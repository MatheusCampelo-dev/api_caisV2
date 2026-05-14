const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

class Instituicao extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        nome: DataTypes.STRING,
        cnpj: DataTypes.STRING,
        email: DataTypes.STRING,
        senha_hash: DataTypes.STRING,
        fotos: { type: DataTypes.JSON, defaultValue: [] },
      },
      {
        sequelize,
        tableName: "instituicoes",
        hooks: {
          beforeSave: async (instituicao) => {
            if (instituicao.changed("senha_hash")) {
              instituicao.senha_hash = await bcrypt.hash(
                instituicao.senha_hash,
                8,
              );
            }
          },
        },
      },
    );
  }

  // ---> COLOQUE O ASSOCIATE EXATAMENTE AQUI <---
  static associate(models) {
    // Uma instituição possui várias visitas agendadas/realizadas
    this.hasMany(models.Visita, {
      foreignKey: "instituicao_id",
      as: "visitas",
    });
  }

  checkPassword(senha) {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

module.exports = Instituicao;
