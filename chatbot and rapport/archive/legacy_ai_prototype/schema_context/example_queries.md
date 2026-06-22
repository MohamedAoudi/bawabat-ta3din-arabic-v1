# Few-shot SQL examples for the AI agent

## Q: How much phosphate did Morocco produce in 2022?
```sql
SELECT ap.production_value_norm, ap.unit
FROM minerals.fact_arab_production ap
JOIN minerals.dim_countries c ON c.country_id = ap.country_id
JOIN minerals.dim_minerals  m ON m.mineral_id = ap.mineral_id
WHERE c.country_name_en = 'Morocco'
  AND m.mineral_name_en ILIKE '%phosphate%'
  AND ap.year = 2022;
```

## Q: Which Arab country produced the most iron ore in 2021?
```sql
SELECT c.country_name_en, SUM(ap.production_value_norm) AS total_tonnes
FROM minerals.fact_arab_production ap
JOIN minerals.dim_countries c ON c.country_id = ap.country_id
JOIN minerals.dim_minerals  m ON m.mineral_id = ap.mineral_id
WHERE m.mineral_name_en ILIKE '%iron%'
  AND ap.year = 2021
  AND ap.production_value_norm IS NOT NULL
GROUP BY c.country_name_en
ORDER BY total_tonnes DESC
LIMIT 5;
```

## Q: What is Morocco's share of world phosphate production in 2022?
```sql
WITH arab AS (
    SELECT SUM(ap.production_value_norm) AS arab_total
    FROM minerals.fact_arab_production ap
    JOIN minerals.dim_countries c ON c.country_id = ap.country_id
    JOIN minerals.dim_minerals  m ON m.mineral_id = ap.mineral_id
    WHERE c.country_name_en = 'Morocco'
      AND m.mineral_name_en ILIKE '%phosphate%'
      AND ap.year = 2022
),
world AS (
    SELECT SUM(wp.production_value_norm) AS world_total
    FROM minerals.fact_world_production wp
    JOIN minerals.dim_minerals m ON m.mineral_id = wp.mineral_id
    WHERE m.mineral_name_en ILIKE '%phosphate%'
      AND wp.year = 2022
)
SELECT
    arab.arab_total,
    world.world_total,
    ROUND(arab.arab_total / NULLIF(world.world_total, 0) * 100, 2) AS share_pct
FROM arab, world;
```

## Q: What are Morocco's top 5 import partners for minerals in 2022?
```sql
SELECT p.partner_name,
       bi.import_value_usd_thousand,
       bi.import_share_pct
FROM minerals.fact_trade_bilateral_import bi
JOIN minerals.dim_countries c ON c.country_id = bi.country_id
JOIN minerals.dim_partners  p ON p.partner_id = bi.partner_id
WHERE c.country_name_en = 'Morocco'
  AND bi.year = 2022
  AND p.partner_type = 'country'
ORDER BY bi.import_value_usd_thousand DESC
LIMIT 5;
```

## Q: Compare Egypt and Algeria total mineral exports from 2018 to 2022
```sql
SELECT c.country_name_en, t.year, SUM(t.value_usd) AS total_export_usd
FROM minerals.fact_trade_aggregate t
JOIN minerals.dim_countries c ON c.country_id = t.country_id
WHERE c.country_name_en IN ('Egypt', 'Algeria')
  AND t.flow = 1
  AND t.year BETWEEN 2018 AND 2022
GROUP BY c.country_name_en, t.year
ORDER BY c.country_name_en, t.year;
```

## Q: Show Morocco mineral export trend over all available years
```sql
SELECT year, total_value_usd
FROM minerals.agg_trade_by_country_year
WHERE country_id = (SELECT country_id FROM minerals.dim_countries
                    WHERE country_name_en = 'Morocco')
  AND flow = 1
ORDER BY year;
```

## Q: Which minerals does Saudi Arabia produce that no other Arab country produces?
```sql
SELECT m.mineral_name_en
FROM minerals.fact_arab_production ap
JOIN minerals.dim_minerals  m ON m.mineral_id = ap.mineral_id
JOIN minerals.dim_countries c ON c.country_id = ap.country_id
WHERE c.country_name_en = 'Saudi Arabia'
  AND m.mineral_id NOT IN (
      SELECT DISTINCT ap2.mineral_id
      FROM minerals.fact_arab_production ap2
      JOIN minerals.dim_countries c2 ON c2.country_id = ap2.country_id
      WHERE c2.country_name_en != 'Saudi Arabia'
  )
GROUP BY m.mineral_name_en;
```
