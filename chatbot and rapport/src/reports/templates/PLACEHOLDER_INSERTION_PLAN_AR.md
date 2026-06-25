# Arabic PPTX Placeholder Insertion Plan

## 1. Purpose

This document explains how to convert `amip_report_template_ar.pptx` from a finished Arabic example report into a reusable PPTX template for AMIP report generation.

The current deck is an example report about phosphate in Arab countries. It already has the desired AMIP visual design, section structure, branding, charts, tables, and Arabic layout. The manual editing goal is to keep that design intact while replacing variable report content with placeholders that the future generator can fill.

## 2. Global rules

- Do not remove logos, waves, icons, backgrounds, section headers, or branding.
- Only replace variable report content: mineral names, country names, years, KPI values, narrative paragraphs, chart images, and table bodies.
- Keep Arabic section titles if they are part of the report structure, such as `الملخص`, `مقدمة`, `الإنتاج`, `التجارة الخارجية`, `التحليل المقارن`, `الاستنتاجات الرئيسية`, `التوصيات`, and `الملاحق والجداول الإحصائية`.
- Placeholder names must stay in English and use the `{{PLACEHOLDER_NAME}}` format.
- Keep Arabic text alignment and RTL layout.
- Put chart placeholders inside clearly marked empty boxes that occupy the same area as the current chart image.
- Put table placeholders inside the existing table area, or replace the table with a single text box containing the table placeholder.
- Keep placeholder names unique. Do not repeat the same placeholder on multiple slides unless the validator is intentionally updated to allow duplicates.

## 3. Slide-by-slide plan

### Slide 1 - Cover

Current text found:

- `بمبادرة من`
- `التقرير الذكي`
- `تقريرك حول المعادن في الدول العربية`

Likely purpose:

- Cover slide for the Arabic report.

Keep static:

- AMIP/AIDSMO logos and branding images.
- Decorative top and bottom waves.
- `بمبادرة من`
- The static product/brand phrase `التقرير الذكي` if it is intended as the report system name.

Replace with placeholders:

- current text: `تقريرك حول المعادن في الدول العربية`
- replacement: `{{REPORT_TITLE}}`

Recommended added placeholders:

- Add a small right-aligned subtitle box below the main title: `{{REPORT_SUBTITLE}}`
- Add small metadata boxes if the design has room: `{{COUNTRY_NAME}}`, `{{MINERAL_NAME}}`, `{{YEAR_RANGE}}`, `{{LANGUAGE}}`, `{{GENERATED_AT}}`

Chart/table placeholders:

- none

Notes:

- If the title should remain fixed as a product name, use `{{REPORT_TITLE}}` in the subtitle area instead.
- The cover currently does not expose country, mineral, year range, language, or generation date clearly. Add small text boxes only if they do not disturb the brand layout.

### Slide 2 - Table of contents

Current text found:

- `بوابة المؤشرات التعدينية العربية`
- `فهرس المحتويات`
- `الملخص`
- `مقدمة`
- `الإنتاج`
- `التجارة الخارجية`
- `تطورات الأسعار العالمية`
- `التحليل المقارن`
- `الاستنتاجات الرئيسية`
- `التوصيات`
- `الملاحق والجداول الإحصائية`
- `تقرير حول الفوسفات في الدول العربية`

Likely purpose:

- Table of contents and report title reminder.

Keep static:

- `بوابة المؤشرات التعدينية العربية`
- `فهرس المحتويات`
- The section list, unless the report structure changes.
- Decorative images and layout.

Replace with placeholders:

- current text: `تقرير حول الفوسفات في الدول العربية`
- replacement: `{{REPORT_TITLE}}`

Recommended added placeholders:

- Add a compact line near the title or footer if needed: `{{DATA_COVERAGE_NOTE}}`

Chart/table placeholders:

- none

Notes:

- Do not replace the table of contents items with placeholders for v1. They are structural labels.

### Slide 3 - Summary and introduction

Current text found:

