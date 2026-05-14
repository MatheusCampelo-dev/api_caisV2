-- ============================================================
-- CAIS v2 — Schema completo para Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- ============================================================

-- Habilita extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FUNÇÃO TRIGGER: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';


-- ============================================================
-- TABELA: adotantes
-- ============================================================
CREATE TABLE IF NOT EXISTS adotantes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT,
  cpf         TEXT,
  email       TEXT UNIQUE,
  senha_hash  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE adotantes DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_adotantes_updated_at
  BEFORE UPDATE ON adotantes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- TABELA: varas
-- ============================================================
CREATE TABLE IF NOT EXISTS varas (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_exibicao   TEXT,
  cnpj            TEXT,
  comarca         TEXT,
  email           TEXT UNIQUE,
  senha_hash      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE varas DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_varas_updated_at
  BEFORE UPDATE ON varas
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- TABELA: instituicoes
-- ============================================================
CREATE TABLE IF NOT EXISTS instituicoes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT,
  cnpj        TEXT UNIQUE,
  email       TEXT UNIQUE,
  senha_hash  TEXT,
  fotos       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE instituicoes DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_instituicoes_updated_at
  BEFORE UPDATE ON instituicoes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- TABELA: processos
-- (depende de: adotantes, instituicoes)
-- ============================================================
CREATE TABLE IF NOT EXISTS processos (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_processo       TEXT UNIQUE,
  comarca               TEXT,
  etapa_atual           TEXT        NOT NULL DEFAULT 'habilitação'
    CHECK (etapa_atual IN (
      'habilitação',
      'fila_de_espera',
      'aproximação',
      'convivência',
      'sentença'
    )),
  posicao_fila          INTEGER,
  data_habilitacao      DATE,
  validade_habilitacao  DATE,
  adotante_id           UUID        REFERENCES adotantes(id) ON DELETE SET NULL,
  instituicao_id        UUID        REFERENCES instituicoes(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE processos DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_processos_updated_at
  BEFORE UPDATE ON processos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- TABELA: documentos
-- (depende de: processos, varas)
-- ============================================================
CREATE TABLE IF NOT EXISTS documentos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_documento  TEXT,
  status          TEXT        CHECK (status IN ('pendente', 'entregue', 'requer_nova_entrega')),
  url_arquivo     TEXT,
  data_validacao  TIMESTAMPTZ,
  processo_id     UUID        REFERENCES processos(id) ON DELETE CASCADE,
  vara_id         UUID        REFERENCES varas(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE documentos DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- TABELA: visitas
-- (depende de: processos, instituicoes)
-- ============================================================
CREATE TABLE IF NOT EXISTS visitas (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  data_visita           DATE,
  hora_inicio           TIME,
  hora_fim              TIME,
  tipo_visita           TEXT,
  status_visita         TEXT    CHECK (status_visita IN ('agendada', 'realizada', 'cancelada')),
  status_relatorio      TEXT    CHECK (status_relatorio IN ('pendente', 'rascunho', 'enviado')),
  criterio_vinculo      TEXT    CHECK (criterio_vinculo IN ('Frágil', 'Em formação', 'Bom')),
  criterio_comunicacao  TEXT    CHECK (criterio_comunicacao IN ('Difícil', 'Adequada', 'Excelente')),
  criterio_adaptacao    TEXT    CHECK (criterio_adaptacao IN ('Resistente', 'Cautelosa', 'Confortável')),
  parecer_descritivo    TEXT,
  recomendacao_vara     TEXT    CHECK (recomendacao_vara IN (
                                  'Prosseguir para próxima visita',
                                  'Solicitar acompanhamento adicional da equipe técnica',
                                  'Sugerir interrupção do estágio de aproximação'
                                )),
  processo_id           UUID    REFERENCES processos(id) ON DELETE CASCADE,
  instituicao_id        UUID    REFERENCES instituicoes(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE visitas DISABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_visitas_updated_at
  BEFORE UPDATE ON visitas
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
