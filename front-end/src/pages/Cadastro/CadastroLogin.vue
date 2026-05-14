<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeaderPublico from '@/components/HeaderPublico.vue'
import { adotanteService, varaService, instituicaoService } from '@/service/index'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const tipo = ref('adotante')   // 'adotante' | 'vara' | 'instituicao'
const modo = ref('entrar')     // 'cadastrar' | 'entrar'
const erro = ref('')
const carregando = ref(false)

const form = ref({
  nome: '',
  cpf: '',
  cnpj: '',
  comarca: '',
  email: '',
  senha: ''
})

// ── Máscara CPF (XXX.XXX.XXX-XX) ─────────────────────────────
const aoDigitarCPF = (e) => {
  const nums = e.target.value.replace(/\D/g, '').slice(0, 11)
  form.value.cpf = nums
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1})/, '$1.$2.$3-$4')
}

// ── Máscara CNPJ (XX.XXX.XXX/XXXX-XX) ───────────────────────
const aoDigitarCNPJ = (e) => {
  const nums = e.target.value.replace(/\D/g, '').slice(0, 14)
  form.value.cnpj = nums
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5')
}

// ── Validação CPF ────────────────────────────────────────────
const cpfValido = (cpf) => {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += +n[i] * (10 - i)
  let r = (s * 10) % 11
  if (r >= 10) r = 0
  if (r !== +n[9]) return false
  s = 0
  for (let i = 0; i < 10; i++) s += +n[i] * (11 - i)
  r = (s * 10) % 11
  if (r >= 10) r = 0
  return r === +n[10]
}

// ── Validação CNPJ ───────────────────────────────────────────
const cnpjValido = (cnpj) => {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false
  const calc = (arr, pesos) => {
    const s = arr.reduce((acc, d, i) => acc + d * pesos[i], 0)
    const r = s % 11
    return r < 2 ? 0 : 11 - r
  }
  const d = n.split('').map(Number)
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  return d[12] === calc(d.slice(0, 12), p1) && d[13] === calc(d.slice(0, 13), p2)
}

// ── Labels dinâmicos ─────────────────────────────────────────
const tipoLabel = computed(() => ({
  adotante: 'Adotante',
  vara: 'Vara da Infância',
  instituicao: 'Instituição'
}[tipo.value]))

const rotaAposLogin = computed(() => ({
  adotante: '/painel',
  vara: '/governo',
  instituicao: '/instituicao/painel'
}[tipo.value]))

// ── Validação antes de enviar ─────────────────────────────────
const validar = () => {
  if (modo.value === 'cadastrar') {
    if (tipo.value === 'adotante') {
      if (!form.value.cpf || form.value.cpf.replace(/\D/g, '').length < 11) {
        return 'Informe um CPF com 11 dígitos.'
      }
      if (!cpfValido(form.value.cpf)) {
        return 'CPF inválido. Verifique os números digitados.'
      }
    }
    if (tipo.value === 'vara' || tipo.value === 'instituicao') {
      if (!form.value.cnpj || form.value.cnpj.replace(/\D/g, '').length < 14) {
        return 'Informe um CNPJ com 14 dígitos.'
      }
      if (!cnpjValido(form.value.cnpj)) {
        return 'CNPJ inválido. Verifique os números digitados.'
      }
    }
  }
  if (form.value.senha.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres.'
  }
  return null
}