- `الملخص`
- A three-paragraph executive summary beginning with `يعرض هذا التقرير واقع الفوسفات في الدول العربية...`
- KPI table with rows such as `الإنتاج العالمي لصخر الفوسفات`, `الإنتاج العربي لصخر الفوسفات`, `الحصة العربية من الإنتاج العالمي`, `صادرات المغرب`, and `صادرات الأردن`
- `مقدمة`
- Introductory paragraph beginning with `يمثل الفوسفات أحد أهم الخامات التعدينية...`
- `1.1 أهمية الفوسفات`
- Mineral importance paragraph beginning with `تنبع أهمية الفوسفات...`
- `1.2 أهداف التقرير`
- Objectives paragraph beginning with `يهدف التقرير إلى تحليل تطور إنتاج صخر الفوسفات...`
- Decorative/possibly accidental text: `كتلة تيبستي`

Likely purpose:

- Executive summary, KPI snapshot, introduction, mineral importance, and report objectives.

Keep static:

- Section headers `الملخص` and `مقدمة`.
- Subsection labels `1.1 أهمية الفوسفات` and `1.2 أهداف التقرير`, unless the numbering is redesigned.
- Table header labels if direct table editing is used.
- Logos, icons, waves, section bars, and background.

Replace with placeholders:

- current text: three-paragraph executive summary
- replacement: `{{EXECUTIVE_SUMMARY}}`
- current text: KPI table body
- replacement: `{{TABLE_KPI_SUMMARY}}`
- current text: introductory paragraph under `مقدمة`
- replacement: `{{INTRODUCTION_TEXT}}`
- current text: paragraph under `1.1 أهمية الفوسفات`
- replacement: `{{MINERAL_IMPORTANCE_TEXT}}`
- current text: paragraph under `1.2 أهداف التقرير`
- replacement: `{{REPORT_OBJECTIVES_TEXT}}`

Recommended added placeholders:

- If the KPI table remains editable, place these in the value cells: `{{KPI_LATEST_PRODUCTION}}`, `{{KPI_LATEST_PRODUCTION_YEAR}}`, `{{KPI_PRODUCTION_CHANGE}}`, `{{KPI_EXPORT_VALUE}}`, `{{KPI_IMPORT_VALUE}}`, `{{KPI_TRADE_BALANCE}}`, `{{KPI_TOP_EXPORT_PARTNER}}`, `{{KPI_TOP_IMPORT_PARTNER}}`, `{{KPI_TOP_HS_PRODUCT}}`

Chart/table placeholders:

- Replace the KPI table area with `{{TABLE_KPI_SUMMARY}}` if v1 uses table images.

Notes:

- Remove or verify `كتلة تيبستي`. It looks unrelated to the visible report structure and may be a stray text box.
- This is the most important slide for v1 because it covers summary, introduction, KPIs, and objectives.

### Slide 4 - Production trends

Current text found:

- Section header: `الإنتاج`
- Narrative beginning with `يعتمد هذا الفصل على بيانات الإنتاج العربي والعالمي...`
- `2.1 تطور الإنتاج العالمي للفوسفات`
- Narrative beginning with `اتجه الإنتاج العالمي لصخر الفوسفات نحو الارتفاع...`
- Caption: `الشكل 2: تطور الإنتاج العربي لصخر الفوسفات`
- `2.3 مساهمة الدول العربية في الإنتاج العالمي`
- Narrative beginning with `تُظهر المقارنة بين الإنتاج العربي والإنتاج العالمي...`
- Caption: `الشكل 3: مساهمة الدول العربية في الإنتاج العالمي لصخر الفوسفات.`

Likely purpose:

- Production analysis with trend charts.

Keep static:

- Section header `الإنتاج`.
- Figure caption positions and Arabic numbering style, if desired.
- Decorative footer wave.

Replace with placeholders:

- current text: all production narrative paragraphs on this slide
- replacement: `{{PRODUCTION_NARRATIVE}}`

Chart/table placeholders:

- Replace the first chart image area, currently under `الشكل 2`, with `{{CHART_PRODUCTION_TREND}}`.
- The second chart area, currently under `الشكل 3`, has no exact required placeholder. For v1, either keep it static out of scope or reuse the area later for a generated production comparison chart.

Notes:

- If only one production chart is generated in v1, prioritize `{{CHART_PRODUCTION_TREND}}` and leave the second chart area for a later iteration.

### Slide 5 - Production ranking and distribution

Current text found:

