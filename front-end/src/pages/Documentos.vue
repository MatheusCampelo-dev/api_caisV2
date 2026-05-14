<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PainelLayout from '@/components/PainelLayout.vue'
import { documentosService } from '@/service/index'

const router = useRouter()

// Lista padrão exibida quando a vara ainda não cadastrou documentos no processo
const DOCS_PADRAO = [
  'RG e CPF',
  'Comprovante de residência',
  'Certidão de nascimento ou casamento',
  'Comprovante de renda',
  'Atestado de sanidade mental',
  'Certidão negativa criminal',
  'Laudo psicológico',
  'Certificado do Curso de Preparação',
]

const documentos = ref([])
const carregando = ref(true)
const erro = ref('')
const possuiProcesso = ref(true)

// Upload do certificado
const inputFile = ref(null)
const uploadando = ref(false)
const uploadErro = ref('')
const uploadSucesso = ref(false)

const entregues = computed(() => documentos.value.filter(d => d.status === 'entregue').length)

// Mapeia o status da API para ícone/cor de exibição
const infoDoc = (doc) => {
  switch (doc.status) {
    case 'entregue':
      return { icone: 'ti-circle-check', cor: 'verde' }
    case 'requer_nova_entrega':
      return { icone: 'ti-alert-triangle', cor: 'vermelho' }
    default:
      return { icone: 'ti-circle', cor: 'cinza' }
  }
}

const carregarDocumentos = async () => {
  carregando.value = true
  erro.value = ''
  possuiProcesso.value = true
  try {
    const dados = await documentosService.meus()
    documentos.value = dados.length === 0
      ? DOCS_PADRAO.map(nome => ({ nome_documento: nome, status: 'pendente', data_validacao: null }))
      : dados
  } catch (err) {
    if (err.message?.includes('Processo não encontrado')) {
      possuiProcesso.value = false
      documentos.value = DOCS_PADRAO.map(nome => ({ nome_documento: nome, status: 'pendente', data_validacao: null }))
    } else {
      erro.value = err.message || 'Erro ao carregar documentos.'
    }
  } finally {
    carregando.value = false
  }
}

onMounted(carregarDocumentos)

const abrirSeletor = () => {
  if (!possuiProcesso.value) {
    uploadErro.value = 'Seu processo ainda não foi criado. O upload de certificado só fica disponível após a Vara criar o processo.'
    return
  }

  uploadErro.value = ''
  uploadSucesso.value = false
  inputFile.value.click()
}

const aoSelecionarArquivo = async (e) => {
  const arquivo = e.target.files[0]
  if (!arquivo) return

  const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png']
  if (!tiposPermitidos.includes(arquivo.type)) {
    uploadErro.value = 'Envie apenas PDF, JPG ou PNG.'
    return
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    uploadErro.value = 'O arquivo não pode passar de 5 MB.'
    return
  }

  uploadando.value = true
  uploadErro.value = ''
  try {
    await documentosService.enviarCertificado(arquivo)
    uploadSucesso.value = true
    await carregarDocumentos()
  } catch (err) {
    uploadErro.value = err.message || 'Falha ao enviar o arquivo.'
  } finally {
    uploadando.value = false
    e.target.value = ''
  }
}

const isCertificado = (doc) =>
  doc.nome_documento === 'Certificado do Curso de Preparação'
</script>

