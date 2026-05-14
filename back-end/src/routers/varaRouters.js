const { Router } = require("express");

// Importação dos controladores renomeados
const VaraRegisterController = require("../controllers/varaRegisterControllers");
const VaraLoginController = require("../controllers/varaLoginController");

const routes = new Router();

/**
 * Rotas Públicas da Vara
 */
// Cadastro de nova Vara
routes.post("/varaRegister", VaraRegisterController.store);

// Login e geração de Token JWT para a Vara
routes.post("/varaLogin", VaraLoginController.store);

module.exports = routes;