- `2.4 ترتيب الدول العربية المنتجة`
- Narrative beginning with `يبين ترتيب الدول العربية المنتجة سنة 2024...`
- Caption: `الشكل 4: ترتيب الدول العربية المنتجة لصخر الفوسفات سنة 2024.`
- Caption: `الشكل 5: توزيع الإنتاج العربي حسب الدول سنة 2024.`
- Caption: `الشكل 6: تطور إنتاج أبرز الدول العربية المنتجة.`

Likely purpose:

- Production ranking, share distribution, and leading-producer trend visuals.

Keep static:

- Subsection title `2.4 ترتيب الدول العربية المنتجة`, unless the section numbering is regenerated later.
- Caption positions and Arabic figure label style.

Replace with placeholders:

- current text: paragraph under `2.4 ترتيب الدول العربية المنتجة`
- replacement: keep within `{{PRODUCTION_NARRATIVE}}` if slide 4 narrative is split manually, or add a small note that this paragraph is covered by the production narrative.

Chart/table placeholders:

- Replace chart image under `الشكل 4` with `{{CHART_PRODUCTION_RANKING}}`.
- Keep chart image under `الشكل 5` static for v1, or mark it as a future production-share chart.
- Keep chart image under `الشكل 6` static for v1, or treat it as a future extension of `{{CHART_PRODUCTION_TREND}}` only if duplicate placeholders become allowed.

Notes:

- Avoid placing `{{CHART_PRODUCTION_TREND}}` twice. Use it on slide 4 first.

### Slide 6 - Production table and export trends

Current text found:

- Production ranking table with headers `الترتيب`, `Country`, `الإنتاج سنة 2024 (طن)`, and `الحصة من الإنتاج العربي %`
- Section header: `التجارة الخارجية`
- Trade narrative beginning with `يتناول هذا الفصل التجارة الخارجية...`
- `3.1 الصادرات العالمية للفوسفات`
- `3.2 الصادرات العربية للفوسفات`
- Caption: `الشكل 7: تطور قيمة الصادرات للمغرب والأردن.`
- `3.3 أداء المغرب في السوق العالمية`
- Narrative beginning with `بلغت صادرات المغرب سنة 2023...`
- Caption: `الشكل 8: تطور حصة الصادرات من إجمالي الصادرات السلعية في المغرب والأردن.`

Likely purpose:

- Transition from production to trade, with a production table and export charts.

Keep static:

- Section header `التجارة الخارجية`.
- Arabic subsection titles and caption style.
- Branding/footer wave.

Replace with placeholders:

- current text: production ranking table
- replacement: `{{TABLE_PRODUCTION_SERIES}}`
- current text: trade narrative paragraphs on this slide
- replacement: `{{TRADE_NARRATIVE}}`

Chart/table placeholders:

- Replace export value chart area under `الشكل 7` with `{{CHART_EXPORT_IMPORT_TREND}}`.
- Keep the export-share chart under `الشكل 8` static for v1, or use it later as part of trade analysis.

Notes:

- If `{{CHART_EXPORT_IMPORT_TREND}}` should include both exports and imports, consider moving it to a slide with enough room for both series.

### Slide 7 - Export partners and imports introduction

Current text found:

- `3.4 أداء الأردن في السوق العالمية`
- Narrative beginning with `بلغت صادرات الأردن سنة 2023...`
- Caption: `الشكل 9: أهم أسواق صادرات المغرب سنة 2023.`
- Caption: `الشكل 10: أهم أسواق صادرات الأردن سنة 2023.`
- `3.5 الواردات العالمية للفوسفات`
- `3.6 الواردات العربية للفوسفات`
- Narrative beginning with `تعتمد الواردات العالمية للفوسفات...`
- Caption: `الشكل 11: تطور قيمة الواردات للمغرب والأردن.`

Likely purpose:

- Export partner analysis and import section introduction.

Keep static:

- Arabic subsection labels and figure caption positions.

Replace with placeholders:

- current text: export/import partner and import introduction narrative
- replacement: `{{PARTNER_TRADE_NARRATIVE}}` or `{{TRADE_NARRATIVE}}` if v1 keeps one combined trade narrative.

Chart/table placeholders:

