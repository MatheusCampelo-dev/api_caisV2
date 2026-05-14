import { api } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ── Autenticação ──────────────────────────────────────────────
export const adotanteService = {
  cadastrar: (dados) => api.post('/adotanteRegister', dados),
  entrar:    (dados) => api.post('/adotanteLogin', dados),
  perfil:    ()      => api.get('/adotantes/perfil'),
}

export const varaService = {
  cadastrar: (dados) => api.post('/varaRegister', dados),
  entrar:    (dados) => api.post('/varaLogin', dados),
}

export const instituicaoService = {
  cadastrar:      (dados) => api.post('/instituicaoRegister', dados),
  entrar:         (dados) => api.post('/instituicaoLogin', dados),
  perfil:         ()      => api.get('/instituicaoPerfil'),
  atualizarPerfil:(dados) => api.put('/instituicaoPerfilUpdate', dados),
  uploadFoto: (arquivo) => {
    const token = localStorage.getItem('token')
    const form = new FormData()
    form.append('foto', arquivo)
    return fetch(`${BASE_URL}/instituicaoFotoUpload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.error || `Erro ${r.status}`)
      }
      return r.json()
    })
  },
  removerFoto: (filename) => api.delete(`/instituicaoFotoRemover/${encodeURIComponent(filename)}`),
}

// ── Varas ─────────────────────────────────────────────────────
export const varasService = {
  listar:          ()        => api.get('/varas'),
  buscarPorComarca:(comarca) => api.get(`/varas/comarca/${encodeURIComponent(comarca)}`),
}

// ── Instituições ──────────────────────────────────────────────
export const instituicoesService = {
  listar:     ()   => api.get('/instituicoes'),
  buscarPorId:(id) => api.get(`/instituicoes/${id}`),
}

// ── Adotantes (uso da Vara) ───────────────────────────────────
export const adotantesService = {
  // Vara lista todos os adotantes cadastrados (com processo se existir)
  listar: () => api.get('/adotantes'),
}

// ── Processos ─────────────────────────────────────────────────
export const processoService = {
  // Adotante consulta o próprio processo (retorna null se ainda não existir)
  consultar: () => api.get('/processoConsulta'),

  // Vara cria processo para adotante
  criar: (dados) => api.post('/processoCreate', dados),

  // Vara lista todos os processos
  listarTodos: () => api.get('/processos'),

  // Vara consulta detalhe de um processo
  detalhe: (id) => api.get(`/processos/${id}`),

  // Vara avança etapa do processo
  avancarEtapa: (id, etapa_atual) => api.put(`/processos/${id}/etapa`, { etapa_atual }),

  // Vara vincula instituição a um processo
  vincularInstituicao: (id, instituicao_id) => api.put(`/processos/${id}/instituicao`, { instituicao_id }),

  // Vara consulta relatórios de visitas de um processo (só enviados)
  relatorios: (processoId) => api.get(`/processo/${processoId}/relatorios`),

  // Vara lista todas as visitas de um processo (agendadas + realizadas)
  listarVisitas: (processoId) => api.get(`/processos/${processoId}/visitas`),

  // Instituição busca processo pelo CPF do adotante
  buscarPorCpf: (cpf) => api.get(`/processos/por-cpf/${encodeURIComponent(cpf)}`),
}

// ── Documentos ────────────────────────────────────────────────
export const documentosService = {
  // Adotante vê seus próprios documentos
  meus: () => api.get('/documentos/meus'),

  // Vara lista documentos de um processo específico
  listar: (processoId) => api.get(`/documentoLista/${processoId}`),

  // Vara atualiza status de um documento
  atualizarStatus: (id, status) => api.put(`/documentoUpdate/${id}`, { status }),

  // Adotante envia o certificado digital
  enviarCertificado: (arquivo) => {
    const token = localStorage.getItem('token')
    const form = new FormData()
    form.append('arquivo_certificado', arquivo)
    return fetch(`${BASE_URL}/documentoUpload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.error || `Erro ${r.status}`)
      }
      return r.json()
    })
  },
}

// ── Visitas ───────────────────────────────────────────────────
export const visitasService = {
  // Instituição lista sua agenda
  listar:    ()            => api.get('/visitasAgenda'),
  criar:     (dados)       => api.post('/visitasCreate', dados),
  atualizar: (id, dados)   => api.put(`/visitasUpdate/${id}`, dados),
  detalhe:   (id)          => api.get(`/visita/${id}`),

  // Adotante vê as visitas do seu processo
  minhaAgenda: () => api.get('/minha-agenda'),
}

// ── Notificações ──────────────────────────────────────────────
export const notificacoesService = {
  listar: () => api.get('/notificacoes'),
}
