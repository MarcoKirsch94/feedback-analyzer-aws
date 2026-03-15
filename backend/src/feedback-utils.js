export function validateFeedbackText(text) {
  const clean = (text ?? "").toString().trim();

  if (clean.length < 3) {
    return { valid: false, error: "text too short" };
  }

  if (clean.length > 5000) {
    return { valid: false, error: "text too long" };
  }

  return { valid: true, value: clean };
}

export function normalizeSentiment(sentiment) {
  const allowed = ["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"];
  return allowed.includes(sentiment) ? sentiment : "NEUTRAL";
}

export function buildStats(rows) {
  const out = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0, MIXED: 0 };

  for (const row of rows ?? []) {
    if (row?.sentiment in out) {
      out[row.sentiment] = Number(row.count) || 0;
    }
  }

  return out;
}

export function extractTopKeyPhrases(keyPhrases, limit = 10) {
  return (keyPhrases ?? [])
    .map((k) => ({
      text: k.text,
      score: k.score
    }))
    .slice(0, limit);
}