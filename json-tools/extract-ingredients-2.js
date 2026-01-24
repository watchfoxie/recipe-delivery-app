#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');

const SRC_PATH = path.resolve(__dirname, '..', 'apps', 'api', 'src', 'database', 'feed-schemas', 'ingredients-categories.json');
const DEST_PATH = path.resolve(__dirname, '..', 'apps', 'api', 'src', 'database', 'feed-schemas', 'ingredients-list.json');

// Recursively walk the JSON structure and gather any object containing an `ingredientId` key.
function collectIngredients(node, seen, conflicts) {
    if (node === null || node === undefined) {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach((child) => collectIngredients(child, seen, conflicts));
        return;
    }

    if (typeof node !== 'object') {
        return;
    }

    if (Object.prototype.hasOwnProperty.call(node, 'ingredientId')) {
        const id = Number(node.ingredientId);
        if (!Number.isFinite(id)) {
            console.warn('S-a sărit peste ingredientul cu ingredientId non-numeric:', node);
        } else {
            const normalized = { ...node, ingredientId: id };
            const existing = seen.get(id);

            if (!existing) {
                seen.set(id, normalized);
            } else if (!isDeepStrictEqual(existing, normalized)) {
                conflicts.push({ id, existing, incoming: normalized });
            }
        }
    }

    Object.values(node).forEach((child) => collectIngredients(child, seen, conflicts));
}

async function main() {
    try {
        const raw = await fs.readFile(SRC_PATH, 'utf8');
        const data = JSON.parse(raw);

        const seen = new Map();
        const conflicts = [];
        collectIngredients(data, seen, conflicts);

        const ingredients = Array.from(seen.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([, value]) => value);

        const output = {
            ingredients_list: ingredients,
        };

        await fs.writeFile(DEST_PATH, `${JSON.stringify(output, null, 4)}\n`, 'utf8');

        console.log(`S-au extras ${ingredients.length} ingrediente unice -> ${DEST_PATH}`);
        if (conflicts.length > 0) {
            console.warn('Duplicate conflicte detectate (s-au păstrat prima apariție):');
            conflicts.forEach(({ id }) => {
                console.warn(` - ingredientId ${id}`);
            });
        }
    } catch (err) {
        console.error('Extragerea a eșuat:', err);
        process.exitCode = 1;
    }
}

main();
