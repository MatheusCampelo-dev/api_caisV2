const bcrypt = require("bcrypt");
const supabase = require("../../config/supabase");

const ATTRS_PUBLICOS = "id, nome_exibicao, comarca, email";

class VaraRegisterController {
  async store(req, res) {
    try {
      const { nome_exibicao, cnpj, comarca, email, senha } = req.body;

      const { data: varaExiste } = await supabase
        .from("varas")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (varaExiste) {
        return res
          .status(400)
          .json({ error: "Vara já cadastrada com este e-mail." });
      }

      const senha_hash = await bcrypt.hash(senha, 8);

      const { data: vara, error } = await supabase
        .from("varas")
        .insert({ nome_exibicao, cnpj, comarca, email, senha_hash })
        .select("id, nome_exibicao, comarca")
        .single();

      if (error) throw error;

      return res.status(201).json(vara);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao cadastrar a Vara." });
    }
  }

  async index(req, res) {
    try {
      const { data: varas, error } = await supabase
        .from("varas")
        .select(ATTRS_PUBLICOS);

      if (error) throw error;
      return res.json(varas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar varas." });
    }
  }

  async indexByComarca(req, res) {
    try {
      const { comarca } = req.params;

      const { data: varas, error } = await supabase
        .from("varas")
        .select(ATTRS_PUBLICOS)
        .ilike("comarca", `%${comarca}%`);

      if (error) throw error;
      return res.json(varas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar varas por comarca." });
    }
  }
}

module.exports = new VaraRegisterController();
