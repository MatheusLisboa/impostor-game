# Impostor

Jogo social de dedução e palavras, no estilo Spyfall: cada rodada sorteia um tema, todos recebem a palavra secreta e o(s) impostor(es) não. O grupo conversa para descobrir quem está blefando.

**Demo:** https://impostor-game-wheat.vercel.app

## Stack

- React + TypeScript + Vite
- Tailwind CSS, Motion
- Firebase (Firestore) para guardar os temas
- Gemini (`@google/genai`) para gerar os temas iniciais

## Rodando localmente

Pré-requisito: Node.js.

```bash
npm install
echo 'GEMINI_API_KEY=sua_chave' > .env.local   # usada para gerar os temas iniciais
npm run dev
```

O app abre em `http://localhost:3000`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run lint` | checagem de tipos (`tsc --noEmit`) |
