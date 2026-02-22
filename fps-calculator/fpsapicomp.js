const API_BASE = "https://fps-proxy.vercel.app/api/fps";
let fpsCPUs = [], fpsGPUs = [], fpsGames = [];

const gameInfoCache = new Map();

const normalizeName = (str) =>
  str?.toUpperCase()
    .replace(/(PALIT|PRIME|GIGABYTE|MSI|ASUS|SLIM|WHITE|GAMING|OC|PRO|DUAL|TUF|VENTUS|STRIX|SUPRIM|PULSE|RED|DEVIL|NITRO|XFX|SAPPHIRE|X|EDITION|SERIES|WINDFORCE|AORUS|MASTER|ICE|CORE|ULTRA)/g, "")
    .replace(/(AMD|INTEL|NVIDIA|GRAPHICS|RADEON|GEFORCE|GPU)/g, "")
    .replace(/\bO?\d+[A-Z]?\d*G\b/gi, "")
    .replace(/\d+\s?(GB|VRAM)/gi, "")
    .replace(/@.*|BOOST|BASE|CLOCK|MHZ|GHZ/gi, "")
    .replace(/[\(\)\.,"]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toQueryName = (str) => String(str || "").toLowerCase().replace(/_/g, "-");

// ---------- DEBUG (zapnout/vypnout) ----------
const FPS_DEBUG = true;
const dlog = (...args) => { if (FPS_DEBUG) console.log(...args); };

// najde TOP kandidáty podle normalizace (aby bylo vidět proč to matchuje)
const debugFindCandidates = (list, name, top = 8) => {
  const norm = normalizeName(name || "");
  const scored = (Array.isArray(list) ? list : []).map(item => {
    const m = normalizeName(item.model || "");
    let score = 0;
    if (m === norm) score += 1000;
    if (norm && m.includes(norm)) score += 200;
    if (m && norm.includes(m)) score += 150;

    const a = new Set(norm.split(" ").filter(Boolean));
    const b = new Set(m.split(" ").filter(Boolean));
    let common = 0;
    for (const t of a) if (b.has(t)) common++;
    score += common * 10;

    return { id: item.id, model: item.model, normModel: m, score };
  }).sort((x, y) => y.score - x.score);

  return { normInput: norm, top: scored.slice(0, top) };
};

/* ---------- meta ---------- */
const fetchMeta = async () => {
  try {
    const [cpus, gpus, games] = await Promise.all([
      fetch(`${API_BASE}?endpoint=cpus`).then(r => r.json()),
      fetch(`${API_BASE}?endpoint=gpus`).then(r => r.json()),
      fetch(`${API_BASE}?endpoint=games`).then(r => r.json())
    ]);

    // vytáhneme presety z /games → parameters
    for (const g of games) {
      const presetParam = (g.parameters || []).find(p =>
        (p.name?.toLowerCase() === "preset") || (p.title?.toLowerCase() === "preset")
      );
      g._presets = Array.isArray(presetParam?.values)
        ? [...new Set(presetParam.values.map(v => String(v).trim()).filter(Boolean))]
        : [];
      // ignorujeme default z API, ať to nikdy neskáče na Epic
      g._defaultPreset = null;
    }

    fpsCPUs = Array.isArray(cpus) ? cpus : [];
    fpsGPUs = Array.isArray(gpus) ? gpus : [];
    fpsGames = Array.isArray(games) ? games : [];

    // viewers načti bokem (UI neblokuj)
    (async () => {
      try {
        await Promise.all(
          fpsGames.map(async (game) => {
            const info = await fetchGameInfo(game.queryName.replace(/-/g, "_"));
            if (info?.viewers) game.viewers = info.viewers;
          })
        );
      } catch {}
    })();
  } catch (err) {
    console.error("❌ Chyba při načítání meta dat:", err);
  }
};

/* --- fallback game-info --- */
const extractPresetsFromInfo = (data) => {
  const tryArrs = [
    data?.presets,
    data?.graphicsPresets,
    data?.presetOptions,
    data?.availablePresets,
    data?.options?.graphicsPreset?.options,
    data?.options?.graphics?.presets,
    data?.game?.presets
  ];
  for (const arr of tryArrs) {
    if (Array.isArray(arr) && arr.length) {
      return [...new Set(arr.map(p => String(p).trim()).filter(Boolean))];
    }
  }
  return [];
};

const fetchGameInfo = async (gameName) => {
  const norm = toQueryName(gameName);
  if (gameInfoCache.has(norm)) return gameInfoCache.get(norm);
  try {
    const url = `${API_BASE}?endpoint=game-info&name=${encodeURIComponent(norm)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("game-info " + res.status);
    const raw = await res.json();
    const presets = extractPresetsFromInfo(raw);
    const info = { ...raw, presets };
    gameInfoCache.set(norm, info);
    return info;
  } catch {
    const info = { presets: [], __error: true };
    gameInfoCache.set(norm, info);
    return info;
  }
};

/* ---------- helpery ---------- */
const getHardwareId = (list, name, label = "HW") => {
  const norm = normalizeName(name || "");

  const exact = (Array.isArray(list) ? list : []).find(item => normalizeName(item.model) === norm);
  if (exact) {
    dlog(`✅ [FPS] ${label} EXACT MATCH`, { input: name, normalized: norm, id: exact.id, model: exact.model });
    return exact.id;
  }

  const partial = (Array.isArray(list) ? list : []).find(item => normalizeName(item.model).includes(norm));
  if (partial) {
    dlog(`🟨 [FPS] ${label} PARTIAL MATCH`, { input: name, normalized: norm, id: partial.id, model: partial.model });
    return partial.id;
  }

  const dbg = debugFindCandidates(list, name, 8);
  dlog(`❌ [FPS] ${label} NOT FOUND`, { input: name, normalized: norm, candidates: dbg.top });
  return null;
};

const getGameByQuery = (gameQueryNameUnderscore) => {
  const q = toQueryName(gameQueryNameUnderscore);
  return fpsGames.find(g => g.queryName === q) || null;
};

const getGameId = (gameName) => {
  const g = getGameByQuery(gameName);
  return g?.id || null;
};

/* ---------- preset UI ---------- */
let presetSwitch = null;
let activePresetName = null;

const ensurePresetSwitch = (fpsBox) => {
  if (presetSwitch && fpsBox.contains(presetSwitch)) return presetSwitch;
  const resRow = fpsBox.querySelector(".fps-resolution-switch");
  presetSwitch = document.createElement("div");
  presetSwitch.className = "fps-preset-switch";
  presetSwitch.innerHTML = `
    <button class="fps-preset-btn" data-slot="low"    type="button">Low</button>
    <button class="fps-preset-btn" data-slot="medium" type="button">Medium</button>
    <button class="fps-preset-btn" data-slot="high"   type="button">High</button>
    <button class="fps-preset-btn" data-slot="epic"   type="button">Epic</button>
  `;
  resRow.insertAdjacentElement("beforebegin", presetSwitch);

  presetSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest(".fps-preset-btn");
    if (!btn || btn.disabled) return;
    const realName = btn.getAttribute("data-preset");
    if (!realName) return;
    activePresetName = realName;
    presetSwitch.querySelectorAll(".fps-preset-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    dlog("🎚️ [FPS] preset click", { slot: btn.getAttribute("data-slot"), realName });
    updateFPS();
  });

  return presetSwitch;
};

/* mapování slotů → názvy (SMART + korektní 2–3 preset režim) */
const mapPresets = (list) => {
  const raw = Array.isArray(list)
    ? [...new Set(list.map(v => String(v).trim()).filter(Boolean))]
    : [];

  if (!raw.length) return { low: null, medium: null, high: null, epic: null };

  // normalizace pro hledání (nezasahuje do reálných názvů, jen pro matching)
  const norm = (s) => String(s || "")
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const findBy = (re) => raw.find(v => re.test(norm(v))) || null;

  // --- speciální režimy: 2–3 presety (nejčastější problém)
  // 3 presety typicky: Normal / High / Ultra (GTA V)
  if (raw.length === 3) {
    const pNormal = findBy(/(^|\b)(normal|default|balanced|recommended|recommend|medium|med)(\b|$)/);
    const pHigh   = findBy(/(^|\b)(high)(\b|$)/);
    const pUltra  = findBy(/(^|\b)(ultra|very high|epic|max|maximum|extreme|insane)(\b|$)/);

    // fallback: drž pořadí, ale epic vždy vypni
    const a = pNormal || raw[0];
    const b = pHigh   || raw[1];
    const c = pUltra  || raw[2];

    return {
      low: a,        // Low tlačítko = Normal
      medium: b,     // Medium tlačítko = High
      high: c,       // High tlačítko = Ultra
      epic: null     // Epic vypnout (hra nemá 4. preset)
    };
  }

  // 2 presety: mapuj na Low/High, ostatní vypni
  if (raw.length === 2) {
    const pLowish  = findBy(/(^|\b)(low|min|minimum|very low|normal|default|balanced|recommended|recommend|medium|med)(\b|$)/) || raw[0];
    const pHighish = findBy(/(^|\b)(high|ultra|very high|epic|max|maximum|extreme|insane)(\b|$)/) || raw[1];

    // pokud by matching vrátil stejnou položku, vezmi druhou z raw
    const lowFinal  = pLowish;
    const highFinal = (pHighish !== lowFinal) ? pHighish : raw[1];

    return {
      low: lowFinal,
      medium: null,
      high: highFinal,
      epic: null
    };
  }

  // --- obecné mapování: klíčová slova + fallback
  const low  = findBy(/(^|\b)(low|min|minimum|very low)(\b|$)/);
  const med  = findBy(/(^|\b)(medium|med|normal|balanced|default|recommended|recommend)(\b|$)/);
  const high = findBy(/(^|\b)(high)(\b|$)/);
  const epic = findBy(/(^|\b)(epic|ultra|very high|max|maximum|extreme|insane)(\b|$)/);

  // odstraň duplicity (když se například "high" trefí i do "very high")
  const used = new Set([low, med, high, epic].filter(Boolean));
  const rest = raw.filter(v => !used.has(v));

  const out = {
    low: low || null,
    medium: med || null,
    high: high || null,
    epic: epic || null
  };

  // doplň chybějící sloty rozumně zbytkem
  const fillOrder = ["medium", "high", "low", "epic"]; // preferujeme MEDIUM jako výchozí
  for (const slot of fillOrder) {
    if (!out[slot] && rest.length) out[slot] = rest.shift();
  }

  if (!out.low && raw[0]) out.low = raw[0];

  return out;
};

/* preferuj MEDIUM → HIGH → LOW → první dostupný */
const pickDefaultPreset = (mapping) => {
  const valid = ["low","medium","high","epic"].map(k => mapping[k]).filter(Boolean);
  const exactMed = valid.find(v => /^medium$/i.test(v));
  const plainMed = valid.find(v => /(^|[^a-z])medium([^a-z]|$)/i.test(v));
  if (exactMed) return exactMed;
  if (plainMed) return plainMed;
  return mapping.medium || mapping.high || mapping.low || valid[0] || null;
};

/* tvrdé nastavení aktivního tlačítka podle slotu (prefer MEDIUM) */
const forceActiveBySlot = (slotOrder = ["medium","high","low","epic"]) => {
  for (const slot of slotOrder) {
    const btn = presetSwitch.querySelector(`.fps-preset-btn[data-slot="${slot}"]`);
    const real = btn?.getAttribute("data-preset");
    if (btn && !btn.disabled && real) {
      presetSwitch.querySelectorAll(".fps-preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePresetName = real;
      return true;
    }
  }
  return false;
};

const paintPresetButtons = (mapping) => {
  presetSwitch.querySelectorAll(".fps-preset-btn").forEach(btn => {
    const slot = btn.getAttribute("data-slot");
    const realName = mapping[slot];
    btn.classList.remove("active");
    if (realName) {
      btn.disabled = false;
      btn.classList.remove("disabled","crossed");
      btn.setAttribute("data-preset", realName);
      btn.title = realName;
    } else {
      btn.disabled = true;
      btn.classList.add("disabled","crossed");
      btn.removeAttribute("data-preset");
      btn.title = "-";
    }
  });

  const prefer = pickDefaultPreset(mapping);
  const valid = Object.values(mapping).filter(Boolean);
  if (!activePresetName || !valid.includes(activePresetName)) {
    activePresetName = prefer;
  }

  if (activePresetName) {
    const btn = Array.from(presetSwitch.querySelectorAll(".fps-preset-btn"))
      .find(b => b.getAttribute("data-preset") === activePresetName);
    btn?.classList.add("active");
  }
};

/* ---------- API predict ---------- */
const fetchFPS = async (cpuId, gpuId, gameId, resolution) => {
  const tryFetch = async (preset = null) => {
    const game = { id: gameId, resolution, ...(preset ? { preset } : {}) };
    const cs2Id = "65e0fbc4d1b58e0ac8a0dca4";
    if (gameId === cs2Id) game.maps = "Mirage";

    dlog("📡 [FPS] batch request", { cpuId, gpuId, gameId, resolution, preset });

    const res = await fetch(`${API_BASE}?endpoint=batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpuIds: [cpuId], gpuIds: [gpuId], games: [game] })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.predictions?.[0] || null;
  };

  try {
    if (activePresetName) return await tryFetch(activePresetName);
    try { return await tryFetch("Medium"); } // fallback na Medium
    catch { return await tryFetch(); }
  } catch {
    try { return await tryFetch(); }
    catch { return null; }
  }
};

