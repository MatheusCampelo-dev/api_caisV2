const { Model, DataTypes } = require("sequelize");

class Visita extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        data_visita: DataTypes.DATEONLY,
        hora_inicio: DataTypes.TIME,
        hora_fim: DataTypes.TIME,
        tipo_visita: DataTypes.STRING,
        status_visita: DataTypes.ENUM("agendada", "realizada", "cancelada"),
        status_relatorio: DataTypes.ENUM("pendente", "rascunho", "enviado"),

        // Dados do Relatório (Critérios)
        criterio_vinculo: DataTypes.ENUM("Frágil", "Em formação", "Bom"),
        criterio_comunicacao: DataTypes.ENUM(
          "Difícil",
          "Adequada",
          "Excelente",
        ),
        criterio_adaptacao: DataTypes.ENUM(
          "Resistente",
          "Cautelosa",
          "Confortável",
        ),
        parecer_descritivo: DataTypes.TEXT,
        recomendacao_vara: DataTypes.ENUM(
          "Prosseguir para próxima visita",
          "Solicitar acompanhamento adicional da equipe técnica",
          "Sugerir interrupção do estágio de aproximação",
        ),
      },
      {
        sequelize,
        tableName: "visitas",
      },
    );
  }

  static associate(models) {
    this.belongsTo(models.Processo, {
      foreignKey: "processo_id",
      as: "processo",
    });
    this.belongsTo(models.Instituicao, {
      foreignKey: "instituicao_id",
      as: "instituicao",
    });
  }
}

module.exports = Visita;
