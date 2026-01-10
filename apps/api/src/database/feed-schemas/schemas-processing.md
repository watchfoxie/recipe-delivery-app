# Ordinea de procesare a datelor

Ingrediente:

1. `pseudo-recipes.json`;
2. `raw-ingredients-list.json`;
3. `ingredients-categories.json`;
4. `ingredients-list.json`;
5. `ingredients-seed.json`;

Operații ingrediente:

1. `pseudo-recipes.json` -> `extract-ingredients.js` -> `raw-ingredients-list.json`
2. `raw-ingredients-list.json` -> `classify-ingredients.js` -> `ingredients-categories.json`
3. `ingredients-categories.json` -> `extract-ingredients-2.js` -> `ingredients-list.json`
4. `ingredients-list.json` -> `normalize-ingredients.js` -> `ingredients-seed.json`

Rețete:

1. `pseudo-recipes.json`;
2. `raw-recipes-list.json`;
3. `recipes-seed.json`;

Operații rețete:

1. `pseudo-recipes.json` -> `extract-recipes.js` -> `raw-recipes-list.json`
2. `raw-recipes-list.json` -> `normalize-recipes.js` -> `recipes-seed.json`
