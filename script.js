const tocList = document.getElementById("tocList");
// Table of Contents name graber
document.querySelectorAll("main.content section").forEach((section) => {
  const heading = section.querySelector("h2");
  if (!heading) return;

  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#" + section.id;
  a.textContent = heading.textContent;
  li.appendChild(a);
  tocList.appendChild(li);
});

// auto open Collapsed Sections
function openSection(id) {
  if (!id) return;

  const details = document.querySelector("#" + id + " details");
  if (details) details.open = true;
}
tocList.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link) openSection(link.getAttribute("href").slice(1));
});

window.addEventListener("hashchange", () =>
  openSection(location.hash.slice(1)),
);

// Sidebar show/hide toggle
const toggleBtn = document.getElementById("sidebarToggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("nav-closed");
});

// Report Original/Revised toggle
document.querySelectorAll(".toggle-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    btn.parentElement.querySelectorAll(".toggle-opt").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    btn
      .closest("section")
      .querySelectorAll(".report-version")
      .forEach((v) => {
        v.classList.toggle("active", v.id === targetId);
      });
  });
});

// Slide viewer (Statistics in the Wild)
document.querySelectorAll(".slides").forEach((viewer) => {
  const imgs = viewer.querySelectorAll(".slide-img");
  const counter = viewer.querySelector(".slide-counter");
  let i = 0;
  function show(n) {
    i = (n + imgs.length) % imgs.length; // wraps around both ends
    imgs.forEach((img, idx) => img.classList.toggle("active", idx === i));
    if (counter) counter.textContent = i + 1 + " / " + imgs.length;
  }
  viewer.querySelectorAll(".slide-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      show(btn.dataset.dir === "next" ? i + 1 : i - 1),
    );
  });
  show(0);
});

