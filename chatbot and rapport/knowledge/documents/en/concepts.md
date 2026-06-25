# AMIP Concepts and Methodology

This glossary supports factual answers about the Arab Mining Indicators Portal. It describes the concepts qualitatively and leaves exact figures, rankings by value, and quantitative comparisons to SQL-backed data.

## Portal Names and Scope

The correct English name is Arab Mining Indicators Portal. The correct French name is Portail arabe des indicateurs miniers. The correct Arabic name is بوابة المؤشرات التعدينية العربية. AMIP covers solid minerals, quarry materials, mineral-processing products, and mineral trade indicators for Arab countries. It should not be described as an oil, gas, or petroleum portal. Its knowledge corpus can explain mineral concepts, country profiles, commodities, methodology, and source interpretation, while exact production volumes, trade values, reserve quantities, and percentage shares should be answered from structured data. The portal covers 21 Arab countries. Production data spans 2010-2024, and trade data currently runs through 2023.

## Production Data

Production data describes the quantity of a mineral commodity produced by a country during a reporting year. In AMIP, production may refer to mined ore, beneficiated concentrate, quarry material, or a processing-stage product such as cement, clinker, direct reduced iron, alumina, or primary aluminium. The meaning depends on the commodity label and unit. Production records should be used for questions about output, producing countries, time trends, and comparisons across countries or minerals. The knowledge corpus should explain what a production record means, but exact production amounts and year-by-year rankings should be retrieved from SQL. Production coverage in AMIP spans 2010-2024.

## Trade Data

Trade data describes cross-border flows of mineral commodities and mineral-related products. AMIP trade records may cover raw minerals, concentrates, refined metals, semi-finished products, fertilizer products, and critical-mineral goods identified through trade classifications. Trade should not be confused with production: a country can export a mineral it processes, re-exports, or trades through ports even if it is not a major mine producer of that mineral. Trade data is useful for questions about importers, exporters, partner countries, product flows, and market exposure. Exact values, quantities, and ranked trade tables should come from SQL. AMIP trade coverage currently runs through 2023.

## Exports and Imports

Exports are mineral goods reported as leaving a country, while imports are mineral goods reported as entering a country. For a single commodity, a country may be both an exporter and an importer because products differ by grade, processing stage, origin, destination, or industrial use. For example, a country can export quarry materials while importing refined metals or specialized mineral chemicals. AMIP answers should keep the flow direction clear and avoid implying that an export record proves domestic mine production. Export and import questions often require filtering by reporting country, commodity, year, partner, and trade flow. Exact amounts and values belong in SQL-backed responses.

## Bilateral and Partner Trade

Bilateral trade links a reporting country with a partner country for a commodity and flow direction. Partner trade is useful for answering questions such as where a country exports a mineral product, where it imports from, or how inter-Arab mineral trade is structured. A partner may be an Arab country, a non-Arab country, a regional market, or a statistical partner category depending on the source. Bilateral data can differ from aggregate trade because of reporting methods, mirror statistics, re-exports, classification changes, and partner disclosure practices. AMIP should explain these concepts qualitatively, while SQL should provide the actual partner lists, values, and quantities.

## Reserves and Resources

Resources are concentrations of minerals with geological interest and possible future economic value. Reserves are the portion of a resource that has been evaluated as economically mineable under defined technical, legal, environmental, and market conditions. Reserves are therefore more constrained than resources. Both concepts can change when exploration improves knowledge, prices change, technology advances, costs shift, or regulations evolve. AMIP knowledge should explain the distinction but should not invent reserve tonnages or reserve-life calculations. Exact reserve quantities, if available and approved for use, must come from structured sources or cited official references, not from free-text generation.

## Ore Grade

Ore grade describes the concentration of a valuable mineral or element in mined material. A higher grade often means more contained metal or mineral per unit of ore, but grade alone does not determine economic value. Mineralogy, recovery, impurities, strip ratio, water, energy, logistics, processing technology, and market specifications also matter. Grade may be expressed differently by commodity: metal content, mineral content, chemical purity, or product quality. In AMIP responses, grade should be explained as a quality and processing concept, not converted into unsupported quantitative claims. Exact grades, if present in a trusted dataset, should be reported through structured data or source-specific analysis.

