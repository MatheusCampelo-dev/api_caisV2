const jwt = require("jsonwebtoken");
const Instituicao = require("../models/instituicao");

class InstituicaoLoginController {
  async store(req, res) {
    const { email, senha } = req.body;

    const instituicao = await Instituicao.findOne({ where: { email } });

    if (!instituicao) {
      return res.status(401).json({ error: "Instituição não encontrada." });
    }

    if (!(await instituicao.checkPassword(senha))) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    const { id, nome } = instituicao;

    return res.json({
      instituicao: { id, nome, email },
      token: jwt.sign({ id, role: "INSTITUICAO" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }),
    });
  }
}

module.exports = new InstituicaoLoginController();
