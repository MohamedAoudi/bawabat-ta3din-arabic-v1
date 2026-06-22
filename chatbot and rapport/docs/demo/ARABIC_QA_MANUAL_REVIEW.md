# Arabic QA Manual Review

Source JSON: `logs/eval_arabic_questions_results.json`

Review date: 2026-06-02

This review covers the 19 cases where `must_contain_passed = false`.
All 19 cases passed route checks in the latest evaluation run, so this file is
focused on answer interpretation, fixture quality, warehouse coverage, and demo
safety rather than routing behavior.

## Manual Category Counts

| Manual category | Cases |
|---|---:|
| `false_failure_strict_keyword` | 1 |
| `expected_keywords_too_strict` | 1 |
| `expected_answer_needs_update` | 2 |
| `missing_warehouse_data` | 9 |
| `unsupported_domain` | 4 |
| `real_chatbot_issue` | 2 |
| `needs_human_review` | 0 |

## Failed Case Review

| Case | Question | Route | Row count | Missing keywords | Answer excerpt | Auto classification | Manual category | Explanation |
|---|---|---|---:|---|---|---|---|---|
| `amip_ar_006` | ما هي الصادرات الرئيسية للجزائر؟ | `SQL` | 8 | الجزائر, الحديد | الصادرات الرئيسية للجزائر تتركز في المنتجات المعدنية، حيث بلغت قيمة الصادرات الإجمالية... | `strict_keyword_mismatch` | `expected_keywords_too_strict` | The answer does mention Algeria as `للجزائر`, so the exact keyword is too strict. The required `الحديد` keyword is not justified by the returned answer and should be reviewed against warehouse data. |
| `amip_ar_008` | ما هي الدول العربية التي تنتج خام الحديد؟ | `SQL` | 7 | موريتانيا | الدول العربية التي تنتج خام الحديد هي... الجمهورية الإسلامية الموريتانية... الجمهورية الجزائرية... | `strict_keyword_mismatch` | `false_failure_strict_keyword` | The answer is semantically correct; it uses the formal country form `الجمهورية الإسلامية الموريتانية` instead of the shorter expected substring `موريتانيا`. |
| `amip_ar_012` | اعرض لي تطور إنتاج النفط في دول الخليج خلال خمس سنوات | `CHART` | N/A | النفط, دول الخليج | إليك تطور الإنتاج. يعرض المخطط أعلى النتائج حسب البيانات المتوفرة في بوابة AMIP. | `chart_response_too_generic` | `real_chatbot_issue` | The route is correct, but the answer does not acknowledge oil or Gulf countries. Keep out of demos until chart/entity handling or domain support is clarified. |
| `amip_ar_014` | ماذا تصدر الجزائر وإلى أي الدول؟ | `SQL` | 8 | الصين | تُصدر الجزائر المعادن بشكل رئيسي... لم تتوفر تفاصيل دقيقة عن الدول المستوردة أو أنواع المعادن المحددة. | `strict_keyword_mismatch` | `real_chatbot_issue` | The question asks for products and destination countries, but the answer says destination details are not available despite SQL querying partner fields. This needs answer-quality review. |
| `amip_ar_015` | من هم أكبر مصدري المعادن العرب سنة 2023؟ | `SQL` | 4 | السعودية | أكبر مصدري المعادن العرب في عام 2023 هم: مملكة البحرين، جمهورية مصر العربية، المملكة الأردنية الهاشمية، المملكة المغربية. | `strict_keyword_mismatch` | `expected_answer_needs_update` | The warehouse-backed answer lists the returned top exporters and does not include Saudi Arabia. The expected keyword appears stale or not supported by current data. |
| `amip_ar_016` | ما قيمة صادرات الفوسفات الأردنية؟ | `SQL` | N/A | الفوسفات, الأردن | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The generated SQL targeted Jordan phosphate exports but returned no rows. Do not change chatbot behavior; review warehouse coverage or demo safety. |
| `amip_ar_017` | ما هي الدول العربية الأكثر استيراداً للحديد؟ | `SQL` | N/A | الحديد, الإمارات, السعودية | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The iron import query returned no rows. The expected keywords are not verifiable from the current result. |
| `amip_ar_018` | من هم الشركاء الرئيسيون لتونس في واردات المعادن؟ | `SQL` | N/A | تونس, الصين | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The Tunisia mineral-import partner query returned no rows. Treat as warehouse coverage or source-data issue. |
| `amip_ar_020` | أي دولة تمتلك أفضل ميزان تجاري للنحاس؟ | `SQL` | N/A | النحاس, الميزان التجاري | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The copper trade-balance query returned no rows, so the fixture expectation is not currently verifiable. |
| `amip_ar_021` | ما حجم احتياطيات المغرب المؤكدة من الفوسفات؟ | `SQL` | N/A | المغرب, الفوسفات, احتياطي | لا يمكنني إنشاء استعلام SQL لهذا السؤال. يرجى إعادة الصياغة. | `unsupported_data_domain` | `unsupported_domain` | Reserve data is not supported by the current Warehouse V2 schema. This should remain out of demos unless reserves become a real data module. |
| `amip_ar_022` | أي دولة عربية تمتلك أكبر احتياطي نفطي؟ | `SQL` | N/A | السعودية, احتياطي, نفطي | لا يمكنني إنشاء استعلام SQL لهذا السؤال. يرجى إعادة الصياغة. | `unsupported_data_domain` | `unsupported_domain` | Oil reserves are outside the currently supported warehouse scope. Mark as unsupported or not safe for demo. |
| `amip_ar_023` | كم سنة تكفي احتياطيات الجزائر وفقاً لمعدلات الإنتاج الحالية؟ | `SQL` | N/A | الجزائر, احتياطيات | لا يمكنني إنشاء استعلام SQL لهذا السؤال. يرجى إعادة الصياغة. | `unsupported_data_domain` | `unsupported_domain` | Reserve lifespan requires reserves plus production modeling that is not available in Warehouse V2. |
| `amip_ar_025` | كيف تحتل الدول العربية مراتب عالمياً في احتياطيات خام الحديد؟ | `SQL` | N/A | خام الحديد, موريتانيا, الجزائر | لا يمكنني إنشاء استعلام SQL لهذا السؤال. يرجى إعادة الصياغة. | `unsupported_data_domain` | `unsupported_domain` | World reserve rankings are not supported by the current schema. Keep as unsupported unless reserve data is added. |
| `amip_ar_026` | ما نسبة صادرات النحاس العالمية القادمة من الدول العربية؟ | `SQL` | N/A | النحاس, الدول العربية | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The copper export-share query returned no rows. The expected answer cannot be verified from the current warehouse result. |
| `amip_ar_027` | ما هي الدول العربية التي تتاجر بالمعادن فيما بينها؟ | `SQL` | 2 | السعودية, الإمارات | لا توجد دول عربية تتاجر بالمعادن فيما بينها وفقاً للبيانات المتاحة حالياً... | `no_rows` | `missing_warehouse_data` | The answer indicates no currently available intra-Arab partner evidence, while the fixture expects Saudi Arabia and UAE. Treat as current data coverage mismatch. |
| `amip_ar_028` | ما قيمة التجارة المعدنية البينية العربية سنة 2023؟ | `SQL` | N/A | التجارة البينية, 2023 | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The 2023 intra-Arab mineral trade query returned no rows. Not demo-safe until data coverage is verified. |
| `amip_ar_029` | هل يصدر المغرب الفوسفات إلى دول عربية أخرى؟ | `SQL` | N/A | المغرب, الفوسفات, دول عربية | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The Morocco phosphate-to-Arab-countries query returned no rows. Do not infer a positive answer without warehouse support. |
| `amip_ar_030` | ما قيمة صادرات خام الحديد الموريتاني؟ | `SQL` | N/A | خام الحديد, موريتانيا | لم يتم العثور على نتائج لهذا الاستعلام. | `no_rows` | `missing_warehouse_data` | The Mauritania iron-ore export-value query returned no rows. Treat as missing trade coverage or source mapping. |
| `amip_ar_031` | أي معدن يحقق أكبر عائدات للدول العربية؟ | `SQL` | 1 | النفط, الفوسفات | تشير البيانات إلى أن هناك خطأ أو نقصًا في تحديد اسم المعدن الأعلى من حيث العائدات... | `strict_keyword_mismatch` | `expected_answer_needs_update` | The warehouse result has a missing product name and the expected `النفط`/`الفوسفات` keywords are not supported by the returned row. Review fixture expectation and source-data quality. |

