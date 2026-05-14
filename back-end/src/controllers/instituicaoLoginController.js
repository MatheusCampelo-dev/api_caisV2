const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const supabase = require("../../config/supabase");

class InstituicaoLoginController {
  async store(req, res) {
    const { email, senha } = req.body;

    const { data: instituicao } = await supabase
      .from("instituicoes")
      .select("id, nome, email, senha_hash")
      .eq("email", email)
      .maybeSingle();

    if (!instituicao) {
      return res.status(401).json({ error: "Instituição não encontrada." });
    }

    const senhaCorreta = await bcrypt.compare(senha, instituicao.senha_hash);
    if (!senhaCorreta) {
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