<template>
  <PainelLayout>
    <div class="conteudo">
      <button class="voltar" @click="router.push('/painel')" type="button">
        <i class="ti ti-arrow-left"></i>
        Voltar ao painel
      </button>

      <h1>Documentos</h1>

      <div v-if="carregando" class="msg-estado">Carregando documentos...</div>
      <div v-else-if="erro" class="msg-estado erro">
        <i class="ti ti-alert-circle"></i> {{ erro }}
      </div>

      <template v-else>
        <p class="subtitulo">{{ entregues }} de {{ documentos.length }} itens entregues</p>

        <div class="aviso">
          <i class="ti ti-info-circle"></i>
          <p>
            Os documentos devem ser entregues presencialmente na Vara da Infância.<br>
            O sistema exibe o status atualizado pela Vara. Exceção: o Certificado do Curso de Preparação tem upload digital.
          </p>
        </div>

        <div v-if="documentos.length === 0" class="card-vazio">
          <i class="ti ti-file-off"></i>
          <p>Nenhum documento registrado ainda. A Vara adicionará os documentos ao seu processo.</p>
        </div>

        <div v-if="!possuiProcesso" class="msg-estado aviso-processo">
          <i class="ti ti-alert-circle"></i>
          Seu processo ainda não foi criado pela Vara. Quando o processo existir, você poderá enviar o Certificado do Curso de Preparação.
        </div>
        <div v-else class="lista">
          <div v-for="(doc, idx) in documentos" :key="idx" class="doc-item">
            <div :class="['doc-icone', `cor-${infoDoc(doc).cor}`]">
              <i :class="['ti', infoDoc(doc).icone]"></i>
            </div>
            <div class="doc-info">
              <p class="doc-nome">{{ doc.nome_documento }}</p>
              <p :class="['doc-detalhe', { erro: doc.status === 'requer_nova_entrega' }]">
                <template v-if="doc.status === 'entregue'">
                  Entregue{{ doc.data_validacao ? ` em ${new Date(doc.data_validacao).toLocaleDateString('pt-BR')}` : '' }}
                </template>
                <template v-else-if="doc.status === 'requer_nova_entrega'">
                  Reapresentação necessária
                </template>
                <template v-else>
                  Aguardando entrega presencial
                </template>
              </p>
            </div>

            <!-- Certificado: upload digital -->
            <div v-if="isCertificado(doc) && possuiProcesso" class="upload-wrapper">
              <input ref="inputFile" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" @change="aoSelecionarArquivo" />
              <button class="btn btn-outline btn-upload" :disabled="uploadando" @click="abrirSeletor">
                <i v-if="uploadando" class="ti ti-loader-2 spin"></i>
                {{ uploadando ? 'Enviando...' : doc.status === 'entregue' ? 'Reenviar' : 'Enviar arquivo' }}
              </button>
            </div>

            <!-- Outros documentos: só badge de status -->
            <template v-else>
              <span v-if="doc.status === 'entregue'" class="status entregue">Entregue</span>
              <span v-else-if="doc.status === 'requer_nova_entrega'" class="status reentregar">Reentregar</span>
              <span v-else class="status pendente">Pendente</span>
            </template>
          </div>
        </div>

        <p v-if="uploadErro" class="msg-upload erro">
          <i class="ti ti-alert-circle"></i> {{ uploadErro }}
        </p>
        <p v-if="uploadSucesso" class="msg-upload sucesso">
          <i class="ti ti-circle-check"></i> Certificado enviado com sucesso!
        </p>
      </template>
    </div>
  </PainelLayout>
</template>

<style scoped>
.conteudo { max-width: 880px; }
.voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  padding: 0;
}
.voltar:hover { text-decoration: underline; }

h1 { font-size: 28px; font-weight: 600; margin-bottom: 4px; }
.subtitulo {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.msg-estado {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.msg-estado.erro { color: var(--color-danger); }

.aviso {
  background: var(--color-warning-soft);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
}
.aviso .ti { font-size: 20px; color: var(--color-warning); flex-shrink: 0; }
.aviso p { font-size: 13px; color: var(--color-warning); line-height: 1.6; }

.card-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-tertiary);
  text-align: center;
}
.card-vazio .ti { font-size: 36px; }

.lista {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.doc-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--color-bg);
}

.doc-icone {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.cor-verde { background: var(--color-success-soft); color: var(--color-success); }
.cor-vermelho { background: var(--color-danger-soft); color: var(--color-danger); }
.cor-cinza { background: var(--color-bg-soft); color: var(--color-text-tertiary); }
.cor-azul { background: var(--color-primary-soft); color: var(--color-primary); }

.doc-info { flex: 1; }
.doc-nome { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.doc-detalhe { font-size: 12px; color: var(--color-text-tertiary); }
.doc-detalhe.erro { color: var(--color-danger); }

.status {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 14px;
  border-radius: 14px;
  flex-shrink: 0;
}
.status.entregue { background: var(--color-success-soft); color: var(--color-success); }
.status.reentregar { background: var(--color-danger-soft); color: var(--color-danger); }
.status.pendente { background: var(--color-bg-soft); color: var(--color-text-tertiary); }

.btn-upload { padding: 7px 14px; font-size: 12px; flex-shrink: 0; }
.upload-wrapper { flex-shrink: 0; }

.msg-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  margin-top: 16px;
}
.msg-upload.erro { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.msg-upload.sucesso { background: var(--color-success-soft); color: var(--color-success); }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { display: inline-block; animation: spin 0.8s linear infinite; }
</style>
