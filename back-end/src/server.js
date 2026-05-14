require("dotenv").config();

const express = require("express");
const cors = require("cors"); // 1. Importa o CORS
const path = require("path");

const routes = require("../src/routers"); // (Lembre de checar se a sua pasta é routes ou routers)
require("./models");

const app = express();

// 2. Configura o CORS antes de tudo
app.use(
  cors({
    // Define quem pode acessar a sua API
    origin: [
      "http://localhost:5173", // O seu front-end local
      // 'http://192.168.0.x:5173', // Exemplo: IP local de colaboradores
      // 'https://meu-dominio-em-producao.com' // Exemplo: URL quando for para nuvem
    ],
    // Quais métodos HTTP são permitidos
    methods: ["GET", "POST", "PUT", "DELETE"],
    // Cabeçalhos permitidos (essencial para o Authorization mandar o Token JWT)
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
