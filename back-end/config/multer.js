const multer = require("multer");
const crypto = require("crypto");
const { extname, resolve } = require("path");

module.exports = {
  // Configuração de onde o arquivo será salvo fisicamente na máquina/container
  storage: multer.diskStorage({
    destination: resolve(__dirname, "..", "src", "tmp", "uploads"),
    filename: (req, file, cb) => {
      // Gera um código aleatório de 16 bytes para garantir que o nome seja único
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // Retorna o nome: codigoaleatorio + extensão original (ex: f8a9...3b.pdf)
        return cb(null, res.toString("hex") + extname(file.originalname));
      });
    },
  }),
  // Filtro de segurança: Só aceita PDF ou Imagens
  fileFilter: (req, file, cb) => {
    const permitidos = ["application/pdf", "image/jpeg", "image/png"];
    if (permitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Formato de arquivo inválido. Envie apenas PDF, JPG ou PNG."),
      );
    }
  },
};
