# Concepts et Méthodologie AMIP

Ce glossaire aide le chatbot à répondre sur le Portail arabe des indicateurs miniers sans inventer de valeurs. Les explications restent qualitatives; les volumes, valeurs, classements chiffrés et comparaisons numériques doivent venir des données SQL.

## Noms du Portail et Périmètre

Le nom français correct est Portail arabe des indicateurs miniers. Le nom anglais correct est Arab Mining Indicators Portal. Le nom arabe correct est بوابة المؤشرات التعدينية العربية. AMIP couvre les minéraux solides, les matériaux de carrière, les produits de transformation minérale et les indicateurs de commerce minier des pays arabes. Il ne doit pas être décrit comme un portail du pétrole, du gaz ou des hydrocarbures. Le corpus peut expliquer les concepts miniers, les profils pays, les substances, la méthodologie et l'interprétation des sources. Les volumes de production, valeurs commerciales, réserves et parts chiffrées doivent être fournis par les tables structurées. Le portail couvre 21 pays arabes; la production couvre 2010-2024 et le commerce jusqu'en 2023.

## Données de Production

Les données de production décrivent la quantité d'une substance produite par un pays pendant une année de déclaration. Dans AMIP, elles peuvent désigner un minerai extrait, un concentré enrichi, un matériau de carrière ou un produit de transformation comme le ciment, le clinker, le fer réduit direct, l'alumine ou l'aluminium primaire. Le sens exact dépend du libellé de la substance et de l'unité. Ces données servent aux questions sur les pays producteurs, les tendances et les comparaisons. Le corpus doit expliquer ce que représente un enregistrement, mais les quantités et les classements par année doivent être extraits par SQL. La couverture de production AMIP s'étend sur 2010-2024.

## Données de Commerce

Les données de commerce décrivent les flux transfrontaliers de substances minérales et de produits liés aux minéraux. Elles peuvent couvrir minerais bruts, concentrés, métaux raffinés, produits semi-finis, engrais et biens de minéraux critiques repérés par classification commerciale. Le commerce ne doit pas être confondu avec la production : un pays peut exporter un produit qu'il transforme, réexporte ou fait transiter sans être un grand producteur minier de la substance. Ces données servent aux questions sur importateurs, exportateurs, partenaires, flux et exposition commerciale. Les valeurs, quantités et classements commerciaux doivent venir de SQL. La couverture commerciale AMIP va jusqu'en 2023.

## Exportations et Importations

Les exportations sont des biens minéraux déclarés comme sortant d'un pays; les importations sont des biens déclarés comme entrant dans un pays. Pour une même substance, un pays peut importer et exporter, car les produits diffèrent par qualité, stade de transformation, origine, destination ou usage industriel. Il peut par exemple exporter des matériaux de carrière et importer des métaux raffinés ou des produits chimiques minéraux spécialisés. Les réponses AMIP doivent toujours préciser le sens du flux et éviter de déduire une production minière nationale d'un simple enregistrement d'exportation. Les questions exigent souvent de filtrer par pays déclarant, substance, année, partenaire et flux.

## Commerce Bilatéral et Partenaires

Le commerce bilatéral relie un pays déclarant à un pays partenaire pour une substance et un sens de flux. Il permet de répondre à des questions comme la destination des exportations, l'origine des importations ou la structure du commerce minier interarabe. Le partenaire peut être un pays arabe, un pays non arabe, un marché régional ou une catégorie statistique selon la source. Les données bilatérales peuvent différer des agrégats à cause des méthodes de déclaration, statistiques miroir, réexportations, changements de classification et règles de confidentialité. AMIP doit expliquer ces notions qualitativement; les listes de partenaires, valeurs et quantités doivent être fournies par SQL.

## Réserves et Ressources

Les ressources sont des concentrations minérales présentant un intérêt géologique et une valeur économique possible. Les réserves sont la partie d'une ressource évaluée comme exploitable économiquement dans des conditions techniques, juridiques, environnementales et commerciales définies. Les réserves sont donc plus restrictives que les ressources. Les deux notions peuvent évoluer avec l'exploration, les prix, les technologies, les coûts et la réglementation. Le corpus AMIP doit expliquer cette différence sans inventer de tonnages, durées de vie ou évaluations quantitatives. Toute quantité de réserve, si elle est disponible et autorisée, doit venir d'une source structurée ou officielle.

## Teneur du Minerai

La teneur d'un minerai indique la concentration de la substance utile dans le matériau extrait. Une teneur plus élevée peut signifier davantage de métal ou de minéral contenu, mais elle ne suffit pas à déterminer la valeur économique. La minéralogie, la récupération, les impuretés, les rapports de décapage, l'eau, l'énergie, la logistique, la technologie et les spécifications du marché comptent aussi. La teneur peut être exprimée comme contenu métallique, contenu minéral, pureté chimique ou qualité de produit. Dans AMIP, elle doit être présentée comme une notion de qualité et de traitement, non transformée en affirmation chiffrée non vérifiée.

