const bcrypt = require("bcrypt");
const supabase = require("../../config/supabase");

class AdotanteRegisterController {
  async store(req, res) {
    try {
      const { nome, cpf, email, senha } = req.body;

      const { data: adotanteExiste } = await supabase
        .from("adotantes")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (adotanteExiste) {
        return res.status(400).json({ error: "Adotante já cadastrado." });
      }

      const senha_hash = await bcrypt.hash(senha, 8);

      const { data: adotante, error } = await supabase
        .from("adotantes")
        .insert({ nome, cpf, email, senha_hash })
        .select("id, nome, email")
        .single();

      if (error) throw error;

      return res.status(201).json(adotante);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  async show(req, res) {
    const { data: adotante } = await supabase
      .from("adotantes")
      .select("id, nome, email, cpf")
      .eq("id", req.usuarioId)
      .maybeSingle();

    return res.json(adotante);
  }

  async indexForVara(req, res) {
    try {
      const { data, error } = await supabase
        .from("adotantes")
        .select("id, nome, cpf, email, processos(*, documentos(*))")
        .order("nome");

      if (error) throw error;

      // Mapeia para manter o mesmo formato do Sequelize: processo (singular, hasOne)
      const adotantes = data.map(({ processos, ...a }) => ({
        ...a,
        processo: processos?.[0] ?? null,
      }));

      return res.json(adotantes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar adotantes." });
    }
  }
}

module.exports = new AdotanteRegisterController();
