const fs = require('fs');

const missingData = JSON.parse(fs.readFileSync('i:/Otros/WEB/missing_items_report.json', 'utf8'));

// Description Pools
const descPool = {
    "armas": [
        "Un arma fiable para sobrevivir en las calles de Night City.",
        "Potencia de fuego pura, sin preguntas.",
        "Ideal para encargos corporativos o ajustes de cuentas.",
        "Mantenimiento sencillo, daño letal.",
        "Herramienta de persuasión de alto calibre."
    ],
    "armaduras": [
        "Kevlar y polímeros de alta resistencia para salvar tu pellejo.",
        "Protección balística garantizada. No salgas sin ella.",
        "Ligera pero resistente. Ideal para tiroteos sorpresivos.",
        "Blindaje estandarizado táctico. Discreción y seguridad."
    ],
    "cyberware": [
        "Cromo de primera calidad. Siente la mejora en tu propia carne.",
        "Implantes neuronales y físicos directo del mercado negro.",
        "Mejora tu anatomía. El futuro es de metal y cables.",
        "Tecnología cibernética de última generación. Sincronización perfecta."
    ],
    "vehiculos": [
        "Movilidad en la jungla de asfalto. Tan rápido como peligroso.",
        "Chasis reforzado y motor ruidoso. Domina las calles.",
        "Transporte fiable para ti y tu equipo táctico."
    ],
    "ropa": [
        "Estilo y actitud. En Night City la apariencia lo es todo.",
        "Ropa de calle resistente, porque nunca sabes cuándo habrá un tiroteo.",
        "Última tendencia en moda urbana y corporativa."
    ],
    "drogas": [
        "Química callejera. Úsala bajo tu propio riesgo.",
        "Estimulante de rápida acción de dudosa procedencia.",
        "Alteración sensorial garantizada. Cuidado con la adicción."
    ],
    "municion": [
        "Balas frescas. Nunca sobran cuando las cosas se ponen feas.",
        "Munición letal. Atraviesa chapa y carne por igual.",
        "Porque recargar es siempre la mejor jugada."
    ],
    "programas": [
        "Código intrusivo y rutinas de defensa para la Arquitectura.",
        "Hielo negro letal. Quema neuronas a los curiosos.",
        "Software avanzado para Netrunners atrevidos."
    ],
    "mejoras": [
        "Piezas de recambio y modificaciones técnicas.",
        "Lleva tu equipo al siguiente nivel con este añadido.",
        "Ajustes de hardware para maximizar el rendimiento."
    ],
    "equipamiento": [
        "Útiles de supervivencia urbana y hardware.",
        "Material de uso general básico. Siempre viene bien en un apuro.",
        "Herramientas indispensables para el mercenario moderno."
    ]
};

