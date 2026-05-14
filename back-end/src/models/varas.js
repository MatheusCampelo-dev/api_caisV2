const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

class Vara extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        nome_exibicao: DataTypes.STRING,
        cnpj: DataTypes.STRING,
        comarca: DataTypes.STRING,
        email: DataTypes.STRING,
        senha_hash: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "varas",
        hooks: {
          beforeSave: async (vara) => {
            if (vara.changed("senha_hash")) {
              vara.senha_hash = await bcrypt.hash(vara.senha_hash, 8);
            }
          },
        },
      },
    );
  }

  checkPassword(senha) {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

module.exports = Vara;
