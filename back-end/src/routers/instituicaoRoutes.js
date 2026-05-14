const { Router } = require("express");
const multer = require("multer");
const multerConfig = require("../../config/multer");

const InstituicaoLoginController = require("../controllers/instituicaoLoginController");
const InstituicaoRegisterController = require("../controllers/instituicaoRegisterController");

const authMiddleware = require("../middlewares/authMiddleware");
const requireRole   = require("../middlewares/roleMiddleware");

const routes = new Router();
const upload = multer(multerConfig);

// ── Públicas ──────────────────────────────────────────────────
routes.post("/instituicaoRegister", InstituicaoRegisterController.store);
routes.post("/instituicaoLogin",    InstituicaoLoginController.store);

// ── Privadas da Instituição (auth aplicado por rota) ──────────
// O blanket routes.use(requireRole) foi removido porque bloqueava
// todas as requisições VARA/ADOTANTE que passavam pelo sub-roteador
// antes de chegar às rotas do roteador principal.
routes.get("/instituicaoPerfil",
  authMiddleware, requireRole(["INSTITUICAO"]),
  InstituicaoRegisterController.show
);
routes.put("/instituicaoPerfilUpdate",
  authMiddleware, requireRole(["INSTITUICAO"]),
  InstituicaoRegisterController.update
);
routes.post("/instituicaoFotoUpload",
  authMiddleware, requireRole(["INSTITUICAO"]),
  upload.single("foto"),
  InstituicaoRegisterController.uploadFoto
);
routes.delete("/instituicaoFotoRemover/:filename",
  authMiddleware, requireRole(["INSTITUICAO"]),
  InstituicaoRegisterController.removerFoto
);

// Visitas da instituição estão no roteador principal (routers/index.js)
// para permitir que a Vara também agende visitas sem conflito de roles.

module.exports = routes;