/* ---------- UI core ---------- */
let updateFPS;

const runFPSBox = async () => {
  const breadcrumb = document.querySelector(".breadcrumbs");
  if (!breadcrumb) return;

  const breadcrumbText = Array.from(breadcrumb.querySelectorAll("span[itemprop='name']"))
    .map(span => span.textContent.toLowerCase().trim());
  const hasGaming = breadcrumbText.some(t =>
    ["herní (gaming)", "herné (gaming)", "játék (gaming)"].includes(t)
  );
  const hasPC = breadcrumbText.some(t => t.includes("počítač") || t.includes("számítógép"));
  if (!(hasGaming && hasPC)) return;

  const wrapper = document.querySelector('.col-xs-12.col-lg-6.p-image-wrapper');
  const description = document.querySelector('.p-short-description');
  const fpsBox = document.createElement("div");
  fpsBox.className = "fps-box-wrapper";

  const lang = window.location.pathname.startsWith("/sk") ? "sk"
    : window.location.pathname.startsWith("/hu") ? "hu" : "cz";

  const titles = {
    sk: "Koľko budete mať FPS?",
    cz: "Kolik budete mít FPS?",
    hu: "Mennyi FPS-ed lesz?"
  };

  const subtitles = {
    sk: "Zobrazené FPS sú orientačné minimálne hodnoty",
    cz: "Zobrazené FPS jsou orientační minimální hodnoty",
    hu: "A megjelenített FPS értékek irányadó, minimális értékek"
  };

  const soonText = { sk: "Čoskoro", cz: "Již brzy", hu: "Hamarosan" };

  fpsBox.innerHTML = `
    <div class="fps-box-header">
      <div>
        <h4 class="fps-heading">
          <svg class="fps-heading-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34">
            <path d="m19.2321 8.82918c-.2314-.38262-.6893-.56446-1.1201-.44436-.4306.12011-.7287.51258-.7287.95952 0 1.21586-.9891 2.20466-2.2046 2.20466-1.2156 0-2.2047-.9888-2.2047-2.20466v-8.348253c0-.402847-.2428-.766006-.615-.9200899-.3722-.1543427-.8005-.06925971-1.0853.2158209-.1121.111801-2.76807 2.783612-5.45908 6.820132-1.587 2.38025-2.85339 4.74135-3.76388 7.01755-1.153294 2.8837-1.73824 5.6443-1.73824 8.2053 0 6.4321 5.23312 11.6652 11.6655 11.6652 6.432 0 11.6651-5.2331 11.6651-11.6652.0003-4.1174-1.484-8.6613-4.411-13.50562zm-.6076 13.24652c0 .5502-.4459.9961-.9961.9961-.5499 0-.996-.4459-.996-.9961v-1.8628l-4.9598 4.96c-.187.1868-.4402.2916-.7045.2916-.2641 0-.5175-.1048-.7043-.2916l-2.31328-2.3136-1.55899 1.559c-.3891.3891-1.0197.3891-1.4088 0s-.3891-1.0197 0-1.4088l2.26352-2.2632c.3891-.3889 1.0197-.3889 1.40879.0002l2.31306 2.3133 4.2557-4.2557h-1.863c-.5502 0-.9961-.4459-.9961-.9961s.4459-.9961.9961-.9961h4.2679c.5499 0 .9961.4462.9961.9961v4.2677z"/>
          </svg>${titles[lang]}
        </h4>
        <small class="fps-note">${subtitles[lang]}</small>
        <div class="fps-search-wrapper">
          <input class="fps-search" type="text" placeholder="${
            lang === "hu" ? "Játék keresése..." : (lang === "sk" ? "Vyhledat hru..." : "Vyhledat hru...")
          }" />
        </div>
      </div>
      <div class="fps-value-box">
        <div class="value fps-coming-soon" id="fpsValue">${soonText[lang]}</div>
        <div class="label">FPS</div>
      </div>
    </div>

    <div class="fps-games-wrapper">
      <div class="fps-scroll-arrow fps-scroll-left"><span class="arrow-text">&#8249;</span></div>
      <div class="fps-games"></div>
      <div class="fps-scroll-arrow fps-scroll-right"><span class="arrow-text">&#8250;</span></div>
    </div>

    <div class="fps-resolution-switch">
      <div class="fps-res-btn active" data-res="1920x1080">Full HD 1920 x 1080</div>
      <div class="fps-res-btn" data-res="2560x1440">WQHD 2560 x 1440</div>
      <div class="fps-res-btn" data-res="3840x2160">4K 3840 x 2160</div>
    </div>

    <div class="fps-logo-mark">
      <img src="/user/documents/upload/how_many_fps.png" alt="How Many FPS logo">
    </div>
  `;

  if (window.innerWidth <= 768 && description) {
    description.insertAdjacentElement("afterend", fpsBox);
  } else {
    wrapper?.appendChild(fpsBox);
  }

  await fetchMeta();

  const fpsValue = fpsBox.querySelector("#fpsValue");
  const gamesScroll = fpsBox.querySelector(".fps-games");
  const leftArrow = fpsBox.querySelector(".fps-scroll-left");
  const rightArrow = fpsBox.querySelector(".fps-scroll-right");

  let activeGame = fpsGames[0]?.queryName.replace(/-/g, "_") || "League_of_Legends";
  let activeRes = "1920x1080";

  ensurePresetSwitch(fpsBox);

  const getCurrentCpuGpu = () => {
    let cpu = "", gpu = "";
    document.querySelectorAll(".konfigurace-item").forEach(item => {
      const title = item.querySelector(".konfigurace-title")?.textContent.toLowerCase();
      const value = item.querySelector(".konfigurace-specs")?.textContent.trim();
      if (title?.includes("cpu") && !title.includes("chladič")) cpu = value || cpu;
      if (title?.includes("gpu")) gpu = value || gpu;
    });

    const upgradeSelect = document.querySelector("select[data-parameter-name='Upgrade CPU']");
    if (upgradeSelect && upgradeSelect.value) {
      const selectedOption = upgradeSelect.querySelector("option:checked");
      const text = selectedOption?.textContent || "";
      const parsed = text.replace(/\s*\+.*$/, "").trim();
      if (parsed) cpu = parsed;
    }

    return { cpu, gpu };
  };

  const pickAndPaintPresetsForActiveGame = async (forceMedium = false) => {
    const meta = getGameByQuery(activeGame);
    let presets = meta?._presets || [];

    if (!presets.length) {
      const info = await fetchGameInfo(activeGame);
      presets = info.presets || [];
    }
    if (!presets.length) {
      presets = ["Low","Medium","High","Ultra","Very High"];
    }

    const mapping = mapPresets(presets);

    // nový výběr (nepřenášet mezi hrami)
    activePresetName = null;
    paintPresetButtons(mapping);

    // při startu / přepnutí vždy preferuj MEDIUM → HIGH → LOW → EPIC
    if (forceMedium) {
      forceActiveBySlot(["medium","high","low","epic"]);
    }

    dlog("🎛️ [FPS] Presety", { activeGame, presets, mapping, activePresetName });
  };

  updateFPS = async () => {
    const { cpu, gpu } = getCurrentCpuGpu();

    dlog("🧩 [FPS] Detekce HW z webu", { cpuText: cpu, gpuText: gpu });

    const cpuId = getHardwareId(fpsCPUs, cpu, "CPU");
    const gpuId = getHardwareId(fpsGPUs, gpu, "GPU");
    const gameId = getGameId(activeGame);

    dlog("🎮 [FPS] Kontext dotazu", { activeGame, gameId, activeRes, activePresetName });

    if (!cpuId || !gpuId || !gameId) {
      dlog("⛔ [FPS] Chybí ID → FPS se nepočítá", { cpuId, gpuId, gameId });
      fpsValue.textContent = soonText[lang];
      fpsValue.className = "value fps-coming-soon";
      return;
    }

    const prediction = await fetchFPS(cpuId, gpuId, gameId, activeRes);
    fpsValue.classList.remove("fps-low","fps-medium","fps-high","fps-coming-soon");

    if (prediction && typeof prediction.fps?.avgFps === "number") {
      const fps = prediction.fps.avgFps;
      fpsValue.textContent = fps < 10 ? "<10" : Math.round(fps);
      fpsValue.classList.add(fps < 40 ? "fps-low" : fps < 60 ? "fps-medium" : "fps-high");
    } else {
      fpsValue.textContent = soonText[lang];
      fpsValue.classList.add("fps-coming-soon");
    }
  };

  const renderGames = (list) => {
    const langKey = lang === "sk" ? "sk" : (lang === "hu" ? "hu" : "cz");
    const html = list.map(game => {
      const year = game.releaseDate ? new Date(game.releaseDate * 1000).getFullYear() : "";
      const viewersRaw = game.twitch?.viewers ?? game.viewers ?? null;
      const viewers = Number(viewersRaw);
      const viewersOk = Number.isFinite(viewers) && viewers > 0;

      const viewersTitle = {
        sk: `${viewersOk ? viewers.toLocaleString("sk-SK") : ""} ${viewersOk ? "sledujúcich na Twitchi" : ""}`.trim(),
        cz: `${viewersOk ? viewers.toLocaleString("cs-CZ") : ""} ${viewersOk ? "sledujících na Twitchi" : ""}`.trim(),
        hu: `${viewersOk ? viewers.toLocaleString("hu-HU") : ""} ${viewersOk ? "Twitch nézők száma" : ""}`.trim()
      };

      return `
        <div class="fps-game" data-game="${game.queryName.replace(/-/g, '_')}" title="${game.name}">
          <div class="fps-game-overlay">
            ${year ? `<div class="fps-tag fps-tag-year">${year}</div>` : ""}
            ${viewersOk ? `
              <div class="fps-tag fps-tag-viewers" title="${viewersTitle[langKey]}">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 15 17">
                  <g fill="white">
                    <path d="m3.125 0-3.125 3.03571v10.92859h3.75v3.0357l3.125-3.0357h2.5l5.625-5.4643v-8.5zm10.625 7.89286-2.5 2.42854h-2.5l-2.1875 2.125v-2.125h-2.8125v-9.10711h10z"/>
                    <path d="m11.875 3.33936h-1.25v3.64285h1.25z"/>
                    <path d="m8.4375 3.33936h-1.25v3.64285h1.25z"/>
                  </g>
                </svg>${Math.round(viewers / 1000)}K
              </div>` : ""}
          </div>
          <img src="${game.imageUrl}" alt="${game.name}" />
          <div class="fps-game-title">${game.name}</div>
        </div>
      `;
    }).join("");

    gamesScroll.innerHTML = html;
    fpsBox.querySelector(`.fps-game[data-game="${activeGame}"]`)?.classList.add("active");
  };

  /* start */
  renderGames(fpsGames);
  await pickAndPaintPresetsForActiveGame(true); // prefer MEDIUM

  if (typeof window.showGameInfo === "function") {
    window.showGameInfo(activeGame);
  }

  // rozlišení
  fpsBox.querySelectorAll(".fps-res-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      fpsBox.querySelectorAll(".fps-res-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeRes = btn.dataset.res;
      updateFPS();
    });
  });

  // výběr hry
  gamesScroll.addEventListener("click", async e => {
    const game = e.target.closest(".fps-game");
    if (!game) return;
    fpsBox.querySelectorAll(".fps-game").forEach(g => g.classList.remove("active"));
    game.classList.add("active");
    activeGame = game.dataset.game;

    await pickAndPaintPresetsForActiveGame(true); // prefer MEDIUM
    updateFPS();

    if (typeof window.showGameInfo === "function") {
      window.showGameInfo(activeGame);
    }
  });

  // vyhledávání
  const fpsSearchInput = fpsBox.querySelector(".fps-search");
  if (fpsSearchInput) {
    fpsSearchInput.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      const filtered = fpsGames.filter(g => g.name.toLowerCase().includes(q));
      renderGames(filtered);
      updateArrows();
    });
    fpsSearchInput.addEventListener("keydown", e => { if (e.key === 'Enter') e.preventDefault(); });
  }

  // throttling přes rAF + pasivní posluchače
  let rafId = null;
  const updateArrows = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const scrollLeft = gamesScroll.scrollLeft;
      const scrollWidth = gamesScroll.scrollWidth;
      const clientWidth = gamesScroll.clientWidth;
      const gameCount = gamesScroll.querySelectorAll(".fps-game").length;
      leftArrow.style.display  = gameCount > 1 && scrollLeft > 5 ? "flex" : "none";
      rightArrow.style.display = gameCount > 1 && scrollLeft + clientWidth < scrollWidth - 5 ? "flex" : "none";
    });
  };

  gamesScroll.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows, { passive: true });
  leftArrow.addEventListener("click", () => gamesScroll.scrollBy({ left: -200, behavior: "smooth" }));
  rightArrow.addEventListener("click", () => gamesScroll.scrollBy({ left: 200, behavior: "smooth" }));

  const upgradeCPU = document.querySelector("select[data-parameter-name='Upgrade CPU']");
  if (upgradeCPU) upgradeCPU.addEventListener("change", updateFPS);

  updateArrows();
  updateFPS();
};

document.addEventListener("DOMContentLoaded", runFPSBox);