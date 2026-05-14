"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("documentos", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },
      processo_id: {
        type: Sequelize.UUID,
        references: { model: "processos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      nome_documento: {
        type: Sequelize.STRING(150),
        allowNull: false,
        // Exemplos: 'Certidão Negativa Criminal', 'Laudo Psicológico', etc.
      },
      status: {
        type: Sequelize.ENUM("pendente", "entregue", "requer_nova_entrega"),
        defaultValue: "pendente",
        allowNull: false,
      },
      url_arquivo: {
        type: Sequelize.STRING(500),
        allowNull: true,
        // Será preenchido apenas para o Certificado do Curso
      },
      vara_id: {
        type: Sequelize.UUID,
        references: { model: "varas", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
        // Quem validou o documento (Governo)
      },
      data_validacao: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("documentos");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_documentos_status";',
    );
  },
};
