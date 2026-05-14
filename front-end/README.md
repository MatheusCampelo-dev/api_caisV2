# CAIS — Centro de apoio à infância e à socialização

Sistema de acompanhamento do processo de adoção. Front-end em Vue 3 (Composition API).

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

## Estrutura

```
src/
├── assets/
│   ├── icons/      # ícones SVG avulsos
│   ├── logo/       # LogoCais.vue
│   ├── imagens/    # ilustrações em PNG/JPG
│   └── styles.css  # tokens globais (cores, raios, botões)
├── components/     # componentes compartilhados (Header, Sidebar, Hero...)
├── pages/          # uma página por rota
│   └── Cadastro/   # fluxo de login/cadastro
├── routes/         # configuração do vue-router
├── service/        # cliente HTTP e services por domínio
└── store/          # Pinia stores (user, etc.)
```

## Rotas implementadas

| Rota                         | Tela                                |
| ---------------------------- | ----------------------------------- |
| `/`                          | T01 — Início                        |
| `/por-onde-comecar`          | T02 — Por onde começar              |
| `/localizar-vara`            | T03 — Localizar Vara da Infância    |
| `/instituicoes`              | T05 — Lista de instituições         |
| `/instituicoes/:id`          | T04 — Detalhe da instituição        |
| `/cadastro`                  | Cadastro / Login                    |
| `/painel`                    | T06 — Painel do adotante            |
| `/painel/documentos`         | T07 — Checklist de documentos       |

## Integrações pendentes

- `service/index.js` faz `fetch` para `VITE_API_URL`. Defina em um `.env` local:
  ```
  VITE_API_URL=https://sua-api.exemplo.com
  ```
- A store `user` está com dados estáticos (Maria Silva); trocar pela resposta do `authService.entrar`.
- A galeria da T04 usa placeholders coloridos; substituir por `<img>` quando as fotos forem carregadas via API.

## Design tokens (em `assets/styles.css`)

- **Cores marca**: `--color-primary` (azul), e os acentos `--color-accent-{pink,yellow,green,blue}` que aparecem no logo CAIS.
- **Raios**: `--radius-sm/md/lg/xl`.
- **Tipografia**: Inter via Google Fonts.
- **Ícones**: Tabler Icons via CDN no `index.html`.
