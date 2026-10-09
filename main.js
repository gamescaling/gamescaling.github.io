(function () {
  const D = window.PAGE_DATA;

  // ---------- promo: autoplay must start muted, one click restarts it with sound ----------
  const promo = document.querySelector(".promo-video");
  const sound = document.querySelector(".promo-sound");
  if (promo && sound) {
    sound.addEventListener("click", () => { promo.muted = false; promo.currentTime = 0; promo.play(); });
    promo.addEventListener("volumechange", () => sound.classList.toggle("hide", !promo.muted));
  }
  const benchById = Object.fromEntries(D.benchmarks.map(b => [b.id, b]));
  const slug = s => s.toLowerCase().replace(/\./g, "").replace(/[^a-z0-9]+/g, "-");
  const fmt = v => (v == null ? "TBD" : v.toFixed(1));

  // ---------- helpers ----------
  function segmented(el, items, active, onPick) {
    el.innerHTML = "";
    items.forEach(it => {
      const b = document.createElement("button");
      b.type = "button";
      b.role = "tab";
      b.textContent = it.label;
      b.dataset.id = it.id;
      if (it.id === active) b.classList.add("on");
      b.addEventListener("click", () => {
        el.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
        onPick(it.id);
      });
      el.appendChild(b);
    });
  }

  const ICON_PLAY = `<svg class="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`;
  const ICON_REPLAY = `<svg class="i-replay" viewBox="0 0 24 24"><path d="M12 5V1.5L7 6l5 4.5V7a5 5 0 11-5 5H5a7 7 0 107-7z" fill="currentColor"/></svg>`;

  // Videos play once and stop on a replay button. preload="none" + a poster frame
  // keeps the page light: nothing is downloaded until a video is actually played.
  function videoCard({ src, title, sub, main, mainCls, unit, accent, badge, highlight }) {
    const card = document.createElement("article");
    card.className = "vcard" + (highlight ? " ours" : "");
    card.style.setProperty("--accent", accent);
    card.innerHTML = `
      <div class="vframe">
        <video muted playsinline preload="none"></video>
        <button class="vctl" type="button" aria-label="Play">${ICON_PLAY}${ICON_REPLAY}</button>
        <div class="vmissing">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
          <span>Video coming soon</span>
          <code>${src}</code>
        </div>
        ${badge ? `<span class="vbadge">${badge}</span>` : ""}
      </div>
      <div class="vmeta">
        <div class="vname"><b>${title}</b><span>${sub}</span></div>
        <div class="vscore">
          <span class="num ${mainCls || ""}">${main}</span>
          <span class="unit">${unit}</span>
        </div>
      </div>`;
    const v = card.querySelector("video");
    const cl = card.classList;
    v.addEventListener("error", () => { cl.add("missing"); cl.remove("loading", "playing"); });
    v.addEventListener("play", () => { cl.remove("ended"); cl.add("playing"); });
    v.addEventListener("pause", () => {
      cl.remove("playing", "loading");
      const grid = card.parentElement;
      if (grid && [...grid.querySelectorAll("video")].every(x => x.paused)) resetPlayAll(grid.id);
    });
    v.addEventListener("ended", () => cl.add("ended"));
    v.addEventListener("waiting", () => cl.add("loading"));
    v.addEventListener("playing", () => cl.remove("loading"));

    // poster from tools/encode_videos.py; without one, probe the video itself so a missing file still shows the placeholder
    const poster = src.replace(/\.mp4$/, ".jpg");
    const probe = new Image();
    probe.onload = () => (v.poster = poster);
    probe.onerror = () => { v.preload = "metadata"; v.load(); };
    probe.src = poster;
    v.src = src;

    // click toggles; an ended video restarts. Hover starts a video that has not been played yet.
    card.querySelector(".vframe").addEventListener("click", () => {
      if (cl.contains("missing")) return;
      if (v.ended) v.currentTime = 0;
      v.paused ? v.play().catch(() => {}) : v.pause();
    });
    card.addEventListener("mouseenter", () => {
      if (!cl.contains("missing") && v.paused && !v.ended && v.currentTime === 0) v.play().catch(() => {});
    });
    return card;
  }

  document.querySelectorAll(".play-all").forEach(btn => {
    btn.addEventListener("click", () => {
      const vids = [...document.getElementById(btn.dataset.group).querySelectorAll(".vcard:not(.missing) video")];
      const anyPaused = vids.some(v => v.paused);
      vids.forEach(v => {
        if (anyPaused) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
      });
      btn.textContent = anyPaused && vids.length ? "❚❚ Pause all" : "▶ Play all";
    });
  });

  function resetPlayAll(group) {
    const b = document.querySelector(`.play-all[data-group="${group}"]`);
    if (b) b.textContent = "▶ Play all";
  }

  // ======================================================
  //  Demo I: base vs S1 vs S3
  // ======================================================
  const M = D.mixture;
  const mixState = { bench: "mcu", caseIdx: 0, size: M.defaultSize };
  const TICKS_PER_S = 20;

  // benches without showcase rollouts yet get one placeholder case
  const casesOf = bench => (M.cases[bench] && M.cases[bench].length ? M.cases[bench] : [{ id: "case1", label: "Case 1", task: null, results: {} }]);
  const sizesOf = c => { const have = M.sizes.filter(s => c.results[s]); return have.length ? have : M.sizes; };

  function outcome(r, metric = "task progress") {
    if (!r) return { main: "TBD", mainCls: "tbd", unit: "rollout result" };
    if ("success" in r) {
      return r.success
        ? { main: "✓ Success", mainCls: "ok", unit: `done at ${(r.ticks / TICKS_PER_S).toFixed(1)} s` }
        : { main: "✗ Fail", mainCls: "fail", unit: `not done within ${Math.round((r.ticks + 1) / TICKS_PER_S)} s` };
    }
    return { main: r.progress == null ? "TBD" : `${Math.round(r.progress)}%`, mainCls: r.progress == null ? "tbd" : "", unit: r.note ? `${metric} · ${r.note}` : metric };
  }

  function pickCase() {
    const cases = casesOf(mixState.bench);
    const caseEl = document.getElementById("mix-case");
    segmented(caseEl, cases.map((c, i) => ({ id: i, label: c.label })), mixState.caseIdx, i => { mixState.caseIdx = i; pickSize(); });
    pickSize();
  }

  function pickSize() {
    const sizes = sizesOf(casesOf(mixState.bench)[mixState.caseIdx]);
    if (!sizes.includes(mixState.size)) mixState.size = sizes.includes(M.defaultSize) ? M.defaultSize : sizes[sizes.length - 1];
    segmented(document.getElementById("mix-size"), sizes.map(s => ({ id: s, label: s })), mixState.size, id => { mixState.size = id; renderMix(); });
    renderMix();
  }

  function renderMix() {
    const { size, bench } = mixState;
    const b = benchById[bench];
    const c = casesOf(bench)[mixState.caseIdx];
    const scores = M.scores[size];
    document.getElementById("mix-bench-caption").innerHTML =
      `<span class="tier-tag ${tierClass(b.tier)}">${b.tier}</span> <b>${b.name}</b> · ${b.desc}${c.task ? ` <span class="task">${c.task}</span>` : ""}`;

    const grid = document.getElementById("mix-grid");
    grid.innerHTML = "";
    M.variants.forEach(v => {
      grid.appendChild(videoCard({
        src: `videos/mixture/${bench}/${c.id}/${slug(size)}_${v.id}.mp4`,
        title: v.id === "base" ? `Qwen3.5-${size}` : `GameScaling-${size}-${v.id.toUpperCase()}`,
        sub: v.sub,
        ...outcome((c.results[size] || {})[v.id], c.metric),
        accent: v.color,
        highlight: v.id === "s3"
      }));
    });
    resetPlayAll("mix-grid");

    // mini table
    document.getElementById("mix-board-size").textContent = size + " backbone";
    const t = document.getElementById("mix-table");
    const head = `<tr><th>Model</th>${D.benchmarks.map(x => `<th class="${x.id === bench ? "cur" : ""}">${x.name}</th>`).join("")}</tr>`;
    const colMax = Object.fromEntries(D.benchmarks.map(x => [x.id, Math.max(...M.variants.map(v => scores[v.id][x.id] ?? -1))]));
    const rows = M.variants.map(v => `<tr>
        <td><i class="dot" style="background:${v.color}"></i>${v.label}<small>${v.sub}</small></td>
        ${D.benchmarks.map(x => {
          const s = scores[v.id][x.id];
          const best = s != null && s === colMax[x.id];
          return `<td class="${x.id === bench ? "cur" : ""} ${best ? "best" : ""} ${s == null ? "tbd" : ""}">${fmt(s)}</td>`;
        }).join("")}
      </tr>`).join("");
    t.innerHTML = `<thead>${head}</thead><tbody>${rows}</tbody>`;
  }

  segmented(document.getElementById("mix-bench"), D.benchmarks.map(b => ({ id: b.id, label: b.name })), mixState.bench, id => { mixState.bench = id; mixState.caseIdx = 0; pickCase(); });
  pickCase();

  // ======================================================
  //  Demo II: frontier vs GameScaling, TP / RT
  // ======================================================
  const F = D.frontier;
  const byId = Object.fromEntries(F.models.map(m => [m.id, m]));
  const frState = { mode: "rt", bench: "mcu", caseIdx: 0 };
  const frCasesOf = bench => (F.cases[bench] && F.cases[bench].length ? F.cases[bench] : [{ id: "case1", label: "Case 1", task: null, results: {} }]);
  const lat = s => (s == null ? "—" : `${s < 1 ? s.toFixed(2) : s.toFixed(1)} s / step`);
  const modeLabel = { tp: "Time-paused", rt: "Real-time" };
  const groupColor = { "Proprietary": "var(--c-prop)", "Open-source": "var(--c-open)", "GameScaling": "var(--c-gs)" };

  function renderFrontier() {
    const { mode, bench } = frState;
    const b = benchById[bench];
    const other = mode === "tp" ? "rt" : "tp";
    const c = frCasesOf(bench)[frState.caseIdx];
    document.getElementById("fr-bench-caption").innerHTML =
      `<span class="tier-tag ${tierClass(b.tier)}">${b.tier}</span> <b>${b.name}</b> · ${b.desc}${c.task ? ` <span class="task">${c.task}</span>` : ""} <span class="task">${modeLabel[mode]} interaction</span>`;

    const grid = document.getElementById("fr-grid");
    grid.innerHTML = "";
    F.showcase.map(id => byId[id]).forEach(m => {
      const r = ((c.results || {})[mode] || {})[m.id];
      grid.appendChild(videoCard({
        src: `videos/frontier/${bench}/${c.id}/${mode}_${m.id}.mp4`,
        title: m.name,
        sub: `${m.group} · ${m.size}`,
        ...outcome(r, c.metric),
        accent: groupColor[m.group],
        badge: lat(r && r.latency ? r.latency : m.latency),
        highlight: m.group === "GameScaling"
      }));
    });
    resetPlayAll("fr-grid");

    // bar chart
    document.getElementById("fr-chart-title").textContent = `${b.name} · ${modeLabel[mode]}`;
    document.getElementById("fr-ghost-label").textContent = modeLabel[other];
    document.getElementById("fr-chart-sub").textContent =
      `Solid bar: ${modeLabel[mode].toLowerCase()} score. Faint bar: the same model under ${modeLabel[other].toLowerCase()} interaction.`;
    const sorted = [...F.models].sort((a, c) => c[mode][bench] - a[mode][bench]);
    const max = Math.max(...F.models.flatMap(m => [m.tp[bench], m.rt[bench]]));
    const bars = document.getElementById("fr-bars");
    bars.innerHTML = sorted.map((m, i) => {
      const s = m[mode][bench], o = m[other][bench];
      return `<div class="bar-row ${m.group === "GameScaling" ? "ours" : ""}">
        <span class="bar-rank">${i + 1}</span>
        <span class="bar-name">${m.name}<small>${m.size}</small></span>
        <span class="bar-track">
          <i class="ghost" style="width:${(o / max) * 100}%"></i>
          <i class="fill" style="width:${(s / max) * 100}%;background:${groupColor[m.group]}"></i>
        </span>
        <span class="bar-val">${s.toFixed(1)}</span>
        <span class="bar-lat">${lat(m.latency).replace(" / step", "")}</span>
      </div>`;
    }).join("");
  }

  segmented(document.getElementById("fr-mode"), [{ id: "tp", label: "⏸ Time-paused" }, { id: "rt", label: "⏵ Real-time" }], frState.mode, id => { frState.mode = id; renderFrontier(); });
  function pickFrCase() {
    const cases = frCasesOf(frState.bench);
    segmented(document.getElementById("fr-case"), cases.map((c, i) => ({ id: i, label: c.label })), frState.caseIdx, i => { frState.caseIdx = i; renderFrontier(); });
    renderFrontier();
  }
  segmented(document.getElementById("fr-bench"), D.benchmarks.map(b => ({ id: b.id, label: b.name })), frState.bench, id => { frState.bench = id; frState.caseIdx = 0; pickFrCase(); });
  pickFrCase();

  function tierClass(tier) {
    return tier.startsWith("In-corpus") ? "t1" : tier.includes("related") ? "t2" : "t3";
  }

  // ---------- citation copy ----------
  document.getElementById("copy-bib").addEventListener("click", e => {
    navigator.clipboard.writeText(document.getElementById("bibtex").textContent).then(() => {
      e.target.textContent = "Copied";
      setTimeout(() => (e.target.textContent = "Copy"), 1400);
    });
  });
})();
