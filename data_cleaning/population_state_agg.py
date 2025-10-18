import pandas as pd

SRC = "data/population_state.csv"            # your original file
OUT = "data/population_state_agg.csv"    # output used by the choropleth

# load & basic cleanup
df = pd.read_csv(SRC)
df['state'] = df['state'].astype(str).str.strip()
df['year']  = pd.to_datetime(df['date'], errors='coerce').dt.year

# keep only total population rows
mask = (
    df['sex'].str.lower().eq('both') &
    df['age'].str.lower().eq('overall') &
    df['ethnicity'].str.lower().eq('overall')
)
df = df.loc[mask, ['state', 'year', 'population']].copy()

# ensure numeric population (your file looks like 'thousands' units—leave as-is)
df['population'] = pd.to_numeric(df['population'], errors='coerce')

# if there are duplicates per (state,year), aggregate them
df = df.groupby(['state','year'], as_index=False, dropna=False)['population'].sum()

# single-key for easy Vega-Lite lookup
df['join_key'] = df['state'] + '|' + df['year'].astype('int').astype(str)

# reorder & save
out = df[['join_key','state','year','population']]
out.to_csv(OUT, index=False)
print(f"Saved {len(out)} rows to {OUT}")
print(out.head())
