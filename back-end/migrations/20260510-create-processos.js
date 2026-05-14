"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("processos", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },
      adotante_id: {
        type: Sequelize.UUID,
        references: { model: "adotantes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      numero_processo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      comarca: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      etapa_atual: {
        type: Sequelize.ENUM(
          "habilitação",
          "fila_de_espera",
          "aproximação",
          "convivência",
          "sentença",
        ),
        defaultValue: "habilitação",
        allowNull: false,
      },
      posicao_fila: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      data_habilitacao: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      validade_habilitacao: {
        type: Sequelize.DATEONLY,
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
    // É uma boa prática remover o ENUM ao dropar a tabela
    await queryInterface.dropTable("processos");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_processos_etapa_atual";',
    );
  },
};
