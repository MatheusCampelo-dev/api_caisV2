const Processo = require("../models/processo");
const Documento = require("../models/documento");
const Visita = require("../models/visitas");
const Instituicao = require("../models/instituicao");

class NotificacoesController {
  // Deriva notificações do estado atual do processo, documentos e visitas
  async index(req, res) {
    try {
      const processo = await Processo.findOne({
        where: { adotante_id: req.usuarioId },
        include: [{ model: Instituicao, as: "instituicao", attributes: ["nome"] }],
      });

      if (!processo) {
        return res.json([]);
      }

      const notificacoes = [];

      // Notificação: etapa avançou para fila de espera
      if (["fila_de_espera", "aproximação", "convivência", "sentença"].includes(processo.etapa_atual)) {
        if (processo.data_habilitacao) {
          notificacoes.push({
            id: "etapa-fila",
            titulo: "Habilitação aprovada",
            mensagem: `Seu processo de habilitação foi aprovado. Você está ${processo.etapa_atual === "fila_de_espera" ? `na posição ${processo.posicao_fila ?? "—"} da` : "fora da"} fila de espera.`,
            quando: new Date(processo.data_habilitacao).toLocaleDateString("pt-BR"),
            tipo: "vara",
            icone: "ti-circle-check",
            cor: "verde",
            lida: true,
          });
        }
      }

      // Notificação: vinculação com instituição
      if (processo.instituicao_id && processo.instituicao) {
        notificacoes.push({
          id: "vinculo-instituicao",
          titulo: "Instituição vinculada",
          mensagem: `Você foi vinculado à instituição ${processo.instituicao.nome}. A aproximação pode começar.`,
          quando: "—",
          tipo: "vara",
          icone: "ti-building",
          cor: "azul",
          lida: false,
        });
      }

      // Notificações de documentos
      const documentos = await Documento.findAll({ where: { processo_id: processo.id } });

      for (const doc of documentos) {
        if (doc.status === "entregue") {
          notificacoes.push({
            id: `doc-entregue-${doc.id}`,
            titulo: "Documento aceito",
            mensagem: `Seu documento "${doc.nome_documento}" foi marcado como entregue pela Vara.`,
            quando: doc.data_validacao
              ? new Date(doc.data_validacao).toLocaleDateString("pt-BR")
              : "—",
            tipo: "vara",
            icone: "ti-circle-check",
            cor: "verde",
            lida: true,
          });
        }

        if (doc.status === "requer_nova_entrega") {
          notificacoes.push({
            id: `doc-reentrega-${doc.id}`,
            titulo: "Documento precisa ser reapresentado",
            mensagem: `A Vara solicitou uma nova entrega do documento "${doc.nome_documento}".`,
            quando: doc.data_validacao
              ? new Date(doc.data_validacao).toLocaleDateString("pt-BR")
              : "—",
            tipo: "vara",
            icone: "ti-alert-triangle",
            cor: "amarelo",
            lida: false,
          });
        }
      }

      // Notificações de visitas agendadas
      const visitas = await Visita.findAll({
        where: { processo_id: processo.id },
        include: [{ model: Instituicao, as: "instituicao", attributes: ["nome"] }],
        order: [["data_visita", "DESC"]],
      });

      for (const visita of visitas) {
        const dataFormatada = visita.data_visita
          ? new Date(visita.data_visita + "T00:00:00").toLocaleDateString("pt-BR")
          : "—";
        const nomeInst = visita.instituicao?.nome ?? "Instituição";

        if (visita.status_visita === "agendada") {
          notificacoes.push({
            id: `visita-agendada-${visita.id}`,
            titulo: `Visita agendada para ${dataFormatada}`,
            mensagem: `${nomeInst} confirmou uma visita do tipo "${visita.tipo_visita}" para ${dataFormatada}.`,
            quando: dataFormatada,
            tipo: "instituicao",
            icone: "ti-calendar-event",
            cor: "azul",
            lida: false,
          });
        }

        if (visita.status_visita === "realizada" && visita.status_relatorio === "enviado") {
          notificacoes.push({
            id: `visita-realizada-${visita.id}`,
            titulo: "Relatório de visita enviado",
            mensagem: `${nomeInst} enviou o relatório da visita de ${dataFormatada}.`,
            quando: dataFormatada,
            tipo: "instituicao",
            icone: "ti-file-check",
            cor: "verde",
            lida: true,
          });
        }
      }

      return res.json(notificacoes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar notificações." });
    }
  }
}

module.exports = new NotificacoesController();