## Beneficiation

Beneficiation is the set of physical, chemical, or thermal processes used to improve a mineral's quality before sale or downstream processing. It can include crushing, screening, washing, gravity separation, magnetic separation, flotation, leaching, calcination, drying, and blending. The goal may be to raise grade, remove impurities, standardize particle size, reduce moisture, or make the material suitable for smelting, fertilizer production, cement, glass, ceramics, or other uses. Beneficiation explains why raw ore, concentrate, pellets, refined metal, and manufactured mineral products should be treated as different processing stages. AMIP knowledge should connect those stages without mixing their quantities.

## HS Codes

HS codes are Harmonized System trade classifications used to identify products in customs and trade statistics. They help map traded goods to mineral commodities, but they are not always identical to geological commodity names. A single HS product may include several related materials, and a mineral may appear under multiple trade codes depending on processing stage, purity, or product form. HS-based data is best for trade questions, not for proving mine production. AMIP answers should explain that HS codes support imports, exports, bilateral trade, and partner analysis. Exact HS-code values, partner flows, and product rankings should be retrieved from the trade database.

## Measurement Units

AMIP production and trade quantities are generally normalized to metric tonnes where the source data supports it. Some commodities may have source-specific units or processing-stage labels, so interpretation should always follow the commodity definition and data field. A tonne of ore, a tonne of concentrate, and a tonne of refined metal do not represent the same physical or economic content. Knowledge answers should explain unit meaning, while SQL should supply exact quantities and conversions. When a question asks for comparisons, the response should make clear whether the comparison is by quantity, value, country, year, partner, or commodity form.

## Base-Unit Normalization

Base-unit normalization converts source quantities into a common unit so AMIP can compare records consistently across years, countries, and sources. Normalization can involve unit conversion, product-name standardization, country-name harmonization, and mapping variant labels to a base commodity. It does not erase commodity meaning: iron ore, pellets, direct reduced iron, pig iron, steel, billets, and rebar remain different stages even if all are stored in comparable units. Normalization improves retrieval and analytics, but users should still pay attention to commodity form, source definitions, and flow direction. Exact normalized values should be served by SQL, not by generated text.

## Time Coverage

AMIP production data spans 2010-2024 for covered Arab countries and commodities where records are available. AMIP trade data currently runs through 2023. These coverage windows describe the available warehouse period, not a guarantee that every country-mineral combination has a record in every year. Some countries have broad coverage, while others have limited production activity or sparse reporting. When answering time-related questions, AMIP should distinguish the coverage window from the latest available record for a specific query. Exact latest-year availability, missing years, trends, and comparisons should come from SQL filters over the relevant fact table.

## Solid-Minerals Scope

AMIP is focused on solid minerals, quarry materials, mineral-processing products, and mineral trade classifications. It includes commodities such as phosphate rock, iron ore, gold, copper, gypsum, salt, potash, limestone, cement, clays, silica, aluminium value-chain products, steel products, and trade-side critical minerals. It should not be expanded into oil, gas, or petroleum coverage. Some legacy source labels may include boundary items, but the chatbot should treat them as scope notes rather than evidence that AMIP is an energy portal. When a user asks outside the solid-minerals scope, the answer should redirect to the relevant AMIP mineral coverage.

## Data Sources

AMIP uses data from Arab mining and energy ministries where those ministries publish mineral statistics, national geological surveys, statistical agencies, customs and trade authorities, and international trade or statistics bodies. Sources can differ in commodity names, languages, units, reporting calendars, and product classifications, so the warehouse harmonizes names and units where possible. The knowledge corpus should describe source families and methodology, not invent values. For factual numeric answers, the chatbot should rely on approved structured tables and cite the relevant data context when available. Source interpretation should remain conservative, especially for countries with limited reporting or disrupted production histories.
