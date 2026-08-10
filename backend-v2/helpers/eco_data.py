"""
helpers/eco_data.py — Données économiques Tunisie embarquées inline.
Sources : BCT, INS, Ministère de l'Énergie, données août 2026.
"""
from typing import Dict, Any, List

# ── Cours du Dinar (BCT) ──────────────────────────────────────────────────────
EXCHANGE_RATES: Dict[str, Any] = {
    "last_updated": "2026-08-06T16:30:00+01:00",
    "source": "Banque Centrale de Tunisie",
    "source_url": "https://www.bct.gov.tn/bct/siteprod/cours.jsp",
    "base": "TND",
    "rates": {
        "EUR": {"buy": 3.325, "sell": 3.385, "mid": 3.355, "flag": "🇪🇺", "name": "Euro"},
        "USD": {"buy": 3.065, "sell": 3.125, "mid": 3.095, "flag": "🇺🇸", "name": "Dollar US"},
        "GBP": {"buy": 3.945, "sell": 4.015, "mid": 3.980, "flag": "🇬🇧", "name": "Livre Sterling"},
        "CHF": {"buy": 3.525, "sell": 3.585, "mid": 3.555, "flag": "🇨🇭", "name": "Franc Suisse"},
        "CAD": {"buy": 2.245, "sell": 2.285, "mid": 2.265, "flag": "🇨🇦", "name": "Dollar Canadien"},
        "SAR": {"buy": 0.815, "sell": 0.835, "mid": 0.825, "flag": "🇸🇦", "name": "Riyal Saoudien"},
        "AED": {"buy": 0.835, "sell": 0.855, "mid": 0.845, "flag": "🇦🇪", "name": "Dirham EAU"},
        "TRY": {"buy": 0.095, "sell": 0.105, "mid": 0.100, "flag": "🇹🇷", "name": "Lire Turque"},
        "JPY": {"buy": 0.021, "sell": 0.023, "mid": 0.022, "flag": "🇯🇵", "name": "Yen Japonais"},
        "CNY": {"buy": 0.425, "sell": 0.445, "mid": 0.435, "flag": "🇨🇳", "name": "Yuan Chinois"},
    },
    "variation_24h": {
        "EUR": {"value": 0.005, "percent": 0.15, "trend": "up"},
        "USD": {"value": 0.003, "percent": 0.10, "trend": "up"},
        "GBP": {"value": -0.002, "percent": -0.05, "trend": "down"},
        "CHF": {"value": 0.000, "percent": 0.00, "trend": "stable"},
        "CAD": {"value": 0.001, "percent": 0.04, "trend": "up"},
        "SAR": {"value": 0.000, "percent": 0.00, "trend": "stable"},
        "AED": {"value": 0.000, "percent": 0.00, "trend": "stable"},
        "TRY": {"value": -0.001, "percent": -0.95, "trend": "down"},
    },
    "variation_30d": {
        "EUR": {"value": 0.045, "percent": 1.36, "trend": "up"},
        "USD": {"value": 0.025, "percent": 0.82, "trend": "up"},
        "GBP": {"value": 0.030, "percent": 0.76, "trend": "up"},
        "CHF": {"value": -0.010, "percent": -0.28, "trend": "down"},
    },
    "history_eur": [
        {"date": "2026-07-07", "mid": 3.310}, {"date": "2026-07-14", "mid": 3.322},
        {"date": "2026-07-21", "mid": 3.335}, {"date": "2026-07-28", "mid": 3.342},
        {"date": "2026-08-01", "mid": 3.350}, {"date": "2026-08-04", "mid": 3.348},
        {"date": "2026-08-06", "mid": 3.355},
    ],
    "history_usd": [
        {"date": "2026-07-07", "mid": 3.070}, {"date": "2026-07-14", "mid": 3.078},
        {"date": "2026-07-21", "mid": 3.085}, {"date": "2026-07-28", "mid": 3.088},
        {"date": "2026-08-01", "mid": 3.090}, {"date": "2026-08-04", "mid": 3.092},
        {"date": "2026-08-06", "mid": 3.095},
    ],
}