- Replace first export partner chart area with `{{CHART_TOP_EXPORT_PARTNERS}}`.
- The second export partner chart can stay static for v1 or be merged into the same generated image.
- Replace import trend chart area under `الشكل 11` with `{{CHART_EXPORT_IMPORT_TREND}}` only if it was not already used on slide 6.

Notes:

- The contract has one `{{CHART_TOP_EXPORT_PARTNERS}}` placeholder, but this slide has two export-partner visuals. For v1, use one combined generated image or keep one chart static.

### Slide 8 - Import partners and trade balance

Current text found:

- `3.7 واردات المغرب`
- Narrative beginning with `بلغت واردات المغرب سنة 2023...`
- Caption: `الشكل 12: أهم مصادر واردات المغرب سنة 2023.`
- `3.8 واردات الأردن`
- Narrative beginning with `بلغت واردات الأردن سنة 2023...`
- Caption: `الشكل 13: أهم مصادر واردات الأردن سنة 2023.`
- Caption: `الشكل 14: الرصيد التجاري للمغرب والأردن.`

Likely purpose:

- Import source analysis and trade balance chart.

Keep static:

- Arabic subsection labels and figure caption positions.

Replace with placeholders:

- current text: import and trade balance narrative
- replacement: `{{PARTNER_TRADE_NARRATIVE}}` if not used on slide 7, otherwise keep this slide as generated chart/table content.

Chart/table placeholders:

- Replace first import partner chart area with `{{CHART_TOP_IMPORT_PARTNERS}}` if import partners are available.
- The second import partner chart can stay static for v1 or be merged into the same generated image.
- Replace trade balance chart area under `الشكل 14` with `{{CHART_TRADE_BALANCE}}`.

Notes:

- `{{CHART_TOP_IMPORT_PARTNERS}}` is optional in the README. If import partner data is missing, this area should receive a neutral missing-data sentence or be skipped for v1.

### Slide 9 - Trade table and price narrative

Current text found:

- Trade summary table with columns `Year`, `صادرات المغرب`, `صادرات الأردن`, `رصيد المغرب`, and `رصيد الأردن`
- Section header: `تطورات الأسعار العالمية`
- Price narrative beginning with `يعتمد هذا الفصل على سلسلة سعرية استرشادية...`
- `4.1 تطور أسعار الفوسفات عالمياً`
- Caption: `الشكل 15: تطور السعر العالمي الاسترشادي لصخر الفوسفات`
- `4.2 تحليل دورات الأسعار`
- `4.3 العلاقة بين الأسعار والتجارة`
- Narrative beginning with `يمكن تقسيم مسار الأسعار إلى ثلاث مراحل...`

Likely purpose:

- Trade series table and price analysis section.

Keep static:

- Section header `تطورات الأسعار العالمية`.
- Arabic subsection labels and caption positions.

Replace with placeholders:

- current text: trade summary table
- replacement: `{{TABLE_TRADE_SERIES}}`
- current text: price analysis paragraphs
- replacement: `{{PRICE_NARRATIVE}}`

Chart/table placeholders:

- The price chart under `الشكل 15` has no required chart placeholder in the current contract. Keep static for v1 or add a future optional price chart placeholder if the contract is expanded.

Notes:

- `{{PRICE_NARRATIVE}}` is optional. If price data is not available, replace it with a neutral missing-data sentence.

### Slide 10 - Price relationship and comparative analysis

Current text found:

- Caption: `الشكل 16: العلاقة بين السعر الاسترشادي وصادرات المغرب`
- `العلاقة بين الأسعار والإنتاج`
- Narrative beginning with `ارتفاع الأسعار لا يؤدي دائماً إلى زيادة فورية في الإنتاج...`
- Section header: `التحليل المقارن`
- `5.1 مقارنة الإنتاج`
- `5.2 مقارنة التجارة الخارجية`
- `5.3 نقاط القوة والتحديات`
- Strengths/challenges table with columns `نقاط القوة` and `التحديات`

Likely purpose:

- Comparative analysis and strengths/challenges.

Keep static:

- Section header `التحليل المقارن`.
- Subsection labels if useful.
- Caption positions.

Replace with placeholders:

