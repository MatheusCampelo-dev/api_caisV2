"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("varas", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
      },
      nome_exibicao: {
        type: Sequelize.STRING, // Ex: "1ª Vara da Infância e Juventude"
        allowNull: false,
      },
      cnpj: {
        type: Sequelize.STRING(18),
        allowNull: false,
        unique: true,
      },
      comarca: {
        type: Sequelize.STRING(100), // Ex: "Recife"
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      senha_hash: {
        type: Sequelize.STRING,
        allowNull: false,
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

  down: async (queryInterface) => {
    await queryInterface.dropTable("varas");
  },
};
