"""
helpers/admin_data.py — Données des établissements administratifs tunisiens.
Données embarquées inline (aucun fichier JSON externe).
~200 établissements couvrant les 24 gouvernorats.
"""
import math
from typing import List, Dict, Any, Optional

TYPE_CONFIG: Dict[str, Dict] = {
    "gouvernorat":      {"label": "Gouvernorat",          "emoji": "🏰", "color": "#0D47A1"},
    "municipalite":     {"label": "Municipalité",         "emoji": "🏛️", "color": "#1565C0"},
    "delegation":       {"label": "Délégation",           "emoji": "🏢", "color": "#1976D2"},
    "poste":            {"label": "Bureau de Poste",      "emoji": "📮", "color": "#F57C00"},
    "cnss":             {"label": "Bureau CNSS",          "emoji": "🛡️", "color": "#388E3C"},
    "cnam":             {"label": "Centre CNAM",          "emoji": "💳", "color": "#2E7D32"},
    "ministere":        {"label": "Ministère",            "emoji": "🏛️", "color": "#6A1B9A"},
    "police":           {"label": "Commissariat / Police","emoji": "👮", "color": "#C62828"},
    "tribunal":         {"label": "Tribunal",             "emoji": "⚖️",  "color": "#455A64"},
    "service_exterieur":{"label": "Service Extérieur",   "emoji": "📋", "color": "#5D4037"},
}

SERVICE_LABELS: Dict[str, str] = {
    "etat_civil":          "État Civil",
    "urbanisme":           "Urbanisme",
    "hygiene":             "Hygiène",
    "proprete":            "Propreté",
    "marches":             "Marchés",
    "representation_etat": "Représentation de l'État",
    "courrier":            "Courrier",
    "colis":               "Colis",
    "ccp":                 "Compte CCP",
    "epargne":             "Épargne",
    "mandats":             "Mandats",
    "rapid_poste":         "Rapid-Poste",
    "affiliation":         "Affiliation",
    "cotisations":         "Cotisations",
    "prestations":         "Prestations",
    "remboursement":       "Remboursement",
    "carte_cnam":          "Carte CNAM",
    "impots":              "Impôts",
    "douanes":             "Douanes",
    "cin":                 "CIN",
    "passeport":           "Passeport",
    "plaintes":            "Dépôt de plainte",
    "civil":               "Affaires civiles",
    "penal":               "Affaires pénales",
    "commercial":          "Affaires commerciales",
}

