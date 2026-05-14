const fs = require("fs");
const path = require("path");
const Instituicao = require("../models/instituicao");

class InstituicaoRegisterController {
  async store(req, res) {
    try {
      const { nome, cnpj, email, senha } = req.body;

      const emailExiste = await Instituicao.findOne({ where: { email } });
      if (emailExiste) {
        return res.status(400).json({ error: "Este e-mail já está cadastrado." });
      }

      const cnpjExiste = await Instituicao.findOne({ where: { cnpj } });
      if (cnpjExiste) {
        return res.status(400).json({ error: "Este CNPJ já está cadastrado." });
      }

      const instituicao = await Instituicao.create({ nome, cnpj, email, senha_hash: senha });
      const { id } = instituicao;
      return res.status(201).json({ id, nome, cnpj, email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao registrar instituição." });
    }
  }

  async show(req, res) {
    try {
      const instituicao = await Instituicao.findByPk(req.usuarioId, {
        attributes: ["id", "nome", "cnpj", "email", "fotos"],
      });
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
      const instituicao = await Instituicao.findByPk(req.usuarioId);
      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }
      await instituicao.update({ nome, email });
      return res.json({
        id: instituicao.id,
        nome: instituicao.nome,
        email: instituicao.email,
        fotos: instituicao.fotos,
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
  }

  async uploadFoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }
      const instituicao = await Instituicao.findByPk(req.usuarioId);
      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }
      const fotosAtuais = Array.isArray(instituicao.fotos) ? instituicao.fotos : [];
      const novasFotos = [...fotosAtuais, req.file.filename];
      await instituicao.update({ fotos: novasFotos });
      return res.json({ filename: req.file.filename, fotos: novasFotos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao fazer upload da foto." });
    }
  }

  async removerFoto(req, res) {
    try {
      const { filename } = req.params;
      const instituicao = await Instituicao.findByPk(req.usuarioId);
      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }
      const fotosAtuais = Array.isArray(instituicao.fotos) ? instituicao.fotos : [];
      const novasFotos = fotosAtuais.filter((f) => f !== filename);
      await instituicao.update({ fotos: novasFotos });

      const filePath = path.resolve(__dirname, "..", "tmp", "uploads", filename);
      try { fs.unlinkSync(filePath); } catch {}

      return res.json({ fotos: novasFotos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao remover foto." });
    }
  }

  async index(req, res) {
    try {
      const instituicoes = await Instituicao.findAll({
        attributes: ["id", "nome", "cnpj", "email"],
      });
      return res.json(instituicoes);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar instituições." });
    }
  }

  async showById(req, res) {
    try {
      const { id } = req.params;
      const instituicao = await Instituicao.findByPk(id, {
        attributes: ["id", "nome", "cnpj", "email", "fotos"],
      });
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
