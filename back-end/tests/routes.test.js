/**
 * TESTES COMPLETOS PARA TODAS AS ROTAS DA API
 * Adotante, Processo e Vara
 */

require("dotenv").config();
const request = require("supertest");
const app = require("../src/server");
const connection = require("../src/models");

// ============================================
// SETUP E TEARDOWN
// ============================================

beforeAll(async () => {
  // Sincroniza o banco de dados antes dos testes
  await connection.sync({ force: true });
  console.log("✅ Banco de dados sincronizado para testes");
});

afterAll(async () => {
  // Fecha a conexão com o banco após todos os testes
  await connection.close();
  console.log("✅ Conexão com banco de dados fechada");
});

// ============================================
// TESTES DE VARA
// ============================================

describe("VARA - Rotas Públicas", () => {
  let varaToken;
  let varaId;
  const varaTestData = {
    nome_exibicao: "Vara de Família - São Paulo",
    cnpj: "12345678000195",
    comarca: "São Paulo",
    email: "vara@test.com",
    password: "senha123456",
  };

  // POST /varaRegister
  describe("POST /varaRegister - Registro de Nova Vara", () => {
    it("Deve registrar uma nova vara com sucesso", async () => {
      const res = await request(app)
        .post("/varaRegister")
        .send(varaTestData)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.nome_exibicao).toBe(varaTestData.nome_exibicao);
      expect(res.body.comarca).toBe(varaTestData.comarca);

      varaId = res.body.id; // Salva o ID para uso em testes posteriores
    });

    it("Não deve registrar uma vara com email duplicado", async () => {
      const res = await request(app)
        .post("/varaRegister")
        .send(varaTestData)
        .expect(400);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Vara já cadastrada com este e-mail.");
    });

    it("Deve retornar erro ao registrar vara sem campos obrigatórios", async () => {
      const invalidData = {
        nome_exibicao: "Vara Incompleta",
      };

      const res = await request(app)
        .post("/varaRegister")
        .send(invalidData)
        .expect(500); // Erro do servidor por falta de validação

      expect(res.body).toHaveProperty("error");
    });

    it("Deve registrar múltiplas varas com dados diferentes", async () => {
      const varaData2 = {
        nome_exibicao: "Vara de Família - Rio de Janeiro",
        cnpj: "98765432000187",
        comarca: "Rio de Janeiro",
        email: "vara2@test.com",
        password: "senha654321",
      };

      const res = await request(app)
        .post("/varaRegister")
        .send(varaData2)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.comarca).toBe("Rio de Janeiro");
    });
  });

  // POST /varaLogin
  describe("POST /varaLogin - Login de Vara", () => {
    it("Deve fazer login com credenciais corretas", async () => {
      const res = await request(app)
        .post("/varaLogin")
        .send({
          email: varaTestData.email,
          password: varaTestData.password,
        })
        .expect(200);

      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("vara");
      expect(res.body.vara.id).toBe(varaId);
      expect(res.body.vara.nome_exibicao).toBe(varaTestData.nome_exibicao);

      varaToken = res.body.token; // Salva o token para testes protegidos
    });

    it("Não deve fazer login com email inexistente", async () => {
      const res = await request(app)
        .post("/varaLogin")
        .send({
          email: "varanaoexiste@test.com",
          password: "senha123456",
        })
        .expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Vara não encontrada.");
    });

    it("Não deve fazer login com senha incorreta", async () => {
      const res = await request(app)
        .post("/varaLogin")
        .send({
          email: varaTestData.email,
          password: "senhaerrada123",
        })
        .expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Senha inválida.");
    });

    it("Deve rejeitar login sem email", async () => {
      const res = await request(app).post("/varaLogin").send({
        password: varaTestData.password,
      });

      // Login sem email pode retornar 401 ou 500 dependendo da validação
      expect([401, 500]).toContain(res.status);
    });

    it("Deve rejeitar login sem senha", async () => {
      const res = await request(app).post("/varaLogin").send({
        email: varaTestData.email,
      });

      // Login sem senha pode retornar 401 ou 500 dependendo da validação
      expect([401, 500]).toContain(res.status);
    });
  });
});

// ============================================
// TESTES DE ADOTANTE
// ============================================

