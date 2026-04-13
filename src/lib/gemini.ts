import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateInitialThemes() {
  const prompt = `Gere 10 temas para um jogo de "Impostor" (estilo Spyfall). 
  Cada tema deve ter exatamente 50 palavras relacionadas.
  Os temas devem ser: Bíblia, Animais, Profissões, Objetos, Comidas, Filmes, Lugares, Personagens famosos, Esportes, Tecnologia.
  Retorne um array de objetos JSON no formato:
  {
    "name": "Nome do Tema",
    "category": "Categoria",
    "words": ["palavra1", "palavra2", ...]
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            words: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["name", "category", "words"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
