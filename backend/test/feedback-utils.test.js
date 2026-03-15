import test from "node:test";
import assert from "node:assert/strict";
import {
  validateFeedbackText,
  normalizeSentiment,
  buildStats,
  extractTopKeyPhrases
} from "../src/feedback-utils.js";

test("validateFeedbackText rejects too short text", () => {
  const result = validateFeedbackText("Hi");
  assert.equal(result.valid, false);
  assert.equal(result.error, "text too short");
});

test("validateFeedbackText accepts valid text", () => {
  const result = validateFeedbackText("Das Produkt ist gut");
  assert.equal(result.valid, true);
  assert.equal(result.value, "Das Produkt ist gut");
});

test("normalizeSentiment keeps valid sentiment", () => {
  assert.equal(normalizeSentiment("POSITIVE"), "POSITIVE");
});

test("normalizeSentiment falls back to NEUTRAL", () => {
  assert.equal(normalizeSentiment("UNKNOWN"), "NEUTRAL");
});

test("buildStats maps DB rows into fixed stats object", () => {
  const rows = [
    { sentiment: "POSITIVE", count: 3 },
    { sentiment: "NEGATIVE", count: 1 }
  ];

  assert.deepEqual(buildStats(rows), {
    POSITIVE: 3,
    NEGATIVE: 1,
    NEUTRAL: 0,
    MIXED: 0
  });
});

test("extractTopKeyPhrases limits result size", () => {
  const phrases = [
    { text: "A", score: 0.9 },
    { text: "B", score: 0.8 },
    { text: "C", score: 0.7 }
  ];

  const result = extractTopKeyPhrases(phrases, 2);

  assert.deepEqual(result, [
    { text: "A", score: 0.9 },
    { text: "B", score: 0.8 }
  ]);
});