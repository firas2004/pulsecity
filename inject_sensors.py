import sqlite3, sys

DB = "/app/data/pulsecity.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Fetch all existing city ids
cur.execute("SELECT id FROM cities")
cities = [r[0] for r in cur.fetchall()]
print(f"Cities found: {cities}")

# The 8 sensor types missing from every city
NEW_SENSORS = [
    # type,          unit,           min_n, max_n, min_a,  max_a
    ("temperature",   "°C",          12.0,  38.0,  45.0,   55.0),
    ("humidity",      "%",           30.0,  75.0,  90.0,  100.0),
    ("wind_speed",    "km/h",         5.0,  40.0,  80.0,  130.0),
    ("pedestrian",    "people/min",   5.0, 200.0, 400.0,  700.0),
    ("waste_fill",    "%",            0.0,  70.0,  85.0,  100.0),
    ("water_quality", "pH",           6.5,   8.5,   9.5,   11.0),
    ("parking",       "%",           20.0,  95.0,   0.0,    5.0),
    ("foot_traffic",  "people/min",  10.0, 250.0, 450.0,  700.0),
]

inserted = 0
skipped  = 0
for city_id in cities:
    for (stype, unit, min_n, max_n, min_a, max_a) in NEW_SENSORS:
        sensor_id = f"{city_id}-{stype}-001"
        # Check if already present
        cur.execute("SELECT id FROM sensors WHERE id = ?", (sensor_id,))
        if cur.fetchone():
            skipped += 1
            continue
        cur.execute("""
            INSERT INTO sensors
                (id, type, city_id, unit, min_normal, max_normal,
                 min_anomaly, max_anomaly, enabled)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (sensor_id, stype, city_id, unit, min_n, max_n, min_a, max_a))
        inserted += 1

conn.commit()
conn.close()
print(f"Done — inserted {inserted} sensors, skipped {skipped} already-existing.")

# Verify
conn2 = sqlite3.connect(DB)
cur2 = conn2.cursor()
cur2.execute("SELECT type, COUNT(*) FROM sensors GROUP BY type ORDER BY type")
for row in cur2.fetchall():
    print(f"  {row[0]:20s} : {row[1]} sensors")
conn2.close()
