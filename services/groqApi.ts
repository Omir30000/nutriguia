
import { AnamneseData, DietPlan } from "../types";

// Configurações de Ambiente
// VITE_GROQ_PROXY_URL deve apontar para sua cloud function (Recomendado)
// VITE_GROQ_API_KEY é o fallback inseguro para desenvolvimento local rápido
const PROXY_URL = (import.meta as any).env?.VITE_GROQ_PROXY_URL || process.env.REACT_APP_GROQ_PROXY_URL;
const API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || process.env.REACT_APP_GROQ_API_KEY;

/**
 * Normaliza e extrai JSON de uma resposta que pode conter textoMarkdown
 */
function normalizeAndParseJSON(text: string): Partial<DietPlan> {
  let jsonString = text;
  
  // Tenta extrair bloco de código JSON ```json ... ```
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    jsonString = jsonBlockMatch[1];
  } else {
    // Tenta encontrar o primeiro { e o último }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      jsonString = text.substring(start, end + 1);
    }
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (e) {
    console.warn("Falha ao parsear JSON estrito. Retornando objeto de erro.", e);
    // Retorna um objeto estruturado indicando erro no conteúdo, para não quebrar o Firestore
    return {
      resumo_nutricional: "Ocorreu um erro ao formatar o plano. O conteúdo bruto está abaixo.",
      observacoes: text,
      lista_compras_semana: [],
      receitas_semana: []
    };
  }
}

export async function gerarPlanoComGroq(dados: AnamneseData): Promise<DietPlan> {
  
  const prompt = `
    Atue como um nutricionista esportivo de elite. Gere um plano alimentar para:
    - Paciente: ${dados.nome}, ${dados.idade} anos, ${dados.genero}
    - Físico: ${dados.peso}kg, ${dados.altura}cm
    - Nível Atividade: ${dados.nivelAtividade}
    - OBJETIVO: ${dados.objetivo}
    - PRAZO: ${dados.tempoObjetivo}
    - Restrições: ${dados.restricoes || "Nenhuma"}
    
    Retorne EXATAMENTE este formato JSON (sem texto extra antes ou depois):
    {
      "resumo_nutricional": "Resumo da estratégia de 3 linhas focado no prazo.",
      "macros_totais": "Ex: 2000kcal (P: 150g, C: 200g, G: 60g)",
      "lista_compras_semana": [
        { "item": "Peito de Frango", "quantidade_kg": 2.5, "quantidade_unidade": "2.5kg" },
        { "item": "Ovos", "quantidade_kg": 0, "quantidade_unidade": "2 dúzias" }
      ],
      "receitas_semana": [
        {
          "titulo": "Café da Manhã Anabólico",
          "tipo_refeicao": "Café da Manhã",
          "tempo_minutos": "10",
          "ingredientes": ["3 ovos", "30g aveia"],
          "modo_preparo": ["Misture tudo", "Frite na frigideira"]
        }
      ],
      "observacoes": "Dicas extras de hidratação e suplementação."
    }
    
    Garanta que "quantidade_kg" seja um número (0 se não aplicável) e "receitas_semana" tenha pelo menos 3 opções (café, almoço, jantar).
  `;

  let data;

  try {
    if (PROXY_URL) {
      // 1. Via Proxy (Seguro)
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anamnese: dados, prompt_custom: prompt }) // O proxy constrói a chamada final
      });
      
      if (!res.ok) throw new Error("Erro no servidor de IA");
      const json = await res.json();
      // Assume que o proxy já devolve o JSON parseado ou o content
      data = json.resultado || json; 

    } else if (API_KEY) {
      // 2. Via Cliente (Fallback)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "Responda apenas em JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3, // Mais determinístico para JSON
          response_format: { type: "json_object" }
        })
      });

      if (!res.ok) throw new Error("Erro na API Groq: " + res.statusText);
      const json = await res.json();
      data = json.choices?.[0]?.message?.content;
    } else {
      throw new Error("Chave de API não configurada. Defina VITE_GROQ_API_KEY ou configure o Proxy.");
    }

    // Processamento da resposta
    let dietPlan: Partial<DietPlan>;

    if (typeof data === 'string') {
      dietPlan = normalizeAndParseJSON(data);
    } else if (typeof data === 'object') {
      dietPlan = data;
    } else {
      throw new Error("Formato de resposta desconhecido.");
    }

    // Normalização final para garantir estrutura
    return {
      resumo_nutricional: dietPlan.resumo_nutricional || "Sem resumo disponível.",
      macros_totais: dietPlan.macros_totais || "Não calculado.",
      lista_compras_semana: Array.isArray(dietPlan.lista_compras_semana) ? dietPlan.lista_compras_semana : [],
      receitas_semana: Array.isArray(dietPlan.receitas_semana) ? dietPlan.receitas_semana : [],
      observacoes: dietPlan.observacoes || "",
      geradoEm: new Date().toISOString(),
      fonteModel: "llama-3.1-8b-instant"
    } as DietPlan;

  } catch (error: any) {
    console.error("Erro no serviço de IA:", error);
    // Retorna um objeto de erro seguro para não quebrar a UI
    return {
      resumo_nutricional: "Erro ao gerar o plano. Tente novamente mais tarde.",
      macros_totais: "-",
      lista_compras_semana: [],
      receitas_semana: [],
      observacoes: `Detalhe do erro: ${error.message}`,
      geradoEm: new Date().toISOString(),
      fonteModel: "error"
    };
  }
}
