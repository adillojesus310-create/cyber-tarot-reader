const fs = require("fs");
const path = require("path");

process.env.EXPORT_TAROT_KNOWLEDGE = "1";
const { buildDeck } = require("../server.js");

const outDir = path.join(__dirname, "..", "data");
const outFile = path.join(outDir, "tarot-knowledge.json");

fs.mkdirSync(outDir, { recursive: true });
const deck = buildDeck();
deck.exportedAt = new Date().toISOString();
deck.sourceMode = "bundled-export";
fs.writeFileSync(outFile, JSON.stringify(deck, null, 2), "utf8");
console.log(`Exported ${deck.cards.length} cards to ${outFile}`);
