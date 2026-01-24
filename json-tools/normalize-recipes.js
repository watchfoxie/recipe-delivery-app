#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');

const SRC_PATH = path.resolve(__dirname, '..', 'apps', 'api', 'src', 'database', 'feed-schemas', 'raw-recipes-list.json');
const DEST_PATH = path.resolve(__dirname, '..', 'apps', 'api', 'src', 'database', 'feed-schemas', 'recipes-seed.json');

const toNumberOrNull = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const normalizeSteps = (steps) => {
    if (!Array.isArray(steps)) {
        return [];
    }

    return steps
        .filter((step) => step && (step.stepOrder !== undefined || step.text !== undefined || step.timerSec !== undefined))
        .map((step) => ({
            stepOrder: toNumberOrNull(step.stepOrder),
            text: step.text ?? '',
            timerSec: toNumberOrNull(step.timerSec),
        }));
};

const normalizeIngredients = (ingredients) => {
    if (!Array.isArray(ingredients)) {
        return [];
    }

    return ingredients
        .filter((ingredient) => ingredient && ingredient.ingredientId !== undefined)
        .map((ingredient) => ({
            ingredientId: toNumberOrNull(ingredient.ingredientId),
            quantity: toNumberOrNull(ingredient.quantity),
            unit: ingredient.unit ?? null,
            note: ingredient.note ?? null,
        }));
};

const normalizeRecipe = (recipe) => ({
    slug: recipe.slug ?? '',
    title: recipe.title ?? '',
    difficulty: recipe.difficulty ?? null,
    totalTimeMin: toNumberOrNull(recipe.totalTimeMin),
    servings: toNumberOrNull(recipe.servings),
    ratingAvg: toNumberOrNull(recipe.ratingAvg),
    dietaryTags: Array.isArray(recipe.dietaryTags) ? recipe.dietaryTags.filter(Boolean) : [],
    description: recipe.description ?? '',
    authorId: toNumberOrNull(recipe.authorId),
    recipeCategoryId: toNumberOrNull(recipe.recipeCategoryId),
    steps: normalizeSteps(recipe.steps),
    ingredients: normalizeIngredients(recipe.ingredients),
});

async function main() {
    try {
        const raw = await fs.readFile(SRC_PATH, 'utf8');
        const data = JSON.parse(raw);

        if (!data || !Array.isArray(data.recipes_list)) {
            throw new Error('Intrarea trebuie să conțină un array `recipes_list`.');
        }

        const normalized = [];
        const skipped = [];

        data.recipes_list.forEach((recipe, index) => {
            if (!recipe || !recipe.slug) {
                skipped.push(index);
                return;
            }
            normalized.push(normalizeRecipe(recipe));
        });

        await fs.writeFile(DEST_PATH, `${JSON.stringify(normalized, null, 4)}\n`, 'utf8');

        console.log(`Normalizate ${normalized.length} rețete -> ${DEST_PATH}`);
        if (skipped.length > 0) {
            console.warn(`S-au omis ${skipped.length} rețetă fără slug la indexul: ${skipped.join(', ')}`);
        }
    } catch (err) {
        console.error('Normalizarea a eșuat:', err);
        process.exitCode = 1;
    }
}

main();
