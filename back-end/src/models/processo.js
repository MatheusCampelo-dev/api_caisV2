const { Model, DataTypes } = require("sequelize");

class Processo extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        numero_processo: DataTypes.STRING,
        comarca: DataTypes.STRING,
        etapa_atual: {
          type: DataTypes.ENUM(
            "habilitação",
            "fila_de_espera",
            "aproximação",
            "convivência",
            "sentença",
          ),
          defaultValue: "habilitação",
        },
        posicao_fila: DataTypes.INTEGER,
        data_habilitacao: DataTypes.DATEONLY,
        validade_habilitacao: DataTypes.DATEONLY,
        instituicao_id: DataTypes.UUID,
      },
      {
        sequelize,
        tableName: "processos",
      },
    );
  }

  static associate(models) {
    this.belongsTo(models.Adotante, {
      foreignKey: "adotante_id",
      as: "adotante",
    });
    this.hasMany(models.Documento, {
      foreignKey: "processo_id",
      as: "documentos",
    });
    this.belongsTo(models.Instituicao, {
      foreignKey: "instituicao_id",
      as: "instituicao",
    });
  }
}

module.exports = Processo;
