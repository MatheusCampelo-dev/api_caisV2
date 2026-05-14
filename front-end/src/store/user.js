import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const id = ref(null)
  const nome = ref('')
  const email = ref('')
  const cpf = ref('')
  const comarca = ref('')
  const role = ref('')        // 'ADOTANTE' | 'VARA' | 'INSTITUICAO'
  const autenticado = ref(false)

  const iniciais = computed(() => {
    return nome.value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase()
  })

  const primeiroNome = computed(() => nome.value.split(' ')[0] || '')

  const login = (dados, token, tipoRole) => {
    id.value = dados.id ?? null
    nome.value = dados.nome ?? dados.nome_exibicao ?? ''
    email.value = dados.email ?? ''
    cpf.value = dados.cpf ?? ''
    comarca.value = dados.comarca ?? ''
    role.value = tipoRole ?? ''
    autenticado.value = true

    if (token) localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify({
      id: id.value,
      nome: nome.value,
      email: email.value,
      cpf: cpf.value,
      comarca: comarca.value,
      role: role.value
    }))
  }

  const logout = () => {
    id.value = null
    nome.value = ''
    email.value = ''
    cpf.value = ''
    comarca.value = ''
    role.value = ''
    autenticado.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  const init = () => {
    const token = localStorage.getItem('token')
    const usuarioStr = localStorage.getItem('usuario')
    if (!token || !usuarioStr) return
    try {
      const usuario = JSON.parse(usuarioStr)
      id.value = usuario.id ?? null
      nome.value = usuario.nome ?? ''
      email.value = usuario.email ?? ''
      cpf.value = usuario.cpf ?? ''
      comarca.value = usuario.comarca ?? ''
      role.value = usuario.role ?? ''
      autenticado.value = true
    } catch {
      logout()
    }
  }

  return { id, nome, email, cpf, comarca, role, autenticado, iniciais, primeiroNome, login, logout, init }
})
