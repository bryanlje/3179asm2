# Re-run aggregation script to produce monthly totals per state from arrivals_soe.csv

import pandas as pd
from pathlib import Path

src = Path("data/arrivals_soe.csv")

df = pd.read_csv(src)

# Standardize column names
df.columns = [c.strip().lower() for c in df.columns]

# Identify columns
year_col = "year" if "year" in df.columns else None
date_col = "date" if "date" in df.columns else None
country_col = "country" if "country" in df.columns else None
soe_col = "soe" if "soe" in df.columns else None

# Parse date as day-first (e.g., 1/2/2020 -> 2020-02-01)
df["date_parsed"] = pd.to_datetime(df[date_col], dayfirst=True, errors="coerce")
df = df.dropna(subset=["date_parsed"]).copy()
df["date"] = df["date_parsed"].dt.to_period("M").dt.to_timestamp()  # first day of month

# Ensure numeric
for col in ["arrivals", "arrivals_male", "arrivals_female"]:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

# Group: monthly totals per state (summing across countries)
group_cols = [soe_col, "date"]
agg_cols = [c for c in ["arrivals", "arrivals_male", "arrivals_female"] if c in df.columns]

per_state = (
    df.groupby(group_cols, as_index=False)[agg_cols]
      .sum()
      .sort_values(["date", soe_col])
)

# Also overall monthly totals (across states) if useful
overall = (
    df.groupby(["date"], as_index=False)[agg_cols]
      .sum()
      .sort_values(["date"])
)
overall["soe"] = "ALL"

# Save
out1 = Path("data/arrivals_soe_monthly_state.csv")
out2 = Path("data/arrivals_soe_monthly_overall.csv")
per_state.to_csv(out1, index=False)
overall.to_csv(out2, index=False)

# Show to user
print(f"Saved per-state monthly file to: {out1}")
print(f"Saved overall monthly file to: {out2}")
