# Create a simpler bump-chart CSV from the uploaded arrivals_soe.csv
import pandas as pd
from pathlib import Path

src = Path("data/arrivals_soe.csv")
df = pd.read_csv(src)

# Parse date and make a year-month anchor (first day of month for ISO date)
df['date'] = pd.to_datetime(df['date'], errors='coerce')
df = df.dropna(subset=['date'])

df['ym'] = df['date'].dt.to_period('M').dt.to_timestamp()  # yyyy-mm-01

# Aggregate by year-month and SOE (state of entry)
g = (
    df.groupby(['ym', 'soe'], as_index=False)
      .agg(arrivals=('arrivals', 'sum'))
)

# Rank within each month (1 = highest arrivals). Use dense ranking for 1..K with no gaps.
g['rank'] = g.groupby('ym')['arrivals'].rank(method='dense', ascending=False).astype(int)

# Sort for readability
g = g.sort_values(['ym', 'rank', 'soe']).reset_index(drop=True)

# Save the simple bump csv
out_path = Path("data/soe_bump.csv")
g.to_csv(out_path, index=False)

out_path.__str__()
