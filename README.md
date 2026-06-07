# Tamanho Certo

Rascunho de app para Nuvemshop focado em guia de tamanho inteligente para roupas.

## Objetivo

Ajudar o cliente a escolher o tamanho mais adequado antes da compra, reduzindo duvidas, trocas e abandono de carrinho.

## Foco inicial

Exclusivamente roupas:

- Camisetas, camisas, blusas e regatas
- Calcas, shorts e bermudas
- Vestidos, macacoes e conjuntos
- Roupa infantil

## Como funciona

1. O app identifica o tipo de produto por nome, categoria, tipo ou tags.
2. Seleciona o guia de perguntas adequado.
3. O cliente responde medidas e preferencia de caimento.
4. O app cruza as respostas com a tabela de medidas.
5. O cliente recebe uma recomendacao simples, com nivel de confianca.

## MVP profissional

- Painel para lojista testar categorias.
- Status de conexao com Nuvemshop.
- OAuth Nuvemshop pronto.
- PostgreSQL pronto para lojas, guias e eventos.
- Guias padrao para desenvolvimento local.
- API para escolher guia por produto.
- API para recomendar tamanho.
- Widget publico inicial para pagina de produto.
- Paginas de privacidade e suporte.

## Rotas

- `GET /`
- `GET /privacy`
- `GET /support`
- `GET /api/guides`
- `GET /api/guides/stats`
- `POST /api/guides/match`
- `POST /api/guides`
- `POST /api/guides/:guideId/recommend`
- `GET /api/widget/config`
- `GET /auth/install`
- `GET /auth/callback`
- `GET /auth/status`

## Rodar localmente

```bash
npm install
npm start
```

Abra:

```text
http://localhost:3001
```

## Deploy no Render

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

Configure as variaveis do `.env.example` no Render. Para producao, use PostgreSQL e um `SESSION_SECRET` forte.

## Proximas evolucoes

- Cadastro de tabelas de medidas por produto, categoria e marca.
- Modal completo no widget da pagina do produto.
- Regras diferentes por tecido/modelagem.
- Relatorio de produtos com mais duvidas.
- Aprendizado com trocas/devolucoes.
