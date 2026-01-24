const fs = require('node:fs');
const path = require('node:path');

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');
const allowUnclassified = args.has('--allow-unclassified');
const pretty = args.has('--pretty');

const workspaceRoot = process.cwd();
const inputPath = path.join(workspaceRoot, 'apps/api/src/database/feed-schemas/raw-ingredients-list.json');
const outputPath = path.join(workspaceRoot, 'apps/api/src/database/feed-schemas/ingredients-categories.json');

const rawInput = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const ingredients = rawInput.ingredients_list ?? rawInput.ingredient_list;

if (!Array.isArray(ingredients)) {
  throw new Error('Se așteaptă ca ingredients_list sau ingredient_list să fie un array în JSON-ul de intrare');
}

const stripDiacritics = (s) => String(s ?? '')
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '');

const normalize = (s) => stripDiacritics(s).toLowerCase();

const testAny = (text, patterns) => patterns.some((p) => p.test(text));

// Rule order matters (more specific first).
const rules = [
  {
    id: 7,
    name: 'peste',
    patterns: [
      /\bfructe de mare\b/,
      /\bcrevet\w*\b/,
      /\bmidii\b/,
      /\bcalamar\w*\b/,
      /\bcaracat\w*\b/,
      /\bton\b/,
      /\bsomon\b/,
      /\bcod\b/,
      /\bpastrav\b/,
      /\bcrap\b/,
      /\bmacrou\b/,
      /\bsard(in|ine|ela)\w*\b/,
      /\bhering\b/,
      /\bpeste\b/,
    ],
  },
  {
    id: 6,
    name: 'carne',
    patterns: [
      /\bbacon\b/,
      /\bprosciutto\b/,
      /\bsunca\b/,
      /\bsalam\b/,
      /\bcarnati\b/,
      /\bpastrama\b/,
      /\bparizer\b/,
      /\bficat\w*\b/,
      /\bpipote\b/,
      /\binim\w*\b/,
      /\borgane\b/,
      /\bpui\b/,
      /\bcurcan\b/,
      /\bporc\b/,
      /\bvit(a|e|\u0103)\b/,
      /\bmiel\b/,
      /\brat\w*\b/,
      /\bgasca\b/,
      /\biepure\b/,
      /\bcarne\b/,
    ],
  },
  {
    id: 10,
    name: 'nuci_si_seminte',
    patterns: [
      /\btahini\b/,
      /\bsusan\b/,
      /\bchia\b/,
      /\bnuci?\b/,
      /\bmigdale\b/,
      /\balune\b/,
      /\bfistic\b/,
      /\bcaju\b/,
      /\barahide\b/,
      /\bpin\b/,
      /\bseminte\b/,
      /\bseminte de susan\b/,
      /\bseminte de dovleac\b/,
      /\bseminte de in\b/,
      /\bflax(seed)?\b/,
      /\bunt de arahide\b/,
    ],
  },
  {
    id: 8,
    name: 'lactate_si_oua',
    patterns: [
      /\boua?\b/,
      /\bou\b/,
      /\balbus\b/,
      /\bgalbenus\b/,
      /\blapte\b/,
      /\biaurt\b/,
      /\bkefir\b/,
      /\bsmantan\w*\b/,
      /\bfrisca\b/,
      /\bbranza\b/,
      /\bcascaval\b/,
      /\btelemea\b/,
      /\bmozzarella\b/,
      /\bparmezan\b/,
      /\bmascarpone\b/,
      /\bricotta\b/,
      /\burda\b/,
      /\bfeta\b/,
      /\bcrema( de)?\b/,
    ],
  },
  {
    id: 9,
    name: 'grasimi_si_uleiuri',
    patterns: [
      /\bulei\b/,
      /\bunt\b/,
      /\bmargarina\b/,
      /\buntura\b/,
      /\bghee\b/,
      /\bgrasime\b/,
    ],
  },
  {
    id: 3,
    name: 'condimente_si_ierburi',
    patterns: [
      /\bmirodenii\b/,
      /\bmenta\b/,
      /\bchimion\b/,
      /\bturmeric\b/,
      /\bpraf de copt\b/,
      /\bvanilie\b/,
      /\besenta de vanilie\b/,
      /\bgelatina\b/,
      /\b(dafin|frunza de dafin)\b/,
      /\bsare\b/,
      /\bpiper\b/,
      /\bboia\b/,
      /\bcimbru\b/,
      /\boregano\b/,
      /\bbusuioc\b/,
      /\bpatrunjel\b/,
      /\bmarar\b/,
      /\brozmarin\b/,
      /\bcoriandru\b/,
      /\bchimen\b/,
      /\bscortisoara\b/,
      /\bnucsoara\b/,
      /\bghimbir\b/,
      /\bcurry\b/,
      /\botet\b/,
      /\bmustar\b/,
      /\bketchup\b/,
      /\bmaioneza\b/,
      /\bsos\b/,
      /\bcondiment\b/,
      /\bulei esential\b/,
    ],
  },
  {
    id: 11,
    name: 'bauturi',
    patterns: [
      /\bapa\b/,
      /\bvin\b/,
      /\bbere\b/,
      /\bcafea\b/,
      /\bceai\b/,
      /\blichior\b/,
      /\brom\b/,
      /\bconiac\b/,
      /\bvodca\b/,
      /\bgin\b/,
    ],
  },
  {
    id: 5,
    name: 'dulciuri_si_zahar',
    patterns: [
      /\bzahar\b/,
      /\bmiere\b/,
      /\bsirop\b/,
      /\bciocolat\w*\b/,
      /\bcacao\b/,
      /\bgem\b/,
      /\bdulceata\b/,
      /\bcaramel\w*\b/,
      /\bindulcitor\b/,
      /\bmelasa\b/,
    ],
  },
  {
    id: 4,
    name: 'fructe',
    patterns: [
      /\bmasline\b/,
      /\bmerisoar\w*\b/,
      /\bstafid\w*\b/,
      /\bcurmal\w*\b/,
      /\bfruct\w*\b/,
      /\bmar\b/,
      /\bpara\b/,
      /\bbanana\b/,
      /\bportocal\w*\b/,
      /\blama\w*\b/,
      /\bcapsun\w*\b/,
      /\bzmeur\w*\b/,
      /\bafin\w*\b/,
      /\bvisin\w*\b/,
      /\bprun\w*\b/,
      /\bstrugur\w*\b/,
      /\bananas\b/,
      /\bkiwi\b/,
      /\bpiersic\w*\b/,
      /\bcais\w*\b/,
      /\bcocos\b/,
    ],
  },
  {
    id: 1,
    name: 'cereale',
    patterns: [
      /\bfoi de placinta\b/,
      /\baluat\b/,
      /\bfoietaj\b/,
      /\bdrojdie\b/,
      /\bmaia\b/,
      /\bfaina\b/,
      /\borez\b/,
      /\bpaste\b/,
      /\bspaghete\b/,
      /\bpaine\b/,
      /\bpesmet\b/,
      /\bgris\b/,
      /\bmalai\b/,
      /\bovaz\b/,
      /\bfulgi\b/,
      /\bquinoa\b/,
      /\bbulgur\b/,
      /\bcouscous\b/,
      /\btortilla\b/,
      /\bamidon\b/,
    ],
  },
  {
    id: 2,
    name: 'legume',
    patterns: [
      /\bsparanghel\b/,
      /\bdovleac\b/,
      /\bro(s|ș)ii\b/,
      /\btomate\b/,
      /\bpassata\b/,
      /\bpasta de tomate\b/,
      /\bceapa\b/,
      /\busturoi\b/,
      /\bmorcov\b/,
      /\bcartof\w*\b/,
      /\brosi\w*\b/,
      /\bardei\b/,
      /\bcastravete\b/,
      /\bvarz\w*\b/,
      /\bsalata\b/,
      /\bspanac\b/,
      /\bbroccoli\b/,
      /\bconopida\b/,
      /\bfasole\b/,
      /\blinte\b/,
      /\bnaut\b/,
      /\bmazare\b/,
      /\bciuperc\w*\b/,
      /\bdovlecel\b/,
      /\bvinete\b/,
      /\bsfecl\w*\b/,
      /\bpraz\b/,
      /\btelin\w*\b/,
      /\bporumb\b/,
      /\blegume\b/,
    ],
  },
];

