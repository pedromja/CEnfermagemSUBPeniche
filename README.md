# Relatório CE — SUB Peniche (ULS Oeste)

Relatório diário do coordenador de enfermagem: um separador por dia, Excel mensal para impressão A4 e resumo com indicadores.

## Publicar na Netlify

1. Abrir [app.netlify.com](https://app.netlify.com).
2. **Add new site → Import an existing project → GitHub**.
3. Ligar o repositório deste projecto (criar um repositório vazio se ainda não existir e enviar o código).
4. Confirmar:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node:** `22`
5. O endereço fica `https://….netlify.app`. Pode alterar o nome do site ou ligar um domínio em **Domain management**.

Na Netlify, defina também `DATABASE_URL` (Postgres) para a conta de administrador e o registo de acções persistirem.

## Local

```bash
npm install
npm run dev
```
