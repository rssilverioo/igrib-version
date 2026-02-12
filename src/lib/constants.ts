export const PRODUCTS = [
  "Soja",
  "Milho",
  "Trigo",
  "Café",
  "Algodão",
  "Arroz",
  "Feijão",
  "Sorgo",
  "Cevada",
  "Aveia",
  "Girassol",
  "Amendoim",
  "Canola",
] as const

export const STATES = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
  "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
  "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const

export const UNITS = ["tonelada", "saca"] as const
export const DELIVERY_TYPES = ["FOB", "CIF"] as const
export const PAYMENT_TERMS = [
  { value: "a_vista", label: "À Vista" },
  { value: "7_dias", label: "7 dias" },
  { value: "30_dias", label: "30 dias" },
] as const

export const PRODUCT_ICONS: Record<string, string> = {
  "Soja": "🌱",
  "Milho": "🌽",
  "Trigo": "🌾",
  "Café": "☕",
  "Algodão": "🧶",
  "Arroz": "🍚",
  "Feijão": "🫘",
  "Sorgo": "🌿",
  "Cevada": "🌾",
  "Aveia": "🥣",
  "Girassol": "🌻",
  "Amendoim": "🥜",
  "Canola": "🌼",
}
