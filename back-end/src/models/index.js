const Sequelize = require("sequelize");
const databaseConfig = require("../../config/db");

// Importação dos Models
const Adotante = require("./adotante");
const Vara = require("./varas");
const Processo = require("./processo");
const Documento = require("./documento");
const Instituicao = require("./instituicao");
const Visita = require("./visitas");

// Cria a conexão com o banco usando as configurações do seu .env / docker
const connection = new Sequelize(databaseConfig.development);

// Inicializa as tabelas
Adotante.init(connection);
Vara.init(connection);
Processo.init(connection);
Documento.init(connection);
Instituicao.init(connection);
Visita.init(connection);

// Inicializa os relacionamentos (Associações)
// Só chama o associate se o model possuir essa função
if (Adotante.associate) Adotante.associate(connection.models);
if (Processo.associate) Processo.associate(connection.models);
if (Documento.associate) Documento.associate(connection.models);
if (Instituicao.associate) Instituicao.associate(connection.models);
if (Visita.associate) Visita.associate(connection.models);

module.exports = connection;
