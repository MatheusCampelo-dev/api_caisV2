const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const supabase = require("../../config/supabase");

class VaraLoginController {
  async store(req, res) {
    try {
      const { email, senha } = req.body;

      const { data: vara } = await supabase
        .from("varas")
        .select("id, nome_exibicao, comarca, senha_hash")
        .eq("email", email)
        .maybeSingle();

      if (!vara) {
        return res.status(401).json({ error: "Vara não encontrada." });
      }

      const senhaCorreta = await bcrypt.compare(senha, vara.senha_hash);
      if (!senhaCorreta) {
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
