const { Router } = require("express");

const ProcessoController = require("../controllers/processoController");
const authMiddleware = require("../middlewares/authMiddleware");
const VisitaController = require("../controllers/visitaContoller");

const requireRole = require("../middlewares/roleMiddleware");
const routes = new Router();

// Todas as rotas de processo exigem que o usuário esteja logado (seja Vara ou Adotante)
routes.use(authMiddleware);

// Rota para a Vara criar um novo processo para um adotante
routes.post("/processos", ProcessoController.store);

// Rota para a Vara avançar a etapa do processo
routes.put(
  "/processoUpdateEtapa/:id",
  requireRole(["VARA"]),
  ProcessoController.updateEtapa,
);

// --- Rotas da Vara ---
// Rota para a Vara ver o histórico de visitas/relatórios de um adotante específico
routes.get(
  "/processo/:processo_id/relatorios",
  requireRole(["VARA"]),
  VisitaController.showForVara,
);

// Rota para o Adotante consultar o status do seu próprio processo
routes.get("/processos/meu-processo", ProcessoController.show);

module.exports = routes;
