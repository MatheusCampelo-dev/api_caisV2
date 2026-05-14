<script setup>
import HeaderPublico from '@/components/HeaderPublico.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="page">
    <HeaderPublico />
    <main class="conteudo">
      <article class="artigo">
        <h1>Sobre o CAIS</h1>
        <p class="lead">O Centro de Apoio à Infância e à Socialização é o canal oficial para acompanhar o processo de adoção no Brasil de forma digital, transparente e acessível.</p>

        <section>
          <h2>Por que existimos</h2>
          <p>O processo de adoção historicamente depende de telefonemas, deslocamentos e intermediação por advogados. Famílias passam meses sem saber em que etapa estão, varas recebem ligações repetidas e instituições não têm um canal direto com adotantes habilitados. O CAIS centraliza essa comunicação.</p>
        </section>

        <section>
          <h2>Para quem é</h2>
          <ul>
            <li><strong>Adotantes:</strong> acompanham etapas, agendamentos, pendências e visitas em um só lugar.</li>
            <li><strong>Varas da Infância:</strong> gerenciam processos, marcam revisões e enviam decisões.</li>
            <li><strong>Instituições de acolhimento:</strong> coordenam visitas de aproximação e enviam relatórios técnicos.</li>
          </ul>
        </section>

        <section>
          <h2>Princípios</h2>
          <ul>
            <li>Proteção integral da criança e do adolescente</li>
            <li>Transparência do processo para o adotante</li>
            <li>Sigilo dos dados sensíveis</li>
            <li>Acessibilidade para todos os perfis de usuário</li>
          </ul>
        </section>

        <section>
          <h2>Marco legal</h2>
          <p>O sistema opera em conformidade com o Estatuto da Criança e do Adolescente (Lei nº 8.069/1990), a Lei Nacional da Adoção (Lei nº 12.010/2009) e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
        </section>
      </article>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.conteudo {
  max-width: 760px;
  margin: 0 auto;
  padding: 48px 32px;
}
.artigo h1 {
  font-size: 32px;
  margin-bottom: 16px;
}
.lead {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 32px;
}
section { margin-bottom: 28px; }
section h2 {
  font-size: 18px;
  margin-bottom: 10px;
}
section p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}
section ul {
  margin: 0;
  padding-left: 20px;
}
section li {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.9;
}
section li strong { color: var(--color-text); }
</style>
