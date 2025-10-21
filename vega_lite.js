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

      // console.log(`Embedding ${selector} with ${rendererType} renderer.`);

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

////////////////////////////////////////////////
//          FOR YEAR FILTER BUTTONS
////////////////////////////////////////////////

const BUFFER_TOP  = '50px';   // e.g., '200px' or '20%'
const BUFFER_BOTTOM = '50px'; // e.g., '240px' or '25%'

/* ===== Scroll-gated visibility for Year FABs ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Which charts should reveal the year buttons?
  const targetChartIds = [
    'arrivals_symbol_map',  // symbol map
    'poe_bar',              // horizontal bar chart (Top 10 POE)
    'state_choropleth',     // choropleth map
    'countries_bar',         // stacked countries bar chart
    // 'arrivals_tourism_scatter'
  ];

  // Get the elements (some pages/states might not have all)
  const targets = targetChartIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // If nothing to watch, just bail and keep buttons visible
  const yearFabs = Array.from(document.querySelectorAll('.year-fab'));
  if (!targets.length || !yearFabs.length) return;

  // Start hidden
  yearFabs.forEach(btn => btn.classList.add('is-hidden'));

  // Track how many watched charts are currently visible
  let inViewCount = 0;

  const showFabs = () => {
    yearFabs.forEach(btn => btn.classList.remove('is-hidden'));
  };
  const hideFabs = () => {
    yearFabs.forEach(btn => btn.classList.add('is-hidden'));
  };

  const visible = new Set();

  // IntersectionObserver to toggle on scroll
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const key = entry.target; // each observed element
      if (entry.isIntersecting) visible.add(key);
      else visible.delete(key);
    }

    if (visible.size > 0) {
      showFabs();
    } else {
      hideFabs();
    }
  }, {
    root: null,
    // Expand the viewport by this much above/below for early show/late hide
    rootMargin: `${BUFFER_TOP} 0px ${BUFFER_BOTTOM} 0px`,
    // Trigger as soon as it touches the expanded region
    threshold: 0
  });

  // Observe each chart (or its .viz-block wrapper)
  targets.forEach(el => {
    const block = el.closest('.viz-block') || el;
    observer.observe(block);
  });

  // Fallback: if IntersectionObserver isn’t supported, keep them visible
  // (Very old browsers only)
  if (!('IntersectionObserver' in window)) {
    showFabs();
  }
});