// ── Submit ───────────────────────────────────────────────────
const submit = async () => {
  erro.value = ''
  const erroValidacao = validar()
  if (erroValidacao) { erro.value = erroValidacao; return }

  carregando.value = true
  try {
    if (tipo.value === 'adotante') {
      if (modo.value === 'cadastrar') {
        await adotanteService.cadastrar({
          nome: form.value.nome,
          cpf: form.value.cpf,
          email: form.value.email,
          senha: form.value.senha
        })
        const res = await adotanteService.entrar({ email: form.value.email, senha: form.value.senha })
        userStore.login(res.adotante, res.token, 'ADOTANTE')
      } else {
        const res = await adotanteService.entrar({ email: form.value.email, senha: form.value.senha })
        userStore.login(res.adotante, res.token, 'ADOTANTE')
      }
    } else if (tipo.value === 'vara') {
      if (modo.value === 'cadastrar') {
        await varaService.cadastrar({
          nome_exibicao: form.value.nome,
          cnpj: form.value.cnpj,
          comarca: form.value.comarca,
          email: form.value.email,
          senha: form.value.senha
        })
        const res = await varaService.entrar({ email: form.value.email, senha: form.value.senha })
        userStore.login(res.vara, res.token, 'VARA')
      } else {
        const res = await varaService.entrar({ email: form.value.email, senha: form.value.senha })
        userStore.login(res.vara, res.token, 'VARA')
      }
    } else {
      if (modo.value === 'cadastrar') {
        await instituicaoService.cadastrar({
          nome: form.value.nome,
          cnpj: form.value.cnpj,
          email: form.value.email,
          senha: form.value.senha
        })
        const res = await instituicaoService.entrar({ email: form.value.email, senha: form.value.senha })
        userStore.login(res.instituicao, res.token, 'INSTITUICAO')
      } else {
        const res = await instituicaoService.entrar({ email: form.value.email, senha: form.value.senha })
        userStore.login(res.instituicao, res.token, 'INSTITUICAO')
      }
    }
    router.push(rotaAposLogin.value)
  } catch (e) {
    erro.value = e.message || 'Ocorreu um erro. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

const trocarTipo = (novoTipo) => {
  tipo.value = novoTipo
  erro.value = ''
  form.value = { nome: '', cpf: '', cnpj: '', comarca: '', email: '', senha: '' }
}

const trocarModo = (novoModo) => {
  modo.value = novoModo
  erro.value = ''
}
</script>

<template>
  <div class="page">
    <HeaderPublico />
    <main class="conteudo">
      <div class="card">
        <!-- Seletor de tipo de usuário -->
        <div class="tipo-tabs">
          <button
            v-for="t in [['adotante','Adotante'],['vara','Vara'],['instituicao','Instituição']]"
            :key="t[0]"
            :class="['tipo-tab', { ativa: tipo === t[0] }]"
            @click="trocarTipo(t[0])"
            type="button"
          >{{ t[1] }}</button>
        </div>

        <h1>{{ modo === 'cadastrar' ? `Criar conta — ${tipoLabel}` : `Entrar como ${tipoLabel}` }}</h1>
        <p class="subtitulo">
          {{ modo === 'cadastrar' ? 'Preencha os dados para criar o acesso.' : 'Use seu e-mail e senha cadastrados.' }}
        </p>

        <!-- Login / Cadastrar tabs -->
        <div class="tabs">
          <button :class="['tab', { ativa: modo === 'entrar' }]" @click="trocarModo('entrar')" type="button">Entrar</button>
          <button :class="['tab', { ativa: modo === 'cadastrar' }]" @click="trocarModo('cadastrar')" type="button">Criar conta</button>
        </div>

        <form @submit.prevent="submit" novalidate>

          <!-- Nome (somente cadastro) -->
          <div v-if="modo === 'cadastrar'" class="campo">
            <label>{{ tipo === 'vara' ? 'Nome da vara' : tipo === 'instituicao' ? 'Nome da instituição' : 'Nome completo' }}</label>
            <input v-model="form.nome" type="text" placeholder="Nome completo" required />
          </div>

          <!-- CPF — apenas adotante no cadastro -->
          <div v-if="modo === 'cadastrar' && tipo === 'adotante'" class="campo">
            <label>CPF</label>
            <input
              :value="form.cpf"
              @input="aoDigitarCPF"
              type="text"
              inputmode="numeric"
              placeholder="000.000.000-00"
              maxlength="14"
              required
            />
            <span v-if="form.cpf && form.cpf.replace(/\D/g,'').length === 11 && !cpfValido(form.cpf)" class="campo-erro">
              CPF inválido. Verifique os números.
            </span>
          </div>

          <!-- CNPJ — vara e instituição no cadastro -->
          <div v-if="modo === 'cadastrar' && (tipo === 'vara' || tipo === 'instituicao')" class="campo">
            <label>CNPJ</label>
            <input
              :value="form.cnpj"
              @input="aoDigitarCNPJ"
              type="text"
              inputmode="numeric"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              required
            />
            <span v-if="form.cnpj && form.cnpj.replace(/\D/g,'').length === 14 && !cnpjValido(form.cnpj)" class="campo-erro">
              CNPJ inválido. Verifique os números.
            </span>
          </div>

          <!-- Comarca — apenas vara no cadastro -->
          <div v-if="modo === 'cadastrar' && tipo === 'vara'" class="campo">
            <label>Comarca</label>
            <input v-model="form.comarca" type="text" placeholder="Ex: Recife" required />
          </div>

          <!-- E-mail (sempre) -->
          <div class="campo">
            <label>E-mail</label>
            <input v-model="form.email" type="email" placeholder="voce@email.com" required />
          </div>

          <!-- Senha (sempre) -->
          <div class="campo">
            <label>Senha</label>
            <input v-model="form.senha" type="password" placeholder="Mínimo 8 caracteres" minlength="8" required />
            <span v-if="form.senha && form.senha.length < 8" class="campo-erro">
              A senha deve ter pelo menos 8 caracteres.
            </span>
          </div>

          <p v-if="erro" class="msg-erro">
            <i class="ti ti-alert-circle"></i> {{ erro }}
          </p>

          <button type="submit" class="btn btn-primary btn-submit" :disabled="carregando">
            {{ carregando ? 'Aguarde...' : (modo === 'cadastrar' ? 'Criar conta' : 'Entrar') }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-warm); }
.conteudo {
  max-width: 480px;
  margin: 0 auto;
  padding: 48px 24px;
}
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 36px 40px;
}

/* Seletor de tipo */
.tipo-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}
.tipo-tab {
  flex: 1;
  padding: 8px 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.15s;
}
.tipo-tab.ativa {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}
.tipo-tab:hover:not(.ativa) { background: var(--color-bg-soft); }

h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}
.subtitulo {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

/* Tabs Entrar / Criar conta */
.tabs {
  display: flex;
  gap: 4px;
  background: var(--color-bg-soft);
  padding: 4px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
}
.tab {
  flex: 1;
  padding: 9px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  color: var(--color-text-secondary);
}
.tab.ativa {
  background: var(--color-bg);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.campo { margin-bottom: 14px; }
.campo label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}
.campo input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  transition: border 0.15s;
  box-sizing: border-box;
}
.campo input:focus { border-color: var(--color-primary); }

/* Feedback inline de campo */
.campo-erro {
  display: block;
  font-size: 12px;
  color: #dc2626;
  margin-top: 5px;
}

/* Erro global do formulário */
.msg-erro {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  margin-bottom: 14px;
}
.msg-erro .ti { font-size: 16px; flex-shrink: 0; }

.btn-submit {
  width: 100%;
  margin-top: 4px;
  padding: 12px;
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