## Fixture Change Recommendations

Do not apply these automatically without product/data-owner review.

| Case | Recommendation |
|---|---|
| `amip_ar_006` | Replace exact `الجزائر` with acceptable alternatives such as `للجزائر` or normalize Arabic prefixes before matching. Review whether `الحديد` is a valid required keyword for the current warehouse answer; if not, remove or replace it with a data-supported term such as `المنتجات المعدنية`. |
| `amip_ar_008` | Add `الجمهورية الإسلامية الموريتانية` as an acceptable alternative for `موريتانيا`, or normalize official country names to short country names before strict matching. |
| `amip_ar_012` | If oil/Gulf production is unsupported, mark the case as not safe for demo or update the question to a supported mineral/region. Do not expect `النفط` and `دول الخليج` until chart handling and data support can preserve those entities. |
| `amip_ar_014` | Keep the case for human review. If partner-country data is expected, verify the SQL result and answer formatter behavior before changing keywords such as `الصين`. |
| `amip_ar_015` | Update expected keywords to match current warehouse-backed top exporters, or mark the fixture expectation as data-version dependent. |
| `amip_ar_016` - `amip_ar_020`, `amip_ar_026` - `amip_ar_030` | Do not loosen keywords yet. These cases return no rows or no relevant intra-Arab evidence; recommend marking them not safe for demo until warehouse coverage is verified. |
| `amip_ar_021` - `amip_ar_023`, `amip_ar_025` | Mark as unsupported domain or not safe for demo unless reserves/reserve-lifespan data is added to the warehouse. |
| `amip_ar_031` | Review the expected answer and source-data quality. The current result has no product name, so `النفط` and `الفوسفات` should not be required unless supported by corrected data. |

