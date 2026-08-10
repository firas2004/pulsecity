"""
routers/eco_pulse.py — Endpoints Éco Pulse (économie & prix).
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List

from helpers.eco_data import (
    EXCHANGE_RATES, FUEL_PRICES, INFLATION, MACRO_INDICATORS,
    PRICE_COMPARISON, get_dashboard_summary, convert_currency, calculate_fuel_cost,
)

router = APIRouter(prefix="/eco-pulse", tags=["eco-pulse"])

SUPPORTED_CURRENCIES = ["TND", "EUR", "USD", "GBP", "CHF", "CAD", "SAR", "AED", "TRY", "JPY", "CNY"]
PRICE_CATEGORIES = ["alimentation", "energie", "transport", "restauration"]


# ── 1. Dashboard complet ──────────────────────────────────────────────────────
@router.get("/dashboard")
def dashboard():
    """Toutes les données économiques agrégées pour le dashboard."""
    return {
        "summary": get_dashboard_summary(),
        "exchange_rates": EXCHANGE_RATES,
        "fuel_prices": FUEL_PRICES,
        "inflation": INFLATION,
        "macro_indicators": MACRO_INDICATORS,
        "price_comparison": PRICE_COMPARISON,
    }


# ── 2. Cours du dinar ─────────────────────────────────────────────────────────
@router.get("/exchange-rates")
def exchange_rates(
    currencies: Optional[str] = Query(None, description="Virgule-séparé ex: EUR,USD,GBP"),
):
    """Cours du dinar avec historique 7j et variations."""
    data = dict(EXCHANGE_RATES)
    if currencies:
        wanted = {c.strip().upper() for c in currencies.split(",")}
        data["rates"] = {k: v for k, v in data["rates"].items() if k in wanted}
        data["variation_24h"] = {k: v for k, v in data.get("variation_24h", {}).items() if k in wanted}
    return data


# ── 3. Prix carburants ────────────────────────────────────────────────────────
@router.get("/fuel-prices")
def fuel_prices(fuel_type: Optional[str] = Query(None)):
    """Prix officiels des carburants avec historique."""
    if fuel_type:
        product = next((p for p in FUEL_PRICES["products"] if p["id"] == fuel_type), None)
        if not product:
            raise HTTPException(404, f"Carburant '{fuel_type}' introuvable. Types disponibles : " +
                                ", ".join(p["id"] for p in FUEL_PRICES["products"]))
        return {**FUEL_PRICES, "products": [product]}
    return FUEL_PRICES


# ── 4. Inflation & IPC ────────────────────────────────────────────────────────
@router.get("/inflation")
def inflation(period: str = Query("monthly", description="monthly | annual")):
    """IPC et inflation avec détail par catégorie."""
    data = dict(INFLATION)
    if period == "annual":
        data.pop("history_monthly", None)
    else:
        data.pop("history_annual", None)
    # Trier les catégories par inflation (desc)
    data["categories"] = sorted(data["categories"], key=lambda c: -c["inflation_yoy"])
    return data


# ── 5. Indicateurs macroéconomiques ──────────────────────────────────────────
@router.get("/macro-indicators")
def macro_indicators(indicator: Optional[str] = Query(None)):
    """Indicateurs macroéconomiques clés."""
    if indicator:
        ind = next((i for i in MACRO_INDICATORS if i["id"] == indicator), None)
        if not ind:
            raise HTTPException(404, f"Indicateur '{indicator}' introuvable.")
        return ind
    return {"indicators": MACRO_INDICATORS, "count": len(MACRO_INDICATORS)}


# ── 6. Comparateur de prix ────────────────────────────────────────────────────
@router.get("/price-comparison")
def price_comparison(
    category: Optional[str] = Query(None, description="alimentation|energie|transport|restauration"),
    trend: Optional[str]    = Query(None, description="up|down|stable|seasonal"),
):
    """Prix des produits de base avec comparaison officiel vs marché."""
    data = list(PRICE_COMPARISON)
    if category:
        data = [p for p in data if p.get("category") == category]
    if trend:
        data = [p for p in data if p.get("trend") == trend]
    return {
        "products": data,
        "count": len(data),
        "categories": PRICE_CATEGORIES,
        "disclaimer": "Prix indicatifs sujets à variation selon les régions et commerçants.",
        "last_updated": "2026-08-01",
    }


# ── 7. Convertisseur de devises ───────────────────────────────────────────────
@router.get("/currency-converter")
def currency_converter(
    amount: float = Query(..., gt=0, description="Montant à convertir"),
    from_c: str   = Query("TND", alias="from", description="Devise source"),
    to_c: str     = Query("EUR", alias="to", description="Devise cible"),
):
    """Convertisseur TND ↔ devises étrangères."""
    from_c = from_c.upper()
    to_c   = to_c.upper()
    if from_c not in SUPPORTED_CURRENCIES:
        raise HTTPException(400, f"Devise non supportée : {from_c}. Disponibles : {SUPPORTED_CURRENCIES}")
    if to_c not in SUPPORTED_CURRENCIES:
        raise HTTPException(400, f"Devise non supportée : {to_c}. Disponibles : {SUPPORTED_CURRENCIES}")

    result = convert_currency(amount, from_c, to_c)
    if "error" in result:
        raise HTTPException(400, result["error"])
    result["rates_date"] = EXCHANGE_RATES["last_updated"]
    result["supported_currencies"] = SUPPORTED_CURRENCIES
    return result


# ── 8. Calculateur carburant ──────────────────────────────────────────────────
@router.get("/fuel-calculator")
def fuel_calculator(
    distance_km: float          = Query(..., gt=0, le=5000),
    fuel_type: str              = Query("essence_super"),
    consumption_l_per_100km: float = Query(7.5, gt=0, le=30),
):
    """Calcule le coût carburant d'un trajet donné."""
    result = calculate_fuel_cost(distance_km, fuel_type, consumption_l_per_100km)
    if "error" in result:
        available = [p["id"] for p in FUEL_PRICES["products"]]
        raise HTTPException(400, f"{result['error']}. Types disponibles : {available}")
    return result


# ── 9. Devises supportées ─────────────────────────────────────────────────────
@router.get("/currencies")
def currencies():
    """Liste des devises supportées avec taux actuels."""
    rates = EXCHANGE_RATES["rates"]
    return {
        "base": "TND",
        "currencies": [
            {
                "code": code,
                "name": rates[code]["name"],
                "flag": rates[code]["flag"],
                "mid": rates[code]["mid"],
            }
            for code in rates
        ],
        "last_updated": EXCHANGE_RATES["last_updated"],
    }


# ── 10. Résumé rapide (pour widget header) ────────────────────────────────────
@router.get("/summary")
def summary():
    """Résumé compact pour affichage rapide (widget header)."""
    return get_dashboard_summary()