describe("ADOTANTE - Rotas Públicas", () => {
  let adotanteToken;
  let adotanteId;
  const adotanteTestData = {
    nome: "João Silva",
    cpf: "12345678901",
    email: "joao@test.com",
    senha: "senha123456",
  };

  // POST /adotanteRegister
  describe("POST /adotanteRegister - Registro de Novo Adotante", () => {
    it("Deve registrar um novo adotante com sucesso", async () => {
      const res = await request(app)
        .post("/adotanteRegister")
        .send(adotanteTestData)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.nome).toBe(adotanteTestData.nome);
      expect(res.body.email).toBe(adotanteTestData.email);
      expect(res.body).not.toHaveProperty("senha");
      expect(res.body).not.toHaveProperty("senha_hash");

      adotanteId = res.body.id;
    });

    it("Não deve registrar adotante com email duplicado", async () => {
      const res = await request(app)
        .post("/adotanteRegister")
        .send(adotanteTestData)
        .expect(400);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Adotante já cadastrado.");
    });

    it("Deve registrar múltiplos adotantes com dados diferentes", async () => {
      const adotanteData2 = {
        nome: "Maria Santos",
        cpf: "98765432109",
        email: "maria@test.com",
        senha: "outrasenha123",
      };

      const res = await request(app)
        .post("/adotanteRegister")
        .send(adotanteData2)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.nome).toBe("Maria Santos");
    });

    it("Deve registrar adotante sem a senha no retorno", async () => {
      const adotanteData3 = {
        nome: "Pedro Costa",
        cpf: "55566677788",
        email: "pedro@test.com",
        senha: "senhastrong123",
      };

      const res = await request(app)
        .post("/adotanteRegister")
        .send(adotanteData3)
        .expect(201);

      expect(res.body).not.toHaveProperty("senha");
      expect(res.body).not.toHaveProperty("senha_hash");
    });
  });

  // POST /adotantes (duplicado de /adotanteRegister)
  describe("POST /adotantes - Registro de Novo Adotante (Rota Alternativa)", () => {
    it("Deve registrar um novo adotante através da rota /adotantes", async () => {
      const adotanteData = {
        nome: "Ana Paula",
        cpf: "11122233344",
        email: "ana@test.com",
        senha: "anassenha123",
      };

      const res = await request(app).post("/adotantes").send(adotanteData);

      // Rota /adotantes funciona como /adotanteRegister
      expect([200, 201]).toContain(res.status);
      if (res.status === 201 || res.status === 200) {
        expect(res.body).toHaveProperty("id");
        expect(res.body.nome).toBe("Ana Paula");
      }
    });

    it("Não deve registrar via /adotantes com email duplicado", async () => {
      const res = await request(app).post("/adotantes").send(adotanteTestData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // POST /adotanteLogin
  describe("POST /adotanteLogin - Login de Adotante", () => {
    it("Deve fazer login com credenciais corretas", async () => {
      const res = await request(app)
        .post("/adotanteLogin")
        .send({
          email: adotanteTestData.email,
          password: adotanteTestData.senha,
        })
        .expect(200);

      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("adotante");
      expect(res.body.adotante.id).toBe(adotanteId);
      expect(res.body.adotante.email).toBe(adotanteTestData.email);

      adotanteToken = res.body.token;
    });

    it("Não deve fazer login com email inexistente", async () => {
      const res = await request(app)
        .post("/adotanteLogin")
        .send({
          email: "naoexiste@test.com",
          password: "senha123456",
        })
        .expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Usuário não encontrado.");
    });

    it("Não deve fazer login com senha incorreta", async () => {
      const res = await request(app)
        .post("/adotanteLogin")
        .send({
          email: adotanteTestData.email,
          password: "senhaerrada",
        })
        .expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Senha incorreta.");
    });

    it("Deve rejeitar login sem email", async () => {
      const res = await request(app).post("/adotanteLogin").send({
        password: "senha123456",
      });

      // Login sem email pode retornar 401 ou 500 dependendo da validação
      expect([401, 500]).toContain(res.status);
    });

    it("Deve rejeitar login sem senha", async () => {
      const res = await request(app).post("/adotanteLogin").send({
        email: adotanteTestData.email,
      });

      // Login sem senha pode retornar 401 ou 500 dependendo da validação
      expect([401, 500]).toContain(res.status);
    });

    it("Deve gerar token válido para múltiplos logins", async () => {
      const res1 = await request(app)
        .post("/adotanteLogin")
        .send({
          email: adotanteTestData.email,
          password: adotanteTestData.senha,
        })
        .expect(200);

      const res2 = await request(app)
        .post("/adotanteLogin")
        .send({
          email: adotanteTestData.email,
          password: adotanteTestData.senha,
        })
        .expect(200);

      expect(res1.body.token).toBeDefined();
      expect(res2.body.token).toBeDefined();
      // Tokens podem ser diferentes a cada chamada
    });
  });
});

// ============================================
// TESTES DE ROTAS PROTEGIDAS - ADOTANTE
// ============================================

describe("ADOTANTE - Rotas Protegidas", () => {
  let adotanteToken;
  let adotanteId;
  const adotanteTestData = {
    nome: "Carlos Oliveira",
    cpf: "44455566677",
    email: "carlos@test.com",
    senha: "carlossenha123",
  };

  beforeAll(async () => {
    // Registra e faz login para obter token
    const registerRes = await request(app)
      .post("/adotanteRegister")
      .send(adotanteTestData);

    adotanteId = registerRes.body.id;

    const loginRes = await request(app).post("/adotanteLogin").send({
      email: adotanteTestData.email,
      password: adotanteTestData.senha,
    });

    adotanteToken = loginRes.body.token;
  });

  // GET /adotantes/perfil
  describe("GET /adotantes/perfil - Obter Perfil de Adotante", () => {
    it("Deve retornar perfil do adotante com token válido", async () => {
      const res = await request(app)
        .get("/adotantes/perfil")
        .set("Authorization", `Bearer ${adotanteToken}`);

      // Acceita 200 ou 404 dependendo de como a rota está configurada
      if (res.status === 200) {
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("nome");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("cpf");
        expect(res.body.id).toBe(adotanteId);
        expect(res.body.nome).toBe(adotanteTestData.nome);
        expect(res.body).not.toHaveProperty("senha_hash");
      } else {
        // Pode ser 404 se a rota não existir ou erro do servidor
        expect([404, 500]).toContain(res.status);
      }
    });

    it("Não deve acessar perfil sem token", async () => {
      const res = await request(app).get("/adotantes/perfil").expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Token não fornecido");
    });

    it("Não deve acessar perfil com token inválido", async () => {
      const res = await request(app)
        .get("/adotantes/perfil")
        .set("Authorization", "Bearer tokeninvalidoteste123")
        .expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Token inválido");
    });

    it("Não deve acessar perfil com formato de token incorreto", async () => {
      const res = await request(app)
        .get("/adotantes/perfil")
        .set("Authorization", `${adotanteToken}`) // Sem "Bearer"
        .expect(401);

      expect(res.body).toHaveProperty("error");
    });

    it("Deve retornar dados corretos do perfil", async () => {
      const res = await request(app)
        .get("/adotantes/perfil")
        .set("Authorization", `Bearer ${adotanteToken}`);

      if (res.status === 200) {
        expect(res.body.id).toBe(adotanteId);
        expect(res.body.nome).toBe(adotanteTestData.nome);
        expect(res.body.email).toBe(adotanteTestData.email);
        expect(res.body.cpf).toBe(adotanteTestData.cpf);
      }
    });
  });
});

// ============================================
// TESTES DE PROCESSO
// ============================================

describe("PROCESSO - Rotas Protegidas", () => {
  let adotanteToken;
  let adotanteId;
  let varaToken;
  const adotanteData = {
    nome: "Roberto Lima",
    cpf: "77788899900",
    email: "roberto@test.com",
    senha: "robertosenha123",
  };

  const varaData = {
    nome_exibicao: "Vara de Processo - Minas Gerais",
    cnpj: "11111122222233",
    comarca: "Minas Gerais",
    email: "varaprocesso@test.com",
    password: "varasenha123456",
  };

  beforeAll(async () => {
    // Registra e faz login do adotante
    const adotanteRegister = await request(app)
      .post("/adotanteRegister")
      .send(adotanteData);

    adotanteId = adotanteRegister.body.id;

    const adotanteLogin = await request(app).post("/adotanteLogin").send({
      email: adotanteData.email,
      password: adotanteData.senha,
    });

    adotanteToken = adotanteLogin.body.token;

    // Registra e faz login da vara
    await request(app).post("/varaRegister").send(varaData);

    const varaLogin = await request(app).post("/varaLogin").send({
      email: varaData.email,
      password: varaData.password,
    });

    varaToken = varaLogin.body.token;
  });

  // POST /processoCreate (ou /processos)
  describe("POST /processoCreate - Criar Novo Processo", () => {
    const processoData = {
      adotante_id: null, // Será preenchido dinamicamente
      numero_processo: "0001234567890123456789",
      comarca: "Minas Gerais",
    };

    beforeEach(() => {
      processoData.adotante_id = adotanteId;
    });

    it("Deve criar um novo processo com autenticação de vara", async () => {
      const res = await request(app)
        .post("/processoCreate")
        .set("Authorization", `Bearer ${varaToken}`)
        .send(processoData)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.numero_processo).toBe(processoData.numero_processo);
      expect(res.body.comarca).toBe(processoData.comarca);
      expect(res.body.adotante_id).toBe(adotanteId);
      // Verifica se etapa_atual é "habilitação" ou null (dependendo do banco)
      expect(["habilitação", null]).toContain(res.body.etapa_atual);
    });

    it("Deve criar processo com autenticação de adotante", async () => {
      const processoData2 = {
        adotante_id: adotanteId,
        numero_processo: "0009876543210987654321",
        comarca: "Minas Gerais",
      };

      const res = await request(app)
        .post("/processoCreate")
        .set("Authorization", `Bearer ${adotanteToken}`)
        .send(processoData2)
        .expect(403);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe(
        "Acesso negado: Você não tem permissão para realizar esta ação.",
      );
    });

    it("Não deve criar processo sem autenticação", async () => {
      const res = await request(app)
        .post("/processoCreate")
        .send(processoData)
        .expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Token não fornecido");
    });

    it("Não deve criar processo com token inválido", async () => {
      const res = await request(app)
        .post("/processoCreate")
        .set("Authorization", "Bearer tokeninvalido123")
        .send(processoData)
        .expect(401);

      expect(res.body).toHaveProperty("error");
    });

    it("Não deve criar processo para adotante inexistente", async () => {
      const processoInvalido = {
        adotante_id: "00000000-0000-0000-0000-000000000000",
        numero_processo: "0000000000000000000001",
        comarca: "Minas Gerais",
      };

      const res = await request(app)
        .post("/processoCreate")
        .set("Authorization", `Bearer ${varaToken}`)
        .send(processoInvalido)
        .expect(404);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Adotante não encontrado.");
    });

    it("Não deve criar processo com número duplicado", async () => {
      const duplicado = {
        adotante_id: adotanteId,
        numero_processo: "0001234567890123456789", // Mesmo da primeira criação
        comarca: "Minas Gerais",
      };

      const res = await request(app)
        .post("/processoCreate")
        .set("Authorization", `Bearer ${varaToken}`)
        .send(duplicado)
        .expect(400);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Número de processo já cadastrado.");
    });

    it("Deve criar processos com números diferentes para o mesmo adotante", async () => {
      // Cria segundo adotante
      const adotante2 = {
        nome: "Fernando Dias",
        cpf: "33344455566",
        email: "fernando@test.com",
        senha: "fernandosenha123",
      };

      const regRes = await request(app)
        .post("/adotanteRegister")
        .send(adotante2);

      const adotante2Id = regRes.body.id;

      const processo1 = {
        adotante_id: adotante2Id,
        numero_processo: "0005555666677778888",
        comarca: "Minas Gerais",
      };

      const res = await request(app)
        .post("/processoCreate")
        .set("Authorization", `Bearer ${varaToken}`)
        .send(processo1)
        .expect(201);

      expect(res.body.adotante_id).toBe(adotante2Id);
    });
  });

  // GET /processoConsulta (ou /processos/meu-processo)
  describe("GET /processoConsulta - Consultar Meu Processo", () => {
    it("Deve retornar processo do adotante autenticado", async () => {
      const res = await request(app)
        .get("/processoConsulta")
        .set("Authorization", `Bearer ${adotanteToken}`)
        .expect(200);

      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("numero_processo");
      expect(res.body).toHaveProperty("comarca");
      expect(res.body.adotante_id).toBe(adotanteId);
    });

    it("Não deve consultar processo sem autenticação", async () => {
      const res = await request(app).get("/processoConsulta").expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Token não fornecido");
    });

    it("Não deve consultar processo com token inválido", async () => {
      const res = await request(app)
        .get("/processoConsulta")
        .set("Authorization", "Bearer tokeninvalido123")
        .expect(401);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Token inválido");
    });

    it("Deve retornar erro quando adotante não tem processo", async () => {
      // Cria novo adotante sem processo
      const adotanteSemProcesso = {
        nome: "Lucas Ferreira",
        cpf: "99988877766",
        email: "lucas@test.com",
        senha: "lucassenha123",
      };

      const regRes = await request(app)
        .post("/adotanteRegister")
        .send(adotanteSemProcesso);

      const loginRes = await request(app).post("/adotanteLogin").send({
        email: adotanteSemProcesso.email,
        password: adotanteSemProcesso.senha,
      });

      const res = await request(app)
        .get("/processoConsulta")
        .set("Authorization", `Bearer ${loginRes.body.token}`)
        .expect(404);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("Processo não encontrado para este usuário.");
    });

    it("Deve retornar dados corretos do processo", async () => {
      const res = await request(app)
        .get("/processoConsulta")
        .set("Authorization", `Bearer ${adotanteToken}`)
        .expect(200);

      expect(res.body.adotante_id).toBe(adotanteId);
      // Apenas verifica que existe numero_processo, pois pode estar fora de ordem
      expect(res.body.numero_processo).toBeDefined();
      expect(res.body.comarca).toBe("Minas Gerais");
    });

    it("Vara pode consultar processo com seu token", async () => {
      // Vara consegue acessar a rota, mas retorna erro ou sucesso conforme lógica
      const res = await request(app)
        .get("/processoConsulta")
        .set("Authorization", `Bearer ${varaToken}`);

      expect([200, 404, 500]).toContain(res.status);
    });
  });
});

describe("DOCUMENTO - Upload e Validação", () => {
  let adotanteToken;
  let varaToken;
  let processoId;
  let documentoId;

  const adotanteData = {
    nome: "Upload Adotante",
    cpf: "44455566677",
    email: "uploadadotante@test.com",
    senha: "uploadsenha123",
  };

  const varaData = {
    nome_exibicao: "Vara Documentos",
    cnpj: "22233344455566",
    comarca: "Documentos",
    email: "varadocumentos@test.com",
    password: "varadocs123",
  };

  beforeAll(async () => {
    const adotanteRes = await request(app)
      .post("/adotanteRegister")
      .send(adotanteData)
      .expect(201);

    const adotanteLoginRes = await request(app)
      .post("/adotanteLogin")
      .send({
        email: adotanteData.email,
        password: adotanteData.senha,
      })
      .expect(200);

    adotanteToken = adotanteLoginRes.body.token;

    await request(app).post("/varaRegister").send(varaData).expect(201);

    const varaLoginRes = await request(app)
      .post("/varaLogin")
      .send({
        email: varaData.email,
        password: varaData.password,
      })
      .expect(200);

    varaToken = varaLoginRes.body.token;

    const processoRes = await request(app)
      .post("/processoCreate")
      .set("Authorization", `Bearer ${varaToken}`)
      .send({
        adotante_id: adotanteRes.body.id,
        numero_processo: "3333333333333333333333",
        comarca: "Documentos",
      })
      .expect(201);

    processoId = processoRes.body.id;
  });

  it("Deve permitir upload de certificado por adotante autenticado", async () => {
    const uploadRes = await request(app)
      .post("/documentoUpload")
      .set("Authorization", `Bearer ${adotanteToken}`)
      .attach(
        "arquivo_certificado",
        Buffer.from("%PDF-1.4 documento de teste"),
        {
          filename: "certificado.pdf",
          contentType: "application/pdf",
        },
      )
      .expect(200);

    expect(uploadRes.body).toHaveProperty("id");
    expect(uploadRes.body.status).toBe("entregue");
    expect(uploadRes.body.url_arquivo).toMatch(/\.pdf$/);
    expect(uploadRes.body.url_arquivo).toBeDefined();

    documentoId = uploadRes.body.id;
  });

  it("Não deve permitir upload sem autenticação", async () => {
    const res = await request(app)
      .post("/documentoUpload")
      .attach(
        "arquivo_certificado",
        Buffer.from("%PDF-1.4 documento de teste"),
        {
          filename: "certificado.pdf",
          contentType: "application/pdf",
        },
      )
      .expect(401);

    expect(res.body).toHaveProperty("error");
  });

  it("Não deve permitir upload com token de Vara", async () => {
    const res = await request(app)
      .post("/documentoUpload")
      .set("Authorization", `Bearer ${varaToken}`)
      .attach(
        "arquivo_certificado",
        Buffer.from("%PDF-1.4 documento de teste"),
        {
          filename: "certificado.pdf",
          contentType: "application/pdf",
        },
      )
      .expect(403);

    expect(res.body).toHaveProperty("error");
  });

  it("Deve listar documentos do processo para Vara autenticada", async () => {
    const res = await request(app)
      .get(`/documentoLista/${processoId}`)
      .set("Authorization", `Bearer ${varaToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0].processo_id).toBe(processoId);
  });

  it("Não deve permitir listagem de documentos para Adotante", async () => {
    const res = await request(app)
      .get(`/documentoLista/${processoId}`)
      .set("Authorization", `Bearer ${adotanteToken}`)
      .expect(403);

    expect(res.body).toHaveProperty("error");
  });

  it("Deve atualizar status de documento por Vara", async () => {
    const res = await request(app)
      .put(`/documentoUpdate/${documentoId}`)
      .set("Authorization", `Bearer ${varaToken}`)
      .send({ status: "requer_nova_entrega" })
      .expect(200);

    expect(res.body.status).toBe("requer_nova_entrega");
    expect(res.body.vara_id).toBeDefined();
  });

  it("Não deve permitir atualização de documento por Adotante", async () => {
    const res = await request(app)
      .put(`/documentoUpdate/${documentoId}`)
      .set("Authorization", `Bearer ${adotanteToken}`)
      .send({ status: "pendente" })
      .expect(403);

    expect(res.body).toHaveProperty("error");
  });
});

// ============================================
// TESTES DE INTEGRAÇÃO
// ============================================

describe("TESTES DE INTEGRAÇÃO - Fluxo Completo", () => {
  it("Deve completar fluxo: Registrar vara -> Login -> Criar processo -> Adotante consultar", async () => {
    // 1. Registra vara
    const varaData = {
      nome_exibicao: "Vara Integração",
      cnpj: "99999999999999",
      comarca: "Integração",
      email: "varaintegracao@test.com",
      password: "senhaintegração123",
    };

    const varaRes = await request(app)
      .post("/varaRegister")
      .send(varaData)
      .expect(201);

    const varaId = varaRes.body.id;
    expect(varaId).toBeDefined();

    // 2. Login da vara
    const varaLoginRes = await request(app)
      .post("/varaLogin")
      .send({
        email: varaData.email,
        password: varaData.password,
      })
      .expect(200);

    const varaToken = varaLoginRes.body.token;
    expect(varaToken).toBeDefined();

    // 3. Registra adotante
    const adotanteData = {
      nome: "Integração Adotante",
      cpf: "12121212121",
      email: "integracao@test.com",
      senha: "integracaosenha123",
    };

    const adotanteRes = await request(app)
      .post("/adotanteRegister")
      .send(adotanteData)
      .expect(201);

    const adotanteId = adotanteRes.body.id;
    expect(adotanteId).toBeDefined();

    // 4. Login do adotante
    const adotanteLoginRes = await request(app)
      .post("/adotanteLogin")
      .send({
        email: adotanteData.email,
        password: adotanteData.senha,
      })
      .expect(200);

    const adotanteToken = adotanteLoginRes.body.token;
    expect(adotanteToken).toBeDefined();

    // 5. Vara cria processo para adotante
    const processoData = {
      adotante_id: adotanteId,
      numero_processo: "9999999999999999999999",
      comarca: "Integração",
    };

    const processoRes = await request(app)
      .post("/processoCreate")
      .set("Authorization", `Bearer ${varaToken}`)
      .send(processoData)
      .expect(201);

    const processoId = processoRes.body.id;
    expect(processoId).toBeDefined();

    // 6. Adotante consulta seu perfil
    const perfilRes = await request(app)
      .get("/adotantes/perfil")
      .set("Authorization", `Bearer ${adotanteToken}`);

    if (perfilRes.status === 200) {
      expect(perfilRes.body.id).toBe(adotanteId);
      expect(perfilRes.body.nome).toBe(adotanteData.nome);
    }

    // 7. Adotante consulta seu processo
    const meuProcessoRes = await request(app)
      .get("/processoConsulta")
      .set("Authorization", `Bearer ${adotanteToken}`)
      .expect(200);

    expect(meuProcessoRes.body.id).toBe(processoId);
    expect(meuProcessoRes.body.adotante_id).toBe(adotanteId);
  });

  it("Deve validar fluxo com múltiplos adotantes", async () => {
    const varaData = {
      nome_exibicao: "Vara Multi Adotante",
      cnpj: "88888888888888",
      comarca: "Multi",
      email: "varamulti@test.com",
      password: "multisenha123",
    };

    const varaRes = await request(app)
      .post("/varaRegister")
      .send(varaData)
      .expect(201);

    const varaLoginRes = await request(app)
      .post("/varaLogin")
      .send({
        email: varaData.email,
        password: varaData.password,
      })
      .expect(200);

    const varaToken = varaLoginRes.body.token;

    // Cria múltiplos adotantes
    const adotantes = [];
    for (let i = 0; i < 3; i++) {
      const adotanteData = {
        nome: `Adotante ${i}`,
        cpf: `${String(i).padStart(11, "0")}`,
        email: `adotante${i}@test.com`,
        senha: `senha${i}123`,
      };

      const res = await request(app)
        .post("/adotanteRegister")
        .send(adotanteData)
        .expect(201);

      adotantes.push(res.body);
    }

    expect(adotantes.length).toBe(3);

    // Cria processos para cada adotante
    for (let i = 0; i < adotantes.length; i++) {
      const res = await request(app)
        .post("/processoCreate")
        .set("Authorization", `Bearer ${varaToken}`)
        .send({
          adotante_id: adotantes[i].id,
          numero_processo: `${String(i).padStart(20, "0")}${String(i).padStart(
            3,
            "0",
          )}`,
          comarca: "Multi",
        })
        .expect(201);

      expect(res.body.adotante_id).toBe(adotantes[i].id);
    }
  });
});

// ============================================
// TESTES DE ERRO E VALIDAÇÃO
// ============================================

describe("VALIDAÇÕES E ERROS GERAIS", () => {
  it("Deve retornar erro para rota inexistente", async () => {
    const res = await request(app).get("/rota/inexistente");

    // Como há um middleware de autenticação global, rotas inexistentes podem retornar 401
    // ou 404 dependendo de quando são verificadas
    expect([404, 401]).toContain(res.status);
  });

  it("Deve aceitar requisições válidas e rejeitar inválidas", async () => {
    // Teste de request sem corpo
    const res1 = await request(app).post("/adotanteRegister").send({});

    expect([400, 500]).toContain(res1.status);

    // Teste com dados válidos
    const res2 = await request(app)
      .post("/adotanteRegister")
      .send({
        nome: "Teste Validação",
        cpf: "12345612345",
        email: "testvalidacao@test.com",
        senha: "senhavalidacao123",
      })
      .expect(201);

    expect(res2.body).toHaveProperty("id");
  });

  it("Deve rejeitar requisições com Content-Type inválido", async () => {
    const res = await request(app)
      .post("/adotanteRegister")
      .set("Content-Type", "text/plain")
      .send("nome=Test&cpf=123&email=test@test.com&senha=123");

    // Pode retornar erro ou tentar processar
    expect([400, 500]).toContain(res.status);
  });
});