# ── Prix Carburants (Ministère Énergie) ───────────────────────────────────────
FUEL_PRICES: Dict[str, Any] = {
    "last_updated": "2026-08-05T00:00:00+01:00",
    "source": "Ministère de l'Industrie, des Mines et de l'Énergie",
    "source_url": "https://www.energiemines.gov.tn",
    "mechanism": "Ajustement trimestriel (plafond 5%)",
    "next_review_date": "2026-11-01",
    "products": [
        {
            "id": "essence_super",
            "name": "Sans Plomb Super",
            "emoji": "⛽",
            "price_tnd": 2.53,
            "price_usd": 0.86,
            "tax_tnd": 0.815,
            "variation_last": 0.0,
            "variation_pct": 0.0,
            "trend": "stable",
            "global_rank": 19,
            "world_avg_usd": 1.54,
            "subvention_tnd": 0.45,
            "global_comparison_pct": 56,
            "history": [
                {"date": "2025-05-27", "price": 2.415},
                {"date": "2025-08-26", "price": 2.435},
                {"date": "2025-11-24", "price": 2.450},
                {"date": "2026-02-24", "price": 2.500},
                {"date": "2026-05-25", "price": 2.530},
                {"date": "2026-08-05", "price": 2.530},
            ],
        },
        {
            "id": "gasoil_ss",
            "name": "Gasoil Sans Soufre",
            "emoji": "🚗",
            "price_tnd": 2.205,
            "price_usd": 0.764,
            "tax_tnd": 0.585,
            "variation_last": 0.030,
            "variation_pct": 1.38,
            "trend": "up",
            "global_rank": 17,
            "world_avg_usd": 1.59,
            "subvention_tnd": 0.52,
            "global_comparison_pct": 48,
            "history": [
                {"date": "2025-05-27", "price": 2.090},
                {"date": "2025-08-26", "price": 2.110},
                {"date": "2025-11-24", "price": 2.135},
                {"date": "2026-02-24", "price": 2.175},
                {"date": "2026-05-25", "price": 2.205},
                {"date": "2026-08-05", "price": 2.205},
            ],
        },
        {
            "id": "gasoil_ordinaire",
            "name": "Gasoil Ordinaire",
            "emoji": "🚛",
            "price_tnd": 1.985,
            "price_usd": 0.688,
            "tax_tnd": None,
            "variation_last": 0.030,
            "variation_pct": 1.54,
            "trend": "up",
            "global_rank": None,
            "world_avg_usd": None,
            "subvention_tnd": 0.60,
            "global_comparison_pct": None,
            "history": [
                {"date": "2025-08-26", "price": 1.885},
                {"date": "2025-11-24", "price": 1.900},
                {"date": "2026-02-24", "price": 1.955},
                {"date": "2026-05-25", "price": 1.985},
                {"date": "2026-08-05", "price": 1.985},
            ],
        },
        {
            "id": "essence_premier",
            "name": "Sans Plomb Premier",
            "emoji": "🏎️",
            "price_tnd": 2.855,
            "price_usd": 0.990,
            "tax_tnd": None,
            "variation_last": 0.0,
            "variation_pct": 0.0,
            "trend": "stable",
            "global_rank": None,
            "world_avg_usd": None,
            "subvention_tnd": 0.10,
            "global_comparison_pct": None,
            "history": [
                {"date": "2026-02-24", "price": 2.820},
                {"date": "2026-05-25", "price": 2.855},
                {"date": "2026-08-05", "price": 2.855},
            ],
        },
        {
            "id": "gasoil_sss",
            "name": "Gasoil SS Super",
            "emoji": "🚌",
            "price_tnd": 2.550,
            "price_usd": 0.884,
            "tax_tnd": None,
            "variation_last": 0.0,
            "variation_pct": 0.0,
            "trend": "stable",
            "global_rank": None,
            "world_avg_usd": None,
            "subvention_tnd": 0.30,
            "global_comparison_pct": None,
            "history": [
                {"date": "2026-02-24", "price": 2.500},
                {"date": "2026-05-25", "price": 2.550},
                {"date": "2026-08-05", "price": 2.550},
            ],
        },
    ],
    "subsidies": {
        "total_billion_tnd_year": 4.2,
        "brent_impact_mln_tnd_per_dollar": 140,
        "note": "Prix maintenus bas par les subventions étatiques",
    },
}

