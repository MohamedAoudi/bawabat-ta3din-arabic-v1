# Data Engineering — Visual Diagrams

Mermaid diagrams for the AMIP data engineering work. These render natively on
GitHub, VS Code (with a Mermaid extension), Notion, Obsidian, and most slide
tools. To export an image: open in any Mermaid live editor
(https://mermaid.live), paste a block, and download as SVG/PNG.

---

## 1. End-to-End Data Flow (architecture)

```mermaid
flowchart TB
    subgraph SRC["📁 SOURCE FILES — Version 1 (analyst-cleaned)"]
        A1["fact_arab_production.xlsx<br/>(headerless)"]
        A2["fact_world_production.xlsx"]
        A3["ref_minerals_hs.xlsx"]
        A4["fact_trade_export/import.xlsx"]
        A5["bilateral country CSVs"]
        A6["ref_countries.xlsx<br/>+ translation JSON"]
    end

    subgraph ETL["⚙️ ETL LOADERS — Python / pandas / psycopg2"]
        E1["load_public_production"]
        E2["load_public_trade"]
        E3["load_public_bilateral"]
        OAI["OpenAI batch<br/>AR/FR translation"]
    end

    subgraph DB["🗄️ PostgreSQL — amip_db.public (star schema)"]
        D1["dimensions:<br/>countries · mineral_production<br/>mineral_trade · trade_partners"]
        D2["facts:<br/>arab_production · world_production<br/>trade_world · partner_trade"]
    end

    subgraph SEM["📊 bi.* semantic views (read-only)"]
        S1["dim_country · dim_mineral_production<br/>dim_date · fact_arab/world_production"]
    end

    subgraph CONS["🎯 CONSUMERS"]
        C1["Power BI<br/>(Import mode)"]
        C2["Report API<br/>(PDF, FastAPI)"]
        C3["Chatbot<br/>(text-to-SQL)"]
    end

    A1 & A2 & A3 & A6 --> E1
    A4 --> E2
    A5 & A6 --> E3
    E1 & E2 & E3 <-.-> OAI
    E1 & E2 & E3 -->|"idempotent upserts"| D1
    E1 & E2 & E3 --> D2
    D1 & D2 --> S1
    S1 --> C1
    D1 & D2 --> C2 & C3
```

---

## 2. Star Schema (entity-relationship diagram)

```mermaid
erDiagram
    countries ||--o{ arab_production : "produces"
    countries ||--o{ trade_world : "reports"
    countries ||--o{ partner_trade : "reports"
    mineral_production ||--o{ arab_production : "of mineral"
    mineral_production ||--o{ world_production : "of mineral"
    mineral_trade ||--o{ trade_world : "of group"
    mineral_trade ||--o{ partner_trade : "of group"
    trade_partners ||--o{ trade_world : "with partner"
    trade_partners ||--o{ partner_trade : "with partner"

    countries {
        bigint id PK
        varchar iso_code UK
        varchar name_en
        varchar name_fr
        varchar name_ar
        int display_order
    }
    mineral_production {
        bigint id PK
        varchar hs_codes
        varchar mineral_name_en
        varchar mineral_name_fr
        varchar mineral_name_ar
    }
    mineral_trade {
        bigint id PK
        text hs_codes "widened from VARCHAR(100)"
        varchar mineral_name_en
        varchar mineral_name_fr
        varchar mineral_name_ar
    }
    trade_partners {
        bigint id PK
        varchar name_en
        varchar name_fr
        varchar name_ar
        varchar partner_category_en
    }
    arab_production {
        bigint id PK
        bigint country_id FK
        bigint mineral_production_id FK
        int year
        numeric production_value
        numeric production_value_base "unit-normalized"
        varchar unit_en
    }
    world_production {
        bigint id PK
        bigint mineral_production_id FK
        int year
        numeric production_value
        numeric production_value_base
        varchar unit_en
    }
    trade_world {
        bigint id PK
        bigint reporter_country_id FK
        bigint partner_id FK
        bigint mineral_trade_id FK
        int year
        numeric value_usd
        numeric value_share "NULL (computed downstream)"
        varchar type_trade "export|import"
    }
    partner_trade {
        bigint id PK
        bigint reporter_country_id FK
        bigint partner_id FK
        bigint mineral_trade_id FK
        int year
        numeric value_usd
        varchar type_trade "export|import"
    }
```

---

## 3. ETL Pipeline Stages (sequence & dependencies)

```mermaid
flowchart LR
    subgraph S1["STAGE 1 — Production"]
        direction TB
        P1["Extract<br/>(headerless, drop leak row)"]
        P2["Resolve countries<br/>(AR→ID via lookup)"]
        P3["Build mineral dim<br/>(EN from file, FR via OpenAI)"]
        P4["Unit normalization<br/>→ production_value_base"]
        P1 --> P2 --> P3 --> P4
    end

    subgraph S2["STAGE 2 — Aggregate Trade"]
        direction TB
        T1["Extract<br/>(fix header offset, casts)"]
        T2["Resolve reporters<br/>(literal map)"]
        T3["Build trade dim<br/>(25 groups, HS→TEXT)"]
        T1 --> T2 --> T3
    end

    subgraph S3["STAGE 3 — Bilateral"]
        direction TB
        B1["Extract<br/>(partner_type='country' only)"]
        B2["Upsert 194 partners"]
        B3["Sentinel 'All Minerals'<br/>+ /options exclusion"]
        B4["thousand-USD → full USD"]
        B1 --> B2 --> B3 --> B4
    end

    S1 -->|"naming conventions"| S2
    S2 -->|"shared mineral_trade dim"| S3
    S1 -.->|"isolation asserted"| S3
```

---

## 4. The Bilateral Grain-Mismatch Decision (headline engineering challenge)

```mermaid
flowchart TD
    START["Bilateral CSV row<br/>(country × partner × year, ALL minerals)"]
    Q1{"partner_type<br/>== 'country'?"}
    DROP1["DROP — World total<br/>or region aggregate<br/>(prevents double counting)"]
    Q2{"mineral_trade_id<br/>is NOT NULL"}
    NAIVE["❌ Naive options:<br/>• violate NOT NULL, or<br/>• fan-out across minerals<br/>(false attribution), or<br/>• sentinel pollutes /options"]
    SENT["✅ Sentinel 'All Minerals'<br/>satisfies FK honestly"]
    EXCL["Exclude sentinel from<br/>report API /options"]
    LOAD["Load partner_trade<br/>value_usd = thousand × 1000"]
    OK["✔ FK integrity · clean dropdown<br/>· no report regression<br/>· data queryable for BI/chatbot"]

    START --> Q1
    Q1 -->|no| DROP1
    Q1 -->|yes| Q2
    Q2 --> NAIVE
    NAIVE --> SENT
    SENT --> EXCL --> LOAD --> OK
```

---

## 5. Data Quality Funnel (rows in → rows loaded)

```mermaid
flowchart LR
    subgraph PROD["Production"]
        PA["2,896 source"] --> PB["−1 header leak<br/>−14 dup keys"] --> PC["2,881 loaded"]
    end
    subgraph TRD["Aggregate Trade"]
        TA["26,553 source"] --> TB["−2 spacer<br/>−20,501 aggregated"] --> TC["6,050 loaded"]
    end
    subgraph BIL["Bilateral"]
        BA["19,458 source"] --> BB["−2,718 non-country"] --> BC["16,740 loaded"]
    end
```

---

## 6. Power BI Semantic Model (production)

```mermaid
erDiagram
    bi_dim_date ||--o{ bi_fact_arab_production : "year"
    bi_dim_date ||--o{ bi_fact_world_production : "year"
    bi_dim_country ||--o{ bi_fact_arab_production : "country_id"
    bi_dim_mineral_production ||--o{ bi_fact_arab_production : "mineral_id"
    bi_dim_mineral_production ||--o{ bi_fact_world_production : "mineral_id"

    bi_dim_date {
        int year
        date date_key "marked date table"
    }
    bi_dim_country {
        bigint country_id
        varchar iso_code "for map visual"
        varchar name_en
    }
    bi_dim_mineral_production {
        bigint mineral_production_id
        varchar mineral_name_en
    }
    bi_fact_arab_production {
        bigint country_id FK
        bigint mineral_production_id FK
        int year FK
        numeric production_value_base "measure base"
    }
    bi_fact_world_production {
        bigint mineral_production_id FK
        int year FK
        numeric production_value_base "Arab share denominator"
    }
```
