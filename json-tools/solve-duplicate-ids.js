const fs = require('node:fs');
const p = 'apps/api/src/database/json-schemas/ingredients-list.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
let id = 1;
const walk = o => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
        if (Object.prototype.hasOwnProperty.call(o, 'ingredientId')) o.ingredientId = id++;
        Object.values(o).forEach(walk);
    }
};
walk(data);
fs.writeFileSync(p, JSON.stringify(data, null, 4) + '\n');
console.log('renumerotat la', id - 1, 'ingrediente');