# ── Inflation & IPC (INS) ─────────────────────────────────────────────────────
INFLATION: Dict[str, Any] = {
    "last_updated": "2026-08-05T00:00:00+01:00",
    "source": "Institut National de la Statistique (INS)",
    "source_url": "http://www.ins.tn/statistiques/90",
    "base_year": 2015,
    "current_ipc": 196.2,
    "current_ipc_date": "2026-07",
    "inflation_yoy": 5.1,
    "inflation_mom": 0.2,
    "inflation_avg_2026": 5.3,
    "forecast_q4_2026": 198.5,
    "forecast_2027": 208.8,
    "categories": [
        {"name": "Produits alimentaires",          "ipc": 216.7, "inflation_yoy": 6.6, "weight": 25.4, "color": "#E65100"},
        {"name": "Articles d'habillement",         "ipc": 248.9, "inflation_yoy": 9.1, "weight": 7.8,  "color": "#C62828"},
        {"name": "Restaurants et hôtels",          "ipc": 247.2, "inflation_yoy": 6.5, "weight": 8.1,  "color": "#AD1457"},
        {"name": "Enseignement",                   "ipc": 209.1, "inflation_yoy": 5.5, "weight": 6.2,  "color": "#6A1B9A"},
        {"name": "Biens et services divers",       "ipc": 218.0, "inflation_yoy": 5.2, "weight": 7.5,  "color": "#4527A0"},
        {"name": "Logement, eau, électricité",     "ipc": 168.7, "inflation_yoy": 4.3, "weight": 14.2, "color": "#1565C0"},
        {"name": "Loisirs et culture",             "ipc": 170.3, "inflation_yoy": 4.4, "weight": 4.8,  "color": "#0277BD"},
        {"name": "Meubles et entretien",           "ipc": 202.8, "inflation_yoy": 4.6, "weight": 5.9,  "color": "#00695C"},
        {"name": "Santé",                          "ipc": 172.1, "inflation_yoy": 2.7, "weight": 5.4,  "color": "#2E7D32"},
        {"name": "Transports",                     "ipc": 172.5, "inflation_yoy": 2.0, "weight": 12.1, "color": "#558B2F"},
        {"name": "Boissons alcoolisées et tabac",  "ipc": 209.9, "inflation_yoy": 1.3, "weight": 2.1,  "color": "#F57F17"},
        {"name": "Communications",                 "ipc": 113.2, "inflation_yoy": 0.4, "weight": 3.5,  "color": "#607D8B"},
    ],
    "history_monthly": [
        {"date": "2025-07", "ipc": 186.8, "inflation_yoy": 5.9},
        {"date": "2025-08", "ipc": 187.3, "inflation_yoy": 5.7},
        {"date": "2025-09", "ipc": 187.8, "inflation_yoy": 5.5},
        {"date": "2025-10", "ipc": 188.5, "inflation_yoy": 5.2},
        {"date": "2025-11", "ipc": 189.8, "inflation_yoy": 4.9},
        {"date": "2025-12", "ipc": 190.3, "inflation_yoy": 4.9},
        {"date": "2026-01", "ipc": 190.8, "inflation_yoy": 4.8},
        {"date": "2026-02", "ipc": 190.9, "inflation_yoy": 5.0},
        {"date": "2026-03", "ipc": 192.7, "inflation_yoy": 5.0},
        {"date": "2026-04", "ipc": 194.8, "inflation_yoy": 5.5},
        {"date": "2026-05", "ipc": 195.5, "inflation_yoy": 5.5},
        {"date": "2026-06", "ipc": 195.8, "inflation_yoy": 5.3},
        {"date": "2026-07", "ipc": 196.2, "inflation_yoy": 5.1},
    ],
    "history_annual": [
        {"year": 2019, "ipc": 125.0, "inflation": 6.7},
        {"year": 2020, "ipc": 132.0, "inflation": 5.6},
        {"year": 2021, "ipc": 139.6, "inflation": 5.7},
        {"year": 2022, "ipc": 151.1, "inflation": 8.3},
        {"year": 2023, "ipc": 165.2, "inflation": 9.3},
        {"year": 2024, "ipc": 176.8, "inflation": 7.0},
        {"year": 2025, "ipc": 186.3, "inflation": 5.4},
    ],
}

