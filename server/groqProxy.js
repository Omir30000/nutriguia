
// Exemplo de Serverless Function (Vercel API Route / Netlify Function)
// Salve como: /api/groq.js (ou configure no seu framework)

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ajuste para seu domínio em produção
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Obter chave da variável de ambiente do SERVIDOR
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server config error: Missing API Key' });
  }

  const { prompt_custom, anamnese } = req.body;

  // Use o prompt customizado enviado pelo front, ou construa um aqui se quiser mais segurança
  const promptFinal = prompt_custom || `Gere um plano para ${JSON.stringify(anamnese)}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Você é um nutricionista. Responda APENAS com JSON válido." },
          { role: "user", content: promptFinal }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // Tenta parsear no servidor para garantir JSON válido pro cliente
    let jsonResult;
    try {
      jsonResult = JSON.parse(content);
    } catch (e) {
      jsonResult = { raw_content: content, error: "Failed to parse JSON on server" };
    }

    return res.status(200).json({ resultado: jsonResult });

  } catch (error) {
    console.error("Groq Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
