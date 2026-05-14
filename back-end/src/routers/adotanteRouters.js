const { Router } = require("express");
const AdotanteRegisterController = require("../controllers/adotanteRegisterController");
const AdotanteLoginController = require("../controllers/adotanteLoginController");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");

const routes = new Router();

routes.post("/adotanteRegister", AdotanteRegisterController.store);
routes.post("/adotanteLogin", AdotanteLoginController.store);

// Rotas abaixo exigem autenticação
routes.use(authMiddleware);
routes.get("/adotantes/perfil", AdotanteRegisterController.show);
routes.get("/adotantes", requireRole(["VARA", "INSTITUICAO"]), AdotanteRegisterController.indexForVara);

module.exports = routes;
