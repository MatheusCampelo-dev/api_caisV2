const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const supabase = require("../../config/supabase");

class InstituicaoRegisterController {
  async store(req, res) {
    try {
      const { nome, cnpj, email, senha } = req.body;

      const { data: emailExiste } = await supabase
        .from("instituicoes")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (emailExiste) {
        return res.status(400).json({ error: "Este e-mail já está cadastrado." });
      }

      const { data: cnpjExiste } = await supabase
        .from("instituicoes")
        .select("id")
        .eq("cnpj", cnpj)
        .maybeSingle();

      if (cnpjExiste) {
        return res.status(400).json({ error: "Este CNPJ já está cadastrado." });
      }

      const senha_hash = await bcrypt.hash(senha, 8);

      const { data: instituicao, error } = await supabase
        .from("instituicoes")
        .insert({ nome, cnpj, email, senha_hash })
        .select("id, nome, cnpj, email")
        .single();

      if (error) throw error;

      return res.status(201).json(instituicao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao registrar instituição." });
    }
  }

  async show(req, res) {
    try {
      const { data: instituicao } = await supabase
        .from("instituicoes")
        .select("id, nome, cnpj, email, fotos")
        .eq("id", req.usuarioId)
        .maybeSingle();

      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }
      return res.json(instituicao);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar dados da instituição." });
    }
  }

  async update(req, res) {
    try {
      const { nome, email } = req.body;

      const { data: instituicao } = await supabase
        .from("instituicoes")
        .select("id, fotos")
        .eq("id", req.usuarioId)
        .maybeSingle();

      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }

      const { data: updated, error } = await supabase
        .from("instituicoes")
        .update({ nome, email })
        .eq("id", req.usuarioId)
        .select("id, nome, email, fotos")
        .single();

      if (error) throw error;
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
  }

  async uploadFoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }

      const { data: instituicao } = await supabase
        .from("instituicoes")
        .select("id, fotos")
        .eq("id", req.usuarioId)
        .maybeSingle();

      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }

      const fotosAtuais = Array.isArray(instituicao.fotos) ? instituicao.fotos : [];
      const novasFotos = [...fotosAtuais, req.file.filename];

      const { error } = await supabase
        .from("instituicoes")
        .update({ fotos: novasFotos })
        .eq("id", req.usuarioId);

      if (error) throw error;

      return res.json({ filename: req.file.filename, fotos: novasFotos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao fazer upload da foto." });
    }
  }

  async removerFoto(req, res) {
    try {
      const { filename } = req.params;

      const { data: instituicao } = await supabase
        .from("instituicoes")
        .select("id, fotos")
        .eq("id", req.usuarioId)
        .maybeSingle();

      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }

      const fotosAtuais = Array.isArray(instituicao.fotos) ? instituicao.fotos : [];
      const novasFotos = fotosAtuais.filter((f) => f !== filename);

      const { error } = await supabase
        .from("instituicoes")
        .update({ fotos: novasFotos })
        .eq("id", req.usuarioId);

      if (error) throw error;

      const filePath = path.resolve(__dirname, "..", "tmp", "uploads", filename);
      try {
        fs.unlinkSync(filePath);
      } catch {}

      return res.json({ fotos: novasFotos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao remover foto." });
    }
  }

  async index(req, res) {
    try {
      const { data: instituicoes, error } = await supabase
        .from("instituicoes")
        .select("id, nome, cnpj, email");

      if (error) throw error;
      return res.json(instituicoes);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar instituições." });
    }
  }

  async showById(req, res) {
    try {
      const { id } = req.params;

      const { data: instituicao } = await supabase
        .from("instituicoes")
        .select("id, nome, cnpj, email, fotos")
        .eq("id", id)
        .maybeSingle();

      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }
      return res.json(instituicao);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar instituição." });
    }
  }
}

module.exports = new InstituicaoRegisterController();
