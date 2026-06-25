# AMIP Data Engineering — At a Glance

> One-page summary for presentation appendix / defense slide.

---

## 🎯 Mission

Transform heterogeneous Arab mineral-sector source files (Excel + CSV) into a
clean, integrity-aligned PostgreSQL warehouse powering a **PDF report
generator**, an **AI chatbot** (text-to-SQL), and a **Power BI** analytics layer.

---

## 📊 What was loaded

| Dimension | Rows | | Fact | Rows | Grain |
|---|---:|---|---|---:|---|
| countries | 21 | | arab_production | 2,881 | country × mineral × year |
| mineral_production | 111 | | world_production | 255 | mineral × year |
| mineral_trade | 26 | | trade_world | 6,050 | country × group × year × flow |
| trade_partners | 195 | | partner_trade | 16,740 | country × partner × year × flow |

**Coverage:** 2010–2024 (production) · 2010–2023 (trade) · 20/21 producing countries · 19 trade reporters · 194 partners

---

## ⚙️ Pipeline — 3 idempotent loaders + 1 semantic layer

```
load_public_production  →  load_public_trade  →  load_public_bilateral  →  bi.* views
```

Every loader: **`.env`-driven** (server-portable) · **single transaction** ·
**idempotent upserts** · **isolation assertions** · **structured load report**.

---

## 🔧 Data-quality problems solved (14)

| Category | Examples |
|---|---|
| **Structural** | Headerless workbook · Excel title-row offset · header-leak row |
| **Type** | String/float years & HS codes cast to int · leading-space column |
| **Semantic** | Arabic alef/hamza name variants · 3 different country-naming conventions |
| **Completeness** | Missing French names → OpenAI batch translation + cache |
| **Measurement** | Mixed mass/volume units → family-aware `production_value_base` |
| **Scale** | Thousand-USD → full-USD parity across trade tables |
| **Schema** | `hs_codes` widened VARCHAR(100)→TEXT (153-char overflow) |
| **Grain** | Bilateral all-minerals data → sentinel + `/options` exclusion |

---

## 🏆 Headline engineering decision — the bilateral grain mismatch

**Problem:** bilateral trade is aggregated across *all* minerals, but the schema
requires a `NOT NULL` mineral foreign key. Naive fixes either break integrity,
falsely attribute trade to a mineral, or pollute the user-facing dropdown.

**Solution:** an explicit `'All Minerals'` sentinel that satisfies the FK
honestly + a one-line `/options` exclusion. Result: **full referential
integrity, a clean frontend, zero report regression**, and data fully queryable
for BI and the chatbot.

---

## ✅ Validation (all passing)

- **0** foreign-key orphans across all 4 fact tables
- **0** NULL production values · **0** NULL base units
- **Idempotent** — re-runs reproduce identical counts
- **Isolation** — production/trade counts asserted unchanged during bilateral load
- **End-to-end** — report API returns valid `%PDF-` documents

---

## 📈 Rows in → rows loaded

| Stage | Source | Filtered / Aggregated | Loaded |
|---|---:|---|---:|
| Production | 2,896 | −1 header, −14 dup keys | **2,881** |
| Aggregate trade | 26,553 | −2 spacer, −20,501 aggregated | **6,050** |
| Bilateral | 19,458 | −2,718 non-country | **16,740** |

---

## 🧱 Tech stack

`Python 3.14` · `pandas` · `psycopg2` · `OpenAI API` · `python-dotenv` ·
`PostgreSQL` · `Power BI (Import)`

---

## 🔭 Known limitations / future work

- Partner names use EN placeholders for AR/FR (report surfaces EN only)
- Bilateral coverage partial (11 of 21 reporters in source)
- Report PDF partner section not yet wired to surface bilateral data (scoped follow-up)
