import { AnamneseData, DietPlan } from "../types";

// Detecção de ambiente (Vite vs Create React App vs Node)
const PROXY_URL = (import.meta as any).env?.VITE_GROQ_PROXY_URL;
const API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY;

// Função auxiliar para extrair JSON de texto misto (Markdown)
function extractJSON(text: string): Partial<DietPlan> {
  try {
    // 1. Tentar parse direto
    return JSON.parse(text);
  } catch (e) {
    // 2. Tentar extrair de blocos de código ```json ... ```
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (innerError) {
        console.warn("Falha ao extrair JSON do bloco.", innerError);
      }
    }
  }
  return {};
}

export async function gerarPlanoComGroq(dados: AnamneseData): Promise<DietPlan> {
  const promptSystem = `Você é um nutricionista esportivo. Responda ESTRITAMENTE em JSON.
  Gere um plano para: ${dados.objetivo}, Prazo: ${dados.tempoObjetivo}.
  
  Estrutura JSON Obrigatória:
  {
    "resumo_nutricional": "string",
    "macros_totais": "string",
    "lista_compras_semana": [{ "item": "string", "quantidade_kg": number, "quantidade_unidade": "string" }],
    "receitas_semana": [{ "titulo": "string", "ingredientes": ["string"], "modo_preparo": ["string"], "tempo_minutos": "string", "tipo_refeicao": "string" }],
    "observacoes": "string"
  }`;

  const promptUser = `Perfil: ${dados.nome}, ${dados.idade} anos, ${dados.peso}kg, ${dados.altura}cm.
  Atividade: ${dados.nivelAtividade}. Restrições: ${dados.restricoes || "Nenhuma"}.`;

  let rawContent = "";
  let dietPlan: Partial<DietPlan> = {};

  try {
    let data;

    // 1. Tentativa via Proxy (Segurança em Produção)
    if (PROXY_URL) {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anamnese: dados, prompt_custom: promptUser })
      });
      if (!res.ok) throw new Error("Erro no Proxy");
      const json = await res.json();
      data = json.resultado;
    } 
    // 2. Tentativa Direta (Desenvolvimento)
    else if (API_KEY) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: promptSystem },
            { role: "user", content: promptUser }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (!res.ok) throw new Error(`Groq API Error: ${res.statusText}`);
      const json = await res.json();
      
      // Acesso seguro ao conteúdo
      rawContent = json.choices?.[0]?.message?.content || "";
      data = rawContent;
    } else {
      throw new Error("API Key não configurada.");
    }

    // Processar Resposta
    if (typeof data === 'object') {
      dietPlan = data;
      rawContent = JSON.stringify(data, null, 2);
    } else {
      rawContent = String(data);
      dietPlan = extractJSON(rawContent);
    }

  } catch (error: any) {
    console.error("Erro Groq:", error);
    rawContent = `Erro ao gerar: ${error.message}`;
    dietPlan = { resumo_nutricional: "Erro na geração. Tente novamente." };
  }

  // Normalização e Retorno
  return {
    resumo_nutricional: dietPlan.resumo_nutricional || "Resumo indisponível.",
    macros_totais: dietPlan.macros_totais || "Não calculado.",
    lista_compras_semana: Array.isArray(dietPlan.lista_compras_semana) ? dietPlan.lista_compras_semana : [],
    receitas_semana: Array.isArray(dietPlan.receitas_semana) ? dietPlan.receitas_semana : [],
    observacoes: dietPlan.observacoes || "",
    conteudo: rawContent, // Fundamental para o fallback visual
    geradoEm: new Date().toISOString(),
    fonteModel: "llama-3.1-8b-instant"
  };
}