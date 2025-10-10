import argparse
import random
import string
from typing import List, Tuple
from datetime import datetime, timedelta

import pandas as pd


def gaussian_clamped(rng: random.Random, mu: float, sigma: float, a: float, b: float) -> float:
    val = rng.gauss(mu, sigma)
    if val < a:
        return a
    if val > b:
        return b
    return val


COLORS: List[str] = ["white", "red", "orange"]

GRAPES_BY_COLOR: dict[str, List[str]] = {
    "white": [
        "Chardonnay", "Sauvignon Blanc", "Riesling", "Chenin Blanc", "Pinot Gris",
        "Albarino", "Viognier", "Gewurztraminer", "Semillon", "Muscadet",
    ],
    "red": [
        "Pinot Noir", "Merlot", "Cabernet Sauvignon", "Syrah", "Grenache",
        "Sangiovese", "Tempranillo", "Nebbiolo", "Malbec", "Zinfandel",
    ],
    "orange": [
        "Rkatsiteli", "Chardonnay", "Sauvignon Blanc", "Pinot Gris",
        "Chenin Blanc", "Gewurztraminer",
    ],
}

REGIONS: List[Tuple[str, str, Tuple[float, float, float]]] = [
    ("France", "Bordeaux", (0.05, 0.9, 0.05)),
    ("France", "Burgundy", (0.35, 0.6, 0.05)),
    ("France", "Loire", (0.6, 0.35, 0.05)),
    ("France", "Rhone", (0.2, 0.75, 0.05)),
    ("France", "Provence", (0.5, 0.4, 0.1)),
    ("France", "Languedoc", (0.4, 0.55, 0.05)),
    ("France", "Alsace", (0.85, 0.1, 0.05)),
    ("France", "Jura", (0.3, 0.5, 0.2)),
    ("France", "Beaujolais", (0.15, 0.8, 0.05)),
    ("France", "Champagne", (0.9, 0.05, 0.05)),
    ("Italy", "Tuscany", (0.1, 0.85, 0.05)),
    ("Italy", "Piedmont", (0.15, 0.8, 0.05)),
    ("Italy", "Veneto", (0.4, 0.55, 0.05)),
    ("Italy", "Sicily", (0.4, 0.55, 0.05)),
    ("Spain", "Rioja", (0.1, 0.85, 0.05)),
    ("Spain", "Ribera del Duero", (0.05, 0.9, 0.05)),
    ("Spain", "Rias Baixas", (0.9, 0.05, 0.05)),
    ("Georgia", "Kakheti", (0.2, 0.3, 0.5)),
]

APPELLATIONS_BY_REGION: dict[str, List[str]] = {
    "Bordeaux": ["Medoc", "Saint-Emilion", "Pauillac", "Pomerol", "Graves"],
    "Burgundy": ["Chablis", "Cote de Nuits", "Cote de Beaune", "Maconnais"],
    "Loire": ["Sancerre", "Vouvray", "Muscadet", "Chinon"],
    "Rhone": ["Cote-Rotie", "Hermitage", "Crozes-Hermitage", "Chateauneuf-du-Pape"],
    "Provence": ["Coteaux d'Aix", "Cotes de Provence"],
    "Languedoc": ["Minervois", "Corbieres", "Faugeres"],
    "Alsace": ["Alsace AOC", "Grand Cru"],
    "Jura": ["Arbois", "Cotes du Jura"],
    "Beaujolais": ["Beaujolais-Villages", "Moulin-a-Vent", "Fleurie"],
    "Champagne": ["Champagne AOC"],
    "Tuscany": ["Chianti Classico", "Brunello di Montalcino", "Bolgheri"],
    "Piedmont": ["Barolo", "Barbaresco", "Langhe"],
    "Veneto": ["Valpolicella", "Soave", "Prosecco"],
    "Sicily": ["Etna", "Nero d'Avola IGT"],
    "Rioja": ["Rioja DOCa"],
    "Ribera del Duero": ["Ribera del Duero DO"],
    "Rias Baixas": ["Rias Baixas DO"],
    "Kakheti": ["Kakheti PDO"],
}