const rulesById = new Map(rules.map((r) => [r.id, r]));
const orderedRuleIds = [7, 6, 9, 3, 8, 10, 5, 4, 1, 2, 11];
const orderedRules = orderedRuleIds.map((id) => {
  const rule = rulesById.get(id);
  if (!rule) throw new Error(`Regula de clasificare lipsă pentru id=${id}`);
  return rule;
});

function classifyIngredient(ingredient) {
  const nameNorm = normalize(ingredient.name);
  const haystack = [ingredient.name, ...(ingredient.synonyms ?? [])]
    .map(normalize)
    .join(' | ');

  // Special-cases to avoid common false positives.
  if (/\blapte (vegan|vegetal)\b|\bplant milk\b|\blapte de (migdale|soia)\b/.test(haystack)) {
    return 11;
  }

  if (/\bpasta de tomate\b|\bsuc de rosii\b|\bsuc de sfecl\w*\b/.test(haystack)) {
    return 2;
  }

  // Prefer the primary name over potentially noisy synonyms.
  if (/\boua?\b|\bou\b|\balbus\b|\bgalbenus\b|\blapte\b|\biaurt\b|\bkefir\b|\bsmantan\w*\b|\bfrisca\b|\bbranza\b|\bcascaval\b|\btelemea\b|\bmozzarella\b|\bparmezan\b|\bmascarpone\b|\bricotta\b|\burda\b|\bfeta\b/.test(nameNorm)) {
    return 8;
  }

  for (const rule of orderedRules) {
    if (testAny(haystack, rule.patterns)) return rule.id;
  }
  return null;
}