- current text: comparative analysis narrative
- replacement: `{{COMPARATIVE_ANALYSIS}}`
- current text: strengths/challenges table
- replacement: `{{TABLE_STRENGTHS_CHALLENGES}}`

Recommended added placeholders:

- Add two small text boxes near the strengths/challenges section if the future generator will produce them separately: `{{RISK_FLAGS}}` and `{{OPPORTUNITY_FLAGS}}`

Chart/table placeholders:

- The price-export relationship chart has no required chart placeholder in the current contract. Keep static for v1 or skip dynamic handling.

Notes:

- This is the best slide for `{{RISK_FLAGS}}` and `{{OPPORTUNITY_FLAGS}}` because the content already discusses strengths and challenges.

### Slide 11 - Conclusions and recommendations

Current text found:

- Section header: `الاستنتاجات الرئيسية`
- Bullet list beginning with `يُعد الفوسفات مورداً تعدينياً استراتيجياً...`
- Section header: `التوصيات`
- Bullet list beginning with `تعزيز الاستثمار في الصناعات التحويلية للفوسفات...`

Likely purpose:

- Final conclusions and recommendations.

Keep static:

- Section headers `الاستنتاجات الرئيسية` and `التوصيات`.
- Bullet styling and RTL layout.

Replace with placeholders:

- current text: conclusion bullet list
- replacement: `{{CONCLUSIONS}}`
- current text: recommendation bullet list
- replacement: `{{RECOMMENDATIONS}}`

Chart/table placeholders:

- none

Notes:

- This slide is part of the recommended v1 scope.

### Slide 12 - Annex tables and data sources

Current text found:

- Section header: `الملاحق والجداول الإحصائية`
- `ملحق 1: الإنتاج العربي حسب الدولة في أحدث سنة متاحة`
- Annex production table with columns `Country` and `الإنتاج (طن)`
- `ملحق 2: مؤشرات التجارة للمغرب والأردن`
- Annex trade table with columns `Year`, `صادرات المغرب`, `واردات المغرب`, `صادرات الأردن`, and `واردات الأردن`
- Section header: `مصادر البيانات`
- Data sources list beginning with `ملفات الإنتاج العربي والعالمي المرفقة...`

Likely purpose:

- Annex production/trade tables and data source disclosure.

Keep static:

- Section headers `الملاحق والجداول الإحصائية` and `مصادر البيانات`.
- Annex labels if they remain true for all generated reports.

Replace with placeholders:

- current text: production annex table
- replacement: `{{TABLE_ANNEX_PRODUCTION}}`
- current text: trade annex table
- replacement: `{{TABLE_ANNEX_TRADE}}`
- current text: data source list
- replacement: `{{DATA_SOURCES}}`

Chart/table placeholders:

- Use the existing two table areas for `{{TABLE_ANNEX_PRODUCTION}}` and `{{TABLE_ANNEX_TRADE}}`.

Notes:

- This slide is the natural home for `{{DATA_SOURCES}}`.

## 4. Required placeholder checklist