## Recommended Demo Questions

### Definitely Safe For Live Demo

These passed route and keyword checks without requiring warehouse access.

| Case | Route | Question |
|---|---|---|
| `amip_ar_001` | `LIST` | ما هي بوابة AMIP؟ |
| `amip_ar_002` | `LIST` | ما هي الدول التي تغطيها البوابة؟ |
| `amip_ar_003` | `LIST` | ما هي المعادن التي تتبعها البوابة؟ |
| `amip_ar_004` | `LIST` | ما هي أحدث سنة تتوفر عنها البيانات؟ |
| `amip_ar_032` | `LIST` | من أين تحصل بوابة AMIP على بياناتها؟ |
| `amip_ar_034` | `LIST` | هل أصبحت بيانات سنة 2024 متاحة؟ |

### Safe Only With PostgreSQL

These use SQL and passed route and keyword checks in the latest evaluation.

| Case | Route | Question |
|---|---|---|
| `amip_ar_005` | `SQL` | ما هي المعادن التي ينتجها المغرب؟ |
| `amip_ar_007` | `SQL` | ما حجم إنتاج السعودية من الفوسفات سنة 2023؟ |
| `amip_ar_009` | `SQL` | من هو أكبر منتج عربي للفوسفات؟ |
| `amip_ar_010` | `SQL` | ما هو الترتيب العالمي للدول العربية في إنتاج الذهب؟ |
| `amip_ar_011` | `SQL` | كم بلغ إنتاج المغرب من الفوسفات سنة 2022؟ |
| `amip_ar_013` | `SQL` | أي دولة سجلت أعلى نمو في إنتاج النحاس؟ |
| `amip_ar_019` | `SQL` | قارن إنتاج الفوسفات بين المغرب والجزائر |
| `amip_ar_024` | `SQL` | ما حصة العالم العربي من الإنتاج العالمي للفوسفات؟ |
| `amip_ar_033` | `SQL` | ما مدى حداثة بيانات الإنتاج الخاصة بالسودان؟ |

`amip_ar_008` is manually acceptable as a strict-keyword false failure, but it
should stay out of the primary demo list until the fixture accepts official
country-name variants.

### Safe Only With LightRAG

None in the latest Arabic evaluation. Final routes were `SQL 27`, `LIST 6`,
`CHART 1`, and `RAG 0`.

### Not Recommended For Demo

These failed strict keyword checks or require data/domain review:

`amip_ar_006`, `amip_ar_012`, `amip_ar_014`, `amip_ar_015`, `amip_ar_016`,
`amip_ar_017`, `amip_ar_018`, `amip_ar_020`, `amip_ar_021`, `amip_ar_022`,
`amip_ar_023`, `amip_ar_025`, `amip_ar_026`, `amip_ar_027`, `amip_ar_028`,
`amip_ar_029`, `amip_ar_030`, `amip_ar_031`.

