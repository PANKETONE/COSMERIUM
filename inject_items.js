const fs = require('fs');

const missingData = JSON.parse(fs.readFileSync('i:/Otros/WEB/missing_items_report.json', 'utf8'));

// Format to match the catalog structure
// { name: "X", cat: "...", sub: "...", rarity: "standard", price: 100, stats: [{ l: "...", t: "neutral" }], desc: "..." }

// Mapping Origin to basic store categories to keep the UI clean
const originToCatMap = {
    "Armadura": "armaduras",
    "Armas": "armas",
    "CromaNegro": "equipamiento",
    "Cyberware": "cyberware",
    "Dia12": "equipamiento",
    "Drogas": "drogas",
    "Equipamiento": "equipamiento",
    "Farmacia": "drogas",
    "HieloNegro": "programas",
    "Medianoche": "programas",
    "Mejoras": "mejoras",
    "Munición": "municion",
    "Programas": "programas",
    "Ropa": "ropa",
    "Vehículos": "vehiculos",
    "Woodchipers": "municion"
};

let appendString = `\n  // ════════════════════════════════════════\n  // IMPORTACIÓN DE UNREAL ENGINE (TESTDATATABLE)\n  // ════════════════════════════════════════\n`;

missingData.forEach(item => {
    let internalCat = originToCatMap[item.category] || "equipamiento";
    let sub = item.category;

    // Prevent breaking quotes by escaping double quotes inside the strings
    let safeName = item.name.replace(/"/g, '\\"');
    let safeDesc = item.desc ? item.desc.replace(/"/g, '\\"') : "Objeto importado de la base de datos de UE4.";

    appendString += `  { name: "${safeName}", cat: "${internalCat}", sub: "${sub}", rarity: "standard", price: 100, stats: [{ l: "Extraído UE4", t: "neutral" }], desc: "${safeDesc}" },\n`;
});

// Read the current items
let itemsJsContent = fs.readFileSync('i:/Otros/WEB/items.js', 'utf8');

// Find the position of the last bracket ];
let lastIndex = itemsJsContent.lastIndexOf('];');

if (lastIndex !== -1) {
    // Insert right before the ];
    let newContent = itemsJsContent.substring(0, lastIndex) + appendString + "\n" + itemsJsContent.substring(lastIndex);
    fs.writeFileSync('i:/Otros/WEB/items.js', newContent, 'utf8');
    console.log(`Successfully injected ${missingData.length} items right before the closing bracket of items.js`);
} else {
    console.error("Could not find closing bracket ]; inside items.js to append.");
}
