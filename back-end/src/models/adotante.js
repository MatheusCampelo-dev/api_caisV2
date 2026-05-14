const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

class Adotante extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        nome: DataTypes.STRING,
        cpf: DataTypes.STRING(14),
        email: DataTypes.STRING,
        senha_hash: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "adotantes",
        hooks: {
          beforeSave: async (adotante) => {
            if (adotante.changed("senha_hash")) {
              adotante.senha_hash = await bcrypt.hash(adotante.senha_hash, 8);
            }
          },
        },
      },
    );
  }

  static associate(models) {
    // Um adotante tem um processo
    this.hasOne(models.Processo, { foreignKey: "adotante_id", as: "processo" });
  }

  // Método de instância para verificar senha
  checkPassword(senha) {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

module.exports = Adotante;
