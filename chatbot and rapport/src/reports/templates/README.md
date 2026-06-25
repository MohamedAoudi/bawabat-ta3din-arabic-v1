# AMIP PPTX Report Template Contract

## 1. Purpose

PPTX files in this folder are static design templates for AMIP reports. They define the official report layout and must preserve logos, waves, icons, colors, section headers, slide layout, and branding.

The report generator should only replace dynamic placeholders. It must not redesign slides or mutate static visual elements.

## 2. Template files

Expected template files:

- `amip_report_template_ar.pptx`
- `amip_report_template_fr.pptx`
- `amip_report_template_en.pptx`

Arabic is the first supported template for the initial implementation.

## 3. Placeholder naming rules

All placeholders must use this format:

```text
{{PLACEHOLDER_NAME}}
```

Rules:

- Use uppercase placeholder names.
- Use English technical names.
- Do not use spaces.
- Do not use Arabic characters inside placeholder names.
- Use unique names.
- Placeholders should be inside text boxes, table cells, or clearly marked chart/image boxes.

## 4. Required metadata placeholders

- `{{REPORT_TITLE}}`
- `{{REPORT_SUBTITLE}}`
- `{{COUNTRY_NAME}}`
- `{{MINERAL_NAME}}`
- `{{YEAR_RANGE}}`
- `{{LANGUAGE}}`
- `{{GENERATED_AT}}`
- `{{DATA_COVERAGE_NOTE}}`

## 5. Required summary placeholders

- `{{EXECUTIVE_SUMMARY}}`
- `{{INTRODUCTION_TEXT}}`
- `{{MINERAL_IMPORTANCE_TEXT}}`
- `{{REPORT_OBJECTIVES_TEXT}}`

## 6. Required KPI placeholders

- `{{KPI_LATEST_PRODUCTION}}`
- `{{KPI_LATEST_PRODUCTION_YEAR}}`
- `{{KPI_PRODUCTION_CHANGE}}`
- `{{KPI_EXPORT_VALUE}}`
- `{{KPI_IMPORT_VALUE}}`
- `{{KPI_TRADE_BALANCE}}`
- `{{KPI_TOP_EXPORT_PARTNER}}`
- `{{KPI_TOP_IMPORT_PARTNER}}`
- `{{KPI_TOP_HS_PRODUCT}}`

## 7. Required chart placeholders

- `{{CHART_PRODUCTION_TREND}}`
- `{{CHART_EXPORT_IMPORT_TREND}}`
- `{{CHART_TRADE_BALANCE}}`
- `{{CHART_TOP_EXPORT_PARTNERS}}`
- `{{CHART_TOP_IMPORT_PARTNERS}}`
- `{{CHART_HS_BREAKDOWN}}`
- `{{CHART_PRODUCTION_RANKING}}`

Chart placeholders should be placed in dedicated empty boxes that will be replaced by generated PNG images.

## 8. Required table placeholders

- `{{TABLE_KPI_SUMMARY}}`
- `{{TABLE_PRODUCTION_SERIES}}`
- `{{TABLE_TRADE_SERIES}}`
- `{{TABLE_HS_BREAKDOWN}}`
- `{{TABLE_PARTNER_TRADE}}`
- `{{TABLE_STRENGTHS_CHALLENGES}}`
- `{{TABLE_ANNEX_PRODUCTION}}`
- `{{TABLE_ANNEX_TRADE}}`

Tables may be replaced either by:

- editing PowerPoint table cells directly, or
- generating table images and inserting them into the slide.

For the first version, use generated table images if direct PowerPoint table editing becomes too fragile.

## 9. Required narrative placeholders

- `{{PRODUCTION_NARRATIVE}}`
- `{{TRADE_NARRATIVE}}`
- `{{PARTNER_TRADE_NARRATIVE}}`
- `{{HS_BREAKDOWN_NARRATIVE}}`
- `{{PRICE_NARRATIVE}}`
- `{{COMPARATIVE_ANALYSIS}}`
- `{{RISK_FLAGS}}`
- `{{OPPORTUNITY_FLAGS}}`
- `{{CONCLUSIONS}}`
- `{{RECOMMENDATIONS}}`
- `{{DATA_SOURCES}}`

## 10. Optional placeholders

Some placeholders are optional and should be replaced with a neutral missing-data sentence when data is unavailable.

Optional placeholders:

- `{{PRICE_NARRATIVE}}`
- `{{CHART_TOP_IMPORT_PARTNERS}}`
- `{{CHART_HS_BREAKDOWN}}`
- `{{TABLE_HS_BREAKDOWN}}`
- `{{KPI_TOP_HS_PRODUCT}}`

## 11. Arabic / RTL rules

- Arabic templates should keep text boxes right-aligned.
- Placeholder names stay in English even inside Arabic slides.
- Replacement Arabic text should preserve paragraph direction as much as possible.
- The generated PDF must be manually checked for Arabic shaping and line direction after the first implementation.

## 12. Static design rules

The generator must not modify:

- AMIP logos
- AIDSMO logos
- section title bars
- icons
- decorative wave shapes
- background images
- fixed branding text
- page layout

## 13. First implementation recommendation

Start with:

1. one Arabic PPTX template
2. placeholder text replacement
3. chart replacement using PNG images
4. LibreOffice headless PPTX-to-PDF conversion
5. filesystem cache for 24 hours
6. Do not modify API routes in this step.
7. Do not modify frontend files in this step.
8. Do not add `python-pptx` yet unless needed only for a small validation script.
9. Do not move any existing report code.
10. Do not delete or refactor the existing ReportLab implementation.
