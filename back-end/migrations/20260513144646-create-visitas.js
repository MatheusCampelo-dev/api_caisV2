"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("visitas", {
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
      instituicao_id: {
        type: Sequelize.UUID,
        references: { model: "instituicoes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      data_visita: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      hora_fim: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      tipo_visita: {
        type: Sequelize.STRING,
        allowNull: false,
        // Ex: '1ª visita de aproximação', 'Acompanhamento de convivência'
      },
      status_visita: {
        type: Sequelize.ENUM("agendada", "realizada", "cancelada"),
        defaultValue: "agendada",
        allowNull: false,
      },

      // ==========================================
      // CAMPOS DO RELATÓRIO (Preenchidos depois)
      // ==========================================
      status_relatorio: {
        type: Sequelize.ENUM("pendente", "rascunho", "enviado"),
        defaultValue: "pendente",
        allowNull: false,
      },
      criterio_vinculo: {
        type: Sequelize.ENUM("Frágil", "Em formação", "Bom"),
        allowNull: true,
      },
      criterio_comunicacao: {
        type: Sequelize.ENUM("Difícil", "Adequada", "Excelente"),
        allowNull: true,
      },
      criterio_adaptacao: {
        type: Sequelize.ENUM("Resistente", "Cautelosa", "Confortável"),
        allowNull: true,
      },
      parecer_descritivo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      recomendacao_vara: {
        type: Sequelize.ENUM(
          "Prosseguir para próxima visita",
          "Solicitar acompanhamento adicional da equipe técnica",
          "Sugerir interrupção do estágio de aproximação",
        ),
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
    await queryInterface.dropTable("visitas");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_visitas_status_visita";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_visitas_status_relatorio";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_visitas_criterio_vinculo";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_visitas_criterio_comunicacao";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_visitas_criterio_adaptacao";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_visitas_recomendacao_vara";',
    );
  },
};