| Placeholder | Slide | Target text/shape description | Status |
| --- | ---: | --- | --- |
| `{{REPORT_TITLE}}` | 1 or 2 | Cover subtitle or slide 2 report title `تقرير حول الفوسفات في الدول العربية` | required |
| `{{REPORT_SUBTITLE}}` | 1 | Add small subtitle text box below main title | required |
| `{{COUNTRY_NAME}}` | 1 | Add compact metadata text box on cover | required |
| `{{MINERAL_NAME}}` | 1 | Add compact metadata text box on cover, or include in title generation | required |
| `{{YEAR_RANGE}}` | 1 | Add compact metadata text box on cover | required |
| `{{LANGUAGE}}` | 1 | Add small metadata text box, expected value Arabic/AR | required |
| `{{GENERATED_AT}}` | 1 | Add small generated-date text box near footer | required |
| `{{DATA_COVERAGE_NOTE}}` | 2 | Add compact note under report title or near footer | required |
| `{{EXECUTIVE_SUMMARY}}` | 3 | Replace the three-paragraph summary body under `الملخص` | required |
| `{{INTRODUCTION_TEXT}}` | 3 | Replace paragraph under `مقدمة` | required |
| `{{MINERAL_IMPORTANCE_TEXT}}` | 3 | Replace paragraph under `1.1 أهمية الفوسفات` | required |
| `{{REPORT_OBJECTIVES_TEXT}}` | 3 | Replace paragraph under `1.2 أهداف التقرير` | required |
| `{{KPI_LATEST_PRODUCTION}}` | 3 | KPI table value cell or generated KPI summary image | required |
| `{{KPI_LATEST_PRODUCTION_YEAR}}` | 3 | KPI table value cell or generated KPI summary image | required |
| `{{KPI_PRODUCTION_CHANGE}}` | 3 | Add KPI row/value in KPI summary table | required |
| `{{KPI_EXPORT_VALUE}}` | 3 | KPI table value cell or generated KPI summary image | required |
| `{{KPI_IMPORT_VALUE}}` | 3 | Add KPI row/value in KPI summary table | required |
| `{{KPI_TRADE_BALANCE}}` | 3 | Add KPI row/value in KPI summary table | required |
| `{{KPI_TOP_EXPORT_PARTNER}}` | 3 | Add KPI row/value in KPI summary table | required |
| `{{KPI_TOP_IMPORT_PARTNER}}` | 3 | Add KPI row/value in KPI summary table | required |
| `{{KPI_TOP_HS_PRODUCT}}` | 3 | Add KPI row/value in KPI summary table | optional |
| `{{CHART_PRODUCTION_TREND}}` | 4 | Replace first production chart image area under `الشكل 2` | required |
| `{{CHART_EXPORT_IMPORT_TREND}}` | 6 | Replace export/import trend chart area under `الشكل 7`, or use slide 7 import trend area if preferred | required |
| `{{CHART_TRADE_BALANCE}}` | 8 | Replace trade balance chart area under `الشكل 14` | required |
| `{{CHART_TOP_EXPORT_PARTNERS}}` | 7 | Replace first export partner chart area under `الشكل 9` | required |
| `{{CHART_TOP_IMPORT_PARTNERS}}` | 8 | Replace first import partner chart area under `الشكل 12` | optional |
| `{{CHART_HS_BREAKDOWN}}` | unclear | No obvious HS chart exists; add new chart box or skip for v1 | optional |
| `{{CHART_PRODUCTION_RANKING}}` | 5 | Replace ranking chart area under `الشكل 4` | required |
| `{{TABLE_KPI_SUMMARY}}` | 3 | Replace KPI table area | required |
| `{{TABLE_PRODUCTION_SERIES}}` | 6 | Replace production ranking table at top of slide | required |
| `{{TABLE_TRADE_SERIES}}` | 9 | Replace trade summary table at top of slide | required |
| `{{TABLE_HS_BREAKDOWN}}` | unclear | No obvious HS breakdown table exists; add new table box or skip for v1 | optional |
| `{{TABLE_PARTNER_TRADE}}` | 7 or 8 | Add table placeholder near partner trade charts, or replace one partner visual with a generated table image | required |
| `{{TABLE_STRENGTHS_CHALLENGES}}` | 10 | Replace strengths/challenges table | required |
| `{{TABLE_ANNEX_PRODUCTION}}` | 12 | Replace annex production table | required |
| `{{TABLE_ANNEX_TRADE}}` | 12 | Replace annex trade table | required |
| `{{PRODUCTION_NARRATIVE}}` | 4 | Replace production narrative text on slide 4; optionally include slide 5 paragraph in same generated text | required |
| `{{TRADE_NARRATIVE}}` | 6 | Replace trade narrative text on slide 6 | required |
| `{{PARTNER_TRADE_NARRATIVE}}` | 7 or 8 | Replace partner/import narrative text | required |
| `{{HS_BREAKDOWN_NARRATIVE}}` | unclear | No obvious HS section exists; add small text box near trade section or skip for v1 | required |
| `{{PRICE_NARRATIVE}}` | 9 | Replace price analysis text | optional |
| `{{COMPARATIVE_ANALYSIS}}` | 10 | Replace comparison narrative text | required |
| `{{RISK_FLAGS}}` | 10 | Add text box near strengths/challenges section | required |
| `{{OPPORTUNITY_FLAGS}}` | 10 | Add text box near strengths/challenges section | required |
| `{{CONCLUSIONS}}` | 11 | Replace conclusion bullet list | required |
| `{{RECOMMENDATIONS}}` | 11 | Replace recommendation bullet list | required |
| `{{DATA_SOURCES}}` | 12 | Replace data sources list under `مصادر البيانات` | required |