def _choose_color_for_region(rng: random.Random, region: str) -> str:
    for _, reg, weights in REGIONS:
        if reg == region:
            return rng.choices(COLORS, weights=list(weights))[0]
    return rng.choice(COLORS)


def _generate_reference(rng: random.Random, year: int, region: str, wine_id: int) -> str:
    region_code = "".join(ch for ch in region.upper() if ch.isalpha())[:3]
    suffix = "".join(rng.choice(string.ascii_uppercase + string.digits) for _ in range(3))
    return f"WN-{year}-{region_code}-{wine_id:04d}-{suffix}"


def _choose_grapes(rng: random.Random, color: str) -> List[str]:
    candidates = GRAPES_BY_COLOR[color]
    is_blend = rng.random() < 0.25
    if is_blend:
        blend_size = rng.choice([2, 3])
        return rng.sample(candidates, k=blend_size)
    return [rng.choice(candidates)]


def _estimate_price(rng: random.Random, color: str, region: str, appellation: str, rating: float) -> float:
    base_by_color = {"white": 18.0, "red": 24.0, "orange": 22.0}
    premium_regions = {
        "Bordeaux": 1.5, "Burgundy": 1.7, "Champagne": 1.8, "Rioja": 1.2,
        "Piedmont": 1.6, "Rhone": 1.4, "Tuscany": 1.5, "Barolo": 2.0,
    }
    region_factor = premium_regions.get(region, 1.0)
    prestige_appellations = {
        "Pauillac", "Saint-Emilion", "Chateauneuf-du-Pape", "Cote-Rotie",
        "Hermitage", "Barolo", "Barbaresco", "Rioja DOCa", "Ribera del Duero DO", "Champagne AOC",
    }
    appellation_factor = 1.3 if appellation in prestige_appellations else 1.0
    rating_factor = 0.8 + (rating - 80.0) * (0.7 / 20.0)
    mean_price = base_by_color[color] * region_factor * appellation_factor * rating_factor
    price = gaussian_clamped(rng, mean_price, mean_price * 0.35, 6.0, 500.0)
    return round(price, 2)


