# Bénin 3D

Une descente continue de l'orbite basse jusqu'aux douze départements du Bénin.
La position dans le texte et la position de la caméra au-dessus du pays sont la même
chose : chaque section possède une station (latitude, longitude, altitude), et le
défilement interpole entre deux stations consécutives.

Aucune texture, aucune image satellite. Le globe est calculé, et les frontières sont
tracées à partir de données ouvertes.

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Données

Deux familles de données, séparées et vérifiables.

**Géométrie** — `src/data/geo.json`, produit par `scripts/build-geo.mjs` à partir des
GeoJSON bruts conservés dans `raw/` :

| Fichier | Source | Contenu |
| --- | --- | --- |
| `raw/land110.geojson` | Natural Earth 1:110m | terres émergées du globe |
| `raw/adm0_*.geojson` | geoBoundaries gbOpen ADM0 | Bénin et ses quatre voisins |
| `raw/ben_adm1.geojson` | geoBoundaries gbOpen ADM1 | les 12 départements |

```bash
node scripts/build-geo.mjs
```

Le script aplatit les anneaux, arrondit à trois décimales (~110 m), corrige
l'orthographe des départements et vérifie qu'il y en a bien douze. Il échoue si le
GeoJSON contient un nom de département inconnu.

**Chiffres** — `src/data/benin.ts`. Chaque valeur porte son millésime et sa source :
Banque mondiale (indicateurs 2023–2025), INStaD (RGPH4, 2013), CIA World Factbook
(côte, frontières terrestres), UNESCO, et l'article de synthèse de Wikipédia pour les
dimensions du territoire. La section « D'où viennent ces chiffres » les liste en clair
sur la page.

Les valeurs de la Banque mondiale ont été relevées via son API :

```bash
curl "https://api.worldbank.org/v2/country/BEN/indicator/SP.POP.TOTL?format=json&mrnev=1"
```

## Comment c'est construit

- `src/lib/descent.ts` — les stations caméra, l'ordre des sections, l'interpolation.
  Une section connaît le côté où se pose son texte ; la caméra décale sa fenêtre de
  projection à l'opposé, pour que le pays ne passe jamais sous le panneau. Les deux
  viennent de la même déclaration : ils ne peuvent pas se désynchroniser.
- `src/lib/geo.ts` — projection sur la sphère, triangulation des polygones, graticule.
- `src/components/scene/Scene.tsx` — le globe, les couches, la caméra. Les seuils
  d'apparition s'expriment par rapport à une section nommée (`at('departements')`)
  plutôt qu'en nombres bruts : insérer une section ne les décale pas.
- `src/lib/theme.ts` — la palette, et l'échelle de densité des départements. La clarté
  augmente avec la densité, pour que la carte se lise sans consulter la légende.
- `src/lib/hover.ts` — le département survolé, partagé entre la carte 3D et le tableau
  HTML dans les deux sens.

Le défilement n'entraîne aucun re-render React : il écrit dans l'objet `view`, que la
boucle de rendu lit à chaque frame.
