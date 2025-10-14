"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const gestionErreurs_1 = require("./middlewares/gestionErreurs");
const produits_1 = __importDefault(require("./chemins/produits"));
const authentification_1 = __importDefault(require("./chemins/authentification"));
const baseDeDonnees_1 = require("./config/baseDeDonnees");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://app.localhost', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({ statut: 'ok', horodatage: new Date().toISOString() });
});
app.use('/api/produits', produits_1.default);
app.use('/api/auth', authentification_1.default);
app.use((req, res) => {
    res.status(404).json({ erreur: 'Route non trouvée', chemin: req.path });
});
app.use(gestionErreurs_1.gestionErreurs);
// Démarrage avec connexion DB
async function demarrer() {
    try {
        await (0, baseDeDonnees_1.connecterBaseDeDonnees)();
        app.listen(PORT, () => {
            console.log('🚀 API démarrée sur port', PORT);
        });
    }
    catch (error) {
        console.error('❌ Erreur démarrage:', error);
        process.exit(1);
    }
}
demarrer();
