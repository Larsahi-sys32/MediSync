/* ========================================
   KIMUEL THE PHARMACISTS - OTC medicine chat widget
   Reads the patient profile from localStorage and calls POST /api/kimuel
   (see server/kimuel-server.js). Wrapped in an IIFE so it can't clash with page scripts.
======================================== */
(function () {
  const NAME = "Kimuel the Pharmacists";
  const USE_AI = false;                         // false = built-in rules, no API key. true = call /api/kimuel (needs the Node server + key)
  const API_URL = "/api/kimuel";
  const PROFILE_KEY = "medisync_profile";       // {name, age, allergies, medicines, pregnantOrBreastfeeding}
  const MEDS_KEY = "medisync_medications";      // saved by the Medications page

  const RED = /(hirap\s*(huminga|sa paghinga)|difficult\w*\s*breath|can'?t breathe|cannot breathe|short(ness)? of breath|chest\s*(pain|tight)|blood\w*\s*(in|when|with)?\s*(my\s*)?(vomit|stool|poop|feces|cough)|vomit\w*\s*blood|bloody\s*(stool|vomit|poop)|black\s*(stool|poop)|confus|faint|unconscious|seizure|convuls|severe dehydrat|stiff neck|cough\w*\s*(up\s*)?blood)/i;

  const SYMPTOMS = [
    ["🤒 Fever / Headache / Body aches", "I have a mild fever, headache, and body aches"],
    ["🤧 Runny nose / Sneezing", "I have a runny nose and sneezing"],
    ["👃 Nasal congestion", "I have nasal congestion"],
    ["😷 Cough", "I have a cough"],
    ["😖 Sore throat", "I have a sore throat"],
    ["🔥 Heartburn", "I have heartburn"],
    ["🚽 Diarrhea", "I have diarrhea"],
    ["🚗 Motion sickness", "I have motion sickness"]
  ];

  const readJSON = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };

  function getProfile() {
    const p = readJSON(PROFILE_KEY, {});
    const meds = readJSON(MEDS_KEY, []).map(m => m && m.name).filter(Boolean);
    return {
      name: p.name || "",
      age: p.age ?? null,
      allergies: p.allergies ?? null,
      medicines: meds.length ? meds.join(", ") : (p.medicines ?? null),
      pregnantOrBreastfeeding: p.pregnantOrBreastfeeding ?? null
    };
  }

  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function md(t) {
    const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    let out = "", list = false;
    for (const raw of t.split("\n")) {
      const line = raw.trim(), m = line.match(/^([-*•]|\d+\.)\s+(.*)/);
      if (m) { if (!list) { out += "<ul>"; list = true; } out += "<li>" + inl(m[2]) + "</li>"; }
      else { if (list) { out += "</ul>"; list = false; } if (line) out += "<p>" + inl(line) + "</p>"; }
    }
    return out + (list ? "</ul>" : "");
  }

  // ---------- UI ----------
  const root = document.createElement("div");
  root.innerHTML = `
    <button class="kimuel-fab" type="button" aria-label="Chat with ${NAME}">
      <i class="fa-solid fa-user-doctor"></i><span>Ask Kimuel</span>
    </button>
    <section class="kimuel-panel" role="dialog" aria-label="${NAME}">
      <header class="kimuel-head">
        <span class="kimuel-avatar"><i class="fa-solid fa-user-doctor"></i></span>
        <div class="kimuel-title"><strong>${NAME}</strong><span>OTC medicine assistant</span></div>
        <button class="kimuel-close" type="button" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>
      </header>
      <p class="kimuel-note">${USE_AI ? "AI assistant" : "Automated assistant"}, not a licensed pharmacist. General information only. Always confirm the dose and brand with a pharmacist.</p>
      <p class="kimuel-profile"></p>
      <div class="kimuel-log" aria-live="polite"></div>
      <form class="kimuel-form">
        <input type="text" autocomplete="off" placeholder="Type your symptoms here…" aria-label="Message">
        <button type="submit">Send</button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const $ = s => root.querySelector(s);
  const fab = $(".kimuel-fab"), panel = $(".kimuel-panel"), log = $(".kimuel-log"),
        form = $(".kimuel-form"), input = form.querySelector("input"), send = form.querySelector("button"),
        pfLine = $(".kimuel-profile");
  const history = [];
  const engine = !USE_AI && window.KimuelRules ? window.KimuelRules.create(getProfile) : null;
  let busy = false, started = false, chips = null;

  function renderProfileLine() {
    const p = getProfile(), bits = [];
    if (p.name) bits.push(p.name);
    if (p.age !== null && p.age !== "") bits.push(p.age + " yrs");
    if (p.allergies) bits.push("Allergies: " + p.allergies);
    if (p.medicines) bits.push("Medicines: " + p.medicines);
    pfLine.textContent = bits.length ? "👤 Using your profile: " + bits.join(" · ") : "👤 No profile details saved yet. Kimuel may ask for them.";
  }

  function add(role, text, extra) {
    const d = document.createElement("div");
    d.className = "kimuel-msg " + role + (extra ? " " + extra : "");
    d.innerHTML = md(text);
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    return d;
  }
  const setBusy = b => { busy = input.disabled = send.disabled = b; if (!b) input.focus(); };

  function open() {
    panel.classList.add("open"); fab.classList.add("hidden"); renderProfileLine();
    if (!started) {
      started = true;
      const p = getProfile();
      add("bot", "Hi" + (p.name ? ", " + p.name : "") + "! I’m Kimuel 💙\nI can help with mild **fever and pain**, **colds and cough**, **sore throat**, **allergies**, **heartburn**, **diarrhea**, and **motion sickness**.\nTap a symptom below or tell me what you’re feeling.");
      chips = document.createElement("div"); chips.className = "kimuel-chips";
      SYMPTOMS.forEach(([label, text]) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "kimuel-chip"; b.textContent = label; b.dataset.t = text;
        chips.appendChild(b);
      });
      log.appendChild(chips);
    }
    input.focus();
  }
  function close() { panel.classList.remove("open"); fab.classList.remove("hidden"); }

  async function ask(text) {
    if (busy || !text.trim()) return;
    if (chips) chips.style.display = "none";
    add("me", text);
    history.push({ role: "user", content: text });

    if (RED.test(text)) {
      const a = "⚠️ **Please get medical attention right away.**\n- Your symptoms may be serious.\n- Go to the nearest hospital or emergency room, or ask someone to take you.\n- In the Philippines you can call **911** for emergencies.\n- I can’t recommend medicine for these symptoms.";
      add("bot", a, "alert"); history.push({ role: "assistant", content: a });
      return;
    }

    if (engine) {
      setBusy(true);
      const t0 = add("bot", "…");
      t0.innerHTML = '<span class="kimuel-dots"><span></span><span></span><span></span></span>';
      await new Promise(r => setTimeout(r, 500));
      const reply = engine.respond(text);
      t0.innerHTML = md(reply);
      if (/^⚠️/.test(reply)) t0.classList.add("alert");
      history.push({ role: "assistant", content: reply });
      log.scrollTop = log.scrollHeight;
      setBusy(false);
      return;
    }

    setBusy(true);
    const typing = add("bot", "…");
    typing.innerHTML = '<span class="kimuel-dots"><span></span><span></span><span></span></span>';
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20), profile: getProfile() })
      });
      if (!res.ok) throw new Error("http " + res.status);
      const data = await res.json();
      const reply = (data.reply || "").trim() || "Sorry, I couldn’t answer that. Please ask a pharmacist.";
      typing.innerHTML = md(reply);
      history.push({ role: "assistant", content: reply });
    } catch (e) {
      typing.innerHTML = md("Sorry, I’m not available right now. Please ask a pharmacist at Mercury Drug, Watsons, or Southstar Drug.");
      history.pop();
    }
    log.scrollTop = log.scrollHeight;
    setBusy(false);
  }

  fab.addEventListener("click", open);
  $(".kimuel-close").addEventListener("click", close);
  form.addEventListener("submit", e => { e.preventDefault(); const t = input.value; input.value = ""; ask(t); });
  log.addEventListener("click", e => {
    const b = e.target.closest(".kimuel-chip");
    if (!b || busy) return;
    const t = b.dataset.t, v = input.value.trim();
    input.value = v ? v.replace(/[.,]$/, "") + ", " + t.replace(/^I (have|think I have) (an? )?/, "") : t;
    input.focus(); input.setSelectionRange(input.value.length, input.value.length);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("open")) close(); });

  // Optional hook so the Profile page can push data without localStorage.
  window.Kimuel = { open, close, setProfile: p => { localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...readJSON(PROFILE_KEY, {}), ...p })); renderProfileLine(); } };
})();
