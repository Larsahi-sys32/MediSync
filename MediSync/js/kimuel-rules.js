/* ========================================
   KIMUEL - rule-based engine (no API, no key)
   Matches mild symptoms to general OTC ingredients, using the patient profile
   for age, allergies, current medicines, and pregnancy/breastfeeding.
======================================== */
(function () {
  const ALIAS = {
    paracetamol: ["paracetamol", "acetaminophen", "biogesic", "tempra", "calpol"],
    ibuprofen: ["ibuprofen", "advil", "medicol"],
    mefenamic: ["mefenamic", "ponstan", "dolfenal"],
    loratadine: ["loratadine", "claritin", "allerta"],
    cetirizine: ["cetirizine", "virlix", "allerkid"],
    carbocisteine: ["carbocisteine", "solmux"],
    guaifenesin: ["guaifenesin"],
    dextromethorphan: ["dextromethorphan", "tuseran"],
    butamirate: ["butamirate"],
    phenylephrine: ["phenylephrine"],
    benzydamine: ["benzydamine", "difflam"],
    povidone: ["povidone", "betadine"],
    antacid: ["aluminum hydroxide", "magnesium hydroxide", "kremil", "antacid"],
    famotidine: ["famotidine", "pepcid"],
    simethicone: ["simethicone", "dimez"],
    loperamide: ["loperamide", "diatabs"],
    meclizine: ["meclizine", "bonamine"],
    dimenhydrinate: ["dimenhydrinate", "dramamine"]
  };
  const NSAIDS = ["ibuprofen", "mefenamic"];
  const rx = {
    fever: /fever|lagnat|temperature|headache|sakit ng ulo|body ache|body pain|aches|masakit ang katawan|nilalagnat/i,
    feverWord: /fever|lagnat|temperature|nilalagnat/i,
    allergy: /runny nose|sipon|sneez|hatsing|allerg|itchy nose|watery eyes/i,
    congestion: /congest|stuffy|blocked nose|baradong ilong|barado/i,
    cough: /cough|\bubo\b/i,
    throat: /sore throat|masakit ang lalamunan|lalamunan|throat/i,
    heartburn: /heartburn|hyperacid|acid reflux|acidity|sour stomach|sikmura/i,
    gas: /bloat|\bgas\b|kabag|utot|gassy/i,
    diarrhea: /diarrh|loose stool|\blbm\b|pagtatae|watery stool/i,
    motion: /motion sick|car sick|sea sick|nahihilo|hilo sa|travel sick|vomit.*(car|travel|boat)/i,
    stomach: /upset stomach|stomach ache|stomachache|tummy|sakit ng tiyan|sumasakit ang tiyan|nausea/i,
    flu: /\bflu\b|trangkaso|influenza/i,
    colds: /\bcolds?\b/i,
    phlegm: /phlegm|plema|mucus|productive|wet cough|with phlegm/i,
    dry: /\bdry\b|walang plema|tickl/i,
    dengue: /rash|bleeding gums|nosebleed|pantal|petechiae/i,
    thanks: /^(thanks|thank you|salamat|ok|okay|got it)\b/i
  };
  const yes = t => /^(y|yes|oo|opo|yep)\b/i.test(t.trim());
  const no = t => /^(n|no|none|wala|nope|hindi|n\/a|nothing)\b/i.test(t.trim());
  const hit = (txt, key) => (ALIAS[key] || []).some(a => (txt || "").toLowerCase().includes(a));

  function create(getProfile) {
    const st = { sym: new Set(), dur: null, cough: null, stomach: false, feverWord: false, dengue: false, pending: null, done: false, extra: {} };

    const val = k => {
      const p = getProfile() || {};
      const map = { age: p.age, allergies: p.allergies, medicines: p.medicines, preg: p.pregnantOrBreastfeeding };
      const v = map[k];
      if (v !== null && v !== undefined && v !== "") return v;
      return st.extra[k];
    };

    function detect(text) {
      const s = new Set();
      if (rx.fever.test(text)) s.add("fever");
      if (rx.allergy.test(text)) s.add("allergy");
      if (rx.congestion.test(text)) s.add("congestion");
      if (rx.cough.test(text)) s.add("cough");
      if (rx.throat.test(text)) s.add("throat");
      if (rx.heartburn.test(text)) s.add("heartburn");
      if (rx.gas.test(text)) s.add("gas");
      if (rx.diarrhea.test(text)) s.add("diarrhea");
      if (rx.motion.test(text)) s.add("motion");
      if (rx.flu.test(text)) { s.add("fever"); s.add("congestion"); }
      if (rx.colds.test(text)) { s.add("allergy"); s.add("congestion"); }
      return s;
    }
    function parseDays(t) {
      let m = t.match(/(\d+)\s*(hour|hr|oras)/i); if (m) return 0.5;
      m = t.match(/(\d+)\s*(day|araw)/i); if (m) return Number(m[1]);
      m = t.match(/(\d+)\s*(week|linggo)/i); if (m) return Number(m[1]) * 7;
      if (/week|linggo/i.test(t)) return 7;
      if (/few days|ilang araw/i.test(t)) return 3;
      if (/yesterday|kahapon/i.test(t)) return 1;
      if (/today|ngayon|this morning|since morning|hours/i.test(t)) return 0.5;
      return null;
    }

    function ingest(text) {
      const found = detect(text);
      found.forEach(x => st.sym.add(x));
      if (rx.feverWord.test(text) || rx.flu.test(text)) st.feverWord = true;
      if (rx.stomach.test(text) && !found.has("heartburn") && !found.has("gas") && !found.has("diarrhea")) st.stomach = true;
      if (rx.phlegm.test(text)) st.cough = "phlegm"; else if (rx.dry.test(text) && st.sym.has("cough")) st.cough = "dry";
      if (rx.dengue.test(text) && st.sym.has("fever")) st.dengue = true;
      const d = parseDays(text); if (d !== null) st.dur = d;
      return found;
    }

    function ask(p, q) { st.pending = p; return q; }

    function answer(p, t) {
      if (p === "age") {
        const m = t.match(/\d{1,3}/); const n = m ? Number(m[0]) : NaN;
        if (!(n >= 0 && n <= 120)) return false;
        st.extra.age = n; return true;
      }
      if (p === "allergies") { st.extra.allergies = no(t) ? "none" : t.trim(); return true; }
      if (p === "medicines") { st.extra.medicines = no(t) ? "none" : t.trim(); return true; }
      if (p === "preg") {
        if (yes(t)) st.extra.preg = "yes"; else if (/applicable|n\/a|male|lalaki/i.test(t)) st.extra.preg = "not applicable"; else if (no(t)) st.extra.preg = "no"; else return false;
        return true;
      }
      if (p === "duration") { if (st.dur === null) st.dur = 1; return true; }
      if (p === "cough") { if (!st.cough) st.cough = "dry"; return true; }
      if (p === "stomach") {
        if (!/heartburn|hyperacid|acid|gas|bloat|diarrh|lbm|loose|pagtatae|kabag/i.test(t)) st.sym.add("gas");
        st.stomach = false; return true;
      }
      return true;
    }

    function advance() {
      if (st.dengue) {
        st.dengue = false; st.done = true;
        return "⚠️ **Please see a doctor today.**\n- Fever with a rash or bleeding can be a sign of a serious illness such as dengue.\n- Please don’t take pain relievers like Ibuprofen or Mefenamic acid.\n- Drink plenty of fluids while you go to the nearest clinic or hospital.";
      }
      if (st.stomach) return ask("stomach", "Is your stomach problem **heartburn**, **gas or bloating**, or **diarrhea**?");
      if (st.sym.size === 0) return "I can help with mild **fever and pain**, **colds and cough**, **sore throat**, **allergies**, **heartburn**, **diarrhea**, and **motion sickness**.\nWhat symptoms do you have?";
      if (st.sym.has("cough") && !st.cough) return ask("cough", "Is your cough **with phlegm** or **dry**?");
      if (st.dur === null) return ask("duration", "How long have you had these symptoms? (for example: 1 day, 3 days)");
      if (val("age") === undefined) return ask("age", "How old is the patient?");
      if (Number(val("age")) < 12) return recommend();
      if (val("allergies") === undefined) return ask("allergies", "Do you have any known medicine allergies? (type “none” if not)");
      if (val("medicines") === undefined) return ask("medicines", "Are you taking any other medicines right now? (type “none” if not)");
      if (val("preg") === undefined) {
        if (Number(val("age")) > 55) st.extra.preg = "not applicable";
        else return ask("preg", "Are you pregnant or breastfeeding? (yes, no, or not applicable)");
      }
      return recommend();
    }

    function recommend() {
      st.done = true;
      const age = Number(val("age")), allergies = String(val("allergies") || ""), taking = String(val("medicines") || "");
      const preg = String(val("preg") || "") === "yes";
      const child = age < 12, adult = age >= 18, mid = age >= 18 && age < 60;
      const long = st.dur !== null && st.dur > 3;
      const notes = [];
      const allergic = k => hit(allergies, k) || (NSAIDS.includes(k) && /nsaid|aspirin/i.test(allergies)) || (k === "povidone" && /iodine/i.test(allergies));
      const taken = k => hit(taking, k);
      const ok = k => {
        if (allergic(k)) return false;
        if (taken(k)) { notes.push("You already take " + k[0].toUpperCase() + k.slice(1) + ", so don’t take extra."); return false; }
        return true;
      };

      const meds = [];
      const limited = preg || long;
      if (!limited) {
        const S = st.sym;
        if (S.has("fever")) {
          if (!child && ok("paracetamol")) meds.push("**Paracetamol** (e.g. Biogesic) – for fever, headache, and body aches.");
          if (mid && !st.feverWord && ok("ibuprofen") && ok("mefenamic")) meds.push("**Ibuprofen or Mefenamic acid** – for pain if Paracetamol isn’t enough. Not for people with stomach ulcer, kidney problems, asthma, or those on blood thinners.");
        }
        if (S.has("allergy") && !child) {
          if (ok("loratadine")) meds.push("**Loratadine** – for runny nose and sneezing (less sleepy).");
          else if (ok("cetirizine")) meds.push("**Cetirizine** – for runny nose and sneezing (may cause sleepiness).");
        }
        if (S.has("congestion")) {
          meds.push("**Saline nasal spray** – for nasal congestion.");
          if (adult && ok("phenylephrine")) meds.push("**Phenylephrine** (often in cold tablets) – for stuffy nose. Skip it if you have high blood pressure or heart problems.");
        }
        if (S.has("cough") && !child) {
          if (st.cough === "phlegm") { if (ok("carbocisteine")) meds.push("**Carbocisteine** – loosens thick phlegm."); else if (ok("guaifenesin")) meds.push("**Guaifenesin** – loosens thick phlegm."); }
          else { if (ok("dextromethorphan")) meds.push("**Dextromethorphan** – for dry cough."); else if (ok("butamirate")) meds.push("**Butamirate** – for dry cough."); }
        }
        if (S.has("throat") && !child) {
          if (ok("benzydamine")) meds.push("**Benzydamine** lozenges or gargle – for sore throat.");
          if (adult && ok("povidone")) meds.push("**Povidone-iodine** gargle – for sore throat. Not for long use or if you have thyroid problems.");
        }
        if (S.has("heartburn") && !child) {
          if (ok("antacid")) meds.push("**Antacid** (Aluminum hydroxide + Magnesium hydroxide, e.g. Kremil-S) – for heartburn and hyperacidity. Some already contain Simethicone, so ask the pharmacist.");
          if (adult && ok("famotidine")) meds.push("**Famotidine** – lowers stomach acid if antacids don’t help enough.");
        }
        if (S.has("gas") && !S.has("heartburn") && !child && ok("simethicone")) meds.push("**Simethicone** (e.g. Dimez) – for gas and bloating.");
        if (S.has("diarrhea")) {
          meds.push("**Oral Rehydration Salts** (e.g. Oresol) – replaces fluids lost from diarrhea.");
          if (adult && ok("loperamide")) meds.push("**Loperamide** – slows diarrhea, together with ORS. Don’t use it if you have fever, blood in the stool, or severe stomach pain.");
        }
        if (S.has("motion") && !child && ok("meclizine") && ok("dimenhydrinate")) meds.push("**Meclizine or Dimenhydrinate** (choose one) – for motion sickness. May cause sleepiness; take before travel as the label says.");
      }

      let out = "";
      if (preg || child || long) {
        out += preg ? "Since you are pregnant or breastfeeding, please ask a doctor or pharmacist which medicine is safe for you.\n"
          : child ? "For children under 12, please ask a pharmacist or doctor to choose the medicine and dose.\n"
          : "Your symptoms have lasted more than 3 days, so please see a doctor before taking medicine.\n";
        if (child) {
          if (st.sym.has("congestion")) meds.push("**Saline nasal spray** – for nasal congestion.");
          if (st.sym.has("diarrhea")) meds.push("**Oral Rehydration Salts** (e.g. Oresol) – replaces fluids lost from diarrhea.");
        }
      }
      out += "**Possible Medicine:**\n";
      const uniq = [...new Set(meds)];
      if (uniq.length) {
        uniq.forEach(m => { out += "- " + m + "\n"; });
        out += "- Follow the package instructions and confirm the exact dosage and brand with a licensed pharmacist at the counter.\n";
      } else out += "- None for now. Please ask a doctor or pharmacist what is safe for you.\n";
      notes.forEach(n => { out += "- " + n + "\n"; });

      out += "\n**Recommended Drinks:**\n- Water\n- Warm water or soup\n";
      if (st.sym.has("diarrhea") || st.sym.has("fever")) out += "- Oral fluids in small, frequent sips\n";

      out += "\n**Home Remedies:**\n- Get enough rest.\n- Drink plenty of water.\n";
      if (st.sym.has("throat") || st.sym.has("cough")) out += "- Gargle warm salt water and avoid smoke and cold drinks.\n";
      if (st.sym.has("heartburn") || st.sym.has("gas")) out += "- Eat smaller meals; avoid coffee, spicy, and fatty foods.\n";
      if (st.sym.has("congestion") || st.sym.has("allergy")) out += "- Avoid dust and strong smells.\n";
      if (st.sym.has("motion")) out += "- Sit near a window or the front seat and look at the horizon.\n";
      out += "\n**Reminder:** Please confirm the dosage and brand with a licensed pharmacist at the counter. Consult a doctor if symptoms get worse or do not improve.";
      return out;
    }

    function respond(text) {
      text = text.trim();
      if (st.pending) {
        const p = st.pending;
        if (["duration", "cough", "stomach"].includes(p)) ingest(text);
        if (!answer(p, text)) {
          return p === "age" ? "Please type the age as a number, for example 25." : "Please answer with yes, no, or not applicable.";
        }
        st.pending = null;
        return advance();
      }
      if (st.done) {
        const found = detect(text);
        if (found.size || rx.stomach.test(text)) {
          st.sym = new Set(); st.dur = null; st.cough = null; st.stomach = false; st.feverWord = false; st.dengue = false; st.done = false;
        } else if (rx.thanks.test(text)) return "You’re welcome! 💙 Get well soon. Tell me if you have other symptoms.";
        else return "I can help with other mild symptoms too. What else are you feeling?";
      }
      ingest(text);
      return advance();
    }
    return { respond };
  }
  window.KimuelRules = { create };
})();