# ─────────────────────────────────────────────────────────────────────────────
# GOUVERNORATS (24)
# ─────────────────────────────────────────────────────────────────────────────
_GOUVERNORATS = [
    {"id":"gov-tunis","name":"Gouvernorat de Tunis","type":"gouvernorat","governorate":"Tunis","city":"Tunis","address":"Place du Gouvernement, La Kasbah, Tunis 1020","lat":36.7975,"lng":10.1710,"phone":"+216 71 565 400","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-ariana","name":"Gouvernorat de l'Ariana","type":"gouvernorat","governorate":"Ariana","city":"Ariana","address":"Avenue de la République, Ariana 2080","lat":36.8625,"lng":10.1956,"phone":"+216 71 710 900","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-ben-arous","name":"Gouvernorat de Ben Arous","type":"gouvernorat","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous","lat":36.7545,"lng":10.2189,"phone":"+216 71 380 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-manouba","name":"Gouvernorat de La Manouba","type":"gouvernorat","governorate":"La Manouba","city":"Manouba","address":"Avenue Farhat Hached, La Manouba 2010","lat":36.8075,"lng":10.1015,"phone":"+216 71 600 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-nabeul","name":"Gouvernorat de Nabeul","type":"gouvernorat","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul 8000","lat":36.4560,"lng":10.7350,"phone":"+216 72 220 500","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-zaghouan","name":"Gouvernorat de Zaghouan","type":"gouvernorat","governorate":"Zaghouan","city":"Zaghouan","address":"Avenue Habib Bourguiba, Zaghouan 1100","lat":36.4020,"lng":10.1430,"phone":"+216 72 675 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-bizerte","name":"Gouvernorat de Bizerte","type":"gouvernorat","governorate":"Bizerte","city":"Bizerte","address":"Place de la République, Bizerte 7000","lat":37.2740,"lng":9.8730,"phone":"+216 72 431 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-beja","name":"Gouvernorat de Béja","type":"gouvernorat","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja 9000","lat":36.7256,"lng":9.1817,"phone":"+216 78 450 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-jendouba","name":"Gouvernorat de Jendouba","type":"gouvernorat","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba 8100","lat":36.5011,"lng":8.7803,"phone":"+216 78 630 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-kef","name":"Gouvernorat du Kef","type":"gouvernorat","governorate":"Le Kef","city":"Le Kef","address":"Avenue de la République, Le Kef 7100","lat":36.1680,"lng":8.7150,"phone":"+216 78 221 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-siliana","name":"Gouvernorat de Siliana","type":"gouvernorat","governorate":"Siliana","city":"Siliana","address":"Avenue Habib Bourguiba, Siliana 6100","lat":36.0844,"lng":9.3708,"phone":"+216 78 870 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-kairouan","name":"Gouvernorat de Kairouan","type":"gouvernorat","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan 3100","lat":35.6781,"lng":10.0963,"phone":"+216 77 230 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-kasserine","name":"Gouvernorat de Kasserine","type":"gouvernorat","governorate":"Kasserine","city":"Kasserine","address":"Avenue Habib Bourguiba, Kasserine 1200","lat":35.1672,"lng":8.8311,"phone":"+216 77 470 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-sidi-bouzid","name":"Gouvernorat de Sidi Bouzid","type":"gouvernorat","governorate":"Sidi Bouzid","city":"Sidi Bouzid","address":"Avenue Habib Bourguiba, Sidi Bouzid 9100","lat":35.0382,"lng":9.4858,"phone":"+216 76 630 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-sousse","name":"Gouvernorat de Sousse","type":"gouvernorat","governorate":"Sousse","city":"Sousse","address":"Avenue Mohamed Karoui, Sousse 4000","lat":35.8256,"lng":10.6084,"phone":"+216 73 221 500","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-monastir","name":"Gouvernorat de Monastir","type":"gouvernorat","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir 5000","lat":35.7833,"lng":10.8333,"phone":"+216 73 461 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-mahdia","name":"Gouvernorat de Mahdia","type":"gouvernorat","governorate":"Mahdia","city":"Mahdia","address":"Avenue Habib Bourguiba, Mahdia 5100","lat":35.5047,"lng":11.0622,"phone":"+216 73 680 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-sfax","name":"Gouvernorat de Sfax","type":"gouvernorat","governorate":"Sfax","city":"Sfax","address":"Place de la République, Sfax 3000","lat":34.7406,"lng":10.7603,"phone":"+216 74 210 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-gabes","name":"Gouvernorat de Gabès","type":"gouvernorat","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, Gabès 6000","lat":33.8815,"lng":10.0982,"phone":"+216 75 270 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-medenine","name":"Gouvernorat de Médenine","type":"gouvernorat","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine 4100","lat":33.3549,"lng":10.5055,"phone":"+216 75 640 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-tataouine","name":"Gouvernorat de Tataouine","type":"gouvernorat","governorate":"Tataouine","city":"Tataouine","address":"Avenue Habib Bourguiba, Tataouine 3200","lat":32.9211,"lng":10.4509,"phone":"+216 75 860 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-gafsa","name":"Gouvernorat de Gafsa","type":"gouvernorat","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa 2100","lat":34.4250,"lng":8.7842,"phone":"+216 76 220 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-tozeur","name":"Gouvernorat de Tozeur","type":"gouvernorat","governorate":"Tozeur","city":"Tozeur","address":"Avenue Habib Bourguiba, Tozeur 2200","lat":33.9197,"lng":8.1335,"phone":"+216 76 453 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
    {"id":"gov-kebili","name":"Gouvernorat de Kébili","type":"gouvernorat","governorate":"Kébili","city":"Kébili","address":"Avenue de la République, Kébili 4200","lat":33.7043,"lng":8.9683,"phone":"+216 75 490 000","services":["administration_generale","coordination"],"opening_hours":"08:00-13:00"},
]

# ─────────────────────────────────────────────────────────────────────────────
# MUNICIPALITÉS (50+)
# ─────────────────────────────────────────────────────────────────────────────
_MUNICIPALITES = [
    {"id":"mun-tunis","name":"Commune de Tunis","type":"municipalite","governorate":"Tunis","city":"Tunis","address":"Place du Gouvernement, La Kasbah, Tunis 1008","lat":36.7975,"lng":10.1710,"phone":"+216 71 260 000","email":"commune.tunis@email.ati.tn","services":["etat_civil","urbanisme","hygiene","proprete","marches"],"has_etat_civil":True,"opening_hours":"08:00-13:00","website":"http://www.commune-tunis.gov.tn"},
    {"id":"mun-bab-bhar","name":"Commune Bab Bhar","type":"municipalite","governorate":"Tunis","city":"Tunis","address":"Rue de la Kasbah, Tunis 1001","lat":36.7990,"lng":10.1740,"phone":"+216 71 336 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-bab-souika","name":"Commune Bab Souika","type":"municipalite","governorate":"Tunis","city":"Tunis","address":"Rue Bab Souika, Tunis","lat":36.8020,"lng":10.1690,"phone":"+216 71 321 000","services":["etat_civil","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-ariana","name":"Commune de l'Ariana","type":"municipalite","governorate":"Ariana","city":"Ariana","address":"Avenue Habib Bourguiba, Ariana 2080","lat":36.8625,"lng":10.1956,"phone":"+216 71 710 000","services":["etat_civil","urbanisme","hygiene","proprete"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-raoued","name":"Commune de Raoued","type":"municipalite","governorate":"Ariana","city":"Raoued","address":"Route de la Marsa, Raoued 2056","lat":36.9000,"lng":10.2010,"phone":"+216 71 770 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-la-marsa","name":"Commune de La Marsa","type":"municipalite","governorate":"Tunis","city":"La Marsa","address":"Avenue Habib Bourguiba, La Marsa 2070","lat":36.8781,"lng":10.3247,"phone":"+216 71 742 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-sidi-bou-said","name":"Commune de Sidi Bou Saïd","type":"municipalite","governorate":"Tunis","city":"Sidi Bou Saïd","address":"Avenue des Romains, Sidi Bou Saïd","lat":36.8707,"lng":10.3413,"phone":"+216 71 740 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-ben-arous","name":"Commune de Ben Arous","type":"municipalite","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous 2013","lat":36.7545,"lng":10.2189,"phone":"+216 71 380 000","services":["etat_civil","urbanisme","hygiene","proprete"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-rades","name":"Commune de Radès","type":"municipalite","governorate":"Ben Arous","city":"Radès","address":"Avenue Habib Bourguiba, Radès","lat":36.7700,"lng":10.2780,"phone":"+216 71 440 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-manouba","name":"Commune de Manouba","type":"municipalite","governorate":"La Manouba","city":"Manouba","address":"Avenue Farhat Hached, Manouba 2010","lat":36.8075,"lng":10.1015,"phone":"+216 71 600 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-tebourba","name":"Commune de Tébourba","type":"municipalite","governorate":"La Manouba","city":"Tébourba","address":"Centre Ville, Tébourba","lat":36.8267,"lng":9.8410,"phone":"+216 71 620 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-nabeul","name":"Commune de Nabeul","type":"municipalite","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul 8000","lat":36.4560,"lng":10.7350,"phone":"+216 72 220 000","services":["etat_civil","urbanisme","hygiene","proprete","marches"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-hammamet","name":"Commune de Hammamet","type":"municipalite","governorate":"Nabeul","city":"Hammamet","address":"Avenue de la République, Hammamet","lat":36.4000,"lng":10.6100,"phone":"+216 72 280 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-kelibia","name":"Commune de Kélibia","type":"municipalite","governorate":"Nabeul","city":"Kélibia","address":"Avenue Habib Bourguiba, Kélibia","lat":36.8467,"lng":11.0949,"phone":"+216 72 296 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-zaghouan","name":"Commune de Zaghouan","type":"municipalite","governorate":"Zaghouan","city":"Zaghouan","address":"Centre Ville, Zaghouan 1100","lat":36.4020,"lng":10.1430,"phone":"+216 72 675 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-bizerte","name":"Commune de Bizerte","type":"municipalite","governorate":"Bizerte","city":"Bizerte","address":"Place de la République, Bizerte 7000","lat":37.2740,"lng":9.8730,"phone":"+216 72 431 000","services":["etat_civil","urbanisme","hygiene","proprete"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-menzel-bourguiba","name":"Commune de Menzel Bourguiba","type":"municipalite","governorate":"Bizerte","city":"Menzel Bourguiba","address":"Rue de la Liberté, Menzel Bourguiba","lat":37.1550,"lng":9.7890,"phone":"+216 72 460 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-beja","name":"Commune de Béja","type":"municipalite","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja 9000","lat":36.7256,"lng":9.1817,"phone":"+216 78 450 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-teboursouk","name":"Commune de Téboursouk","type":"municipalite","governorate":"Béja","city":"Téboursouk","address":"Centre Ville, Téboursouk","lat":36.4580,"lng":9.2480,"phone":"+216 78 465 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-jendouba","name":"Commune de Jendouba","type":"municipalite","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba 8100","lat":36.5011,"lng":8.7803,"phone":"+216 78 630 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-tabarka","name":"Commune de Tabarka","type":"municipalite","governorate":"Jendouba","city":"Tabarka","address":"Avenue Habib Bourguiba, Tabarka 8110","lat":36.9540,"lng":8.7580,"phone":"+216 78 673 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-kef","name":"Commune du Kef","type":"municipalite","governorate":"Le Kef","city":"Le Kef","address":"Avenue de la République, Le Kef 7100","lat":36.1680,"lng":8.7150,"phone":"+216 78 221 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-siliana","name":"Commune de Siliana","type":"municipalite","governorate":"Siliana","city":"Siliana","address":"Avenue Habib Bourguiba, Siliana 6100","lat":36.0844,"lng":9.3708,"phone":"+216 78 870 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-kairouan","name":"Commune de Kairouan","type":"municipalite","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan 3100","lat":35.6781,"lng":10.0963,"phone":"+216 77 230 000","services":["etat_civil","urbanisme","hygiene","proprete","marches"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-sbeitla","name":"Commune de Sbeitla","type":"municipalite","governorate":"Kasserine","city":"Sbeitla","address":"Centre Ville, Sbeitla","lat":35.2330,"lng":9.1190,"phone":"+216 77 467 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-kasserine","name":"Commune de Kasserine","type":"municipalite","governorate":"Kasserine","city":"Kasserine","address":"Avenue Habib Bourguiba, Kasserine 1200","lat":35.1672,"lng":8.8311,"phone":"+216 77 470 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-sidi-bouzid","name":"Commune de Sidi Bouzid","type":"municipalite","governorate":"Sidi Bouzid","city":"Sidi Bouzid","address":"Avenue Habib Bourguiba, Sidi Bouzid","lat":35.0382,"lng":9.4858,"phone":"+216 76 630 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-sousse","name":"Commune de Sousse","type":"municipalite","governorate":"Sousse","city":"Sousse","address":"Place de la République, Sousse 4000","lat":35.8256,"lng":10.6084,"phone":"+216 73 221 000","services":["etat_civil","urbanisme","hygiene","proprete","marches"],"has_etat_civil":True,"opening_hours":"08:00-13:00","website":"http://www.commune-sousse.gov.tn"},
    {"id":"mun-msaken","name":"Commune de M'saken","type":"municipalite","governorate":"Sousse","city":"M'saken","address":"Centre Ville, M'saken","lat":35.7290,"lng":10.5820,"phone":"+216 73 264 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-monastir","name":"Commune de Monastir","type":"municipalite","governorate":"Monastir","city":"Monastir","address":"Avenue Habib Bourguiba, Monastir 5000","lat":35.7833,"lng":10.8333,"phone":"+216 73 460 000","services":["etat_civil","urbanisme","hygiene","proprete"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-moknine","name":"Commune de Moknine","type":"municipalite","governorate":"Monastir","city":"Moknine","address":"Avenue Habib Bourguiba, Moknine","lat":35.6380,"lng":10.9150,"phone":"+216 73 497 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-mahdia","name":"Commune de Mahdia","type":"municipalite","governorate":"Mahdia","city":"Mahdia","address":"Avenue Habib Bourguiba, Mahdia 5100","lat":35.5047,"lng":11.0622,"phone":"+216 73 680 000","services":["etat_civil","urbanisme","hygiene","proprete"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-sfax","name":"Commune de Sfax","type":"municipalite","governorate":"Sfax","city":"Sfax","address":"Place de la République, Sfax 3000","lat":34.7406,"lng":10.7603,"phone":"+216 74 210 000","services":["etat_civil","urbanisme","hygiene","proprete","marches"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-gabes","name":"Commune de Gabès","type":"municipalite","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, Gabès 6000","lat":33.8815,"lng":10.0982,"phone":"+216 75 270 000","services":["etat_civil","urbanisme","hygiene","proprete"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-medenine","name":"Commune de Médenine","type":"municipalite","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine 4100","lat":33.3549,"lng":10.5055,"phone":"+216 75 640 000","services":["etat_civil","urbanisme","hygiene"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-zarzis","name":"Commune de Zarzis","type":"municipalite","governorate":"Médenine","city":"Zarzis","address":"Avenue Habib Bourguiba, Zarzis","lat":33.5040,"lng":11.1130,"phone":"+216 75 681 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-djerba-houmt-souk","name":"Commune de Djerba Houmt-Souk","type":"municipalite","governorate":"Médenine","city":"Djerba","address":"Houmt Souk, Djerba 4180","lat":33.8760,"lng":10.8572,"phone":"+216 75 650 000","services":["etat_civil","urbanisme","hygiene","marches"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-tataouine","name":"Commune de Tataouine","type":"municipalite","governorate":"Tataouine","city":"Tataouine","address":"Avenue Habib Bourguiba, Tataouine 3200","lat":32.9211,"lng":10.4509,"phone":"+216 75 860 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-gafsa","name":"Commune de Gafsa","type":"municipalite","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa 2100","lat":34.4250,"lng":8.7842,"phone":"+216 76 220 000","services":["etat_civil","urbanisme","hygiene","proprete"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-tozeur","name":"Commune de Tozeur","type":"municipalite","governorate":"Tozeur","city":"Tozeur","address":"Avenue Habib Bourguiba, Tozeur 2200","lat":33.9197,"lng":8.1335,"phone":"+216 76 453 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-kebili","name":"Commune de Kébili","type":"municipalite","governorate":"Kébili","city":"Kébili","address":"Avenue de la République, Kébili 4200","lat":33.7043,"lng":8.9683,"phone":"+216 75 490 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
    {"id":"mun-douz","name":"Commune de Douz","type":"municipalite","governorate":"Kébili","city":"Douz","address":"Centre Ville, Douz 4260","lat":33.4600,"lng":9.0270,"phone":"+216 75 470 000","services":["etat_civil","urbanisme"],"has_etat_civil":True,"opening_hours":"08:00-13:00"},
]

# ─────────────────────────────────────────────────────────────────────────────
# DÉLÉGATIONS (30+)
# ─────────────────────────────────────────────────────────────────────────────
_DELEGATIONS = [
    {"id":"del-tunis-centre","name":"Délégation Tunis Centre","type":"delegation","governorate":"Tunis","city":"Tunis","address":"Avenue de Paris, Tunis 1000","lat":36.8065,"lng":10.1815,"phone":"+216 71 333 000","services":["representation_etat","services_techniques"],"opening_hours":"08:00-13:00"},
    {"id":"del-sidi-hassine","name":"Délégation Sidi Hassine","type":"delegation","governorate":"Tunis","city":"Tunis","address":"Sidi Hassine, Tunis 1095","lat":36.7795,"lng":10.1115,"phone":"+216 71 592 991","services":["representation_etat","services_techniques"],"opening_hours":"08:00-13:00"},
    {"id":"del-ariana","name":"Délégation Ariana Ville","type":"delegation","governorate":"Ariana","city":"Ariana","address":"Avenue de la République, Ariana","lat":36.8530,"lng":10.1650,"phone":"+216 71 712 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-la-goulette","name":"Délégation La Goulette","type":"delegation","governorate":"Tunis","city":"La Goulette","address":"Centre Ville, La Goulette","lat":36.8190,"lng":10.3050,"phone":"+216 71 737 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-sousse-medina","name":"Délégation Sousse Médina","type":"delegation","governorate":"Sousse","city":"Sousse","address":"Avenue Habib Bourguiba, Sousse","lat":35.8290,"lng":10.6120,"phone":"+216 73 213 000","services":["representation_etat","services_techniques"],"opening_hours":"08:00-13:00"},
    {"id":"del-sfax-ville","name":"Délégation Sfax Ville","type":"delegation","governorate":"Sfax","city":"Sfax","address":"Avenue Habib Bourguiba, Sfax","lat":34.7490,"lng":10.7640,"phone":"+216 74 220 000","services":["representation_etat","services_techniques"],"opening_hours":"08:00-13:00"},
    {"id":"del-monastir","name":"Délégation Monastir","type":"delegation","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7700,"lng":10.8200,"phone":"+216 73 462 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-bizerte-nord","name":"Délégation Bizerte Nord","type":"delegation","governorate":"Bizerte","city":"Bizerte","address":"Avenue Habib Bourguiba, Bizerte","lat":37.2760,"lng":9.8750,"phone":"+216 72 432 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-nabeul","name":"Délégation Nabeul","type":"delegation","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul","lat":36.4580,"lng":10.7380,"phone":"+216 72 222 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-gabes-medina","name":"Délégation Gabès Médina","type":"delegation","governorate":"Gabès","city":"Gabès","address":"Centre Ville, Gabès","lat":33.8820,"lng":10.0990,"phone":"+216 75 271 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-kairouan","name":"Délégation Kairouan Nord","type":"delegation","governorate":"Kairouan","city":"Kairouan","address":"Avenue Farhat Hached, Kairouan","lat":35.6800,"lng":10.0980,"phone":"+216 77 232 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-beja","name":"Délégation Béja Nord","type":"delegation","governorate":"Béja","city":"Béja","address":"Centre Ville, Béja","lat":36.7270,"lng":9.1830,"phone":"+216 78 451 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-jendouba","name":"Délégation Jendouba","type":"delegation","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba","lat":36.5020,"lng":8.7820,"phone":"+216 78 631 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-mahdia","name":"Délégation Mahdia","type":"delegation","governorate":"Mahdia","city":"Mahdia","address":"Avenue Habib Bourguiba, Mahdia","lat":35.5060,"lng":11.0640,"phone":"+216 73 681 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
    {"id":"del-gafsa","name":"Délégation Gafsa","type":"delegation","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4260,"lng":8.7850,"phone":"+216 76 221 000","services":["representation_etat"],"opening_hours":"08:00-13:00"},
]

# ─────────────────────────────────────────────────────────────────────────────
# BUREAUX DE POSTE (30+)
# ─────────────────────────────────────────────────────────────────────────────
_POST_OFFICES = [
    {"id":"bp-tunis-republique","name":"Bureau de Poste Tunis République","type":"poste","subtype":"bureau_poste","governorate":"Tunis","city":"Tunis","address":"Avenue de la République, 1001 Tunis","lat":36.7990,"lng":10.1850,"phone":"+216 71 336 600","services":["courrier","colis","ccp","epargne","mandats"],"opening_hours":"08:00-16:30","opening_hours_saturday":"08:00-12:15"},
    {"id":"bp-tunis-hafsia","name":"Bureau de Poste El Hafsia","type":"poste","subtype":"bureau_poste","governorate":"Tunis","city":"Tunis","address":"32, Rue Sidi Bouhdid, 1059 El Hafsia","lat":36.8020,"lng":10.1750,"phone":"+216 71 281 854","email":"apc.elhafsia@poste.tn","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"rapid-poste-el-manar","name":"Centre Rapid-Poste El Manar","type":"poste","subtype":"rapid_poste","governorate":"Tunis","city":"El Manar","address":"Rue Malaga, 2092 El Manar I","lat":36.8450,"lng":10.1650,"phone":"+216 71 888 888","services":["rapid_poste","colis_express"],"opening_hours":"08:00-17:00","is_rapid_poste":True},
    {"id":"bp-aeroport-tunis","name":"Bureau de Poste Aéroport Tunis","type":"poste","subtype":"aeroport","governorate":"Tunis","city":"Tunis","address":"Aéroport Tunis-Carthage","lat":36.8510,"lng":10.2272,"phone":"+216 71 940 578","services":["courrier","colis","ccp"],"opening_hours":"24/7"},
    {"id":"bp-ariana","name":"Bureau de Poste Ariana","type":"poste","subtype":"bureau_poste","governorate":"Ariana","city":"Ariana","address":"Avenue Hédi Nouira, Ariana","lat":36.8530,"lng":10.1650,"phone":"+216 70 854 033","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-la-marsa","name":"Bureau de Poste La Marsa","type":"poste","subtype":"bureau_poste","governorate":"Tunis","city":"La Marsa","address":"Avenue Habib Bourguiba, La Marsa","lat":36.8781,"lng":10.3247,"phone":"+216 71 748 000","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-ben-arous","name":"Bureau de Poste Ben Arous","type":"poste","subtype":"bureau_poste","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous","lat":36.7545,"lng":10.2189,"phone":"+216 71 380 100","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-manouba","name":"Bureau de Poste Manouba","type":"poste","subtype":"bureau_poste","governorate":"La Manouba","city":"Manouba","address":"Av. Farhat Hached, Manouba","lat":36.8075,"lng":10.1015,"phone":"+216 71 600 200","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-nabeul","name":"Bureau de Poste Nabeul","type":"poste","subtype":"bureau_poste","governorate":"Nabeul","city":"Nabeul","address":"Rue de la Révolution, 8000 Nabeul","lat":36.4560,"lng":10.7350,"phone":"+216 72 233 259","email":"apc.nabeul@poste.tn","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-hammamet","name":"Bureau de Poste Hammamet","type":"poste","subtype":"bureau_poste","governorate":"Nabeul","city":"Hammamet","address":"Avenue de la République, Hammamet","lat":36.4000,"lng":10.6100,"phone":"+216 72 280 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-zaghouan","name":"Bureau de Poste Zaghouan","type":"poste","subtype":"bureau_poste","governorate":"Zaghouan","city":"Zaghouan","address":"Centre Ville, Zaghouan","lat":36.4020,"lng":10.1430,"phone":"+216 72 675 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-bizerte","name":"Bureau de Poste Bizerte","type":"poste","subtype":"bureau_poste","governorate":"Bizerte","city":"Bizerte","address":"Rue d'Algérie, 7000 Bizerte","lat":37.2740,"lng":9.8730,"phone":"+216 72 431 594","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-beja","name":"Bureau de Poste Béja","type":"poste","subtype":"bureau_poste","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja","lat":36.7256,"lng":9.1817,"phone":"+216 78 450 100","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-jendouba","name":"Bureau de Poste Jendouba","type":"poste","subtype":"bureau_poste","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba","lat":36.5011,"lng":8.7803,"phone":"+216 78 630 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-kef","name":"Bureau de Poste Le Kef","type":"poste","subtype":"bureau_poste","governorate":"Le Kef","city":"Le Kef","address":"Avenue de la République, Le Kef","lat":36.1680,"lng":8.7150,"phone":"+216 78 221 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-siliana","name":"Bureau de Poste Siliana","type":"poste","subtype":"bureau_poste","governorate":"Siliana","city":"Siliana","address":"Avenue Habib Bourguiba, Siliana","lat":36.0844,"lng":9.3708,"phone":"+216 78 870 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-kairouan","name":"Bureau de Poste Kairouan","type":"poste","subtype":"bureau_poste","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan","lat":35.6781,"lng":10.0963,"phone":"+216 77 230 100","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-kasserine","name":"Bureau de Poste Kasserine","type":"poste","subtype":"bureau_poste","governorate":"Kasserine","city":"Kasserine","address":"Avenue Habib Bourguiba, Kasserine","lat":35.1672,"lng":8.8311,"phone":"+216 77 470 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-sidi-bouzid","name":"Bureau de Poste Sidi Bouzid","type":"poste","subtype":"bureau_poste","governorate":"Sidi Bouzid","city":"Sidi Bouzid","address":"Avenue Habib Bourguiba, Sidi Bouzid","lat":35.0382,"lng":9.4858,"phone":"+216 76 630 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-sousse","name":"Bureau de Poste Sousse","type":"poste","subtype":"bureau_poste","governorate":"Sousse","city":"Sousse","address":"Rue de Ribat, 4059 Sousse","lat":35.8256,"lng":10.6084,"phone":"+216 73 213 544","email":"apc.sousse@poste.tn","services":["courrier","colis","ccp","epargne","mandats"],"opening_hours":"08:00-16:30"},
    {"id":"bp-monastir","name":"Bureau de Poste Monastir","type":"poste","subtype":"bureau_poste","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7833,"lng":10.8333,"phone":"+216 73 461 100","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-mahdia","name":"Bureau de Poste Mahdia","type":"poste","subtype":"bureau_poste","governorate":"Mahdia","city":"Mahdia","address":"Avenue Habib Bourguiba, Mahdia","lat":35.5047,"lng":11.0622,"phone":"+216 73 680 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-sfax","name":"Bureau de Poste Sfax","type":"poste","subtype":"bureau_poste","governorate":"Sfax","city":"Sfax","address":"Avenue Habib Bourguiba, Sfax","lat":34.7406,"lng":10.7603,"phone":"+216 74 210 709","email":"apc.sfax@poste.tn","services":["courrier","colis","ccp","epargne","mandats"],"opening_hours":"08:00-16:30"},
    {"id":"bp-gabes","name":"Bureau de Poste Gabès","type":"poste","subtype":"bureau_poste","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, 6000 Gabès","lat":33.8815,"lng":10.0982,"phone":"+216 75 270 558","email":"apc.gabes@poste.tn","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-medenine","name":"Bureau de Poste Médenine","type":"poste","subtype":"bureau_poste","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine","lat":33.3549,"lng":10.5055,"phone":"+216 75 640 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-tataouine","name":"Bureau de Poste Tataouine","type":"poste","subtype":"bureau_poste","governorate":"Tataouine","city":"Tataouine","address":"Avenue Habib Bourguiba, Tataouine","lat":32.9211,"lng":10.4509,"phone":"+216 75 860 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-gafsa","name":"Bureau de Poste Gafsa","type":"poste","subtype":"bureau_poste","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4250,"lng":8.7842,"phone":"+216 76 220 100","services":["courrier","colis","ccp","epargne"],"opening_hours":"08:00-16:30"},
    {"id":"bp-tozeur","name":"Bureau de Poste Tozeur","type":"poste","subtype":"bureau_poste","governorate":"Tozeur","city":"Tozeur","address":"Avenue Habib Bourguiba, Tozeur","lat":33.9197,"lng":8.1335,"phone":"+216 76 453 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
    {"id":"bp-kebili","name":"Bureau de Poste Kébili","type":"poste","subtype":"bureau_poste","governorate":"Kébili","city":"Kébili","address":"Avenue de la République, Kébili","lat":33.7043,"lng":8.9683,"phone":"+216 75 490 100","services":["courrier","colis","ccp"],"opening_hours":"08:00-16:30"},
]

# ─────────────────────────────────────────────────────────────────────────────
# CNSS (20+)
# ─────────────────────────────────────────────────────────────────────────────
_CNSS = [
    {"id":"cnss-tunis-belvedere","name":"Bureau Régional CNSS Tunis Belvédère","type":"cnss","governorate":"Tunis","city":"Tunis","address":"8, Rue de Beyrout, 1002 Tunis","lat":36.8060,"lng":10.1800,"phone":"+216 71 796 744","email":"BR.TunisBelvedere@cnss.nat.tn","services":["affiliation","cotisations","prestations","contentieux"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-tunis-centre","name":"Bureau Régional CNSS Tunis Centre","type":"cnss","governorate":"Tunis","city":"Tunis","address":"12, Avenue de Madrid, 1006 Tunis","lat":36.8050,"lng":10.1850,"phone":"+216 71 849 833","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-ariana","name":"Bureau Régional CNSS Ariana","type":"cnss","governorate":"Ariana","city":"Ariana","address":"Avenue Habib Bourguiba, Ariana","lat":36.8625,"lng":10.1956,"phone":"+216 71 713 000","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-ben-arous","name":"Bureau Régional CNSS Ben Arous","type":"cnss","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous","lat":36.7545,"lng":10.2189,"phone":"+216 71 380 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-manouba","name":"Bureau Régional CNSS Manouba","type":"cnss","governorate":"La Manouba","city":"Manouba","address":"Av. Farhat Hached, Manouba","lat":36.8075,"lng":10.1015,"phone":"+216 71 601 000","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-nabeul","name":"Bureau Régional CNSS Nabeul","type":"cnss","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, 8000 Nabeul","lat":36.4560,"lng":10.7350,"phone":"+216 72 225 364","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-bizerte","name":"Bureau Régional CNSS Bizerte","type":"cnss","governorate":"Bizerte","city":"Bizerte","address":"Avenue 18 Janvier 1952, 7000 Bizerte","lat":37.2740,"lng":9.8730,"phone":"+216 72 425 364","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-beja","name":"Bureau Régional CNSS Béja","type":"cnss","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja","lat":36.7256,"lng":9.1817,"phone":"+216 78 451 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-jendouba","name":"Bureau Régional CNSS Jendouba","type":"cnss","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba","lat":36.5011,"lng":8.7803,"phone":"+216 78 631 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-kairouan","name":"Bureau Régional CNSS Kairouan","type":"cnss","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan","lat":35.6781,"lng":10.0963,"phone":"+216 77 231 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-sousse","name":"Bureau Régional CNSS Sousse","type":"cnss","governorate":"Sousse","city":"Sousse","address":"Rue Ernest Conseil, 4000 Sousse","lat":35.8256,"lng":10.6084,"phone":"+216 73 202 800","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-monastir","name":"Bureau Régional CNSS Monastir","type":"cnss","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7833,"lng":10.8333,"phone":"+216 73 462 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-mahdia","name":"Bureau Régional CNSS Mahdia","type":"cnss","governorate":"Mahdia","city":"Mahdia","address":"Avenue Habib Bourguiba, Mahdia","lat":35.5047,"lng":11.0622,"phone":"+216 73 681 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-sfax","name":"Bureau Régional CNSS Sfax","type":"cnss","governorate":"Sfax","city":"Sfax","address":"Rue Ksantina, 3049 Sfax","lat":34.7406,"lng":10.7603,"phone":"+216 74 200 725","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-gabes","name":"Bureau Régional CNSS Gabès","type":"cnss","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, Gabès","lat":33.8815,"lng":10.0982,"phone":"+216 75 271 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-medenine","name":"Bureau Régional CNSS Médenine","type":"cnss","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine","lat":33.3549,"lng":10.5055,"phone":"+216 75 641 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-gafsa","name":"Bureau Régional CNSS Gafsa","type":"cnss","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4250,"lng":8.7842,"phone":"+216 76 221 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
    {"id":"cnss-tozeur","name":"Bureau Régional CNSS Tozeur","type":"cnss","governorate":"Tozeur","city":"Tozeur","address":"Avenue Habib Bourguiba, Tozeur","lat":33.9197,"lng":8.1335,"phone":"+216 76 453 500","services":["affiliation","cotisations","prestations"],"opening_hours":"08:00-13:00"},
]

# ─────────────────────────────────────────────────────────────────────────────
# CNAM (12)
# ─────────────────────────────────────────────────────────────────────────────
_CNAM = [
    {"id":"cnam-siege","name":"Siège CNAM — Montplaisir","type":"cnam","subtype":"siege","governorate":"Tunis","city":"Tunis","address":"12, Rue Abou Hamed El Ghazali, Montplaisir 1073","lat":36.8320,"lng":10.1950,"phone":"+216 71 104 200","numero_vert":"80100295","email":"brc@cnam.nat.tn","services":["affiliation","remboursement","direction_generale"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-tunis-1","name":"Centre Local CNAM Tunis I","type":"cnam","subtype":"centre_local","governorate":"Tunis","city":"Tunis","address":"10, Rue Jean Jaurès, 1002 Tunis","lat":36.8060,"lng":10.1800,"phone":"+216 71 258 432","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-ariana","name":"Centre Local CNAM Ariana","type":"cnam","subtype":"centre_local","governorate":"Ariana","city":"Ariana","address":"Avenue Habib Bourguiba, Ariana","lat":36.8625,"lng":10.1956,"phone":"+216 71 710 500","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-ben-arous","name":"Centre Local CNAM Ben Arous","type":"cnam","subtype":"centre_local","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous","lat":36.7545,"lng":10.2189,"phone":"+216 71 380 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-sousse","name":"Centre Local CNAM Sousse","type":"cnam","subtype":"centre_local","governorate":"Sousse","city":"Sousse","address":"Rue Ernest Conseil, 4000 Sousse","lat":35.8256,"lng":10.6084,"phone":"+216 73 202 800","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-sfax","name":"Centre Local CNAM Sfax","type":"cnam","subtype":"centre_local","governorate":"Sfax","city":"Sfax","address":"Avenue Habib Bourguiba, Sfax","lat":34.7406,"lng":10.7603,"phone":"+216 74 210 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-monastir","name":"Centre Local CNAM Monastir","type":"cnam","subtype":"centre_local","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7833,"lng":10.8333,"phone":"+216 73 460 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-bizerte","name":"Centre Local CNAM Bizerte","type":"cnam","subtype":"centre_local","governorate":"Bizerte","city":"Bizerte","address":"Avenue Habib Bourguiba, Bizerte","lat":37.2740,"lng":9.8730,"phone":"+216 72 430 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-gabes","name":"Centre Local CNAM Gabès","type":"cnam","subtype":"centre_local","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, Gabès","lat":33.8815,"lng":10.0982,"phone":"+216 75 270 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-kairouan","name":"Centre Local CNAM Kairouan","type":"cnam","subtype":"centre_local","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan","lat":35.6781,"lng":10.0963,"phone":"+216 77 230 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-gafsa","name":"Centre Local CNAM Gafsa","type":"cnam","subtype":"centre_local","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4250,"lng":8.7842,"phone":"+216 76 220 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
    {"id":"cnam-nabeul","name":"Centre Local CNAM Nabeul","type":"cnam","subtype":"centre_local","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul","lat":36.4560,"lng":10.7350,"phone":"+216 72 220 600","services":["affiliation","remboursement","carte_cnam"],"opening_hours":"08:00-13:00"},
]

# ─────────────────────────────────────────────────────────────────────────────
# MINISTÈRES (7)
# ─────────────────────────────────────────────────────────────────────────────
_MINISTERES = [
    {"id":"min-interieur","name":"Ministère de l'Intérieur","type":"ministere","governorate":"Tunis","city":"Tunis","address":"Avenue Habib Bourguiba, 1000 Tunis","lat":36.7990,"lng":10.1850,"phone":"+216 71 333 000","services":["cin","passeport","permis_conduire","surete"],"opening_hours":"08:00-14:00","website":"http://www.interieur.gov.tn"},
    {"id":"min-justice","name":"Ministère de la Justice","type":"ministere","governorate":"Tunis","city":"Tunis","address":"Place du Gouvernement, La Kasbah, Tunis","lat":36.7975,"lng":10.1710,"phone":"+216 71 571 000","services":["tribunaux","casiers_judiciaires","notaires"],"opening_hours":"08:00-14:00","website":"http://www.justice.gov.tn"},
    {"id":"min-finances","name":"Ministère des Finances","type":"ministere","governorate":"Tunis","city":"Tunis","address":"Place du Gouvernement, La Kasbah, 1006 Tunis","lat":36.7975,"lng":10.1710,"phone":"+216 71 571 888","services":["impots","douanes","timbre_fiscal"],"opening_hours":"08:00-14:00","website":"http://www.finances.gov.tn"},
    {"id":"min-affaires-sociales","name":"Ministère des Affaires Sociales","type":"ministere","governorate":"Tunis","city":"Tunis","address":"27, Avenue Bab Bnet, 1006 Tunis","lat":36.8050,"lng":10.1750,"phone":"+216 71 333 000","services":["cnss","cnam","cnrps","affaires_sociales"],"opening_hours":"08:00-14:00","website":"http://www.social.gov.tn"},
    {"id":"min-transport","name":"Ministère du Transport et de la Logistique","type":"ministere","governorate":"Tunis","city":"Tunis","address":"Avenue de Paris, Tunis","lat":36.8065,"lng":10.1815,"phone":"+216 71 333 000","services":["transport","permis_conduire"],"opening_hours":"08:00-14:00"},
    {"id":"min-sante","name":"Ministère de la Santé","type":"ministere","governorate":"Tunis","city":"Tunis","address":"Avenue de Paris, Tunis","lat":36.8068,"lng":10.1818,"phone":"+216 71 577 000","services":["sante_publique","hopitaux","pharmacies"],"opening_hours":"08:00-14:00","website":"http://www.santetunisie.rns.tn"},
    {"id":"min-etranger","name":"Ministère des Affaires Étrangères","type":"ministere","governorate":"Tunis","city":"Tunis","address":"Avenue de La Ligue des États Arabes, Nord Hilton, 1030 Tunis","lat":36.8450,"lng":10.1950,"phone":"+216 71 847 500","services":["passeport","consulats","diplomatie"],"opening_hours":"08:00-14:00","website":"https://www.diplomatie.gov.tn"},
]

# ─────────────────────────────────────────────────────────────────────────────
# COMMISSARIATS DE POLICE (20)
# ─────────────────────────────────────────────────────────────────────────────
_POLICE = [
    {"id":"police-tunis-centre","name":"Commissariat de Police Tunis","type":"police","governorate":"Tunis","city":"Tunis","address":"Avenue Habib Bourguiba, Tunis","lat":36.7990,"lng":10.1850,"phone":"197","emergency":True,"services":["plaintes","renseignements","autorisations"],"opening_hours":"24/7"},
    {"id":"police-ariana","name":"Commissariat de Police Ariana","type":"police","governorate":"Ariana","city":"Ariana","address":"Avenue de la République, Ariana","lat":36.8625,"lng":10.1956,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-ben-arous","name":"Commissariat de Police Ben Arous","type":"police","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous","lat":36.7545,"lng":10.2189,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-la-marsa","name":"Commissariat de Police La Marsa","type":"police","governorate":"Tunis","city":"La Marsa","address":"Avenue Habib Bourguiba, La Marsa","lat":36.8781,"lng":10.3247,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-nabeul","name":"Commissariat de Police Nabeul","type":"police","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul","lat":36.4560,"lng":10.7350,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-bizerte","name":"Commissariat de Police Bizerte","type":"police","governorate":"Bizerte","city":"Bizerte","address":"Avenue Habib Bourguiba, Bizerte","lat":37.2740,"lng":9.8730,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-beja","name":"Commissariat de Police Béja","type":"police","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja","lat":36.7256,"lng":9.1817,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-jendouba","name":"Commissariat de Police Jendouba","type":"police","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba","lat":36.5011,"lng":8.7803,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-kairouan","name":"Commissariat de Police Kairouan","type":"police","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan","lat":35.6781,"lng":10.0963,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-sousse","name":"Commissariat de Police Sousse","type":"police","governorate":"Sousse","city":"Sousse","address":"Avenue Habib Bourguiba, Sousse","lat":35.8256,"lng":10.6084,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-monastir","name":"Commissariat de Police Monastir","type":"police","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7833,"lng":10.8333,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-mahdia","name":"Commissariat de Police Mahdia","type":"police","governorate":"Mahdia","city":"Mahdia","address":"Avenue Habib Bourguiba, Mahdia","lat":35.5047,"lng":11.0622,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-sfax","name":"Commissariat de Police Sfax","type":"police","governorate":"Sfax","city":"Sfax","address":"Avenue Habib Bourguiba, Sfax","lat":34.7406,"lng":10.7603,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-gabes","name":"Commissariat de Police Gabès","type":"police","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, Gabès","lat":33.8815,"lng":10.0982,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-medenine","name":"Commissariat de Police Médenine","type":"police","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine","lat":33.3549,"lng":10.5055,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-tataouine","name":"Commissariat de Police Tataouine","type":"police","governorate":"Tataouine","city":"Tataouine","address":"Avenue Habib Bourguiba, Tataouine","lat":32.9211,"lng":10.4509,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-gafsa","name":"Commissariat de Police Gafsa","type":"police","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4250,"lng":8.7842,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-tozeur","name":"Commissariat de Police Tozeur","type":"police","governorate":"Tozeur","city":"Tozeur","address":"Avenue Habib Bourguiba, Tozeur","lat":33.9197,"lng":8.1335,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-siliana","name":"Commissariat de Police Siliana","type":"police","governorate":"Siliana","city":"Siliana","address":"Avenue Habib Bourguiba, Siliana","lat":36.0844,"lng":9.3708,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
    {"id":"police-kef","name":"Commissariat de Police Le Kef","type":"police","governorate":"Le Kef","city":"Le Kef","address":"Avenue de la République, Le Kef","lat":36.1680,"lng":8.7150,"phone":"197","emergency":True,"services":["plaintes","renseignements"],"opening_hours":"24/7"},
]

# ─────────────────────────────────────────────────────────────────────────────
# TRIBUNAUX (20)
# ─────────────────────────────────────────────────────────────────────────────
_TRIBUNAUX = [
    {"id":"tpi-tunis","name":"Tribunal de Première Instance de Tunis","type":"tribunal","subtype":"tpi","governorate":"Tunis","city":"Tunis","address":"Avenue de Paris, Tunis","lat":36.8065,"lng":10.1815,"phone":"+216 71 333 000","services":["civil","penal","commercial","contentieux"],"opening_hours":"08:00-13:00"},
    {"id":"ca-tunis","name":"Cour d'Appel de Tunis","type":"tribunal","subtype":"ca","governorate":"Tunis","city":"Tunis","address":"Avenue de Paris, Tunis","lat":36.8068,"lng":10.1820,"phone":"+216 71 333 100","services":["appel_civil","appel_penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-ariana","name":"Tribunal de Première Instance de l'Ariana","type":"tribunal","subtype":"tpi","governorate":"Ariana","city":"Ariana","address":"Avenue de la République, Ariana","lat":36.8625,"lng":10.1956,"phone":"+216 71 710 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-ben-arous","name":"Tribunal de Première Instance de Ben Arous","type":"tribunal","subtype":"tpi","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous","lat":36.7545,"lng":10.2189,"phone":"+216 71 380 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-manouba","name":"Tribunal de Première Instance de La Manouba","type":"tribunal","subtype":"tpi","governorate":"La Manouba","city":"Manouba","address":"Av. Farhat Hached, Manouba","lat":36.8075,"lng":10.1015,"phone":"+216 71 600 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-nabeul","name":"Tribunal de Première Instance de Nabeul","type":"tribunal","subtype":"tpi","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul","lat":36.4560,"lng":10.7350,"phone":"+216 72 220 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-bizerte","name":"Tribunal de Première Instance de Bizerte","type":"tribunal","subtype":"tpi","governorate":"Bizerte","city":"Bizerte","address":"Avenue Habib Bourguiba, Bizerte","lat":37.2740,"lng":9.8730,"phone":"+216 72 431 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-beja","name":"Tribunal de Première Instance de Béja","type":"tribunal","subtype":"tpi","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja","lat":36.7256,"lng":9.1817,"phone":"+216 78 450 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-jendouba","name":"Tribunal de Première Instance de Jendouba","type":"tribunal","subtype":"tpi","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba","lat":36.5011,"lng":8.7803,"phone":"+216 78 630 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-kairouan","name":"Tribunal de Première Instance de Kairouan","type":"tribunal","subtype":"tpi","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan","lat":35.6781,"lng":10.0963,"phone":"+216 77 230 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-sousse","name":"Tribunal de Première Instance de Sousse","type":"tribunal","subtype":"tpi","governorate":"Sousse","city":"Sousse","address":"Avenue Mohamed Karoui, Sousse","lat":35.8256,"lng":10.6084,"phone":"+216 73 221 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-monastir","name":"Tribunal de Première Instance de Monastir","type":"tribunal","subtype":"tpi","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7833,"lng":10.8333,"phone":"+216 73 461 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-sfax","name":"Tribunal de Première Instance de Sfax","type":"tribunal","subtype":"tpi","governorate":"Sfax","city":"Sfax","address":"Avenue de Paris, Sfax","lat":34.7406,"lng":10.7603,"phone":"+216 74 210 700","services":["civil","penal","commercial"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-gabes","name":"Tribunal de Première Instance de Gabès","type":"tribunal","subtype":"tpi","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, Gabès","lat":33.8815,"lng":10.0982,"phone":"+216 75 270 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-medenine","name":"Tribunal de Première Instance de Médenine","type":"tribunal","subtype":"tpi","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine","lat":33.3549,"lng":10.5055,"phone":"+216 75 640 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-gafsa","name":"Tribunal de Première Instance de Gafsa","type":"tribunal","subtype":"tpi","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4250,"lng":8.7842,"phone":"+216 76 220 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-mahdia","name":"Tribunal de Première Instance de Mahdia","type":"tribunal","subtype":"tpi","governorate":"Mahdia","city":"Mahdia","address":"Avenue Habib Bourguiba, Mahdia","lat":35.5047,"lng":11.0622,"phone":"+216 73 680 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-tozeur","name":"Tribunal de Première Instance de Tozeur","type":"tribunal","subtype":"tpi","governorate":"Tozeur","city":"Tozeur","address":"Avenue Habib Bourguiba, Tozeur","lat":33.9197,"lng":8.1335,"phone":"+216 76 453 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-kef","name":"Tribunal de Première Instance du Kef","type":"tribunal","subtype":"tpi","governorate":"Le Kef","city":"Le Kef","address":"Avenue de la République, Le Kef","lat":36.1680,"lng":8.7150,"phone":"+216 78 221 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
    {"id":"tpi-siliana","name":"Tribunal de Première Instance de Siliana","type":"tribunal","subtype":"tpi","governorate":"Siliana","city":"Siliana","address":"Avenue Habib Bourguiba, Siliana","lat":36.0844,"lng":9.3708,"phone":"+216 78 870 700","services":["civil","penal"],"opening_hours":"08:00-13:00"},
]

# ─────────────────────────────────────────────────────────────────────────────
# Enrichissement & Agrégation
# ─────────────────────────────────────────────────────────────────────────────
def _enrich(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    result = []
    for e in entries:
        e = dict(e)
        cfg = TYPE_CONFIG.get(e.get("type", ""), {})
        e["type_label"]  = cfg.get("label", e.get("type", ""))
        e["type_emoji"]  = cfg.get("emoji", "🏢")
        e["type_color"]  = cfg.get("color", "#607D8B")
        e.setdefault("subtype", None)
        e.setdefault("email", None)
        e.setdefault("fax", None)
        e.setdefault("website", None)
        e.setdefault("numero_vert", None)
        e.setdefault("emergency", False)
        e.setdefault("has_etat_civil", False)
        e.setdefault("opening_hours_ramadan", "08:00-14:00")
        e.setdefault("opening_hours_summer", "07:30-13:00")
        # Tags
        tags = [f"{cfg.get('emoji','')} {cfg.get('label','')}"]
        if e.get("has_etat_civil"):   tags.append("📋 État civil")
        if e.get("emergency"):        tags.append("🚨 Urgences 24h")
        if "etat_civil" in e.get("services",[]): tags.append("📋 État civil")
        if "affiliation" in e.get("services",[]): tags.append("👥 Affiliation")
        e["tags"] = list(dict.fromkeys(tags))  # deduplicate
        result.append(e)
    return result

_ALL_ADMIN: List[Dict[str, Any]] = _enrich(
    _GOUVERNORATS + _MUNICIPALITES + _DELEGATIONS +
    _POST_OFFICES + _CNSS + _CNAM +
    _MINISTERES + _POLICE + _TRIBUNAUX
)


def load_all_admin() -> List[Dict[str, Any]]:
    """Retourne tous les établissements administratifs (données embarquées)."""
    return _ALL_ADMIN


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


def get_nearby_admin(lat: float, lng: float, radius_km: float = 5.0,
                     admin_type: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    results = []
    for e in _ALL_ADMIN:
        if admin_type and e.get("type") != admin_type:
            continue
        dist = _haversine_km(lat, lng, e.get("lat", 0), e.get("lng", 0))
        if dist <= radius_km:
            results.append({**e, "distance_km": round(dist, 2), "walk_min": round(dist/5*60)})
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]
