async function loadGlobalTrends() {
  const res = await fetch('/api/global_data');
  const data = await res.json();
  const gdpData = data.filter(d => d.Country === "USA").map(d => ({
    x: d.Year,
    y: parseFloat(d.GDP)
  }));

  new Chart(document.getElementById("global-chart"), {
    type: 'line',
    data: {
      datasets: [{
        label: 'GDP over time',
        data: gdpData,
        borderColor: '#00ff99'
      }]
    }
  });
}
