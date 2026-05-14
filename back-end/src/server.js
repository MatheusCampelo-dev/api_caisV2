require("dotenv").config();

const express = require("express");
const cors = require("cors"); // 1. Importa o CORS
const path = require("path");

const routes = require("../src/routers");

const app = express();

// 2. Configura o CORS antes de tudo
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Expõe a pasta de uploads do Multer
app.use("/files", express.static(path.resolve(__dirname, "tmp", "uploads")));

// Rotas da aplicação (todas sob /api)
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Sistema CAIS rodando na porta ${PORT}`);
  console.log(`📚 Banco de dados conectado e inicializado.`);
  console.log(
    `📑 Documentação do Swagger em: http://localhost:${PORT}/api-docs`,
  );
});

module.exports = app;
