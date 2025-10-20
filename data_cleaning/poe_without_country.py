import pandas as pd

in_path = "data/arrivals_record.csv"
out_path = "data/poe_without_country.csv"

# Load
df = pd.read_csv(in_path)

# Floor to month (keeps column name 'date')
df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.to_period("M").dt.to_timestamp()

# Remove the need for 'country'
if "country" in df.columns:
    df = df.drop(columns=["country"])

# Sum all numeric columns by poe+date
numeric_cols = df.select_dtypes(include="number").columns.tolist()
agg = df.groupby(["poe", "date"], as_index=False)[numeric_cols].sum()

# Save
agg.to_csv(out_path, index=False)
print(f"Saved: {out_path}")
