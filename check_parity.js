const fs = require('fs');

let itemsJsContent = fs.readFileSync('i:/Otros/WEB/items.js', 'utf8');
const itemsJsNames = new Set();
const nameRegex = /name:\s*"([^"]+)"/g;
let match;
while ((match = nameRegex.exec(itemsJsContent)) !== null) {
    itemsJsNames.add(match[1].toLowerCase().trim());
}

const ueDataRaw = fs.readFileSync('i:/Otros/WEB/TESTDATATABLE_GENERATED.json', 'utf16le');
const ueData = JSON.parse(ueDataRaw.replace(/^\uFEFF/, ''));

// Origins that correspond to real, purchasable/usable items
const validOrigins = [
    "Armadura", "Armas", "CromaNegro", "Cyberware", "Dia12",
    "Drogas", "Equipamiento", "Farmacia", "HieloNegro",
    "Medianoche", "Mejoras", "Munición", "Programas", "Ropa",
    "Vehículos", "Woodchipers"
];

const missingItems = [];

ueData.forEach(entry => {
    if (entry.Name && entry.Name.includes('TESTDATATABLE_')) {
        const nameMatch = entry.Name.match(/NSLOCTEXT\([^,]+,\s*"[^"]+",\s*"(.*)"\)/);

        if (nameMatch && nameMatch[1]) {
            let cleanName = nameMatch[1].trim();

            let desc = "";
            let origin = "Unknown";
            if (entry.LongDesc) {
                const descMatch = entry.LongDesc.match(/NSLOCTEXT\([^,]+,\s*"[^"]+",\s*"(.*)"\)/);
                if (descMatch && descMatch[1]) {
                    desc = descMatch[1].replace(/<[^>]*>?/gm, ''); // Remove HTML tags
                    const originMatch = desc.match(/Origen:\s*([^)]+)\)/);
                    if (originMatch && originMatch[1]) {
                        origin = originMatch[1].trim();
                    }
                }
            }

            if (validOrigins.includes(origin) && !itemsJsNames.has(cleanName.toLowerCase())) {
                missingItems.push({
                    name: cleanName,
                    category: origin, // Using Origin as the temporary subcategory
                    desc: desc
                });
            }
        }
    }
});

console.log(`Found ${missingItems.length} genuinely missing items based on valid Origins.`);

fs.writeFileSync('i:/Otros/WEB/missing_items_report.json', JSON.stringify(missingItems, null, 2), 'utf8');