/* ─── Statistics in the Wild #3 · MTG interactive exhibit ─── */
/* Ported from mtg_infographic_1920x1080.html. */
(function () {
  if (!document.querySelector(".mtg-exhibit")) return;

  // ── math helpers ──
  function comb(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
    return r;
  }
  function hyper(N, K, n, k) {
    return (comb(K, k) * comb(N - K, n - k)) / comb(N, n);
  }
  function fmt(p) {
    return (p * 100).toFixed(1) + "%";
  }

  // ── constants (the four config pills) ──
  const N = 60,
    L = 24,
    n = 7,
    K = 4;

  // ── land distribution chart ──
  const landDef = [
    { k: 0, c: "#8b1a1a" },
    { k: 1, c: "#8b1a1a" },
    { k: 2, c: "#1a4d2e" },
    { k: 3, c: "#1a4d2e" },
    { k: 4, c: "#b8860b" },
    { k: 5, c: "#b8860b" },
    { k: 6, c: "#b8860b" },
    { k: 7, c: "#b8860b" },
  ];
  const lp = landDef.map((d) => ({ ...d, p: hyper(N, L, n, d.k) }));
  const maxLP = Math.max(...lp.map((d) => d.p));
  const lc = document.getElementById("landChart");
  lp.forEach((d) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    const lbl = document.createElement("div");
    lbl.className = "bar-lbl";
    lbl.textContent = d.k + " land" + (d.k === 1 ? "" : "s");
    const bg = document.createElement("div");
    bg.className = "bar-bg";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = (d.p / maxLP) * 100 + "%";
    fill.style.background = d.c;
    fill.style.opacity = ".72";
    const pct = document.createElement("div");
    pct.className = "bar-pct";
    pct.textContent = fmt(d.p);
    bg.appendChild(fill);
    bg.appendChild(pct);
    row.appendChild(lbl);
    row.appendChild(bg);
    lc.appendChild(row);
  });

  // ── key-card "why four copies" chart + stats ──
  const cp = [1, 2, 3, 4].map((c) => ({ c, p: 1 - hyper(N, c, n, 0) }));
  const maxCP = Math.max(...cp.map((d) => d.p));
  const cc = document.getElementById("copiesChart");
  cp.forEach((d) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    const lbl = document.createElement("div");
    lbl.className = "bar-lbl";
    lbl.textContent = d.c + " cop" + (d.c === 1 ? "y" : "ies");
    const bg = document.createElement("div");
    bg.className = "bar-bg";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = (d.p / maxCP) * 100 + "%";
    fill.style.background = "#0d2d5e";
    fill.style.opacity = ".72";
    const pct = document.createElement("div");
    pct.className = "bar-pct";
    pct.textContent = fmt(d.p);
    bg.appendChild(fill);
    bg.appendChild(pct);
    row.appendChild(lbl);
    row.appendChild(bg);
    cc.appendChild(row);
  });
  const p0c = hyper(N, K, n, 0),
    p1c = hyper(N, K, n, 1);
  document.getElementById("atLeast1").textContent = fmt(1 - p0c);
  document.getElementById("exactly1").textContent = fmt(p1c);
  document.getElementById("atLeast2").textContent = fmt(
    Math.max(0, 1 - p0c - p1c),
  );
  document.getElementById("zeroCard").textContent = fmt(p0c);

  // ── mana curve sliders → bars + castability ──
  const curveColors = ["#3d1a5e", "#0d2d5e", "#1a4d2e", "#7a4a00", "#8b1a1a"];
  const curveLabels = ["1", "2", "3", "4", "5+"];
  const cardClasses = ["mv1", "mv2", "mv3", "mv4", "mv5"];
  const cardIcons = ["⚡", "⚔", "🛡", "💀", "🐉"];
  const cardLblsTxt = ["1-drop", "2-drop", "3-drop", "4-drop", "5+drop"];

  function updateCurve() {
    const ids = ["mv1", "mv2", "mv3", "mv4", "mv5"];
    const counts = ids.map((id) => +document.getElementById(id).value);
    ids.forEach(
      (id, i) => (document.getElementById(id + "v").textContent = counts[i]),
    );
    const total = counts.reduce((a, b) => a + b, 0);
    document.getElementById("totalSpells").textContent = total;
    document.getElementById("avgMv").textContent =
      total > 0
        ? (
            (counts[0] * 1 +
              counts[1] * 2 +
              counts[2] * 3 +
              counts[3] * 4 +
              counts[4] * 5.5) /
            total
          ).toFixed(1)
        : "—";

    // curve bars
    const cb = document.getElementById("curveBars");
    cb.innerHTML = "";
    const maxC = Math.max(...counts, 1);
    counts.forEach((c, i) => {
      const col = document.createElement("div");
      col.className = "cbar-col";
      const cnt = document.createElement("div");
      cnt.className = "cbar-cnt";
      cnt.textContent = c;
      const bw = document.createElement("div");
      bw.className = "cbar-wrap";
      const bar = document.createElement("div");
      bar.className = "cbar";
      bar.style.height = (c / maxC) * 100 + "%";
      bar.style.background = curveColors[i];
      bar.style.opacity = ".8";
      const cost = document.createElement("div");
      cost.className = "cbar-cost";
      cost.textContent = curveLabels[i];
      bw.appendChild(bar);
      col.appendChild(cnt);
      col.appendChild(bw);
      col.appendChild(cost);
      cb.appendChild(col);
    });

    // castability by turn
    const cc2 = document.getElementById("castChart");
    cc2.innerHTML = "";
    let running = 0;
    counts.forEach((c, i) => {
      running += c;
      const p = total > 0 ? running / total : 0;
      const row = document.createElement("div");
      row.className = "bar-row";
      const lbl = document.createElement("div");
      lbl.className = "bar-lbl";
      lbl.style.width = "48px";
      lbl.textContent = "Turn " + (i + 1);
      const bg = document.createElement("div");
      bg.className = "bar-bg";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = p * 100 + "%";
      const g = Math.floor(p * 140 + 40),
        r = Math.floor((1 - p) * 160 + 40);
      fill.style.background = "rgb(" + r + "," + g + ",50)";
      fill.style.opacity = ".65";
      const pct = document.createElement("div");
      pct.className = "bar-pct";
      pct.textContent = fmt(p);
      bg.appendChild(fill);
      bg.appendChild(pct);
      row.appendChild(lbl);
      row.appendChild(bg);
      cc2.appendChild(row);
    });

    updateHand(counts);
  }

  function updateHand(counts) {
    // The #handVis row was dropped in the Figma layout — only paint if it exists.
    const hv = document.getElementById("handVis");
    if (hv) {
      const slots = [];
      const lSlots = Math.round((7 * L) / N);
      for (let i = 0; i < lSlots; i++)
        slots.push({ cls: "land", ico: "🌿", lbl: "Land" });
      counts.forEach((c, i) => {
        const s = Math.round((7 * c) / N);
        for (let j = 0; j < s; j++)
          slots.push({
            cls: cardClasses[i],
            ico: cardIcons[i],
            lbl: cardLblsTxt[i],
          });
      });
      while (slots.length < 7)
        slots.push({ cls: "land", ico: "🌿", lbl: "Land" });
      hv.innerHTML = "";
      slots.slice(0, 7).forEach((s) => {
        const card = document.createElement("div");
        card.className = "hcard " + s.cls;
        const ico = document.createElement("div");
        ico.className = "hico";
        ico.textContent = s.ico;
        const lbl = document.createElement("div");
        lbl.className = "hlbl";
        lbl.textContent = s.lbl;
        card.appendChild(ico);
        card.appendChild(lbl);
        hv.appendChild(card);
      });
    }

    // Hand stats
    const C1 = counts[0],
      C2 = counts[1],
      C12 = C1 + C2;
    const p1drop = C1 > 0 ? 1 - hyper(N, C1, n, 0) : 0;
    const p2drop = C2 > 0 ? 1 - hyper(N, C2, n, 0) : 0;
    const p0land = hyper(N, L, n, 0);
    const p0c1 = C1 > 0 ? hyper(N, C1, n, 0) : 1;
    const pBoth0_T1 =
      C1 > 0 ? comb(N - L - C1, n) / comb(N, n) : comb(N - L, n) / comb(N, n);
    const pT1 = Math.max(0, 1 - p0land - p0c1 + pBoth0_T1);
    const p0c12 = C12 > 0 ? hyper(N, C12, n, 0) : 1;
    const pBoth0_T2 =
      C12 > 0
        ? comb(Math.max(0, N - L - C12), n) / comb(N, n)
        : comb(N - L, n) / comb(N, n);
    const pT2 = Math.max(0, 1 - p0land - p0c12 + pBoth0_T2);

    let ideal = 0;
    for (let kL = 2; kL <= 3; kL++) {
      const eff = Math.min(C12, N - L);
      const pLandNoSpell =
        eff > 0 ? (comb(L, kL) * comb(N - L - eff, n - kL)) / comb(N, n) : 0;
      ideal += Math.max(0, hyper(N, L, n, kL) - pLandNoSpell);
    }

    document.getElementById("p1drop").textContent = fmt(p1drop);
    document.getElementById("p2drop").textContent = fmt(p2drop);
    document.getElementById("pT1").textContent = fmt(pT1);
    document.getElementById("pT2").textContent = fmt(pT2);
    const ip = document.getElementById("idealPct");
    ip.textContent = fmt(ideal);
    ip.className =
      "sn " + (ideal > 0.45 ? "good" : ideal > 0.3 ? "mid" : "bad");
    document.getElementById("handNote").textContent =
      ideal > 0.5
        ? "Solid consistency — your curve supports early plays reliably."
        : ideal > 0.35
          ? "Decent — consider adding more low-drops."
          : "Low ideal-opener rate — more 1 and 2-drops would help.";

    // Drop distribution
    const typeData = [
      {
        label: "Land",
        K: L,
        colors: ["rgba(0,0,0,.1)", "#5aaf7a", "#2a8f5a", "#1a5e3e"],
      },
      {
        label: "1-drop",
        K: counts[0],
        colors: ["rgba(0,0,0,.1)", "#9a7acc", "#7a5aab", "#4a2a8e"],
      },
      {
        label: "2-drop",
        K: counts[1],
        colors: ["rgba(0,0,0,.1)", "#6a9dcc", "#3a6dab", "#1a3d8e"],
      },
      {
        label: "3-drop",
        K: counts[2],
        colors: ["rgba(0,0,0,.1)", "#6abf9a", "#3a9f7a", "#1a6f5a"],
      },
      {
        label: "4-drop",
        K: counts[3],
        colors: ["rgba(0,0,0,.1)", "#d4a060", "#b07030", "#7a4a00"],
      },
      {
        label: "5+",
        K: counts[4],
        colors: ["rgba(0,0,0,.1)", "#d07070", "#b04040", "#8b1a1a"],
      },
    ];
    const dc = document.getElementById("distChart");
    dc.innerHTML = "";
    typeData.forEach((type) => {
      if (type.K === 0 && type.label !== "Land") return;
      const maxSeg = Math.min(type.K, n);
      const p0 = hyper(N, type.K, n, 0);
      const p1 = hyper(N, type.K, n, 1);
      const p2 = maxSeg >= 2 ? hyper(N, type.K, n, 2) : 0;
      const p3 = Math.max(0, 1 - p0 - p1 - p2);
      const exp = ((7 * type.K) / N).toFixed(1);
      const row = document.createElement("div");
      row.className = "dist-row";
      const lbl = document.createElement("div");
      lbl.className = "dist-lbl";
      lbl.textContent = type.label;
      const bar = document.createElement("div");
      bar.className = "dist-bar";
      [p0, p1, p2, p3].forEach((p, i) => {
        if (p < 0.005) return;
        const seg = document.createElement("div");
        seg.className = "dist-seg";
        seg.style.width = p * 100 + "%";
        seg.style.background = type.colors[i];
        if (p > 0.1) {
          const s = document.createElement("span");
          s.className = "dsn";
          s.textContent = i === 3 ? "3+" : i + "";
          seg.appendChild(s);
        }
        bar.appendChild(seg);
      });
      const expEl = document.createElement("div");
      expEl.className = "dist-exp";
      expEl.textContent = "~" + exp;
      row.appendChild(lbl);
      row.appendChild(bar);
      row.appendChild(expEl);
      dc.appendChild(row);
    });
  }

  // ── wire sliders ──
  ["mv1", "mv2", "mv3", "mv4", "mv5"].forEach((id) =>
    document.getElementById(id).addEventListener("input", updateCurve),
  );
  updateCurve();
})();
