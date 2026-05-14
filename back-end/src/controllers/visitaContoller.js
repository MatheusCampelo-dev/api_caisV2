const Visita = require("../models/visitas");
const Processo = require("../models/processo");
const Adotante = require("../models/adotante");
const Instituicao = require("../models/instituicao");

class VisitaController {
  // 1. Criar um novo agendamento — Instituição (usa seu próprio ID) ou Vara (informa instituicao_id no body)
  async store(req, res) {
    try {
      const { processo_id, data_visita, hora_inicio, hora_fim, tipo_visita, instituicao_id: bodyInstituicaoId } = req.body;

      const instituicao_id = req.usuarioRole === "VARA" ? bodyInstituicaoId : req.usuarioId;

      if (!instituicao_id) {
        return res.status(400).json({ error: "Informe a instituição responsável pela visita." });
      }
      if (!processo_id || !data_visita || !hora_inicio) {
        return res.status(400).json({ error: "Processo, data e hora de início são obrigatórios." });
      }

      const visita = await Visita.create({
        processo_id,
        instituicao_id,
        data_visita,
        hora_inicio,
        hora_fim: hora_fim || hora_inicio,
        tipo_visita,
        status_visita: "agendada",
        status_relatorio: "pendente",
      });

      return res.status(201).json(visita);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao agendar visita." });
    }
  }

  // 2. Listar visitas para a Agenda (Próximas e Realizadas)
  async index(req, res) {
    try {
      const visitas = await Visita.findAll({
        where: { instituicao_id: req.usuarioId },
        include: [
          {
            model: Processo,
            as: "processo",
            attributes: ["numero_processo"],
            include: [
              { model: Adotante, as: "adotante", attributes: ["nome"] },
            ],
          },
        ],
        order: [
          ["data_visita", "DESC"],
          ["hora_inicio", "DESC"],
        ],
      });

      return res.json(visitas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao carregar agenda." });
    }
  }

  // 3. Salvar Relatório (Rascunho ou Envio Final) — ou simplesmente concluir visita
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        status_relatorio,
        status_visita: bodyStatusVisita,
        criterio_vinculo,
        criterio_comunicacao,
        criterio_adaptacao,
        parecer_descritivo,
        recomendacao_vara,
      } = req.body;

      const visita = await Visita.findByPk(id);

      if (!visita || visita.instituicao_id !== req.usuarioId) {
        return res.status(404).json({ error: "Visita não encontrada." });
      }

      const newStatusRelatorio = status_relatorio ?? visita.status_relatorio;
      const newStatusVisita =
        newStatusRelatorio === "enviado"
          ? "realizada"
          : (bodyStatusVisita ?? visita.status_visita);

      await visita.update({
        status_relatorio: newStatusRelatorio,
        status_visita: newStatusVisita,
        criterio_vinculo,
        criterio_comunicacao,
        criterio_adaptacao,
        parecer_descritivo,
        recomendacao_vara,
      });

      return res.json(visita);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao salvar relatório." });
    }
  }
  // Adotante consulta as visitas do seu processo (agenda do adotante)
  async showForAdotante(req, res) {
    try {
      const processo = await Processo.findOne({
        where: { adotante_id: req.usuarioId },
      });

      if (!processo) {
        return res.json([]);
      }

      const visitas = await Visita.findAll({
        where: { processo_id: processo.id },
        include: [
          {
            model: Instituicao,
            as: "instituicao",
            attributes: ["id", "nome", "email"],
          },
        ],
        order: [
          ["data_visita", "ASC"],
          ["hora_inicio", "ASC"],
        ],
      });

      return res.json(visitas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao carregar agenda do adotante." });
    }
  }

  // Vara lista TODAS as visitas de um processo (agendadas + realizadas)
  async listForProcesso(req, res) {
    try {
      const { id } = req.params;

      const visitas = await Visita.findAll({
        where: { processo_id: id },
        include: [
          { model: Instituicao, as: "instituicao", attributes: ["id", "nome", "email"] },
        ],
        order: [["data_visita", "ASC"], ["hora_inicio", "ASC"]],
      });

      return res.json(visitas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar visitas do processo." });
    }
  }

  // Instituição consulta uma visita específica pelo ID (para preencher relatório)
  async showOne(req, res) {
    try {
      const { id } = req.params;
      const visita = await Visita.findByPk(id, {
        include: [
          {
            model: Processo,
            as: "processo",
            attributes: ["numero_processo"],
            include: [{ model: Adotante, as: "adotante", attributes: ["nome"] }],
          },
        ],
      });
      if (!visita || visita.instituicao_id !== req.usuarioId) {
        return res.status(404).json({ error: "Visita não encontrada." });
      }
      return res.json(visita);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar visita." });
    }
  }

  // Vara consulta os relatórios enviados de um processo
  async showForVara(req, res) {
    try {
      const { processo_id } = req.params;

      // A Vara só deve ver relatórios que já foram "enviados" (finalizados)
      const visitas = await Visita.findAll({
        where: {
          processo_id,
          status_relatorio: "enviado",
        },
        include: [
          {
            model: Instituicao,
            as: "instituicao",
            attributes: ["nome"], // Para saber qual abrigo escreveu o relatório
          },
        ],
        order: [["data_visita", "DESC"]],
      });

      return res.json(visitas);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar relatórios para a Vara." });
    }
  }
}

module.exports = new VisitaController();
