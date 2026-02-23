import { ComprehendClient, DetectSentimentCommand, DetectKeyPhrasesCommand } from "@aws-sdk/client-comprehend";

export function createComprehend() {
  const region = process.env.AWS_REGION || "eu-central-1";
  return new ComprehendClient({ region });
}

export async function analyzeText(comprehend, text) {
  // Guardrail: trivial input abfangen, damit Demo stabil bleibt
  const clean = (text ?? "").trim();
  if (clean.length < 3) {
    return {
      sentiment: "NEUTRAL",
      confidence: { Positive: 0, Negative: 0, Neutral: 1, Mixed: 0 },
      keyPhrases: []
    };
  }

  const sentimentRes = await comprehend.send(
    new DetectSentimentCommand({ LanguageCode: "de", Text: clean })
  );

  const keyRes = await comprehend.send(
    new DetectKeyPhrasesCommand({ LanguageCode: "de", Text: clean })
  );

  const keyPhrases = (keyRes.KeyPhrases ?? [])
    .map(k => ({ text: k.Text, score: k.Score }))
    .slice(0, 10);

  return {
    sentiment: sentimentRes.Sentiment ?? "NEUTRAL",
    confidence: sentimentRes.SentimentScore ?? {},
    keyPhrases
  };
}