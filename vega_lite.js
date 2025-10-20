const allCharts = [
  // SVG Charts
  ["#arrivals_symbol_map", "charts/arrivals_symbol_map.json", "svg"],
  ["#poe_bar", "charts/poe_bar.json", "svg"],
  ["#calendar_heatmap", "charts/calendar_heatmap.json", "svg"],
  ["#poe_bump", "charts/poe_bump.json", "svg"],
  ["#mode_stream", "charts/mode_stream.json", "svg"],
  ["#state_choropleth", "charts/state_choropleth.json", "svg"],
  ["#arrivals_tourism_scatter", "charts/arrivals_tourism_scatter.json", "svg"],
  ["#countries_bar", "charts/countries_bar.json", "svg"],
  
  // Canvas Chart
  ["#sankey", "charts/sankey.json", "svg"]
];

const views = [];

function embedAll() {
  return Promise.all(
    allCharts.map(([selector, specPath, rendererType]) => {
      // Dynamically create the options for each chart
      const embedOptions = {
        actions: false,
        renderer: rendererType // Use the renderer from the array
      };

      console.log(`Embedding ${selector} with ${rendererType} renderer.`);

      return vegaEmbed(selector, specPath, embedOptions).then((res) => {
        views.push(res.view);
        return res;
      });
    })
  );
}

// Master year state (persisted)
function getInitialYear() {
  const urlY = new URLSearchParams(location.search).get("year");
  const savedY = localStorage.getItem("vizYear");
  return Number(urlY || savedY || 2023); // default
}

function setActiveButton(y) {
  document.querySelectorAll(".year-btn").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.year) === y);
  });
}

function parseYear(val) {
  return val === "All Years" ? "All Years" : Number(val);
}

function setYear(val) {
  const y = parseYear(val);

  // (a) update UI
  setActiveButton(val);

  // (b) update URL and storage
  const usp = new URLSearchParams(location.search);
  usp.set("year", val);
  history.replaceState(null, "", `${location.pathname}?${usp}`);
  localStorage.setItem("vizYear", String(val));

  // (c) broadcast to all charts that expose a 'Year' signal
  views.forEach((v) => {
    try {
      v.signal("Year", y); // set
      v.runAsync(); // apply
    } catch (e) {
      // this chart just doesn't have a 'Year' signal—ignore
    }
  });
}

function wireYearButtons(initialYear) {
  document.querySelectorAll(".year-btn").forEach((btn) => {
    btn.addEventListener("click", () => setYear(Number(btn.dataset.year)));
  });
  setYear(initialYear);
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  const initialYear = getInitialYear();
  embedAll().then(() => wireYearButtons(initialYear));
});
