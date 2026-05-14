// src/controllers/VaraRegisterController.js
const Vara = require("../models/varas.js");

const ATTRS_PUBLICOS = ["id", "nome_exibicao", "comarca", "email"];

class VaraRegisterController {
  async store(req, res) {
    try {
      const { nome_exibicao, cnpj, comarca, email, senha } = req.body;

      const varaExiste = await Vara.findOne({ where: { email } });
      if (varaExiste) {
        return res
          .status(400)
          .json({ error: "Vara já cadastrada com este e-mail." });
      }

      const vara = await Vara.create({
        nome_exibicao,
        cnpj,
        comarca,
        email,
        senha_hash: senha,
      });

      return res.status(201).json({
        id: vara.id,
        nome_exibicao: vara.nome_exibicao,
        comarca: vara.comarca,
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao cadastrar a Vara." });
    }
  }

  async index(req, res) {
    try {
      const varas = await Vara.findAll({ attributes: ATTRS_PUBLICOS });
      return res.json(varas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar varas." });
    }
  }

  async indexByComarca(req, res) {
    try {
      const { comarca } = req.params;
      const { Op } = require("sequelize");
      const varas = await Vara.findAll({
        where: { comarca: { [Op.iLike]: `%${comarca}%` } },
        attributes: ATTRS_PUBLICOS,
      });
      return res.json(varas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar varas por comarca." });
    }
  }
}

module.exports = new VaraRegisterController();
