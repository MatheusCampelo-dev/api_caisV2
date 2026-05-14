const supabase = require("../../config/supabase");

class VisitaController {
  // 1. Criar um novo agendamento — Instituição (usa seu próprio ID) ou Vara (informa instituicao_id no body)
  async store(req, res) {
    try {
      const {
        processo_id,
        data_visita,
        hora_inicio,
        hora_fim,
        tipo_visita,
        instituicao_id: bodyInstituicaoId,
      } = req.body;

      const instituicao_id =
        req.usuarioRole === "VARA" ? bodyInstituicaoId : req.usuarioId;

      if (!instituicao_id) {
        return res
          .status(400)
          .json({ error: "Informe a instituição responsável pela visita." });
      }
      if (!processo_id || !data_visita || !hora_inicio) {
        return res
          .status(400)
          .json({ error: "Processo, data e hora de início são obrigatórios." });
      }

      const { data: visita, error } = await supabase
        .from("visitas")
        .insert({
          processo_id,
          instituicao_id,
          data_visita,
          hora_inicio,
          hora_fim: hora_fim || hora_inicio,
          tipo_visita,
          status_visita: "agendada",
          status_relatorio: "pendente",
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(visita);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao agendar visita." });
    }
  }

  // 2. Listar visitas para a Agenda (Próximas e Realizadas) — Instituição
  async index(req, res) {
    try {
      const { data: visitas, error } = await supabase
        .from("visitas")
        .select(`
          *,
          processo:processos(
            numero_processo,
            adotante:adotantes(nome)
          )
        `)
        .eq("instituicao_id", req.usuarioId)
        .order("data_visita", { ascending: false })
        .order("hora_inicio", { ascending: false });

      if (error) throw error;
      return res.json(visitas ?? []);
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

      const { data: visita } = await supabase
        .from("visitas")
        .select("id, instituicao_id, status_relatorio, status_visita")
        .eq("id", id)
        .maybeSingle();

      if (!visita || visita.instituicao_id !== req.usuarioId) {
        return res.status(404).json({ error: "Visita não encontrada." });
      }

      const newStatusRelatorio = status_relatorio ?? visita.status_relatorio;
      const newStatusVisita =
        newStatusRelatorio === "enviado"
          ? "realizada"
          : (bodyStatusVisita ?? visita.status_visita);

      const { data: updated, error } = await supabase
        .from("visitas")
        .update({
          status_relatorio: newStatusRelatorio,
          status_visita: newStatusVisita,
          criterio_vinculo,
          criterio_comunicacao,
          criterio_adaptacao,
          parecer_descritivo,
          recomendacao_vara,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao salvar relatório." });
    }
  }

  // Adotante consulta as visitas do seu processo (agenda do adotante)
  async showForAdotante(req, res) {
    try {
      const { data: processo } = await supabase
        .from("processos")
        .select("id")
        .eq("adotante_id", req.usuarioId)
        .maybeSingle();

      if (!processo) {
        return res.json([]);
      }

      const { data: visitas, error } = await supabase
        .from("visitas")
        .select("*, instituicao:instituicoes(id, nome, email)")
        .eq("processo_id", processo.id)
        .order("data_visita", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (error) throw error;
      return res.json(visitas ?? []);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao carregar agenda do adotante." });
    }
  }

  // Vara lista TODAS as visitas de um processo (agendadas + realizadas)
  async listForProcesso(req, res) {
    try {
      const { id } = req.params;

      const { data: visitas, error } = await supabase
        .from("visitas")
        .select("*, instituicao:instituicoes(id, nome, email)")
        .eq("processo_id", id)
        .order("data_visita", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (error) throw error;
      return res.json(visitas ?? []);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar visitas do processo." });
    }
  }

  // Instituição consulta uma visita específica pelo ID (para preencher relatório)
  async showOne(req, res) {
    try {
      const { id } = req.params;

      const { data: visita, error } = await supabase
        .from("visitas")
        .select(`
          *,
          processo:processos(
            numero_processo,
            adotante:adotantes(nome)
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

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

      const { data: visitas, error } = await supabase
        .from("visitas")
        .select("*, instituicao:instituicoes(nome)")
        .eq("processo_id", processo_id)
        .eq("status_relatorio", "enviado")
        .order("data_visita", { ascending: false });

      if (error) throw error;
      return res.json(visitas ?? []);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar relatórios para a Vara." });
    }
  }
}

module.exports = new VisitaController();
