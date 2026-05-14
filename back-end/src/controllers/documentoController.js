const Documento = require("../models/documento");
const Processo = require("../models/processo");

class DocumentoController {
  // Método para a Vara atualizar o status de um documento
  async update(req, res) {
    try {
      const { id } = req.params; // ID do documento
      const { status } = req.body; // 'entregue' ou 'requer_nova_entrega'

      // 1. Procura o documento no banco
      const documento = await Documento.findByPk(id);

      if (!documento) {
        return res.status(404).json({ error: "Documento não encontrado." });
      }

      // 2. Atualiza os dados
      // Armazenamos o ID da Vara que validou e a data atual
      await documento.update({
        status,
        vara_id: req.usuarioId, // ID extraído do Token JWT da Vara
        data_validacao: new Date(),
      });

      return res.json(documento);
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

      const documentos = await Documento.findAll({
        where: { processo_id },
        order: [["nome_documento", "ASC"]],
      });

      return res.json(documentos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar documentos." });
    }
  }

  // Adotante lista seus próprios documentos
  async meusDocs(req, res) {
    try {
      const processo = await Processo.findOne({
        where: { adotante_id: req.usuarioId },
      });

      if (!processo) {
        return res.status(404).json({ error: "Processo não encontrado." });
      }

      const documentos = await Documento.findAll({
        where: { processo_id: processo.id },
        order: [["nome_documento", "ASC"]],
      });

      return res.json(documentos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar documentos." });
    }
  }

  // Método para o ADOTANTE enviar o certificado digitalmente
  async uploadCertificado(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado. Selecione um arquivo PDF, JPG ou PNG.' });
      }
      // O Multer já injeta o arquivo dentro de req.file
      const { filename } = req.file;

      // 1. Descobrir qual é o processo do adotante logado
      const processo = await Processo.findOne({
        where: { adotante_id: req.usuarioId },
      });

      if (!processo) {
        return res
          .status(404)
          .json({ error: "Processo não encontrado para este usuário." });
      }

      // 2. Procura se já existe um registro de "Certificado" para este processo
      // Se não existir, cria um.
      const [documento, created] = await Documento.findOrCreate({
        where: {
          processo_id: processo.id,
          nome_documento: "Certificado do Curso de Preparação",
        },
        defaults: {
          status: "entregue", // Como ele acabou de enviar, consideramos entregue digitalmente
          url_arquivo: filename, // Salva apenas o nome do arquivo gerado
        },
      });

      // Se já existia e ele está reenviando, apenas atualiza
      if (!created) {
        await documento.update({
          status: "entregue",
          url_arquivo: filename,
          vara_id: null, // Zera a validação antiga, já que é um arquivo novo
          data_validacao: null,
        });
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
