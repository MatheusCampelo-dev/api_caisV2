const supabase = require("../../config/supabase");

const ETAPAS_PERMITIDAS = [
  "habilitação",
  "fila_de_espera",
  "aproximação",
  "convivência",
  "sentença",
];

const DOCS_PADRAO = [
  "RG e CPF",
  "Comprovante de residência",
  "Certidão de nascimento ou casamento",
  "Comprovante de renda",
  "Atestado de sanidade mental",
  "Certidão negativa criminal",
  "Laudo psicológico",
  "Certificado do Curso de Preparação",
];

class ProcessoController {
  // Vara cria processo para um adotante
  async store(req, res) {
    try {
      const { adotante_id, numero_processo, comarca } = req.body;

      const { data: adotante } = await supabase
        .from("adotantes")
        .select("id")
        .eq("id", adotante_id)
        .maybeSingle();

      if (!adotante) {
        return res.status(404).json({ error: "Adotante não encontrado." });
      }

      const { data: processoExiste } = await supabase
        .from("processos")
        .select("id")
        .eq("numero_processo", numero_processo)
        .maybeSingle();

      if (processoExiste) {
        return res.status(400).json({ error: "Número de processo já cadastrado." });
      }

      const { data: processo, error: errProcesso } = await supabase
        .from("processos")
        .insert({ adotante_id, numero_processo, comarca })
        .select()
        .single();

      if (errProcesso) throw errProcesso;

      const docsPayload = DOCS_PADRAO.map((nome) => ({
        processo_id: processo.id,
        nome_documento: nome,
        status: "pendente",
      }));

      const { error: errDocs } = await supabase
        .from("documentos")
        .insert(docsPayload);

      if (errDocs) throw errDocs;

      return res.status(201).json(processo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar o processo." });
    }
  }

  // Adotante consulta seu próprio processo — retorna null (200) se ainda não existir
  async show(req, res) {
    try {
      const { data: processo } = await supabase
        .from("processos")
        .select("*, instituicao:instituicoes(id, nome, cnpj, email)")
        .eq("adotante_id", req.usuarioId)
        .maybeSingle();

      return res.json(processo ?? null);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar processo." });
    }
  }

  // Vara lista todos os processos com dados do adotante e instituição vinculada
  async indexForVara(req, res) {
    try {
      const { data: processos, error } = await supabase
        .from("processos")
        .select(`
          *,
          adotante:adotantes(id, nome, cpf, email),
          instituicao:instituicoes(id, nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
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

      const { data: processo, error } = await supabase
        .from("processos")
        .select(`
          *,
          adotante:adotantes(id, nome, cpf, email),
          documentos(*),
          instituicao:instituicoes(id, nome, email)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }

      if (processo.documentos) {
        processo.documentos.sort((a, b) =>
          a.nome_documento.localeCompare(b.nome_documento, "pt-BR")
        );
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

      if (!ETAPAS_PERMITIDAS.includes(etapa_atual)) {
        return res.status(400).json({ error: "Etapa inválida." });
      }

      const { data: processo } = await supabase
        .from("processos")
        .select("id, etapa_atual, posicao_fila")
        .eq("id", id)
        .maybeSingle();

      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }

      const updates = { etapa_atual };

      if (etapa_atual === "fila_de_espera" && processo.etapa_atual === "habilitação") {
        updates.data_habilitacao = new Date().toISOString().split("T")[0];

        const { count } = await supabase
          .from("processos")
          .select("*", { count: "exact", head: true })
          .eq("etapa_atual", "fila_de_espera");

        updates.posicao_fila = (count ?? 0) + 1;
      }

      if (etapa_atual !== "fila_de_espera" && processo.etapa_atual === "fila_de_espera") {
        updates.posicao_fila = null;
      }

      const { data: updated, error } = await supabase
        .from("processos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.json(updated);
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

      const { data: processo } = await supabase
        .from("processos")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }

      if (instituicao_id) {
        const { data: instituicao } = await supabase
          .from("instituicoes")
          .select("id")
          .eq("id", instituicao_id)
          .maybeSingle();

        if (!instituicao) {
          return res.status(404).json({ error: "Instituição não encontrada." });
        }
      }

      const { data: updated, error } = await supabase
        .from("processos")
        .update({ instituicao_id: instituicao_id ?? null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao vincular instituição." });
    }
  }

  // Instituição busca processo pelo CPF do adotante (para criar visita)
  async buscarPorCpf(req, res) {
    try {
      const { cpf } = req.params;

      const cpfLimpo = cpf.replace(/\D/g, "");
      const cpfFormatado = cpfLimpo.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
      );

      // Busca flexível: tenta com todas as variações de formatação
      const cpfValues = [...new Set([cpf, cpfLimpo, cpfFormatado])];

      const { data: adotantes } = await supabase
        .from("adotantes")
        .select("id, nome, cpf")
        .in("cpf", cpfValues);

      if (!adotantes || !adotantes.length) {
        return res
          .status(404)
          .json({ error: "Adotante não encontrado com este CPF." });
      }

      const { data: processo } = await supabase
        .from("processos")
        .select("*, adotante:adotantes(id, nome, cpf)")
        .eq("adotante_id", adotantes[0].id)
        .eq("instituicao_id", req.usuarioId)
        .maybeSingle();

      if (!processo) {
        return res.status(404).json({
          error:
            "Nenhum processo vinculado a esta instituição foi encontrado para este CPF.",
        });
      }

      return res.json(processo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar processo por CPF." });
    }
  }
}

module.exports = new ProcessoController();
