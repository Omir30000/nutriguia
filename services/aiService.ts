import { GoogleGenAI, Type } from "@google/genai";
import { AnamneseData, DietPlan } from "../types";

/**
 * IMPORTANTE: Configure sua chave de API aqui ou nas variáveis de ambiente.
 * Para este exemplo, a chave deve ser definida em process.env.API_KEY.
 *
 * OBS: Utilizando a API do Google Gemini com Schema Mode para garantir JSON estruturado.
 */

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const gerarPlanoNutricional = async (dados: AnamneseData): Promise<DietPlan> => {
  const prompt = `
    Atue como um nutricionista brasileiro experiente.
    Com base nos seguintes dados do paciente, gere um plano alimentar:

    Nome: ${dados.nome}
    Idade: ${dados.idade}
    Peso: ${dados.peso}kg
    Altura: ${dados.altura}cm
    Gênero: ${dados.genero}
    Objetivo: ${dados.objetivo}
    Nível de Atividade: ${dados.nivelAtividade}
    Restrições Alimentares: ${dados.restricoes || "Nenhuma"}
    Preferências: ${dados.preferencias || "Nenhuma"}

    Gere:
    1. Resumo Nutricional e Necessidades Diárias.
    2. Plano Semanal resumido.
    3. Uma lista de compras completa e categorizada para a semana baseada nas receitas sugeridas.
    4. 3 receitas variadas (café da manhã, almoço, jantar) que se alinhem ao objetivo.

    Retorne APENAS o JSON conforme o schema solicitado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumoNutricional: { 
              type: Type.STRING, 
              description: "Uma análise curta (max 3 linhas) do perfil e estratégia." 
            },
            necessidadesDiarias: { 
              type: Type.STRING, 
              description: "Estimativa de calorias e macros (ex: 2000kcal, 150g Proteína...)" 
            },
            planoSemanal: { 
              type: Type.STRING, 
              description: "Resumo textual de como deve ser a alimentação durante a semana" 
            },
            listaCompras: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de itens para comprar no supermercado"
            },
            receitas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  ingredientes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  preparo: { type: Type.ARRAY, items: { type: Type.STRING } },
                  calorias: { type: Type.STRING, description: "Ex: 400 kcal" },
                  tempoPreparo: { type: Type.STRING, description: "Ex: 30 min" }
                },
                required: ["nome", "ingredientes", "preparo", "calorias", "tempoPreparo"]
              }
            }
          },
          required: ["resumoNutricional", "necessidadesDiarias", "planoSemanal", "listaCompras", "receitas"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return {
        ...result,
        dataGeracao: new Date().toISOString()
      } as DietPlan;
    }

    throw new Error("Não foi possível gerar o plano. Tente novamente.");

  } catch (error) {
    console.error("Erro na geração do plano:", error);
    throw error;
  }
};