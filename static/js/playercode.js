document.addEventListener("DOMContentLoaded", async () => {
  const playercode = document.body.dataset.playercode || "TEST";

  // === LOAD CONTRACT DATA ===
  async function loadContracts() {
    const section = document.getElementById("contracts-section");
    section.innerHTML = `<p>Loading...</p>`;

    try {
      const res = await fetch(`/api/player/${playercode}`);
      const data = await res.json();
      if (!data || data.error) throw new Error(data?.error || "No data");

      const rows = data.data || [];
      const lineItems = [];
      for (let i = 1; i < rows.length; i++) {
        const h = rows[i][7];
        const iCol = rows[i][8];
        if (h) lineItems.push({ name: h, contracts: parseInt(iCol || 0) });
      }

      const maxContracts = parseInt(rows?.[0]?.[9] || 0);
      section.innerHTML = "";

      if (lineItems.length === 0) {
        section.innerHTML = `<h2>Contracts</h2><p>No data found.</p>`;
        return;
      }

      lineItems.forEach((item, index) => {
        const row = document.createElement("div");
        row.classList.add("contract-row");
        row.innerHTML = `
          <label>${item.name}</label>
          <input type="number" id="contract-${index}" value="${item.contracts}" min="0" style="width:60px; margin-left:10px;">
        `;
        section.appendChild(row);
      });

      const counter = document.createElement("p");
      counter.style.marginTop = "10px";
      counter.style.fontWeight = "bold";
      section.appendChild(counter);

      function updateCounter() {
        const used = lineItems.reduce((sum, _, i) => {
          const val = parseInt(document.getElementById(`contract-${i}`).value) || 0;
          return sum + val;
        }, 0);
        counter.innerHTML = `Contracts Used: <b>${used}</b> / ${maxContracts}`;
        counter.style.color = used > maxContracts ? "#ff4444" : "#00ff99";
      }

      section.querySelectorAll("input").forEach(inp => inp.addEventListener("input", updateCounter));
      updateCounter();

      document.getElementById("save-contracts").onclick = async () => {
        const updated = lineItems.map((_, i) =>
          parseInt(document.getElementById(`contract-${i}`).value) || 0
        );
        const total = updated.reduce((a, b) => a + b, 0);

        if (maxContracts && total > maxContracts) {
          alert(`⚠️ Total ${total} exceeds max ${maxContracts}!`);
          return;
        }

        const res = await fetch(`/api/contracts/${playercode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contracts: updated })
        });
        const out = await res.json();
        alert(out.status === "updated" ? `✅ ${out.message}` : `⚠️ ${out.message}`);
      };
    } catch (err) {
      console.error("Contract load error:", err);
      section.innerHTML = `<h2>Contracts</h2><p>Failed to load contract data.</p>`;
    }
  }

  // === LOAD POLICY DATA ===
  async function loadPolicies() {
    const section = document.getElementById("policies-section");
    section.innerHTML = `<p>Loading...</p>`;

    const policyOptions = {
      Tax: ["Libertarian", "Conservative", "Moderate", "Liberal", "Keynesian"],
      Welfare: ["Minimalist State", "Workfare Conservatism", "Social Market", "Social Democracy", "Universalist Welfare"],
      Defense: ["Pacifist Doctrine", "Minimal Defense", "Strategic Defense", "Forward Defense", "Fully Mobilized"],
      Research: ["Austerity Science", "Applied Focus", "National Agenda", "Innovative", "Technocratic"],
      Governance: ["Watchman", "Civic Pluralism", "Constitutional", "Centralized", "Authoritarian"],
      Economy: ["Laissez-Faire", "Market Conservatism", "Mixed Economy", "War Economy", "Command Economy"],
      Conscription: ["Volunteer Force", "Limited Draft", "Selective Service", "Mandatory Service", "Universal Service"],
      Monetary: ["Extreme Deflationary Monetary Policy", "Deflationary Monetary Policy", "Fiscal Constraint", "Fiscal Responsibility", "Moderate Fiscality", "Neutral Fiscality", "Expansionary Monetary Policy"],
      Trade: ["Unregulated Trade Policy", "Free Trade Policy", "Balanced Trade Policy", "Closed Trade Policy", "Protectionist Trade Policy"],
      AI_Policy: ["Repressed Development", "Cautious Development", "Moderate Development", "Racing Development", "National Development Effort"]
    };

    try {
      const res = await fetch(`/api/player/${playercode}`);
      const data = await res.json();
      if (!data || data.error) throw new Error(data?.error || "No data");

      const rows = data.data || [];
      const current = [];
      for (let i = 59; i < 69; i++) current.push(rows[i]?.[12] || "");

      section.innerHTML = "";
      Object.entries(policyOptions).forEach(([lever, opts], idx) => {
        const div = document.createElement("div");
        div.classList.add("policy-row");
        const sel = document.createElement("select");
        sel.id = `policy-${lever}`;
        opts.forEach(o => {
          const op = document.createElement("option");
          op.value = o;
          op.textContent = o;
          if (o === current[idx]) op.selected = true;
          sel.appendChild(op);
        });
        div.innerHTML = `<label>${lever}: </label>`;
        div.appendChild(sel);
        section.appendChild(div);
      });

      document.getElementById("save-policies").onclick = async () => {
        const selected = Object.keys(policyOptions).map(l =>
          document.getElementById(`policy-${l}`).value
        );
        const res = await fetch(`/api/policies/${playercode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ policies: selected })
        });
        const out = await res.json();
        alert(out.status === "policies updated"
          ? "✅ Policies saved successfully!"
          : `⚠️ ${out.error || "Error saving policies"}`);
      };
    } catch (err) {
      console.error("Policy load error:", err);
      section.innerHTML = `<h2>Policies</h2><p>Failed to load policy data.</p>`;
    }
  }

  // === LOAD INTELLIGENCE DATA ===
  async function loadIntelData() {
    const res = await fetch(`/api/data/${playercode}`);
    const data = await res.json();

    // === Nation and Capital ===
    const nationName = (data.Nation && typeof data.Nation === "string")
      ? data.Nation.replace("Nation:", "").replace(";", "").trim()
      : (Object.values(data.Nation || {})[0] || "Unknown Nation").replace(";", "").trim();

    const capitalName = (data.Capital && typeof data.Capital === "string")
      ? data.Capital.replace("Capital:", "").replace(";", "").trim()
      : (Object.values(data.Capital || {})[0] || "Unknown Capital").replace(";", "").trim();

    const headerEl = document.querySelector("h1");
    headerEl.textContent = nationName;

    let subtitle = document.getElementById("capital-subtitle");
    if (!subtitle) {
      subtitle = document.createElement("h3");
      subtitle.id = "capital-subtitle";
      headerEl.insertAdjacentElement("afterend", subtitle);
    }
    subtitle.textContent = `Capital: ${capitalName}`;

    // === Alerts ===
    if (data.Alerts && typeof data.Alerts === "object" && data.Alerts.items) {
      const alerts = data.Alerts.items;
      const count = alerts.length;

      const alertsBody = document.getElementById("alerts-body");
      alertsBody.innerHTML = alerts.join("\n")
        .replace(/✅/g, '<span style="color:#00ff99;">✅</span>')
        .replace(/⚠️/g, '<span style="color:#ffaa00;">⚠️</span>')
        .replace(/🔥/g, '<span style="color:#ff4444;">🔥</span>')
        .replace(/💡/g, '<span style="color:#00bfff;">💡</span>')
        .replace(/🧠/g, '<span style="color:#66ccff;">🧠</span>');

      const modal = document.getElementById("alerts-modal");
      const openBtn = document.getElementById("open-alerts");
      const closeBtn = document.getElementById("close-alerts");

      openBtn.style.display = "block";
      openBtn.onclick = () => { modal.style.display = "flex"; };
      closeBtn.onclick = () => { modal.style.display = "none"; };
      window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

      openBtn.classList.remove("alert-low", "alert-medium", "alert-high");
      if (count < 10) {
        openBtn.classList.add("alert-low");
        openBtn.textContent = `💡 Alerts (${count})`;
      } else if (count < 20) {
        openBtn.classList.add("alert-medium");
        openBtn.textContent = `⚠️ Alerts (${count})`;
      } else {
        openBtn.classList.add("alert-high");
        openBtn.textContent = `🔥 Alerts (${count})`;
      }
    } else {
      document.getElementById("open-alerts").style.display = "none";
    }

    delete data.Nation;
    delete data.Capital;
    delete data.Alerts;

    // === Render Intel ===
    const intelOutput = document.getElementById("intel-output");
    intelOutput.innerHTML = `
      <div class="intel-header"><h2>Intelligence Overview</h2></div>
      <div id="intel-grid"></div>
    `;
    const grid = intelOutput.querySelector("#intel-grid");

    Object.entries(data).forEach(([key, val]) => {
      const card = document.createElement("div");
      card.className = "intel-card";
      card.innerHTML = `<h3>${key}</h3>`;

      if (val === null) {
        card.innerHTML += `<p><i>No data available</i></p>`;
      } else if (typeof val === "object" && val.items) {
        if (val.title) card.innerHTML += `<p><b>${val.title}</b></p>`;
        const list = document.createElement("ul");
        val.items.forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = item.replace(/\[(.*?)\]/g, `<span class="tag">[$1]</span>`);
          list.appendChild(li);
        });
        card.appendChild(list);
      } else if (typeof val === "object") {
        const [subk, subv] = Object.entries(val)[0];
        card.innerHTML += `<p><b>${subk}:</b> ${subv}</p>`;
      } else {
        card.innerHTML += `<p>${val}</p>`;
      }

      grid.appendChild(card);
    });

    // === Fade-in Animation ===
    intelOutput.style.opacity = 0;
    requestAnimationFrame(() => {
      intelOutput.style.transition = "opacity 0.6s ease-in";
      intelOutput.style.opacity = 1;
    });
  }

  // === EXECUTION ORDER ===
  await loadIntelData();
  await loadContracts();
  await loadPolicies();
});
