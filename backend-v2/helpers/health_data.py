"""
helpers/health_data.py — Données des établissements de santé embarquées directement.
Pas de fichiers JSON externes : données inline pour garantir la disponibilité dans Docker.
"""
import math
from typing import List, Dict, Any, Optional

TYPE_LABELS: Dict[str, str] = {
    "chu":                    "CHU — Centre Hospitalier Universitaire",
    "hopital_regional":       "Hôpital Régional",
    "hopital_circonscription":"Hôpital de Circonscription",
    "clinique":               "Clinique Privée",
    "centre_sante":           "Centre de Santé de Base (CSB)",
    "institut_specialise":    "Institut Spécialisé",
    "centre_specialise":      "Centre Spécialisé",
    "centre_dialyse":         "Centre de Dialyse",
    "laboratoire":            "Laboratoire d'Analyses",
    "pharmacie":              "Pharmacie",
}

SECTOR_LABELS: Dict[str, str] = {"public": "Public", "prive": "Privé"}

# ─────────────────────────────────────────────────────────────────────────────
# DONNÉES EMBARQUÉES — Hôpitaux publics
# ─────────────────────────────────────────────────────────────────────────────
_HOSPITALS_PUBLIC = [
    {"id":"chu-charles-nicolle","name":"Hôpital Charles-Nicolle","type":"chu","sector":"public","governorate":"Tunis","city":"Tunis","address":"Rue 9 Avril, Bab Saadoun, Tunis 1006","lat":36.8065,"lng":10.1815,"phone":"+216 71 578 000","specialties":["urgences","chirurgie","médecine interne","pédiatrie","cardiologie"],"services":["urgences 24h","scanner","IRM"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":1200},
    {"id":"hopital-la-rabta","name":"Hôpital La Rabta","type":"chu","sector":"public","governorate":"Tunis","city":"Tunis","address":"La Rabta, Tunis 1007","lat":36.8080,"lng":10.1620,"phone":"+216 71 262 083","specialties":["pneumologie","phtisiologie","urgences","médecine interne"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":600},
    {"id":"hopital-habib-thameur","name":"Hôpital Habib-Thameur","type":"chu","sector":"public","governorate":"Tunis","city":"Tunis","address":"20 Rue de l'Hôpital, Tunis","lat":36.8010,"lng":10.1700,"phone":"+216 71 245 000","specialties":["cardiologie","chirurgie cardiaque","urgences"],"services":["urgences 24h","chirurgie cardiaque"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":450},
    {"id":"hopital-aziza-othmana","name":"Hôpital Aziza Othmana","type":"chu","sector":"public","governorate":"Tunis","city":"Tunis","address":"Place du Gouvernement, La Kasbah, Tunis 1008","lat":36.7975,"lng":10.1710,"phone":"+216 71 260 000","specialties":["urgences","chirurgie","gynécologie","obstétrique"],"services":["urgences 24h","maternité"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":500},
    {"id":"hopital-mongi-slim","name":"Hôpital Mongi-Slim","type":"hopital_regional","sector":"public","governorate":"Ariana","city":"La Marsa","address":"Avenue de la Corniche, La Marsa","lat":36.8890,"lng":10.3230,"phone":"+216 71 740 000","specialties":["rééducation","traumatologie","orthopédie"],"services":["urgences","rééducation"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":300},
    {"id":"chu-sousse-farhat-hached","name":"CHU Farhat-Hached de Sousse","type":"chu","sector":"public","governorate":"Sousse","city":"Sousse","address":"Avenue Mohamed Karoui, Sousse","lat":35.8256,"lng":10.6084,"phone":"+216 73 221 000","specialties":["urgences","chirurgie","orthopédie","cardiologie"],"services":["urgences 24h","scanner"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":700},
    {"id":"chu-sfax-habib-bourguiba","name":"CHU Habib-Bourguiba de Sfax","type":"chu","sector":"public","governorate":"Sfax","city":"Sfax","address":"Route El Ain km 0.5, Sfax","lat":34.7406,"lng":10.7603,"phone":"+216 74 246 000","specialties":["urgences","chirurgie","néphrologie","cardiologie"],"services":["urgences 24h","dialyse","scanner"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":800},
    {"id":"chu-monastir-fattouma","name":"CHU Fattouma-Bourguiba de Monastir","type":"chu","sector":"public","governorate":"Monastir","city":"Monastir","address":"Avenue Farhat-Hached, Monastir","lat":35.7833,"lng":10.8333,"phone":"+216 73 460 000","specialties":["urgences","chirurgie","odontologie","médecine interne"],"services":["urgences 24h","scanner"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":500},
    {"id":"chu-nabeul-taher-maamouri","name":"CHU Taher-Maamouri de Nabeul","type":"chu","sector":"public","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul","lat":36.4560,"lng":10.7350,"phone":"+216 72 220 000","specialties":["urgences","chirurgie","médecine interne"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":350},
    {"id":"chu-bizerte","name":"CHU de Bizerte","type":"chu","sector":"public","governorate":"Bizerte","city":"Bizerte","address":"Route de Tunis, Bizerte","lat":37.2740,"lng":9.8730,"phone":"+216 72 431 000","specialties":["urgences","chirurgie","cardiologie"],"services":["urgences 24h","scanner"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"universitaire","beds":400},
    {"id":"hopital-gabes","name":"Hôpital Régional de Gabès","type":"hopital_regional","sector":"public","governorate":"Gabès","city":"Gabès","address":"Avenue Habib Bourguiba, Gabès","lat":33.8815,"lng":10.0982,"phone":"+216 75 270 000","specialties":["urgences","chirurgie","pédiatrie"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":300},
    {"id":"hopital-kairouan","name":"Hôpital Régional de Kairouan","type":"hopital_regional","sector":"public","governorate":"Kairouan","city":"Kairouan","address":"Route de Tunis, Kairouan","lat":35.6781,"lng":10.0963,"phone":"+216 77 230 000","specialties":["urgences","chirurgie","médecine interne"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":280},
    {"id":"hopital-mahdia","name":"Hôpital Régional de Mahdia","type":"hopital_regional","sector":"public","governorate":"Mahdia","city":"Mahdia","address":"Route de Sousse, Mahdia","lat":35.5047,"lng":11.0622,"phone":"+216 73 680 000","specialties":["urgences","chirurgie","gynécologie"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":220},
    {"id":"hopital-jendouba","name":"Hôpital Régional de Jendouba","type":"hopital_regional","sector":"public","governorate":"Jendouba","city":"Jendouba","address":"Route de Tunis, Jendouba","lat":36.5011,"lng":8.7803,"phone":"+216 78 630 000","specialties":["urgences","chirurgie"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":180},
    {"id":"hopital-gafsa","name":"Hôpital Régional de Gafsa","type":"hopital_regional","sector":"public","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4250,"lng":8.7842,"phone":"+216 76 220 000","specialties":["urgences","chirurgie","médecine interne"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":250},
    {"id":"hopital-tozeur","name":"Hôpital Régional de Tozeur","type":"hopital_regional","sector":"public","governorate":"Tozeur","city":"Tozeur","address":"Route de Gafsa, Tozeur","lat":33.9197,"lng":8.1335,"phone":"+216 76 453 000","specialties":["urgences","chirurgie","médecine générale"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":150},
    {"id":"hopital-beja","name":"Hôpital Régional de Béja","type":"hopital_regional","sector":"public","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja","lat":36.7256,"lng":9.1817,"phone":"+216 78 450 000","specialties":["urgences","chirurgie","pédiatrie"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":200},
    {"id":"hopital-siliana","name":"Hôpital Régional de Siliana","type":"hopital_regional","sector":"public","governorate":"Siliana","city":"Siliana","address":"Route de Tunis, Siliana","lat":36.0844,"lng":9.3708,"phone":"+216 78 870 000","specialties":["urgences","médecine générale","chirurgie"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":120},
    {"id":"hopital-medenine","name":"Hôpital Régional de Médenine","type":"hopital_regional","sector":"public","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine","lat":33.3549,"lng":10.5055,"phone":"+216 75 640 000","specialties":["urgences","chirurgie","médecine interne"],"services":["urgences 24h"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"level":"regional","beds":200},
    {"id":"hopital-psychiatrie-razi","name":"Hôpital Psychiatrique Razi","type":"hopital_circonscription","sector":"public","governorate":"La Manouba","city":"Manouba","address":"Hôpital Razi, La Manouba 2010","lat":36.8075,"lng":10.0980,"phone":"+216 71 600 755","specialties":["psychiatrie","psychologie","neuropsychiatrie"],"services":["hospitalisation","consultations","urgences psychiatriques"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"beds":1200},
]

# ─────────────────────────────────────────────────────────────────────────────
# Cliniques privées
# ─────────────────────────────────────────────────────────────────────────────
_CLINICS_PRIVATE = [
    {"id":"clinique-taoufik","name":"Clinique Taoufik","type":"clinique","sector":"prive","governorate":"Tunis","city":"Tunis","address":"Boulevard Mohamed Bouazizi, Tunis 1004","lat":36.8060,"lng":10.1790,"phone":"+216 36 411 411","specialties":["ophtalmologie","chirurgie","médecine générale"],"services":["consultations","chirurgie ambulatoire"],"has_emergency":False,"opening_hours":"08:00-18:00","cnam_convention":True,"beds":180},
    {"id":"clinique-carthagene","name":"Centre Hospitalier Int. Carthagène","type":"clinique","sector":"prive","governorate":"Tunis","city":"Tunis","address":"Centre Urbain Nord, 1082 Tunis","lat":36.8450,"lng":10.1950,"phone":"+216 31 336 336","specialties":["pluridisciplinaire","cardiologie","chirurgie","réanimation"],"services":["consultations","hospitalisation","urgences","scanner","IRM"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"beds":120},
    {"id":"clinique-el-amen-marsa","name":"Clinique El Amen La Marsa","type":"clinique","sector":"prive","governorate":"Tunis","city":"La Marsa","address":"15 Avenue de la République, La Marsa","lat":36.8890,"lng":10.3230,"phone":"+216 71 749 000","specialties":["pluridisciplinaire","gynécologie","chirurgie","pédiatrie"],"services":["consultations","hospitalisation","maternité"],"has_emergency":False,"opening_hours":"08:00-20:00","cnam_convention":True,"beds":80},
    {"id":"clinique-pasteur","name":"Clinique Pasteur","type":"clinique","sector":"prive","governorate":"Tunis","city":"Tunis","address":"Centre Urbain Nord, Tunis","lat":36.8440,"lng":10.1970,"phone":"+216 36 402 000","specialties":["pluridisciplinaire","cardiologie","chirurgie vasculaire"],"services":["consultations","hospitalisation","cathétérisme"],"has_emergency":False,"opening_hours":"08:00-18:00","cnam_convention":True,"beds":100},
    {"id":"clinique-alyssa","name":"Clinique Alyssa","type":"clinique","sector":"prive","governorate":"Tunis","city":"Les Berges du Lac","address":"Rue du Lac Léman, 1053 Les Berges du Lac","lat":36.8320,"lng":10.2350,"phone":"+216 71 962 555","specialties":["pluridisciplinaire","chirurgie esthétique","orthopédie"],"services":["consultations","hospitalisation","bloc opératoire"],"has_emergency":False,"opening_hours":"08:00-18:00","cnam_convention":True,"beds":80},
    {"id":"clinique-narcisses","name":"Clinique Les Narcisses","type":"clinique","sector":"prive","governorate":"Ariana","city":"Ennasr 2","address":"50 Avenue de l'Ère Nouvelle, Ennasr 2","lat":36.8530,"lng":10.1650,"phone":"+216 70 248 800","specialties":["pluridisciplinaire","chirurgie","neurochirurgie"],"services":["consultations","hospitalisation","urgences"],"has_emergency":True,"opening_hours":"08:00-20:00","cnam_convention":True,"beds":60},
    {"id":"clinique-hannibal","name":"Clinique Hannibal","type":"clinique","sector":"prive","governorate":"Tunis","city":"Tunis","address":"Rue de la Bourse, Mutuelle Ville, Tunis","lat":36.8075,"lng":10.1755,"phone":"+216 71 280 000","specialties":["urologie","chirurgie","médecine interne"],"services":["consultations","hospitalisation"],"has_emergency":False,"opening_hours":"08:00-18:00","cnam_convention":True,"beds":70},
    {"id":"clinique-el-hayat-sousse","name":"Clinique El Hayat Sousse","type":"clinique","sector":"prive","governorate":"Sousse","city":"Sousse","address":"Avenue Habib Bourguiba, Sousse","lat":35.8320,"lng":10.6150,"phone":"+216 73 230 000","specialties":["pluridisciplinaire","cardiologie","chirurgie"],"services":["consultations","hospitalisation"],"has_emergency":False,"opening_hours":"08:00-18:00","cnam_convention":True,"beds":100},
    {"id":"clinique-ibn-nafis-sfax","name":"Clinique Ibn-Nafis Sfax","type":"clinique","sector":"prive","governorate":"Sfax","city":"Sfax","address":"Route de Mahdia, Sfax","lat":34.7550,"lng":10.7650,"phone":"+216 74 431 000","specialties":["pluridisciplinaire","cardiologie","chirurgie vasculaire"],"services":["consultations","hospitalisation","scanner"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"beds":130},
    {"id":"clinique-monastir-prive","name":"Clinique Privée de Monastir","type":"clinique","sector":"prive","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7700,"lng":10.8150,"phone":"+216 73 500 000","specialties":["pluridisciplinaire","gynécologie","pédiatrie"],"services":["consultations","hospitalisation","maternité"],"has_emergency":False,"opening_hours":"08:00-20:00","cnam_convention":True,"beds":70},
]

# ─────────────────────────────────────────────────────────────────────────────
# Centres de santé de base (CSB)
# ─────────────────────────────────────────────────────────────────────────────
_CSB = [
    {"id":"csb-bab-bhar","name":"CSB Bab El Bhar","type":"centre_sante","sector":"public","governorate":"Tunis","city":"Tunis","address":"Rue de la Kasbah, Tunis","lat":36.7990,"lng":10.1740,"phone":"+216 71 320 000","specialties":["médecine générale","vaccination","pédiatrie"],"services":["consultations","vaccination","soins infirmiers","planning familial"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-bab-souika","name":"CSB Bab Souika","type":"centre_sante","sector":"public","governorate":"Tunis","city":"Tunis","address":"Rue Bab Souika, Tunis","lat":36.8020,"lng":10.1690,"phone":"+216 71 321 000","specialties":["médecine générale","gynécologie","vaccination"],"services":["consultations","vaccination","soins infirmiers"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-ariana-centre","name":"CSB Ariana Centre","type":"centre_sante","sector":"public","governorate":"Ariana","city":"Ariana","address":"Avenue de la République, Ariana","lat":36.8625,"lng":10.1956,"phone":"+216 71 713 000","specialties":["médecine générale","pédiatrie","vaccination"],"services":["consultations","vaccination","planning familial"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-ennasr","name":"CSB Ennasr","type":"centre_sante","sector":"public","governorate":"Ariana","city":"Ennasr","address":"Avenue de l'Ère Nouvelle, Ennasr","lat":36.8550,"lng":10.1680,"phone":"+216 71 715 000","specialties":["médecine générale","pédiatrie"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-ben-arous","name":"CSB Ben Arous","type":"centre_sante","sector":"public","governorate":"Ben Arous","city":"Ben Arous","address":"Avenue Habib Bourguiba, Ben Arous","lat":36.7545,"lng":10.2189,"phone":"+216 71 381 000","specialties":["médecine générale","pédiatrie","gynécologie"],"services":["consultations","vaccination","soins infirmiers"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-manouba","name":"CSB Manouba","type":"centre_sante","sector":"public","governorate":"La Manouba","city":"Manouba","address":"Avenue Farhat Hached, Manouba","lat":36.8085,"lng":10.1015,"phone":"+216 71 601 000","specialties":["médecine générale","vaccination","pédiatrie"],"services":["consultations","vaccination","planning familial"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-la-marsa","name":"CSB La Marsa","type":"centre_sante","sector":"public","governorate":"Tunis","city":"La Marsa","address":"Avenue Habib Bourguiba, La Marsa","lat":36.8781,"lng":10.3247,"phone":"+216 71 742 000","specialties":["médecine générale","pédiatrie"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-lac-berges","name":"CSB Les Berges du Lac","type":"centre_sante","sector":"public","governorate":"Tunis","city":"Les Berges du Lac","address":"Rue du Lac Victoria, Les Berges du Lac","lat":36.8340,"lng":10.2330,"phone":"+216 71 960 000","specialties":["médecine générale","vaccination"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-17:00","cnam_convention":True},
    {"id":"csb-sousse-centre","name":"CSB Sousse Centre","type":"centre_sante","sector":"public","governorate":"Sousse","city":"Sousse","address":"Rue Mohamed Ali, Sousse","lat":35.8290,"lng":10.6120,"phone":"+216 73 213 000","specialties":["médecine générale","pédiatrie","gynécologie"],"services":["consultations","vaccination","soins infirmiers"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-sfax-ville","name":"CSB Sfax Ville","type":"centre_sante","sector":"public","governorate":"Sfax","city":"Sfax","address":"Avenue Habib Bourguiba, Sfax","lat":34.7490,"lng":10.7610,"phone":"+216 74 220 000","specialties":["médecine générale","pédiatrie","vaccination"],"services":["consultations","vaccination","soins infirmiers"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-bizerte-ville","name":"CSB Bizerte Ville","type":"centre_sante","sector":"public","governorate":"Bizerte","city":"Bizerte","address":"Avenue Habib Bourguiba, Bizerte","lat":37.2744,"lng":9.8739,"phone":"+216 72 431 000","specialties":["médecine générale","pédiatrie","vaccination"],"services":["consultations","vaccination","soins infirmiers"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-kairouan","name":"CSB Kairouan Centre","type":"centre_sante","sector":"public","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan","lat":35.6781,"lng":10.0963,"phone":"+216 77 231 000","specialties":["médecine générale","pédiatrie"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-monastir","name":"CSB Monastir Centre","type":"centre_sante","sector":"public","governorate":"Monastir","city":"Monastir","address":"Avenue Farhat Hached, Monastir","lat":35.7643,"lng":10.8113,"phone":"+216 73 460 000","specialties":["médecine générale","gynécologie","pédiatrie"],"services":["consultations","vaccination","planning familial"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-nabeul","name":"CSB Nabeul Centre","type":"centre_sante","sector":"public","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul","lat":36.4560,"lng":10.7350,"phone":"+216 72 220 000","specialties":["médecine générale","pédiatrie"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-hammamet","name":"CSB Hammamet","type":"centre_sante","sector":"public","governorate":"Nabeul","city":"Hammamet","address":"Avenue de la République, Hammamet","lat":36.4000,"lng":10.6100,"phone":"+216 72 280 000","specialties":["médecine générale","pédiatrie","vaccination"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-gabes","name":"CSB Gabès Centre","type":"centre_sante","sector":"public","governorate":"Gabès","city":"Gabès","address":"Rue Habib Bourguiba, Gabès","lat":33.8815,"lng":10.0982,"phone":"+216 75 270 000","specialties":["médecine générale","pédiatrie"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-medenine","name":"CSB Médenine Centre","type":"centre_sante","sector":"public","governorate":"Médenine","city":"Médenine","address":"Avenue Habib Bourguiba, Médenine","lat":33.3549,"lng":10.5055,"phone":"+216 75 640 000","specialties":["médecine générale","vaccination"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-jendouba","name":"CSB Jendouba Centre","type":"centre_sante","sector":"public","governorate":"Jendouba","city":"Jendouba","address":"Avenue Habib Bourguiba, Jendouba","lat":36.5011,"lng":8.7803,"phone":"+216 78 630 000","specialties":["médecine générale","pédiatrie","vaccination"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-gafsa","name":"CSB Gafsa Centre","type":"centre_sante","sector":"public","governorate":"Gafsa","city":"Gafsa","address":"Avenue Habib Bourguiba, Gafsa","lat":34.4250,"lng":8.7842,"phone":"+216 76 220 000","specialties":["médecine générale","vaccination"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
    {"id":"csb-beja","name":"CSB Béja Centre","type":"centre_sante","sector":"public","governorate":"Béja","city":"Béja","address":"Avenue Habib Bourguiba, Béja","lat":36.7256,"lng":9.1817,"phone":"+216 78 450 000","specialties":["médecine générale","pédiatrie"],"services":["consultations","vaccination"],"has_emergency":False,"opening_hours":"08:00-14:00","cnam_convention":True},
]

# ─────────────────────────────────────────────────────────────────────────────
# Centres spécialisés, instituts, dialyse, labos
# ─────────────────────────────────────────────────────────────────────────────
_SPECIALIZED = [
    {"id":"institut-ophtalmo","name":"Institut Hédi-Raïs d'Ophtalmologie","type":"institut_specialise","sector":"public","governorate":"Tunis","city":"Tunis","address":"Bab Saadoun, Tunis","lat":36.8095,"lng":10.1645,"phone":"+216 71 578 000","specialties":["ophtalmologie","chirurgie réfractive","cataracte"],"services":["consultations","chirurgie laser","bloc opératoire"],"has_emergency":False,"opening_hours":"08:00-16:00","cnam_convention":True},
    {"id":"institut-neurologie","name":"Institut National de Neurologie Mongi-Ben-Hamida","type":"institut_specialise","sector":"public","governorate":"La Manouba","city":"La Manouba","address":"Hôpital Razi, La Manouba","lat":36.8080,"lng":10.1000,"phone":"+216 71 603 000","specialties":["neurologie","neurochirurgie","épileptologie"],"services":["consultations","hospitalisation","EEG","IRM"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True},
    {"id":"institut-kassab","name":"Institut Mohamed-Kassab d'Orthopédie","type":"institut_specialise","sector":"public","governorate":"Tunis","city":"Ksar Saïd","address":"Ksar Saïd, Manouba","lat":36.8500,"lng":10.1800,"phone":"+216 71 705 000","specialties":["orthopédie","traumatologie","rééducation"],"services":["consultations","chirurgie","rééducation","kinésithérapie"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True},
    {"id":"centre-grands-brulures","name":"Centre Traumatologie & Grands Brûlés","type":"centre_specialise","sector":"public","governorate":"Ben Arous","city":"Ben Arous","address":"Ben Arous, Tunis","lat":36.7500,"lng":10.2200,"phone":"+216 71 382 000","specialties":["traumatologie","chirurgie plastique","grands brûlés","réanimation"],"services":["urgences 24h","chirurgie","soins intensifs","greffes de peau"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True},
    {"id":"centre-dialyse-tunis","name":"Centre de Dialyse de Tunis","type":"centre_dialyse","sector":"public","governorate":"Tunis","city":"Tunis","address":"Boulevard du 9 Avril, Tunis","lat":36.8050,"lng":10.1810,"phone":"+216 71 560 000","specialties":["néphrologie","dialyse","greffe rénale"],"services":["hémodialyse","dialyse péritonéale","consultations"],"has_emergency":False,"opening_hours":"06:00-22:00","cnam_convention":True},
    {"id":"centre-dialyse-sfax","name":"Centre de Dialyse de Sfax","type":"centre_dialyse","sector":"public","governorate":"Sfax","city":"Sfax","address":"CHU Habib-Bourguiba, Sfax","lat":34.7406,"lng":10.7603,"phone":"+216 74 246 000","specialties":["néphrologie","dialyse"],"services":["hémodialyse","consultations"],"has_emergency":False,"opening_hours":"06:00-22:00","cnam_convention":True},
    {"id":"institut-pasteur","name":"Institut Pasteur de Tunis","type":"laboratoire","sector":"public","governorate":"Tunis","city":"Tunis","address":"13 Place Pasteur, Tunis 1002","lat":36.8110,"lng":10.1840,"phone":"+216 71 793 755","specialties":["microbiologie","virologie","immunologie","analyses médicales"],"services":["analyses biologiques","sérologie","bactériologie"],"has_emergency":False,"opening_hours":"08:00-16:00","cnam_convention":False},
    {"id":"labo-bioanalyse-lac","name":"Laboratoire Bioanalyse — Berges du Lac","type":"laboratoire","sector":"prive","governorate":"Tunis","city":"Les Berges du Lac","address":"Rue du Lac Marechal, Les Berges du Lac","lat":36.8360,"lng":10.2310,"phone":"+216 71 962 100","specialties":["analyses biologiques","biochimie","hématologie","microbiologie"],"services":["prélèvements","analyses rapides","résultats en ligne"],"has_emergency":False,"opening_hours":"07:00-18:00","cnam_convention":True},
]

# ─────────────────────────────────────────────────────────────────────────────
# Pharmacies
# ─────────────────────────────────────────────────────────────────────────────
_PHARMACIES = [
    {"id":"pharmacie-habib-bourguiba","name":"Pharmacie Habib Bourguiba","type":"pharmacie","sector":"prive","governorate":"Tunis","city":"Tunis","address":"19 Avenue Habib Bourguiba, Tunis","lat":36.7990,"lng":10.1850,"phone":"+216 71 333 000","specialties":["pharmacie"],"services":["médicaments","conseil pharmaceutique","garde"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"is_on_duty":True},
    {"id":"pharmacie-lac","name":"Pharmacie des Berges du Lac","type":"pharmacie","sector":"prive","governorate":"Tunis","city":"Les Berges du Lac","address":"Rue du Lac Victoria, Les Berges du Lac","lat":36.8350,"lng":10.2320,"phone":"+216 71 960 120","specialties":["pharmacie","parapharmacie"],"services":["médicaments","cosmétiques","conseil"],"has_emergency":False,"opening_hours":"08:30-20:00","cnam_convention":True,"is_on_duty":False},
    {"id":"pharmacie-marsa","name":"Pharmacie La Marsa Centre","type":"pharmacie","sector":"prive","governorate":"Tunis","city":"La Marsa","address":"Avenue Habib Bourguiba, La Marsa","lat":36.8770,"lng":10.3230,"phone":"+216 71 742 500","specialties":["pharmacie","homéopathie"],"services":["médicaments","conseil pharmaceutique"],"has_emergency":False,"opening_hours":"08:00-20:00","cnam_convention":True,"is_on_duty":False},
    {"id":"pharmacie-garde-sousse","name":"Pharmacie de Garde Sousse","type":"pharmacie","sector":"prive","governorate":"Sousse","city":"Sousse","address":"Avenue Habib Bourguiba, Sousse","lat":35.8256,"lng":10.6084,"phone":"+216 73 222 000","specialties":["pharmacie"],"services":["médicaments","garde","conseil"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"is_on_duty":True},
    {"id":"pharmacie-garde-sfax","name":"Pharmacie de Garde Sfax","type":"pharmacie","sector":"prive","governorate":"Sfax","city":"Sfax","address":"Avenue Habib Bourguiba, Sfax","lat":34.7490,"lng":10.7680,"phone":"+216 74 224 000","specialties":["pharmacie"],"services":["médicaments","garde"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"is_on_duty":True},
    {"id":"pharmacie-garde-bizerte","name":"Pharmacie de Garde Bizerte","type":"pharmacie","sector":"prive","governorate":"Bizerte","city":"Bizerte","address":"Avenue Habib Bourguiba, Bizerte","lat":37.2744,"lng":9.8739,"phone":"+216 72 430 000","specialties":["pharmacie"],"services":["médicaments","garde"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"is_on_duty":True},
    {"id":"pharmacie-ariana","name":"Pharmacie Ariana Centre","type":"pharmacie","sector":"prive","governorate":"Ariana","city":"Ariana","address":"Avenue de la République, Ariana","lat":36.8625,"lng":10.1956,"phone":"+216 71 710 000","specialties":["pharmacie","parapharmacie"],"services":["médicaments","conseil"],"has_emergency":False,"opening_hours":"08:00-20:00","cnam_convention":True,"is_on_duty":False},
    {"id":"pharmacie-monastir","name":"Pharmacie de Garde Monastir","type":"pharmacie","sector":"prive","governorate":"Monastir","city":"Monastir","address":"Avenue de l'Indépendance, Monastir","lat":35.7643,"lng":10.8113,"phone":"+216 73 461 000","specialties":["pharmacie"],"services":["médicaments","garde"],"has_emergency":True,"opening_hours":"24/7","cnam_convention":True,"is_on_duty":True},
    {"id":"pharmacie-nabeul","name":"Pharmacie Nabeul Centre","type":"pharmacie","sector":"prive","governorate":"Nabeul","city":"Nabeul","address":"Avenue Habib Bourguiba, Nabeul","lat":36.4561,"lng":10.7376,"phone":"+216 72 285 000","specialties":["pharmacie"],"services":["médicaments","conseil"],"has_emergency":False,"opening_hours":"08:00-20:00","cnam_convention":True,"is_on_duty":False},
    {"id":"pharmacie-kairouan","name":"Pharmacie Kairouan Centre","type":"pharmacie","sector":"prive","governorate":"Kairouan","city":"Kairouan","address":"Avenue Ali Belhouane, Kairouan","lat":35.6781,"lng":10.0963,"phone":"+216 77 230 500","specialties":["pharmacie"],"services":["médicaments","conseil"],"has_emergency":False,"opening_hours":"08:00-20:00","cnam_convention":True,"is_on_duty":False},
]

# ─────────────────────────────────────────────────────────────────────────────
# Agrégation + enrichissement
# ─────────────────────────────────────────────────────────────────────────────
def _enrich(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    result = []
    for e in entries:
        e = dict(e)
        e["type_label"]   = TYPE_LABELS.get(e.get("type", ""), e.get("type", ""))
        e["sector_label"] = SECTOR_LABELS.get(e.get("sector", ""), e.get("sector", ""))
        e.setdefault("beds", None)
        e.setdefault("level", None)
        e.setdefault("is_on_duty", False)
        tags = []
        if e.get("has_emergency"):       tags.append("🚨 Urgences 24h")
        if e.get("cnam_convention"):     tags.append("✅ CNAM")
        if e.get("level") == "universitaire": tags.append("🎓 Universitaire")
        if e.get("is_on_duty"):          tags.append("💊 Pharmacie de garde")
        e["tags"] = tags
        result.append(e)
    return result


# Chargement au démarrage du module
_ALL_ESTABLISHMENTS: List[Dict[str, Any]] = _enrich(
    _HOSPITALS_PUBLIC + _CLINICS_PRIVATE + _CSB + _SPECIALIZED + _PHARMACIES
)


def load_all_establishments() -> List[Dict[str, Any]]:
    """Retourne tous les établissements (données embarquées, pas de I/O)."""
    return _ALL_ESTABLISHMENTS


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_nearby_health(
    lat: float, lng: float,
    radius_km: float = 10.0,
    facility_type: Optional[str] = None,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    results = []
    for e in _ALL_ESTABLISHMENTS:
        if facility_type and e.get("type") != facility_type:
            continue
        dist = _haversine_km(lat, lng, e.get("lat", 0), e.get("lng", 0))
        if dist <= radius_km:
            results.append({**e, "distance_km": round(dist, 2), "walk_min": round(dist / 5 * 60)})
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]
