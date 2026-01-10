#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '..', 'apps', 'api', 'src', 'database', 'feed-schemas', 'ingredients-list.json');
const destinationPath = path.resolve(__dirname, '..', 'apps', 'api', 'src', 'database', 'feed-schemas', 'ingredients-seed.json');

function loadJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function normalizeSynonyms(rawSynonyms) {
  if (!Array.isArray(rawSynonyms)) {
    return [];
  }

  const seen = new Set();
  const cleaned = [];

  rawSynonyms
    .map((item) => (item ?? '').toString().trim())
    .filter(Boolean)
    .forEach((item) => {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        cleaned.push(item);
      }
    });

  return cleaned;
}

function sortByIngredientId(items) {
  return [...items].sort((a, b) => {
    const aId = Number(a.ingredientId);
    const bId = Number(b.ingredientId);

    const aValid = Number.isFinite(aId);
    const bValid = Number.isFinite(bId);

    if (aValid && bValid) return aId - bId;
    if (aValid) return -1;
    if (bValid) return 1;
    return 0;
  });
}

function transformIngredients(items) {
  return sortByIngredientId(items).map((item) => {
    const ingredientCategoryId = item.ingredientCategoryId;
    const name = item.name;
    const synonyms = normalizeSynonyms(item.synonyms);

    if (ingredientCategoryId === undefined) {
      console.warn(`WARN: Lipsă ingredientCategoryId pentru ingredientId=${item.ingredientId ?? 'necunoscut'}`);
    }
    if (!name) {
      console.warn(`WARN: Lipsă nume pentru ingredientId=${item.ingredientId ?? 'necunoscut'}`);
    }

    return {
      ingredientCategoryId,
      name,
      synonyms,
    };
  });
}

function main() {
  const source = loadJson(sourcePath);
  if (!source || !Array.isArray(source.ingredients_list)) {
    throw new Error('Formatul sursei este invalid: se aștepta un array ingredients_list.');
  }

  const transformed = transformIngredients(source.ingredients_list);
  fs.writeFileSync(destinationPath, `${JSON.stringify(transformed, null, 2)}\n`, 'utf8');
  console.log(`S-au scris ${transformed.length} ingrediente în ${destinationPath}`);
}

main();
