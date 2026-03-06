const fs = require('fs');
const path = require('path');

const filePath = 'i:/Otros/WEB/items.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Extract the array content
// Find the start of the array
const arrayStartMarker = 'const CATALOG = [';
const arrayStartIdx = content.indexOf(arrayStartMarker);
if (arrayStartIdx === -1) {
    console.error("Could not find CATALOG array start.");
    process.exit(1);
}

const startOfItems = arrayStartIdx + arrayStartMarker.length;
const endOfItems = content.lastIndexOf('];');

if (endOfItems === -1) {
    console.error("Could not find CATALOG array end.");
    process.exit(1);
}

let itemsStr = content.substring(startOfItems, endOfItems);

// 2. Parse items using a more robust approach than simple regex
// Since these are JS objects (trailing commas, unquoted keys allowed), we'll use a trick
// We'll wrap it in a function and eval it safely to get the actual array object
let itemsArray = [];
try {
    itemsArray = eval('[' + itemsStr + ']');
} catch (e) {
    console.error("Error parsing items with eval. Falling back to regex extraction.", e);
    // Fallback: Regex for simple { ... } blocks
    const itemRegex = /\{[\s\S]*?\}(?=\s*,|\s*\]|\s*$)/g;
    let matches = itemsStr.match(itemRegex);
    if (matches) {
        matches.forEach(m => {
            try {
                itemsArray.push(eval('(' + m + ')'));
            } catch (err) { }
        });
    }
}

console.log(`Extracted ${itemsArray.length} items.`);

// 3. Group and Sort
const categoriesOrder = [
    "armas",
    "armaduras",
    "cyberware",
    "vehiculos",
    "ropa",
    "drogas",
    "municion",
    "programas",
    "mejoras",
    "equipamiento"
];

// Group by category
const grouped = {};
categoriesOrder.forEach(cat => grouped[cat] = []);

itemsArray.forEach(item => {
    if (!grouped[item.cat]) {
        grouped[item.cat] = [];
    }
    grouped[item.cat].push(item);
});

// Sort inside categories by name
for (let cat in grouped) {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
}

// 4. Reconstruct the file
let newItemsContent = "";

const catFriendlyNames = {
    "armas": "ARMAS — Callejeras y Corporativas",
    "armaduras": "ARMADURAS — Protección Personal",
    "cyberware": "CYBERWARE — Cromo e Implantes",
    "vehiculos": "VEHÍCULOS — Asfalto y Aire",
    "ropa": "ROPA — Estilo y Actitud",
    "drogas": "DROGAS — Química y Fármacos",
    "municion": "MUNICIÓN — Balística y Explosivos",
    "programas": "PROGRAMAS — Software de Red",
    "mejoras": "MEJORAS — Upgrades y Piezas",
    "equipamiento": "EQUIPAMIENTO — Supervivencia y Gear"
};

categoriesOrder.forEach(cat => {
    if (grouped[cat].length === 0) return;

    let friendlyName = catFriendlyNames[cat] || cat.toUpperCase();
    newItemsContent += `\n  // ════════════════════════════════════════\n`;
    newItemsContent += `  // ${friendlyName}\n`;
    newItemsContent += `  // ════════════════════════════════════════\n`;

    grouped[cat].forEach(item => {
        let statsStr = JSON.stringify(item.stats);
        // Clean up JSON output for JS style
        statsStr = statsStr.replace(/"(\w+)":/g, '$1:');

        let line = `  { name: "${item.name}", cat: "${item.cat}", sub: "${item.sub}", rarity: "${item.rarity}", price: ${item.price}, stats: ${statsStr}, desc: "${item.desc.replace(/"/g, '\\"')}" },`;
        newItemsContent += line + "\n";
    });
});

// Preserve the header comments
let header = content.substring(0, arrayStartIdx);
let newFullContent = header + arrayStartMarker + "\n" + newItemsContent + "\n];\n";

fs.writeFileSync(filePath, newFullContent, 'utf8');
console.log("items.js has been successfully sorted and reorganized.");
