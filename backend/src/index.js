import "dotenv/config";
import express from "express";
import { createPool, ensureSchema } from "./db.js";
import { createComprehend, analyzeText } from "./comprehend.js";
import { requireAuth } from "./auth.js";

const app = express();
app.use(express.json({ limit: "50kb" }));

const pool = createPool();
const comprehend = createComprehend();

await ensureSchema(pool);

app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.get("/readyz", async (req, res) => {
  try {
    await pool.query("SELECT 1;");
    res.status(200).send("ready");
  } catch {
    res.status(503).send("not ready");
  }
});

/**
 * PUBLIC: Feedback einreichen (kein Login)
 * - macht Comprehend Sentiment + KeyPhrases
 * - speichert in Postgres (RDS später)
 */
app.post("/api/feedback", async (req, res) => {
  const text = (req.body?.text ?? "").toString().trim();
  if (text.length < 3 || text.length > 5000) {
    return res.status(400).json({ error: "text must be 3..5000 chars" });
  }

  try {
    const analysis = await analyzeText(comprehend, text);

    const inserted = await pool.query(
      `INSERT INTO feedback(text, sentiment, confidence_json, key_phrases_json)
       VALUES ($1, $2, $3::jsonb, $4::jsonb)
       RETURNING id, text, created_at, sentiment, confidence_json, key_phrases_json;`,
      [
        text,
        analysis.sentiment,
        JSON.stringify(analysis.confidence ?? {}),
        JSON.stringify(analysis.keyPhrases ?? [])
      ]
    );

    res.status(201).json(inserted.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "analysis_failed" });
  }
});

/**
 * ADMIN: Liste + Filter
 * - später Cognito geschützt (AUTH_DISABLED=false)
 * - optionalGroup="admin" prüft cognito:groups
 */
app.get("/api/admin/feedback", requireAuth("admin"), async (req, res) => {
  const sentiment = req.query.sentiment;
  const params = [];
  let where = "";

  if (sentiment) {
    params.push(sentiment);
    where = `WHERE sentiment = $1`;
  }

  const result = await pool.query(
    `SELECT id, text, created_at, sentiment
     FROM feedback
     ${where}
     ORDER BY created_at DESC
     LIMIT 200;`,
    params
  );

  res.json({ items: result.rows });
});

/**
 * ADMIN: Stats letzte 7 Tage (Button „Aktualisieren“)
 */
app.get(
  "/api/admin/stats/last-7-days",
  requireAuth("admin"),
  async (req, res) => {
    const result = await pool.query(
      `
      SELECT sentiment, COUNT(*)::int AS count
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY sentiment;
      `
    );

    const out = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0, MIXED: 0 };
    for (const r of result.rows) out[r.sentiment] = r.count;

    res.json(out);
  }
);

const port = Number(process.env.PORT || 3001);

// IPv4-bind, damit localhost/127.0.0.1 auf macOS stabil ist
app.listen(port, "0.0.0.0", () => console.log(`backend listening on :${port}`));