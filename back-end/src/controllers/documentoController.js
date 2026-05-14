const supabase = require("../../config/supabase");

class DocumentoController {
  // Vara atualiza o status de um documento
  async update(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data: documento } = await supabase
        .from("documentos")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (!documento) {
        return res.status(404).json({ error: "Documento não encontrado." });
      }

      const { data: updated, error } = await supabase
        .from("documentos")
        .update({
          status,
          vara_id: req.usuarioId,
          data_validacao: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar o status do documento." });
    }
  }

  // Vara lista documentos de um processo específico
  async index(req, res) {
    try {
      const { processo_id } = req.params;

      const { data: documentos, error } = await supabase
        .from("documentos")
        .select("*")
        .eq("processo_id", processo_id)
        .order("nome_documento");

      if (error) throw error;

      return res.json(documentos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar documentos." });
    }
  }

  // Adotante lista seus próprios documentos
  async meusDocs(req, res) {
    try {
      const { data: processo } = await supabase
        .from("processos")
        .select("id")
        .eq("adotante_id", req.usuarioId)
        .maybeSingle();

      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }

      const { data: documentos, error } = await supabase
        .from("documentos")
        .select("*")
        .eq("processo_id", processo.id)
        .order("nome_documento");

      if (error) throw error;

      return res.json(documentos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar documentos." });
    }
  }

  // Adotante envia o certificado digitalmente
  async uploadCertificado(req, res) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Nenhum arquivo enviado. Selecione um arquivo PDF, JPG ou PNG." });
      }

      const { filename } = req.file;

      const { data: processo } = await supabase
        .from("processos")
        .select("id")
        .eq("adotante_id", req.usuarioId)
        .maybeSingle();

      if (!processo) {
        return res
          .status(404)
          .json({ error: "Processo não encontrado para este usuário." });
      }

      // Verifica se já existe o documento de certificado para este processo
      const { data: existingDoc } = await supabase
        .from("documentos")
        .select("*")
        .eq("processo_id", processo.id)
        .eq("nome_documento", "Certificado do Curso de Preparação")
        .maybeSingle();

      let documento;

      if (existingDoc) {
        // Já existe — atualiza
        const { data: updated, error } = await supabase
          .from("documentos")
          .update({
            status: "entregue",
            url_arquivo: filename,
            vara_id: null,
            data_validacao: null,
          })
          .eq("id", existingDoc.id)
          .select()
          .single();

        if (error) throw error;
        documento = updated;
      } else {
        // Não existe — cria
        const { data: created, error } = await supabase
          .from("documentos")
          .insert({
            processo_id: processo.id,
            nome_documento: "Certificado do Curso de Preparação",
            status: "entregue",
            url_arquivo: filename,
          })
          .select()
          .single();

        if (error) throw error;
        documento = created;
      }

      return res.json(documento);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao fazer upload do documento." });
    }
  }
}

module.exports = new DocumentoController();
