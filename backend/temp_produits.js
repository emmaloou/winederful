"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const produits_1 = require("../controleurs/produits");
const router = (0, express_1.Router)();
router.get('/', produits_1.obtenirProduits);
router.get('/:id', produits_1.obtenirProduitParId);
exports.default = router;
