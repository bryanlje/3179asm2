import pandas as pd
from pathlib import Path

src = Path("data/tourism_state.csv")
out = Path("data/tourism_state_agg.csv")

df = pd.read_csv(src)

# Keep exactly the original column names
work = df[['state', 'year', 'gdp_p5']].copy()

# Clean types
work['state'] = work['state'].astype(str).str.strip()
work['year'] = pd.to_numeric(work['year'], errors='coerce').astype('Int64')
work['gdp_p5'] = pd.to_numeric(work['gdp_p5'], errors='coerce')

# Aggregate if duplicates per (state, year)
work = work.dropna(subset=['state','year']).groupby(['state','year'], as_index=False)['gdp_p5'].sum()

# Build join key (state|year)
work['join_key'] = work['state'] + '|' + work['year'].astype(int).astype(str)

# Reorder columns; preserve gdp_p5 name
work = work[['join_key', 'state', 'year', 'gdp_p5']].sort_values(['state','year'])

# Save
work.to_csv(out, index=False)

print(f"Wrote {len(work)} rows to {out}")
