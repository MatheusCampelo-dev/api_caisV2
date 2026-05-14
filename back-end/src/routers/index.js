const { Router } = require("express");

const AdotanteRegisterController = require("../controllers/adotanteRegisterController");
const AdotanteLoginController    = require("../controllers/adotanteLoginController");
const VaraRegisterController     = require("../controllers/varaRegisterControllers");
const VaraLoginController        = require("../controllers/varaLoginController");
const InstituicaoRegisterController = require("../controllers/instituicaoRegisterController");
const ProcessoController         = require("../controllers/processoController");
const DocumentoController        = require("../controllers/documentoController");
const VisitaController           = require("../controllers/visitaContoller");
const NotificacoesController     = require("../controllers/notificacoesController");

const authMiddleware  = require("../middlewares/authMiddleware");
const requireRole     = require("../middlewares/roleMiddleware");
const instituicaoRoutes = require("./instituicaoRoutes");
const documentoRoutes   = require("./documentoRouter");

const routes = new Router();

// ==========================================
// ROTAS PÚBLICAS
// ==========================================

routes.post("/adotanteRegister", AdotanteRegisterController.store);
routes.post("/adotanteLogin",    AdotanteLoginController.store);

routes.post("/varaRegister", VaraRegisterController.store);
routes.post("/varaLogin",    VaraLoginController.store);

routes.get("/varas",                       VaraRegisterController.index);
routes.get("/varas/comarca/:comarca",      VaraRegisterController.indexByComarca);

routes.get("/instituicoes",    InstituicaoRegisterController.index);
routes.get("/instituicoes/:id", InstituicaoRegisterController.showById);

// Rotas de Instituição (login/register públicos + privados com role)
routes.use(instituicaoRoutes);

// ==========================================
// MIDDLEWARE GLOBAL DE AUTENTICAÇÃO
// ==========================================
routes.use(authMiddleware);

// ==========================================
// ROTAS — ADOTANTE
// ==========================================

routes.get("/adotantes/perfil",   requireRole(["ADOTANTE"]), AdotanteRegisterController.show);

// Processo do adotante (retorna null se ainda não tiver)
routes.get("/processoConsulta",   requireRole(["ADOTANTE"]), ProcessoController.show);

// Agenda de visitas do adotante
routes.get("/minha-agenda",       requireRole(["ADOTANTE"]), VisitaController.showForAdotante);

// Documentos do adotante
routes.get("/documentos/meus",    requireRole(["ADOTANTE"]), DocumentoController.meusDocs);

// Notificações do adotante
routes.get("/notificacoes",       requireRole(["ADOTANTE"]), NotificacoesController.index);

// ==========================================
// ROTAS — VARA
// ==========================================

// Listar todos os adotantes cadastrados (com processo se existir)
routes.get("/adotantes",                requireRole(["VARA"]), AdotanteRegisterController.indexForVara);

// Criar processo para um adotante
routes.post("/processoCreate",          requireRole(["VARA"]), ProcessoController.store);

// ==========================================
// ROTAS — INSTITUIÇÃO
// ==========================================

// Buscar processo pelo CPF do adotante — ANTES de /processos/:id para não colidir
routes.get("/processos/por-cpf/:cpf",   requireRole(["INSTITUICAO"]), ProcessoController.buscarPorCpf);

// ==========================================
// ROTAS — VARA (continuação)
// ==========================================

// Listar todos os processos (com adotante + instituição)
routes.get("/processos",                requireRole(["VARA"]), ProcessoController.indexForVara);

// Detalhe de um processo específico
routes.get("/processos/:id",            requireRole(["VARA"]), ProcessoController.showForVara);

// Avançar etapa do processo
routes.put("/processos/:id/etapa",      requireRole(["VARA"]), ProcessoController.updateEtapa);

// Vincular instituição a um processo
routes.put("/processos/:id/instituicao", requireRole(["VARA"]), ProcessoController.vincularInstituicao);

// Relatórios de visitas de um processo (só visitas com relatório enviado)
routes.get("/processo/:processo_id/relatorios", requireRole(["VARA"]), VisitaController.showForVara);

// Todas as visitas de um processo (agendadas + realizadas)
routes.get("/processos/:id/visitas", requireRole(["VARA"]), VisitaController.listForProcesso);

// Vara agenda uma visita (precisa informar instituicao_id no body)
routes.post("/visitasCreate", requireRole(["INSTITUICAO", "VARA"]), VisitaController.store);

// ==========================================
// ROTAS — INSTITUIÇÃO (visitas)
// ==========================================

// Agenda da instituição (lista suas visitas)
routes.get("/visitasAgenda",     requireRole(["INSTITUICAO"]), VisitaController.index);

// Detalhe de uma visita (para preencher relatório)
routes.get("/visita/:id",        requireRole(["INSTITUICAO"]), VisitaController.showOne);

// Atualizar visita / salvar relatório
routes.put("/visitasUpdate/:id", requireRole(["INSTITUICAO"]), VisitaController.update);

// ==========================================
// ROTAS DE DOCUMENTOS (multer / upload / validação)
// ==========================================
routes.use(documentoRoutes);

module.exports = routes;