# ── Indicateurs Macroéconomiques ──────────────────────────────────────────────
MACRO_INDICATORS: List[Dict] = [
    {"id": "gdp",         "name": "PIB 2025",              "value": 58.2,  "unit": "Mds TND",   "change": +1.8,  "change_unit": "%/an",   "trend": "up",     "emoji": "📈", "color": "#2E7D32", "source": "BCT"},
    {"id": "gdp_capita",  "name": "PIB / habitant",        "value": 4800,  "unit": "USD",       "change": None,  "change_unit": None,     "trend": "stable", "emoji": "💵", "color": "#1565C0", "source": "BCT"},
    {"id": "growth",      "name": "Croissance PIB",        "value": 1.8,   "unit": "%",         "change": +0.3,  "change_unit": "pts/an", "trend": "up",     "emoji": "📊", "color": "#2E7D32", "source": "BCT"},
    {"id": "unemployment","name": "Chômage Q2 2026",       "value": 15.6,  "unit": "%",         "change": -0.3,  "change_unit": "pts/trim","trend": "down",   "emoji": "👷", "color": "#F57C00", "source": "INS"},
    {"id": "youth_unemp", "name": "Chômage jeunes",        "value": 35.2,  "unit": "%",         "change": -0.5,  "change_unit": "pts/an", "trend": "down",   "emoji": "🎓", "color": "#C62828", "source": "INS"},
    {"id": "reserves",    "name": "Réserves de change",    "value": 9.8,   "unit": "Mds USD",   "change": +0.2,  "change_unit": "Mds",    "trend": "up",     "emoji": "🏦", "color": "#00695C", "source": "BCT"},
    {"id": "debt_gdp",    "name": "Dette / PIB",           "value": 78.5,  "unit": "%",         "change": +1.5,  "change_unit": "pts/an", "trend": "up",     "emoji": "📉", "color": "#D32F2F", "source": "Min. Finances"},
    {"id": "deficit",     "name": "Déficit budgétaire",    "value": -6.2,  "unit": "% PIB",     "change": +0.5,  "change_unit": "pts/an", "trend": "down",   "emoji": "💸", "color": "#D32F2F", "source": "Min. Finances"},
    {"id": "trade",       "name": "Balance commerciale",   "value": -12.4, "unit": "Mds TND",   "change": None,  "change_unit": None,     "trend": "stable", "emoji": "🌍", "color": "#7B1FA2", "source": "BCT"},
    {"id": "rate_bct",    "name": "Taux directeur BCT",    "value": 8.0,   "unit": "%",         "change": 0.0,   "change_unit": None,     "trend": "stable", "emoji": "🏧", "color": "#1565C0", "source": "BCT"},
]

