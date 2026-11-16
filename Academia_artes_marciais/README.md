# Dojo Alpha - site (Angular 20 + Tailwind 4)

## Rodar
    npm install
    npm start            # http://localhost:4200
    npm run build        # saída em dist/dojo-alpha/browser

## O que trocar antes de publicar
- `src/app/core/config.ts`: número do WhatsApp (DDI + DDD + número, só dígitos)
- `src/app/core/data.ts`: modalidades, horários e planos (site e chat leem daqui)
- `src/app/sections/sobre.component.ts`: textos de exemplo de história, missão e visão
- `src/app/sections/hero.component.ts` e `galeria.component.ts`: fotos reais
- `src/app/layout/footer.component.ts`: links do Instagram e Facebook

## Estrutura
    src/app/core        dados, config e serviços (WhatsApp, estado do chat)
    src/app/layout      header e footer
    src/app/sections    hero, modalidades, sobre, horários, planos, galeria
    src/app/chat        atendimento automático do site
    backend/            bot que responde dentro do WhatsApp (Flask + Cloud API)

## Bot do WhatsApp
Veja as instruções no topo de `backend/bot_whatsapp.py`.
