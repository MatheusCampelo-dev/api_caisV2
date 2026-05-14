const path = require("path");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API CAIS - Sistema de Adoção",
      version: "1.0.0",
      description: "Documentação interativa da API do Sistema de Adoção",
    },
    // Configuração para o Swagger aceitar o seu Token JWT
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Onde o Swagger vai procurar os comentários das suas rotas
  apis: [path.resolve(__dirname, "../src/routers/*.js")],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
