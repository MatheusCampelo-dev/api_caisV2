// src/controllers/VaraLoginController.js
const jwt = require("jsonwebtoken");
const Vara = require("../models/varas.js");

class VaraLoginController {
  async store(req, res) {
    try {
      const { email, senha } = req.body;

      const vara = await Vara.findOne({ where: { email } });

      if (!vara) {
        return res.status(401).json({ error: "Vara não encontrada." });
      }

      if (!(await vara.checkPassword(senha))) {
        return res.status(401).json({ error: "Senha inválida." });
      }

      const { id, nome_exibicao, comarca } = vara;

      return res.json({
        vara: { id, nome_exibicao, comarca },
        token: jwt.sign({ id, role: "VARA" }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        }),
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao realizar login da Vara." });
    }
  }
}

module.exports = new VaraLoginController();
