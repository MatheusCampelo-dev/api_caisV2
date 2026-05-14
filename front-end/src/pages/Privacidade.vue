<script setup>
import HeaderPublico from '@/components/HeaderPublico.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="page">
    <HeaderPublico />
    <main class="conteudo">
      <article class="artigo">
        <h1>Política de privacidade</h1>
        <p class="atualizado">Última atualização: 12 de maio de 2026</p>

        <section>
          <h2>1. Dados que coletamos</h2>
          <p>O CAIS coleta apenas os dados necessários para a tramitação do processo de adoção:</p>
          <ul>
            <li>Identificação pessoal: nome completo, CPF, RG, data de nascimento</li>
            <li>Contato: e-mail e telefone</li>
            <li>Endereço residencial</li>
            <li>Documentos digitalizados (apenas o Certificado do Curso de Preparação)</li>
            <li>Registros do processo: agendamentos, status, observações da Vara</li>
          </ul>
        </section>

        <section>
          <h2>2. O que NÃO coletamos</h2>
          <p>Por princípio de proteção à criança, o sistema <strong>não armazena</strong>:</p>
          <ul>
            <li>Dados pessoais de crianças e adolescentes acolhidos</li>
            <li>Fotos identificáveis de menores</li>
            <li>Laudos médicos ou psicológicos de crianças</li>
            <li>Histórico familiar de crianças em acolhimento</li>
          </ul>
        </section>

        <section>
          <h2>3. Quem tem acesso</h2>
          <p>Adotantes veem apenas o próprio processo. Servidores da Vara veem os processos da sua comarca. Instituições veem apenas os adotantes com vínculo ativo de aproximação. Nenhum ator vê dados que não lhe digam respeito.</p>
        </section>

        <section>
          <h2>4. Retenção</h2>
          <p>Os dados são retidos enquanto o processo estiver ativo e por 5 anos após o trânsito em julgado da sentença, conforme normativa do CNJ.</p>
        </section>

        <section>
          <h2>5. Seus direitos (LGPD)</h2>
          <p>Você pode solicitar acesso, correção, portabilidade ou anonimização dos seus dados a qualquer momento, escrevendo para <strong>dpo@cais.jus.br</strong>.</p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>Usamos apenas cookies essenciais para manter a sessão autenticada. Não há cookies de rastreamento ou de terceiros.</p>
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
  margin-bottom: 4px;
}
.atualizado {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 32px;
}
section { margin-bottom: 28px; }
section h2 {
  font-size: 17px;
  margin-bottom: 10px;
}
section p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 8px;
}
section ul {
  margin: 0;
  padding-left: 20px;
}
section li {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.8;
}
strong { color: var(--color-text); }
</style>
