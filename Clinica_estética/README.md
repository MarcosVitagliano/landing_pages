# Aura Estética - site (Angular 20 + Tailwind 4)

Proposta de site para clínica de estética: serviços, agendamento, blog, chat de atendimento e galeria.

## Rodar (Windows, Mac ou Linux; Node 20.19+)
    npm install
    npm start            # http://localhost:4200
    npm run build        # saída em dist/clinica-aura/browser

## O que trocar antes de apresentar ou publicar
- `src/app/core/config.ts`: nome, WhatsApp (DDI + DDD + número), endereço, Instagram e horário de funcionamento
- `src/app/core/data.ts`: serviços, diferenciais, artigos do blog e fotos (textos de exemplo)
- Fotos: salve em `public/img` com os nomes listados em `public/img/LEIA-ME.txt` (sem mexer no código).
  Foto que não existir é trocada por um fundo rosa. Para mudar nomes ou caminhos: `core/config.ts` (topo) e `core/data.ts`.

## Estrutura e conceitos para estudar
    core/        dados, config e serviços (WhatsApp, estado do chat)
    shared/      carrossel.component.ts (scroll-snap, signals, projeção de conteúdo) e foto.component.ts (input())
    layout/      header e footer (routerLink com fragment)
    sections/    hero, galeria (A clínica), servicos (carrossel de procedimentos), sobre, agendamento (Reactive Forms), blog
    pages/       home.page.ts e post.page.ts (rota /blog/:slug, lazy loading, input de rota)
    chat/        atendimento automático (effect, viewChild, Router)
    backend/     bot que responde dentro do WhatsApp (Flask + WhatsApp Cloud API)

## Publicação
Gere o build e publique o conteúdo de `dist/clinica-aura/browser`. Como o blog usa rotas
(`/blog/...`), o servidor precisa devolver o `index.html` para qualquer endereço.
O arquivo `public/_redirects` já faz isso no Netlify e no Cloudflare Pages.

## Atenção (publicidade em saúde e estética)
Conselhos profissionais e a Anvisa têm regras sobre o que pode ser divulgado (por exemplo,
promessas de resultado, "antes e depois" e preços promocionais de alguns procedimentos).
Confirme com a clínica e com o conselho da categoria antes de publicar textos e imagens.
