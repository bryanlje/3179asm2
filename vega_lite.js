const charts = [
  ["#arrivals_symbol_map",  "charts/arrivals_symbol_map.json"],
  ["#poe_bar",              "charts/poe_bar.json"],
  ["#calendar_heatmap",     "charts/calendar_heatmap.json"],
  ["#poe_bump",             "charts/poe_bump.json"],
  ["#mode_stream",          "charts/mode_stream.json"],
  ["#state_choropleth",     "charts/state_choropleth.json"]
];

for (const [sel, spec] of charts) {
  const el = document.querySelector(sel);
  if (!el) continue;
  vegaEmbed(el, spec, {actions: false})
    .catch(err => console.error(`Embed failed for ${sel} with ${spec}:`, err));
}
