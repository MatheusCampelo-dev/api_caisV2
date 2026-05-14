const Adotante = require("../models/adotante.js");
const Processo = require("../models/processo.js");

class AdotanteRegisterController {
  async store(req, res) {
    try {
      const { nome, cpf, email, senha } = req.body;

      const adotanteExiste = await Adotante.findOne({ where: { email } });
      if (adotanteExiste) {
        return res.status(400).json({ error: "Adotante já cadastrado." });
      }

      // O hook do model se encarrega de fazer o hash da senha
      const adotante = await Adotante.create({
        nome,
        cpf,
        email,
        senha_hash: senha,
      });

      // Retorna sem a senha
      return res.status(201).json({
        id: adotante.id,
        nome: adotante.nome,
        email: adotante.email,
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  async show(req, res) {
    const adotante = await Adotante.findByPk(req.usuarioId, {
      attributes: ["id", "nome", "email", "cpf"],
    });
    return res.json(adotante);
  }

  // Vara lista todos os adotantes cadastrados com info do processo
  async indexForVara(req, res) {
    try {
      const adotantes = await Adotante.findAll({
        attributes: ["id", "nome", "cpf", "email"],
        include: [
          {
            model: Processo,
            as: "processo",
            required: false, // LEFT JOIN — inclui adotantes sem processo
            include: [
              {
                model: require("../models/documento.js"),
                as: "documentos",
                required: false,
              },
            ],
          },
        ],
        order: [["nome", "ASC"]],
      });
      return res.json(adotantes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar adotantes." });
    }
  }
}

module.exports = new AdotanteRegisterController();