## 5. Missing or unclear placeholders

- `{{CHART_HS_BREAKDOWN}}`: no obvious HS breakdown chart exists in the current PPTX. Recommendation: skip for v1 or add a new chart box in the trade section if HS data is ready.
- `{{TABLE_HS_BREAKDOWN}}`: no obvious HS breakdown table exists. Recommendation: mark optional for v1 and add a new table box later.
- `{{HS_BREAKDOWN_NARRATIVE}}`: no clear HS narrative section exists. Recommendation: add a short text box near slide 7 or 8 only if HS analysis is implemented; otherwise defer.
- `{{TABLE_PARTNER_TRADE}}`: partner trade is currently shown as charts, not a table. Recommendation: add a small generated table image placeholder on slide 7 or 8, or defer if chart-only partner analysis is enough for v1.
- `{{RISK_FLAGS}}` and `{{OPPORTUNITY_FLAGS}}`: the current deck has a strengths/challenges table, not separate flag boxes. Recommendation: add two small boxes on slide 10 or include them inside `{{TABLE_STRENGTHS_CHALLENGES}}` for v1.
- `{{COUNTRY_NAME}}`, `{{MINERAL_NAME}}`, `{{YEAR_RANGE}}`, `{{LANGUAGE}}`, `{{GENERATED_AT}}`, and `{{DATA_COVERAGE_NOTE}}`: the current deck does not have dedicated metadata boxes. Recommendation: add compact boxes on slide 1 or slide 2.
- `{{KPI_PRODUCTION_CHANGE}}`, `{{KPI_IMPORT_VALUE}}`, `{{KPI_TRADE_BALANCE}}`, `{{KPI_TOP_EXPORT_PARTNER}}`, `{{KPI_TOP_IMPORT_PARTNER}}`, and `{{KPI_TOP_HS_PRODUCT}}`: the current KPI table does not contain all required KPI rows. Recommendation: use `{{TABLE_KPI_SUMMARY}}` as a generated image for v1, then direct-edit individual KPI cells later if needed.

## 6. Recommended v1 placeholder scope

For the first implementation, use a smaller and realistic scope:

- metadata placeholders: `{{REPORT_TITLE}}`, `{{REPORT_SUBTITLE}}`, `{{COUNTRY_NAME}}`, `{{MINERAL_NAME}}`, `{{YEAR_RANGE}}`, `{{LANGUAGE}}`, `{{GENERATED_AT}}`, `{{DATA_COVERAGE_NOTE}}`
- executive summary: `{{EXECUTIVE_SUMMARY}}`
- KPI summary: `{{TABLE_KPI_SUMMARY}}`
- main production chart: `{{CHART_PRODUCTION_TREND}}`
- main trade chart: `{{CHART_EXPORT_IMPORT_TREND}}`
- conclusions: `{{CONCLUSIONS}}`
- recommendations: `{{RECOMMENDATIONS}}`
- data sources: `{{DATA_SOURCES}}`

After v1 works, expand to production ranking, partner charts, trade balance, annex tables, strengths/challenges, and optional HS/price content.

## 7. Manual editing instructions

1. Open `amip_report_template_ar.pptx` in PowerPoint.
2. Replace the identified variable text with placeholders.
3. Keep all placeholders right-aligned where they are inside Arabic text boxes.
4. For chart placeholders, delete the example chart image and place a text box with the placeholder in the same chart area.
5. For table placeholders, either place the placeholder inside the existing table area or replace the table with a single text box containing the placeholder.
6. Save the file.
7. Run the validator command:

```bash
python3 -m src.reports.pptx_template_validator src/reports/templates/amip_report_template_ar.pptx
```

If using the local validation environment from this workspace:

```bash
.venv/bin/python -m src.reports.pptx_template_validator src/reports/templates/amip_report_template_ar.pptx
```

8. Repeat manual edits until the required placeholders are found.
