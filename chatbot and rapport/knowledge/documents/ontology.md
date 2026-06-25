# AMIP Platform Ontology

This document defines the domain ontology for the AMIP Arab Mining Indicators Portal and
its data warehouse. It is indexed into LightRAG to enable rich RAG retrieval about mining
mineral categories, production, trade, HS codes, partner relationships, and country-level mineral profiles.

## About AMIP

AMIP (Arab Mining Indicators Portal) is a digital portal specialized in displaying and
analyzing indicators and data related to the mining and mineral resources sector in Arab
countries. It provides production data, trade data, and various mineral indicators across
21 Arab countries. Production data spans 2010-2024, and trade data currently runs through
2023.

## Core Entities

### Mineral
A Mineral is the central tracked entity. Each mineral has an English name, Arabic name,
and French name. Minerals are categorized as metal, non-metal, industrial, construction,
or processing-stage mineral products within the solid-minerals scope.

Key minerals: phosphate (الفوسفات), iron ore (خام الحديد), gold (الذهب), copper (النحاس),
gypsum (الجبس), salt (الملح), zinc (الزنك), barite (الباريت), feldspar (الفلسبار),
kaolin (الكاولين), cement (الأسمنت), bentonite (البنتونيت).

### Country
A Country represents one of the 21 Arab nations covered by AMIP.

The 21 AMIP countries are:
Morocco, Algeria, Tunisia, Libya, Egypt, Sudan, Mauritania, Saudi Arabia, UAE, Qatar,
Bahrain, Kuwait, Oman, Yemen, Iraq, Jordan, Lebanon, Syria, Palestine, Djibouti, Somalia.

Countries are grouped into regions: Maghreb, Mashreq, Gulf, Horn of Africa.

### Production
A Production record captures how much of a mineral a country produced in a given year.
Production is measured in tons (or mineral-specific units) and sourced from ministries
and geological agencies.

### Trade
A Trade record captures bilateral trade flows: which country exported how much of a
mineral to which importing country, and the reported trade value where available.

### Price
A Price record is supported by the Warehouse V2 schema for future market-price
monitoring. In the current local build, the price loader is a safe no-op because no
warehouse-scoped local price source is configured.

## Database Schema

The AMIP warehouse (PostgreSQL 15) contains fact and dimension tables organized into:

### Dimension tables
- dim_minerals     — mineral names in AR/FR/EN, categories, units
- dim_countries    — country names in AR/FR/EN, ISO codes, regions (all 21 AMIP countries)
- dim_time         — date/year dimension
- dim_partners     — trade partner names and partner types
- dim_trade_products — mineral trade products linked to HS codes

### Fact tables
- fact_arab_production        — annual Arab-country production by country/mineral/year
- fact_world_production       — annual world production by mineral/year
- fact_trade_world            — aggregate import/export trade by country/product/year/flow
- fact_bilateral_trade        — bilateral mineral trade by reporting country/partner/year/flow
- fact_mineral_price_ticks    — future price ticks table; currently empty in the local build

Production and trade facts join to AMIP dimensions under the PostgreSQL `minerals` schema.

## Mineral Profiles

### Phosphate
Morocco is among the world's leading phosphate countries and has globally important
phosphate resources. Other major Arab producers: Saudi Arabia, Jordan, Tunisia, Egypt,
Algeria. Key use: fertilizer production.

### Iron Ore
Major Arab producers: Mauritania, Algeria, Saudi Arabia, Egypt.
Mauritania's iron ore is a critical mineral sector for the national economy.

### Gold
Top Arab producers: Sudan, Mauritania, Egypt, Saudi Arabia, Morocco, Algeria.

### Copper
Produced in Morocco, Saudi Arabia, and others.