# ── Comparateur de Prix (marché) ──────────────────────────────────────────────
PRICE_COMPARISON: List[Dict] = [
    {
        "id": "pain", "category": "alimentation", "name": "Pain (baguette)", "emoji": "🍞", "unit": "pièce",
        "official_price": 0.190, "market_min": 0.180, "market_max": 0.220, "avg": 0.195,
        "trend": "stable", "season_note": None,
    },
    {
        "id": "pain_kg", "category": "alimentation", "name": "Pain de campagne", "emoji": "🫓", "unit": "kg",
        "official_price": 0.380, "market_min": 0.350, "market_max": 0.450, "avg": 0.390,
        "trend": "stable", "season_note": None,
    },
    {
        "id": "lait", "category": "alimentation", "name": "Lait pasteurisé", "emoji": "🥛", "unit": "litre",
        "official_price": 1.350, "market_min": 1.200, "market_max": 1.500, "avg": 1.380,
        "trend": "up", "season_note": None,
    },
    {
        "id": "huile_olive", "category": "alimentation", "name": "Huile d'olive", "emoji": "🫒", "unit": "litre",
        "official_price": 8.500, "market_min": 7.500, "market_max": 10.000, "avg": 8.800,
        "trend": "up", "season_note": "Prix plus élevé hors saison de récolte",
    },
    {
        "id": "poulet", "category": "alimentation", "name": "Poulet entier", "emoji": "🍗", "unit": "kg",
        "official_price": 7.500, "market_min": 6.800, "market_max": 8.200, "avg": 7.600,
        "trend": "stable", "season_note": None,
    },
    {
        "id": "oeufs", "category": "alimentation", "name": "Œufs", "emoji": "🥚", "unit": "douzaine",
        "official_price": 3.800, "market_min": 3.500, "market_max": 4.200, "avg": 3.850,
        "trend": "down", "season_note": None,
    },
    {
        "id": "tomates", "category": "alimentation", "name": "Tomates", "emoji": "🍅", "unit": "kg",
        "official_price": 1.200, "market_min": 0.800, "market_max": 1.800, "avg": 1.150,
        "trend": "seasonal", "season_note": "Bas en été, haut en hiver",
    },
    {
        "id": "sucre", "category": "alimentation", "name": "Sucre", "emoji": "🍬", "unit": "kg",
        "official_price": 1.450, "market_min": 1.400, "market_max": 1.600, "avg": 1.480,
        "trend": "stable", "season_note": None,
    },
    {
        "id": "farine", "category": "alimentation", "name": "Farine de blé", "emoji": "🌾", "unit": "kg",
        "official_price": 0.650, "market_min": 0.600, "market_max": 0.750, "avg": 0.660,
        "trend": "stable", "season_note": None,
    },
    {
        "id": "eau_minerale", "category": "alimentation", "name": "Eau minérale", "emoji": "💧", "unit": "1.5L",
        "official_price": 0.500, "market_min": 0.450, "market_max": 0.650, "avg": 0.520,
        "trend": "up", "season_note": None,
    },
    {
        "id": "cafe", "category": "alimentation", "name": "Café (en grains)", "emoji": "☕", "unit": "250g",
        "official_price": None, "market_min": 5.500, "market_max": 8.000, "avg": 6.500,
        "trend": "up", "season_note": None,
    },
    {
        "id": "gaz_domestique", "category": "energie", "name": "Bouteille de gaz", "emoji": "🔥", "unit": "13 kg",
        "official_price": 7.000, "market_min": 7.000, "market_max": 7.000, "avg": 7.000,
        "trend": "stable", "season_note": "Prix réglementé",
    },
    {
        "id": "ticket_metro", "category": "transport", "name": "Ticket Métro Tunis", "emoji": "🚇", "unit": "voyage",
        "official_price": 0.650, "market_min": 0.650, "market_max": 0.650, "avg": 0.650,
        "trend": "stable", "season_note": "Prix réglementé",
    },
    {
        "id": "taxi_km", "category": "transport", "name": "Taxi (tarif km)", "emoji": "🚕", "unit": "km",
        "official_price": 0.800, "market_min": 0.800, "market_max": 1.200, "avg": 0.950,
        "trend": "up", "season_note": None,
    },
    {
        "id": "restaurant_midi", "category": "restauration", "name": "Repas midi restaurant", "emoji": "🍽️", "unit": "personne",
        "official_price": None, "market_min": 8.000, "market_max": 20.000, "avg": 13.500,
        "trend": "up", "season_note": None,
    },
    {
        "id": "cafe_express", "category": "restauration", "name": "Café espresso (café)", "emoji": "☕", "unit": "tasse",
        "official_price": None, "market_min": 1.000, "market_max": 2.500, "avg": 1.500,
        "trend": "up", "season_note": None,
    },
]

