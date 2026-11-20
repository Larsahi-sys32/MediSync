// Minimal backend for Kimuel. Keeps the Claude API key and system prompt off the browser.
// Run:  npm i express @anthropic-ai/sdk  &&  ANTHROPIC_API_KEY=sk-... node server/kimuel-server.js
const express = require("express");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const SYSTEM = require("./kimuel-prompt");

const app = express();
const client = new Anthropic(); // reads ANTHROPIC_API_KEY
app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, ".."))); // serves /front-end, /js, images

const show = (v, label) => `${label}: ${v === null || v === undefined || v === "" ? "not on file" : String(v).slice(0, 200)}`;

app.post("/api/kimuel", async (req, res) => {
  try {
    const { messages = [], profile = {} } = req.body || {};
    const clean = messages.slice(-20)
      .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
    if (!clean.length || clean[clean.length - 1].role !== "user") return res.status(400).json({ error: "bad request" });

    const profileText = "PATIENT PROFILE (from the system, trusted, do not ask again):\n- " + [
      show(profile.age, "Age"),
      show(profile.allergies, "Known medicine allergies"),
      show(profile.medicines, "Current medicines"),
      show(profile.pregnantOrBreastfeeding, "Pregnant or breastfeeding")
    ].join("\n- ");

    const out = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 700,
      system: SYSTEM + "\n\n" + profileText,
      messages: clean
    });
    res.json({ reply: out.content.filter(b => b.type === "text").map(b => b.text).join("\n") });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "unavailable" });
  }
});

app.listen(3000, () => console.log("MediSync + Kimuel on http://localhost:3000/front-end/html/dashboard.html"));
