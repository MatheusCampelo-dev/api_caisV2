const jwt = require("jsonwebtoken");
const Adotante = require("../models/adotante");

class AdotanteLoginController {
  async store(req, res) {
    const { email, senha } = req.body;

    const adotante = await Adotante.findOne({ where: { email } });

    if (!adotante) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    if (!(await adotante.checkPassword(senha))) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    const { id, nome, cpf } = adotante;

    return res.json({
      adotante: { id, nome, email, cpf },
      token: jwt.sign({ id, role: "ADOTANTE" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }),
    });
  }
}

module.exports = new AdotanteLoginController();