def _random_order_id(rng: random.Random) -> str:
    y = datetime.utcnow().year
    token = "".join(rng.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    return f"ORD-{y}-{token}"


def _random_order_date_str(rng: random.Random) -> str:
    dt = datetime.utcnow() - timedelta(days=rng.randint(0, 90), hours=rng.randint(0, 23), minutes=rng.randint(0, 59))
    style = rng.choice(["iso", "eu", "us"])
    if style == "iso":
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    if style == "eu":
        return dt.strftime("%d/%m/%Y")
    return dt.strftime("%m-%d-%Y")


def _format_price_dirty(rng: random.Random, price: float) -> str:
    style = rng.choice(["euro_prefix_dot", "euro_suffix_dot", "euro_suffix_comma", "euro_prefix_comma", "dot", "comma"])
    if style == "euro_prefix_dot":
        return f"€{price:.2f}"
    if style == "euro_suffix_dot":
        return f"{price:.2f}€"
    if style == "euro_suffix_comma":
        return f"{str(price).replace('.', ',')}€"
    if style == "euro_prefix_comma":
        return f"€{str(price).replace('.', ',')}"
    if style == "dot":
        return f"{price:.2f}"
    return str(price).replace(".", ",")


def generate_wines(rows: int, seed: int = 42) -> pd.DataFrame:
    rng = random.Random(seed)

    vintages = list(range(1985, 2025))
    vintage_weights = [0.2 if y >= 2015 else 0.1 if y >= 2005 else 0.05 if y >= 1995 else 0.02 for y in vintages]
    bottle_sizes = [(0.375, 0.05), (0.75, 0.9), (1.5, 0.05)]

    rows_out: List[dict] = []
    for wine_id in range(1, rows + 1):
        country, region, _ = rng.choice(REGIONS)
        color = _choose_color_for_region(rng, region)
        appellation = rng.choice(APPELLATIONS_BY_REGION.get(region, [f"{region} AOC"]))
        grapes = _choose_grapes(rng, color)
        grape_text = ", ".join(grapes)

        vintage = rng.choices(vintages, weights=vintage_weights)[0]
        reference = _generate_reference(rng, vintage, region, wine_id)
        rating = round(gaussian_clamped(rng, 90.0, 3.5, 80.0, 100.0), 1)

        if color == "white":
            abv = round(gaussian_clamped(rng, 12.5, 0.8, 11.0, 14.5), 1)
        elif color == "red":
            abv = round(gaussian_clamped(rng, 13.5, 0.9, 12.0, 16.0), 1)
        else:
            abv = round(gaussian_clamped(rng, 13.0, 0.8, 11.5, 15.0), 1)

        if color == "red":
            tannin = int(gaussian_clamped(rng, 4.0, 0.8, 1.0, 5.0))
            acidity = int(gaussian_clamped(rng, 3.2, 0.7, 1.0, 5.0))
            sweetness = rng.choices(["dry", "off-dry"], weights=[0.9, 0.1])[0]
        elif color == "white":
            tannin = int(gaussian_clamped(rng, 1.8, 0.6, 1.0, 5.0))
            acidity = int(gaussian_clamped(rng, 3.6, 0.7, 1.0, 5.0))
            sweetness = rng.choices(["dry", "off-dry", "sweet"], weights=[0.7, 0.25, 0.05])[0]
        else:
            tannin = int(gaussian_clamped(rng, 3.2, 0.7, 1.0, 5.0))
            acidity = int(gaussian_clamped(rng, 3.4, 0.6, 1.0, 5.0))
            sweetness = rng.choices(["dry", "off-dry"], weights=[0.85, 0.15])[0]

        size_l = rng.choices([s for s, _ in bottle_sizes], weights=[w for _, w in bottle_sizes])[0]
        price_eur = _estimate_price(rng, color, region, appellation, rating)

        producer_prefix = rng.choice(["Domaine", "Chateau", "Maison", "Bodegas", "Cantina", "Winery"]) if country in {"France", "Spain", "Italy"} else rng.choice(["Domaine", "Marani", "Estate"])
        producer_core = rng.choice([
            "Dubois", "Lafitte", "Moreau", "Marchesi", "Rossi", "Garcia", "Torres", "Imeretian",
            "Mukuzani", "Nikoladze", "Fontaine", "Durand", "Bonnet", "Ferreira", "da Costa",
        ])
        producer = f"{producer_prefix} {producer_core}"

        stock_qty = int(gaussian_clamped(rng, 80, 60, 0, 400))

        order_id = _random_order_id(rng)
        order_date = _random_order_date_str(rng)
        price_dirty = _format_price_dirty(rng, price_eur)

        rows_out.append(
            {
                "id": wine_id,
                "order_id": order_id,
                "order_date": order_date,
                "reference": reference,
                "name": None,
                "color": color,
                "country": country,
                "region": region,
                "appellation": appellation,
                "vintage": vintage,
                "grapes": grape_text,
                "alcohol_percent": abv,
                "bottle_size_l": size_l,
                "sweetness": sweetness,
                "tannin": tannin,
                "acidity": acidity,
                "rating": rating,
                "price": price_dirty,
                "price_eur": price_eur,
                "producer": producer,
                "stock_quantity": stock_qty,
            }
        )

    df = pd.DataFrame(rows_out)

    # 5% de doublons exacts (même order_id envoyé 2 fois)
    if len(df) > 0:
        dup_n = max(1, int(round(0.05 * len(df))))
        dup_sample = df.sample(n=dup_n, random_state=seed)
        df = pd.concat([df, dup_sample], ignore_index=True)
        df = df.sample(frac=1.0, random_state=seed + 1).reset_index(drop=True)

    return df


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a realistic (dirty) wine dataset.")
    parser.add_argument("--rows", type=int, default=500, help="Number of wines to generate (100-1000)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--out", type=str, default="wines.csv", help="Output CSV filename (saved in current directory)")
    args = parser.parse_args()

    rows = max(100, min(1000, args.rows))
    df = generate_wines(rows=rows, seed=args.seed)

    print(f"✅ Generated {len(df)} rows (incl. ~5% duplicates)")
    print(f"Columns: {list(df.columns)}")
    print("\nFirst 5 rows:")
    print(df.head())

    df.to_csv(args.out, index=False)
    print(f"\n💾 Saved to {args.out}")


if __name__ == "__main__":
    main()
