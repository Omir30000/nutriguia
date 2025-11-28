
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface AnamneseData {
  nome: string;
  idade: string;
  peso: string;
  altura: string;
  genero: string;
  objetivo: string;
  tempoObjetivo: string; // Ex: "8 semanas"
  nivelAtividade: string;
  restricoes: string;
  preferencias: string;
}

export interface IngredienteItem {
  item: string;
  quantidade_kg?: number; // Quantidade normalizada para cálculos
  quantidade_unidade?: string; // Ex: "2 unidades", "1 maço"
}

export interface Receita {
  titulo: string;
  ingredientes: string[]; // Lista formatada
  modo_preparo: string[];
  tempo_minutos: string;
  tipo_refeicao?: string; // Café, Almoço, Jantar
}

export interface DietPlan {
  resumo_nutricional: string;
  macros_totais: string;
  plano_semanal_texto?: string;
  lista_compras_semana: IngredienteItem[];
  receitas_semana: Receita[];
  observacoes?: string;
  
  // Metadados
  geradoEm?: string;
  fonteModel?: string;
}

export interface UserData {
  anamnese?: AnamneseData;
  dietPlan?: DietPlan;
}