## Enrichissement

L'enrichissement regroupe les procédés physiques, chimiques ou thermiques utilisés pour améliorer la qualité d'un minerai avant la vente ou la transformation. Il peut inclure concassage, criblage, lavage, séparation gravimétrique, séparation magnétique, flottation, lixiviation, calcination, séchage et mélange. Le but peut être d'augmenter la teneur, d'éliminer les impuretés, de standardiser la granulométrie, de réduire l'humidité ou de rendre le matériau apte à la fusion, aux engrais, au ciment, au verre ou à la céramique. Cette notion explique pourquoi minerai brut, concentré, pellets, métal raffiné et produits manufacturés doivent rester des stades distincts dans AMIP.

## Codes SH

Les codes SH sont les classifications du Système harmonisé utilisées dans les statistiques douanières et commerciales. Ils aident à rattacher des biens échangés à des substances minérales, mais ne correspondent pas toujours aux noms géologiques. Un produit SH peut couvrir plusieurs matériaux proches, et une substance peut apparaître sous plusieurs codes selon son stade de transformation, sa pureté ou sa forme. Les codes SH sont adaptés aux questions de commerce, pas à la preuve d'une production minière. AMIP doit expliquer leur rôle pour les importations, exportations, partenaires et produits. Les valeurs, quantités et classements par code doivent venir de la base de commerce.

## Unités de Mesure

Les quantités AMIP sont généralement normalisées en tonnes métriques lorsque les sources le permettent. Certaines substances conservent des unités ou libellés de stade propres aux sources; l'interprétation doit donc suivre la définition du produit. Une tonne de minerai, une tonne de concentré et une tonne de métal raffiné ne représentent pas le même contenu physique ou économique. Le corpus doit expliquer le sens des unités, tandis que SQL doit fournir les quantités et conversions exactes. Pour les comparaisons, la réponse doit préciser si l'on compare par quantité, valeur, pays, année, partenaire ou forme de produit.

## Normalisation en Unité de Base

La normalisation en unité de base convertit les quantités sources vers une unité commune afin de comparer les enregistrements entre années, pays et sources. Elle peut inclure conversion d'unités, standardisation des noms de produits, harmonisation des pays et rattachement des variantes à une substance de base. Elle ne supprime pas le sens des produits : minerai de fer, pellets, fer réduit direct, fonte, acier, billettes et barres d'armature restent des stades différents. La normalisation améliore l'analyse et la recherche, mais l'utilisateur doit regarder la forme du produit, la source et le sens du flux. Les valeurs normalisées exactes relèvent de SQL.

## Couverture Temporelle

Les données de production AMIP couvrent 2010-2024 pour les pays et substances disponibles. Les données commerciales vont actuellement jusqu'en 2023. Ces fenêtres décrivent la période couverte par l'entrepôt, mais ne garantissent pas qu'un couple pays-substance possède un enregistrement chaque année. Certains pays ont une couverture large; d'autres ont une activité limitée ou une déclaration plus rare. Pour les questions temporelles, AMIP doit distinguer la fenêtre globale de la dernière donnée disponible pour la requête précise. Les années manquantes, tendances et comparaisons doivent être calculées par SQL.

## Périmètre des Minéraux Solides

AMIP se concentre sur les minéraux solides, les matériaux de carrière, les produits de transformation minérale et les classifications commerciales de produits minéraux. Il inclut par exemple roche phosphatée, minerai de fer, or, cuivre, gypse, sel, potasse, calcaire, ciment, argiles, silice, produits de l'aluminium, produits sidérurgiques et minéraux critiques du commerce. Il ne doit pas être élargi au pétrole, au gaz ou aux hydrocarbures. Certains libellés anciens peuvent apparaître comme cas limites, mais ils doivent être traités comme notes de périmètre et non comme preuve d'un portail énergétique.

## Sources de Données

AMIP utilise des données issues de ministères arabes des mines et de l'énergie lorsque ces ministères publient des statistiques minières, de services géologiques nationaux, d'agences statistiques, d'autorités douanières et commerciales, ainsi que d'organismes internationaux de commerce ou de statistiques. Les sources diffèrent par noms de produits, langues, unités, calendriers et classifications; l'entrepôt harmonise donc les noms et unités lorsque c'est possible. Le corpus doit décrire les familles de sources et la méthode sans inventer de valeurs. Les réponses numériques doivent s'appuyer sur les tables structurées approuvées et conserver une interprétation prudente, surtout pour les pays à données limitées.