const byCategoryId = new Map([
  [1, []], [2, []], [3, []], [4, []], [5, []], [6, []], [7, []], [8, []], [9, []], [10, []], [11, []],
]);

const unclassified = [];
for (const ingredient of ingredients) {
  const categoryId = classifyIngredient(ingredient);
  if (!categoryId) {
    unclassified.push(ingredient);
    continue;
  }
  byCategoryId.get(categoryId).push({
    ...ingredient,
    ingredientCategoryId: categoryId,
  });
}

const counts = [...byCategoryId.entries()].map(([id, list]) => ({ id, count: list.length }));
console.log(`Total ingrediente: ${ingredients.length}`);
console.log('Număr de ingrediente pe categorie:', counts.map((c) => `${c.id}:${c.count}`).join(' '));
if (unclassified.length) {
  console.log(`Neclasificate: ${unclassified.length}`);
  console.log(unclassified.slice(0, 80).map((x) => x.name).join(' | '));
  if (!allowUnclassified) {
    process.exitCode = 2;
  }
}

if (shouldWrite) {
  const output = [
    { ingredient_category_id: 1, category: 'cereale', cereals_list: byCategoryId.get(1) },
    { ingredient_category_id: 2, category: 'legume', vegetables_list: byCategoryId.get(2) },
    { ingredient_category_id: 3, category: 'condimente_si_ierburi', spices_and_herbs_list: byCategoryId.get(3) },
    { ingredient_category_id: 4, category: 'fructe', fruits_list: byCategoryId.get(4) },
    { ingredient_category_id: 5, category: 'dulciuri_si_zahar', sweets_and_sugar_list: byCategoryId.get(5) },
    { ingredient_category_id: 6, category: 'carne', meat_list: byCategoryId.get(6) },
    { ingredient_category_id: 7, category: 'peste', fish_list: byCategoryId.get(7) },
    { ingredient_category_id: 8, category: 'lactate_si_oua', dairy_products_and_eggs_list: byCategoryId.get(8) },
    { ingredient_category_id: 9, category: 'grasimi_si_uleiuri', fats_and_oils_list: byCategoryId.get(9) },
    { ingredient_category_id: 10, category: 'nuci_si_seminte', nuts_and_seeds_list: byCategoryId.get(10) },
    { ingredient_category_id: 11, category: 'bauturi', drinks_list: byCategoryId.get(11) },
  ];

  const serialized = pretty
    ? JSON.stringify(output, null, 4)
    : JSON.stringify(output);

  fs.writeFileSync(outputPath, serialized + '\n', 'utf8');
  console.log(`Înscris: ${path.relative(workspaceRoot, outputPath)}`);
}