# ── Utilitaires ───────────────────────────────────────────────────────────────
def get_dashboard_summary() -> Dict:
    """Retourne un résumé dashboard agrégé."""
    top_inflation_cat = max(INFLATION["categories"], key=lambda c: c["inflation_yoy"])
    return {
        "last_updated": "2026-08-06T16:30:00+01:00",
        "exchange_summary": {
            "eur_mid": EXCHANGE_RATES["rates"]["EUR"]["mid"],
            "usd_mid": EXCHANGE_RATES["rates"]["USD"]["mid"],
            "eur_trend": EXCHANGE_RATES["variation_24h"]["EUR"]["trend"],
            "usd_trend": EXCHANGE_RATES["variation_24h"]["USD"]["trend"],
        },
        "fuel_summary": {
            "essence_super": next(p["price_tnd"] for p in FUEL_PRICES["products"] if p["id"] == "essence_super"),
            "gasoil_ss": next(p["price_tnd"] for p in FUEL_PRICES["products"] if p["id"] == "gasoil_ss"),
            "next_review": FUEL_PRICES["next_review_date"],
        },
        "inflation_summary": {
            "current": INFLATION["inflation_yoy"],
            "date": INFLATION["current_ipc_date"],
            "top_category": {"name": top_inflation_cat["name"], "value": top_inflation_cat["inflation_yoy"]},
        },
        "macro_summary": {
            "gdp_growth": 1.8,
            "unemployment": 15.6,
            "reserves": 9.8,
            "bct_rate": 8.0,
        },
    }


def convert_currency(amount: float, from_currency: str, to_currency: str) -> Dict:
    """Convertit entre TND et une devise étrangère."""
    rates = EXCHANGE_RATES["rates"]
    from_c = from_currency.upper()
    to_c   = to_currency.upper()

    if from_c == to_c:
        return {"amount": amount, "result": amount, "rate": 1.0, "from": from_c, "to": to_c}

    if from_c == "TND" and to_c in rates:
        rate = 1 / rates[to_c]["mid"]
        return {"amount": amount, "result": round(amount * rate, 4), "rate": round(rate, 6), "from": from_c, "to": to_c}
    elif to_c == "TND" and from_c in rates:
        rate = rates[from_c]["mid"]
        return {"amount": amount, "result": round(amount * rate, 4), "rate": round(rate, 6), "from": from_c, "to": to_c}
    elif from_c in rates and to_c in rates:
        # Via TND pivot
        in_tnd = amount * rates[from_c]["mid"]
        result = in_tnd / rates[to_c]["mid"]
        return {"amount": amount, "result": round(result, 4), "rate": round(result / amount, 6), "from": from_c, "to": to_c}
    else:
        return {"error": f"Devise non supportée : {from_c} → {to_c}"}


def calculate_fuel_cost(distance_km: float, fuel_type: str, consumption_l_per_100: float) -> Dict:
    """Calcule le coût carburant pour un trajet."""
    product = next((p for p in FUEL_PRICES["products"] if p["id"] == fuel_type), None)
    if not product:
        return {"error": f"Type carburant '{fuel_type}' inconnu"}
    liters = distance_km * consumption_l_per_100 / 100
    cost_tnd = liters * product["price_tnd"]
    return {
        "distance_km": distance_km,
        "fuel_type": fuel_type,
        "fuel_name": product["name"],
        "price_per_litre": product["price_tnd"],
        "consumption_l_per_100km": consumption_l_per_100,
        "fuel_needed_litres": round(liters, 2),
        "cost_tnd": round(cost_tnd, 3),
        "cost_per_km_tnd": round(cost_tnd / distance_km, 4) if distance_km > 0 else 0,
        "cost_usd": round(cost_tnd / EXCHANGE_RATES["rates"]["USD"]["mid"], 2),
    }
