const { Model, DataTypes } = require("sequelize");

class Documento extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        nome_documento: DataTypes.STRING,
        status: DataTypes.ENUM("pendente", "entregue", "requer_nova_entrega"),
        url_arquivo: DataTypes.STRING,
        data_validacao: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "documentos",
      },
    );
  }

  static associate(models) {
    // Um documento pertence a um processo
    this.belongsTo(models.Processo, {
      foreignKey: "processo_id",
      as: "processo",
    });

    // Um documento pode ser validado por uma Vara
    this.belongsTo(models.Vara, { foreignKey: "vara_id", as: "validado_por" });
  }
}

module.exports = Documento;
