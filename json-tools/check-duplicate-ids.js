const fs = require('node:fs');
const data = JSON.parse(fs.readFileSync('apps/api/src/database/json-schemas/ingredients-list.json', 'utf8'));
let ids = [];

function walk(obj) {
    if (Array.isArray(obj)) {
        obj.forEach(walk);
    } else if (obj && typeof obj === 'object') {
        if (obj.ingredientId != null) ids.push(obj.ingredientId);
        Object.values(obj).forEach(walk);
    }
}
walk(data);
const dup = ids.filter((v, i, a) => a.indexOf(v) !== i);
const set = new Set(ids);
const min = Math.min(...ids);
const max = Math.max(...ids);
console.log('număr', ids.length, 'unice', set.size, 'min', min, 'max', max);
console.log('lipsește', Array.from({
    length: max - min + 1
}, (_, i) => i + min).filter(v => !set.has(v)).slice(0, 50));
console.log('duplicate', Array.from(new Set(dup)).slice(0, 50));
