const { Router } = require("express");
const multer = require("multer"); // <- NOVO
const multerConfig = require("../../config/multer"); // <- NOVO

const DocumentoController = require("../controllers/documentoController");
const authMiddleware = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");

const routes = new Router();
const upload = multer(multerConfig); // Inicializa o Multer com nossas configurações

routes.use(authMiddleware);

/**
 * ROTAS DA VARA (Governo)
 */
routes.get(
  "/documentoLista/:processo_id",
  requireRole(["VARA"]),
  DocumentoController.index,
);
routes.put(
  "/documentoUpdate/:id",
  requireRole(["VARA"]),
  DocumentoController.update,
);

/**
 * ROTAS DO ADOTANTE
 */
// Rota de Upload: O Multer intercepta o arquivo chamado 'arquivo_certificado' antes de chegar no Controller
routes.post(
  "/documentoUpload",
  requireRole(["ADOTANTE"]),
  upload.single("arquivo_certificado"), // 'arquivo_certificado' é a chave que será usada no Insomnia/Postman/Front-end
  DocumentoController.uploadCertificado,
);

module.exports = routes;
