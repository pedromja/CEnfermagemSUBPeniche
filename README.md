# Relatório CE — SUB Peniche (ULS Oeste)

Relatório diário do coordenador de enfermagem: um separador por dia, Excel mensal para impressão A4 e resumo com indicadores.

## Publicar na Netlify

1. Abrir [app.netlify.com](https://app.netlify.com) (conta já criada).
2. **Add new site → Import an existing project → GitHub**.
3. Escolher o repositório `pedromja/relatorio-ce-sub-peniche`.
4. Confirmar:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node:** `22`
5. Deploy. O endereço fica `https://….netlify.app` (pode mudar o nome do site em Site configuration → Domain management).

Atalho: [Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/pedromja/relatorio-ce-sub-peniche)

## Local

```bash
npm install
npm run dev
```

Abre em `http://localhost:8080`.
