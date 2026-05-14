const { Op } = require("sequelize");
const Processo = require("../models/processo");
const Adotante = require("../models/adotante");
const Documento = require("../models/documento");
const Instituicao = require("../models/instituicao");

class ProcessoController {
  // Vara cria processo para um adotante
  async store(req, res) {
    try {
      const { adotante_id, numero_processo, comarca } = req.body;

      const adotante = await Adotante.findByPk(adotante_id);
      if (!adotante) {
        return res.status(404).json({ error: "Adotante não encontrado." });
      }

      const processoExiste = await Processo.findOne({ where: { numero_processo } });
      if (processoExiste) {
        return res.status(400).json({ error: "Número de processo já cadastrado." });
      }

      const processo = await Processo.create({ adotante_id, numero_processo, comarca });

      // Criar documentos padrão para o processo
      const docsPadrao = [
        'RG e CPF',
        'Comprovante de residência',
        'Certidão de nascimento ou casamento',
        'Comprovante de renda',
        'Atestado de sanidade mental',
        'Certidão negativa criminal',
        'Laudo psicológico',
        'Certificado do Curso de Preparação',
      ];

      const documentos = await Promise.all(
        docsPadrao.map(nome => Documento.create({
          processo_id: processo.id,
          nome_documento: nome,
          status: 'pendente',
        }))
      );

      return res.status(201).json(processo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar o processo." });
    }
  }

  // Adotante consulta seu próprio processo — retorna null (200) se ainda não existir
  async show(req, res) {
    try {
      const processo = await Processo.findOne({
        where: { adotante_id: req.usuarioId },
        include: [
          { model: Instituicao, as: "instituicao", attributes: ["id", "nome", "cnpj", "email"] },
        ],
      });
      return res.json(processo ?? null);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar processo." });
    }
  }

  // Vara lista todos os processos com dados do adotante e instituição vinculada
  async indexForVara(req, res) {
    try {
      const processos = await Processo.findAll({
        include: [
          { model: Adotante, as: "adotante", attributes: ["id", "nome", "cpf", "email"] },
          { model: Instituicao, as: "instituicao", attributes: ["id", "nome"] },
        ],
        order: [["createdAt", "DESC"]],
      });
      return res.json(processos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar processos." });
    }
  }

  // Vara consulta detalhe de um processo (com adotante, documentos e instituição)
  async showForVara(req, res) {
    try {
      const { id } = req.params;
      const processo = await Processo.findByPk(id, {
        include: [
          { model: Adotante, as: "adotante", attributes: ["id", "nome", "cpf", "email"] },
          { model: Documento, as: "documentos", order: [["nome_documento", "ASC"]] },
          { model: Instituicao, as: "instituicao", attributes: ["id", "nome", "email"] },
        ],
      });
      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }
      return res.json(processo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar processo." });
    }
  }

  // Vara avança a etapa do processo
  async updateEtapa(req, res) {
    try {
      const { id } = req.params;
      const { etapa_atual } = req.body;

      const etapasPermitidas = ["habilitação", "fila_de_espera", "aproximação", "convivência", "sentença"];
      if (!etapasPermitidas.includes(etapa_atual)) {
        return res.status(400).json({ error: "Etapa inválida." });
      }

      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }

      const updates = { etapa_atual };

      if (etapa_atual === "fila_de_espera" && processo.etapa_atual === "habilitação") {
        updates.data_habilitacao = new Date();
        const totalNaFila = await Processo.count({ where: { etapa_atual: "fila_de_espera" } });
        updates.posicao_fila = totalNaFila + 1;
      }

      if (etapa_atual !== "fila_de_espera" && processo.etapa_atual === "fila_de_espera") {
        updates.posicao_fila = null;
      }

      await processo.update(updates);
      return res.json(processo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar a etapa do processo." });
    }
  }

  // Vara vincula uma instituição a um processo
  async vincularInstituicao(req, res) {
    try {
      const { id } = req.params;
      const { instituicao_id } = req.body;

      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }

      if (instituicao_id) {
        const instituicao = await Instituicao.findByPk(instituicao_id);
        if (!instituicao) {
          return res.status(404).json({ error: "Instituição não encontrada." });
        }
      }

      await processo.update({ instituicao_id: instituicao_id ?? null });
      return res.json(processo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao vincular instituição." });
    }
  }

  // Instituição busca processo pelo CPF do adotante (para criar visita)
  async buscarPorCpf(req, res) {
    try {
      const { cpf } = req.params;

      const adotante = await Adotante.findOne({
        where: { cpf: { [Op.iLike]: cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") } },
      });

      // Busca flexível: tenta com formatação e sem
      const cpfLimpo = cpf.replace(/\D/g, "");
      const adotantes = await Adotante.findAll({
        where: {
          [Op.or]: [
            { cpf: cpf },
            { cpf: cpfLimpo },
            { cpf: cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") },
          ],
        },
      });

      if (!adotantes.length) {
        return res.status(404).json({ error: "Adotante não encontrado com este CPF." });
      }

      const processo = await Processo.findOne({
        where: { adotante_id: adotantes[0].id, instituicao_id: req.usuarioId },
        include: [{ model: Adotante, as: "adotante", attributes: ["id", "nome", "cpf"] }],
      });

      if (!processo) {
        return res.status(404).json({ error: "Nenhum processo vinculado a esta instituição foi encontrado para este CPF." });
      }

      return res.json(processo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar processo por CPF." });
    }
  }
}

module.exports = new ProcessoController();
