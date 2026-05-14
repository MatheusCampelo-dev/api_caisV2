const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const supabase = require("../../config/supabase");

class AdotanteLoginController {
  async store(req, res) {
    const { email, senha } = req.body;

    const { data: adotante } = await supabase
      .from("adotantes")
      .select("id, nome, cpf, email, senha_hash")
      .eq("email", email)
      .maybeSingle();

    if (!adotante) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(senha, adotante.senha_hash);
    if (!senhaCorreta) {
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
