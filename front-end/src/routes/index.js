import { createRouter, createWebHistory } from 'vue-router'

import Inicio from '@/pages/Inicio.vue'
import PorOndeComecar from '@/pages/PorOndeComecar.vue'
import LocalizarVara from '@/pages/LocalizarVara.vue'
import Instituicoes from '@/pages/Instituicoes.vue'
import DetalheInstituicao from '@/pages/DetalheInstituicao.vue'
import CadastroLogin from '@/pages/Cadastro/CadastroLogin.vue'
import Painel from '@/pages/Painel.vue'
import Documentos from '@/pages/Documentos.vue'
import Agendamentos from '@/pages/Agendamentos.vue'
import Notificacoes from '@/pages/Notificacoes.vue'
import MinhaInstituicao from '@/pages/MinhaInstituicao.vue'
import GovernoAdotantes from '@/pages/GovernoAdotantes.vue'
import GovernoDetalheAdotante from '@/pages/GovernoDetalheAdotante.vue'
import GovernoInstituicoes from '@/pages/GovernoInstituicoes.vue'
import InstituicaoVisitas from '@/pages/InstituicaoVisitas.vue'
import InstituicaoRelatorioVisita from '@/pages/InstituicaoRelatorioVisita.vue'
import InstituicaoPerfil from '@/pages/InstituicaoPerfil.vue'
import Sobre from '@/pages/Sobre.vue'
import Privacidade from '@/pages/Privacidade.vue'
import Acessibilidade from '@/pages/Acessibilidade.vue'
import GovernoPainel from '@/pages/GovernoPainel.vue'
import InstituicaoRelatorios from '@/pages/InstituicaoRelatorios.vue'
import InstituicaoPainel from '@/pages/InstiuicaoPainel.vue'

const routes = [
  // Área pública
  { path: '/', name: 'inicio', component: Inicio },
  { path: '/por-onde-comecar', name: 'por-onde-comecar', component: PorOndeComecar },
  { path: '/localizar-vara', name: 'localizar-vara', component: LocalizarVara },
  { path: '/instituicoes', name: 'instituicoes', component: Instituicoes },
  { path: '/instituicoes/:id', name: 'detalhe-instituicao', component: DetalheInstituicao },
  { path: '/cadastro', name: 'cadastro', component: CadastroLogin },

  // Painel do adotante
  { path: '/painel', name: 'painel', component: Painel },
  { path: '/painel/documentos', name: 'documentos', component: Documentos },
  { path: '/painel/agendamentos', name: 'agendamentos', component: Agendamentos },
  { path: '/painel/notificacoes', name: 'notificacoes', component: Notificacoes },
  { path: '/painel/minha-instituicao', name: 'minha-instituicao', component: MinhaInstituicao },
  { path: '/governo/adotantes', name: 'governo-adotantes', component: GovernoAdotantes },
  { path: '/governo/adotantes/:id', name: 'governo-detalhe-adotante', component: GovernoDetalheAdotante },
  { path: '/governo/instituicoes', name: 'governo-instituicoes', component: GovernoInstituicoes },
  { path: '/instituicao/visitas', name: 'inst-visitas', component: InstituicaoVisitas },
  { path: '/instituicao/visitas/:id/relatorio', name: 'inst-relatorio', component: InstituicaoRelatorioVisita },
  { path: '/instituicao/perfil', name: 'inst-perfil', component: InstituicaoPerfil },
  { path: '/sobre', name: 'sobre', component: Sobre },
  { path: '/privacidade', name: 'privacidade', component: Privacidade },
  { path: '/acessibilidade', name: 'acessibilidade', component: Acessibilidade },
  { path: '/governo', name: 'governo-painel', component: GovernoPainel },
  { path: '/instituicao/relatorios', name: 'inst-relatorios', component: InstituicaoRelatorios },
  {path: '/instituicao/painel', name: 'inst-painel', component: InstituicaoPainel },

  // Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
