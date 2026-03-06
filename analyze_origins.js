const fs = require('fs');

const ueDataRaw = fs.readFileSync('i:/Otros/WEB/TESTDATATABLE_GENERATED.json', 'utf16le');
const ueData = JSON.parse(ueDataRaw.replace(/^\uFEFF/, ''));

const origins = {};

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

                    // Extract origin: e.g. "Origen: Cyberware)"
                    const originMatch = desc.match(/Origen:\s*([^)]+)\)/);
                    if (originMatch && originMatch[1]) {
                        origin = originMatch[1].trim();
                    }
                }
            }

            if (!origins[origin]) {
                origins[origin] = { count: 0, examples: [] };
            }
            origins[origin].count++;
            if (origins[origin].examples.length < 5) {
                origins[origin].examples.push(cleanName);
            }
        }
    }
});

console.log("Found Origins:\n");
for (const [ori, data] of Object.entries(origins)) {
    console.log(`[${ori}]: ${data.count} items`);
    console.log(`  Examples: ${data.examples.join(', ')}\n`);
}
