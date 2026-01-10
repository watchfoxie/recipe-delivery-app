const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'apps', 'api', 'src', 'database', 'feed-schemas', 'pseudo-recipes.json');
const DEST_PATH = path.join(ROOT, 'apps', 'api', 'src', 'database', 'feed-schemas', 'raw-recipes-list.json');

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const isSubcategory = (value) => value && typeof value === 'object' && 'id_subcategorie' in value && 'DTO_pentru_corpul_cererii' in value;

const collectSubcategories = (category) => Object.values(category).flatMap((value) => (Array.isArray(value) ? value.filter(isSubcategory) : []));

const collectRecipesSorted = (data) => {
    const collected = [];

    for (const category of Array.isArray(data) ? data : []) {
        for (const subcategory of collectSubcategories(category)) {
            const subId = Number(subcategory.id_subcategorie);
            const recipes = Array.isArray(subcategory.DTO_pentru_corpul_cererii) ? subcategory.DTO_pentru_corpul_cererii : [];

            for (const recipe of recipes) {
                if (recipe && typeof recipe === 'object' && Object.keys(recipe).length > 0) {
                    collected.push({
                        idSubcategorie: Number.isFinite(subId) ? subId : subcategory.id_subcategorie,
                        recipe,
                    });
                }
            }
        }
    }

    collected.sort((a, b) => {
        const aId = Number(a.idSubcategorie);
        const bId = Number(b.idSubcategorie);

        if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId;
        if (Number.isFinite(aId)) return -1;
        if (Number.isFinite(bId)) return 1;
        return String(a.idSubcategorie).localeCompare(String(b.idSubcategorie));
    });

    return collected.map((entry) => entry.recipe);
};

const writeRecipes = async (recipes) => {
    const payload = { recipes_list: recipes };
    await fs.writeFile(DEST_PATH, `${JSON.stringify(payload, null, 4)}\n`, 'utf8');
};

(async () => {
    try {
        const sourceData = await readJson(SOURCE_PATH);
        const recipes = collectRecipesSorted(sourceData);
        await writeRecipes(recipes);
        console.log(`S-au extras ${recipes.length} rețete sortate după id_subcategorie.`);
        console.log(`Scris în ${DEST_PATH}`);
    } catch (error) {
        console.error('Nu s-au putut extrage rețetele:', error);
        process.exitCode = 1;
    }
})();