function getDesc(cat, name) {
    let pool = descPool[cat] || descPool["equipamiento"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return pool[Math.abs(hash) % pool.length];
}

function fixName(name) {
    let fixedName = name
        .replace(/Pistolamuypesada/gi, "Pistola Muy Pesada ")
        .replace(/Pistolamuy/gi, "Pistola Muy ")
        .replace(/Pistolapesada/gi, "Pistola Pesada ")
        .replace(/Pistolamediana/gi, "Pistola Mediana ")
        .replace(/Pistolamedia/gi, "Pistola Media ")
        .replace(/Pistolabasura/gi, "Pistola Basura ")
        .replace(/muypesada/gi, " Muy Pesada ")
        .replace(/armaduraperforante/gi, " Perforante de Armadura ")
        .replace(/Pesadaperforante/gi, "Pesada Perforante de Armadura ")
        .replace(/Pistolaarmadura/gi, "Pistola ")
        .replace(/incendiaria/gi, " Incendiaria ")
        .replace(/incendiario/gi, " Incendiario ")
        .replace(/inteligente/gi, " Inteligente ")
        .replace(/Basica/gi, " Básica ")
        .replace(/\s+/g, ' ').trim();

    // Capitalize properly any resulting lowercase letters at the start of words
    fixedName = fixedName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    // Restore proper lowercase for prepositions
    fixedName = fixedName.replace(/ De /g, " de ").replace(/ La /g, " la ").replace(/ El /g, " el ").replace(/ En /g, " en ");

    return fixedName;
}

function getCategoryAndSub(name, origin) {
    let lowerName = name.toLowerCase();

    // Avoid overriding programs
    if (origin === "Programas" || origin === "HieloNegro" || origin === "Medianoche") {
        return { cat: "programas", sub: origin === "Medianoche" ? "Midnight" : origin === "HieloNegro" ? "Black ICE" : "Programa" };
    }

    // 1. Keyword Overrides (Strongest to weakest precedence)

    // AMMO FIRST (avoids "Bala de Escopeta" becoming Weapon)
    if (/(munición|bala|babosa|proyectil|casquillo|batería)/.test(lowerName)) {
        return { cat: "municion", sub: "Munición" };
    }
    if (/(granada|paintball)/.test(lowerName)) {
        return { cat: "municion", sub: "Granada/Misc" };
    }

    // CYBERWARE SECOND (avoids "Marco Lineal" becoming Weapon because of "arco")
    if (/(ciber|cyber|óptico|implante|subdérmico|enlace|zócalo|chipware|neuron|holo|biónico|visor|órgano de|marco lineal|brazo|pierna)/.test(lowerName)) {
        // Only classify as cyberware if it explicitly mentions cyber things, or if it has these terms AND originated from cyberware
        if (origin === "Cyberware" || /(ciber|cyber|implante|subdérmico|chipware|neuron|holo|marco lineal)/.test(lowerName)) {
            return { cat: "cyberware", sub: "Cyberware" };
        }
    }

    // WEAPONS 
    if (/(pistola|rifle|fusil|escopeta|cuchillo|espada|machete|lanzagranadas|cañón|ballesta|boomerang|nudillos|molotov|hacha|lanzador|destructora)/.test(lowerName)) {
        return { cat: "armas", sub: "Arma" };
    }
    // Short generic weapons with word boundary-like protections to prevent "bate" matching "batería" and "arco" matching "marco"
    if (/(^|\s)(arco|bate|puño)(s)?(\s|$)/.test(lowerName) || /rinocepuño/.test(lowerName)) {
        return { cat: "armas", sub: "Arma" };
    }

    // ARMOR
    if (/(armadura|casco|blindaje|escudo|traje de patrullero|traje de montar)/.test(lowerName)) {
        return { cat: "armaduras", sub: "Armadura" };
    }

    // VEHICLES
    if (/(coche|moto|furgoneta|avión|helicóptero|triciclo|aerovox|autobús|rickshaw)/.test(lowerName)) {
        return { cat: "vehiculos", sub: "Vehículo" };
    }

    // CLOTHING
    if (/(chaqueta|camiseta|pantalones|sombrero|botas|gafas|traje|ropa|lentes de contacto|fondos genéricos|calzado genérico|tapa genérica)/.test(lowerName)) {
        return { cat: "ropa", sub: "Ropa" };
    }

    // DRUGS
    if (/(droga|frenético|coca|encaje negro|vidrio azul|aumentar|rapidetox)/.test(lowerName)) {
        return { cat: "drogas", sub: "Drogas" };
    }

    // 2. Fallback to Origin map if no strong keyword
    const originToCatMap = {
        "Armadura": "armaduras",
        "Armas": "armas", // if it reached here, maybe it's a uniquely named weapon without standard keywords
        "CromaNegro": "equipamiento",
        "Cyberware": "cyberware", // uniquely named cyberware
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

    let cat = originToCatMap[origin] || "equipamiento";
    let sub = origin;
    if (cat === "armas") sub = "Arma";
    else if (cat === "armaduras") sub = "Armadura";
    else if (cat === "cyberware") sub = "Cyberware";
    else if (cat === "vehiculos") sub = "Vehículo";
    else if (cat === "ropa") sub = "Ropa";
    else if (cat === "municion") sub = "Munición";
    else if (cat === "drogas") sub = "Drogas";
    else if (cat === "mejoras") sub = "Años 2020";
    else if (cat === "equipamiento") sub = "Supervivencia";

    return { cat: cat, sub: sub };
}

// --- Pricing Helper ---
function getPrice(cat, sub, name) {
    let lowerName = name.toLowerCase();

    // Cyberpunk RED standard price tiers: 10, 20, 50, 100, 500, 1000, 5000

    if (cat === "municion") {
        if (/(granada|biotoxina|veneno)/.test(lowerName)) return 100; // Expensive explosives/toxins
        if (/(paintball)/.test(lowerName)) return 10;
        return 50; // Standard box of ammo is usually 50eb
    }

    if (cat === "armas") {
        if (/muy pesada/.test(lowerName)) return 500;
        if (/pesada/.test(lowerName)) return 100;
        if (/(fusil|rifle|escopeta|lanzagranadas)/.test(lowerName)) return 500;
        if (/(cuchillo|bate|latigo|nudillos|puño)/.test(lowerName)) return 50;
        if (/(espada|machete|hacha)/.test(lowerName)) return 100;
        if (/inteligente/.test(lowerName)) return 1000;
        return 100; // Medium/Basic pistols
    }

    if (cat === "armaduras") {
        if (/(choque|ejecutiva)/.test(lowerName)) return 1000;
        if (/(casco|escudo)/.test(lowerName)) return 100;
        return 500; // Standard Light Armorjack equivalent
    }

    if (cat === "cyberware") {
        if (/(brazo|pierna|marco lineal)/.test(lowerName)) return 1000;
        if (/(ojo|visor|óptico)/.test(lowerName)) return 500;
        if (/(piel|cubierta|revestimiento)/.test(lowerName)) return 100;
        return 500; // Standard cyberware
    }

    if (cat === "vehiculos") {
        if (/(triciclo|moto)/.test(lowerName)) return 5000;
        if (/(coche|furgoneta|autobús)/.test(lowerName)) return 10000;
        if (/(avión|helicóptero|aerovox)/.test(lowerName)) return 50000; // AVs
        return 20000;
    }

    if (cat === "programas") {
        if (sub === "Black ICE" || sub === "Midnight") return 500;
        return 100; // Standard programs
    }

    if (cat === "drogas") {
        return 50;
    }

    if (cat === "ropa") {
        if (/(traje|ejecutiva)/.test(lowerName)) return 500;
        if (/genérico/.test(lowerName)) return 10;
        return 50;
    }

    if (cat === "mejoras") {
        if (/(cañón|ametralladora|cohete)/.test(lowerName)) return 1000;
        return 500;
    }

    // Equipamiento/Supervivencia fallback
    if (/(radio|amplificador|impresora)/.test(lowerName)) return 100;
    if (/(tienda|saco de dormir|croquetas|agua|cuerda|llamarada)/.test(lowerName)) return 10; // Cheap survival items

    return 100; // Absolute fallback
}

let appendString = `  // ════════════════════════════════════════\n  // IMPORTACIÓN DE UNREAL ENGINE (TESTDATATABLE)\n  // ════════════════════════════════════════\n\n`;

missingData.forEach(item => {
    let cleanName = fixName(item.name);
    let { cat, sub } = getCategoryAndSub(cleanName, item.category);

    let safeName = cleanName.replace(/"/g, '\\"');
    let immersiveDesc = getDesc(cat, safeName);
    let overridePrice = getPrice(cat, sub, safeName);

    // Stats array is completely empty to hide the metadata marker from UI, dynamic pricing generated
    appendString += `  { name: "${safeName}", cat: "${cat}", sub: "${sub}", rarity: "standard", price: ${overridePrice}, stats: [], desc: "${immersiveDesc}" },\n`;
});

let itemsJsContent = fs.readFileSync('i:/Otros/WEB/items.js', 'utf8');

let markerIndex = itemsJsContent.indexOf('// IMPORTACIÓN DE UNREAL ENGINE');

if (markerIndex !== -1) {
    let cleanTopPart = itemsJsContent.substring(0, markerIndex).trim();
    let newContent = cleanTopPart + "\n\n" + appendString + "\n];\n";
    fs.writeFileSync('i:/Otros/WEB/items.js', newContent, 'utf8');
    console.log(`Successfully removed old imports and injected ${missingData.length} polished categorized items.`);
} else {
    console.error("Could not find the marker '// IMPORTACIÓN DE UNREAL ENGINE' to replace.");
}
