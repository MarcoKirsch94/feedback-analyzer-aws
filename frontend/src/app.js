const API_BASE = "/api";

const form = document.getElementById("feedback-form");
const resultSection = document.getElementById("result-section");
const errorSection = document.getElementById("error-section");
const resultSentiment = document.getElementById("result-sentiment");
const resultConfidence = document.getElementById("result-confidence");
const resultKeyphrases = document.getElementById("result-keyphrases");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  resultSection.hidden = true;
  errorSection.hidden = true;
  resultKeyphrases.innerHTML = "";

  const text = document.getElementById("feedback-text").value.trim();

  try {
    const response = await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Unbekannter Fehler" }));
      throw new Error(err.error || "Request fehlgeschlagen");
    }

    const data = await response.json();

    resultSentiment.textContent = data.sentiment;
    resultConfidence.textContent = JSON.stringify(data.confidence_json, null, 2);

    for (const phrase of data.key_phrases_json || []) {
      const li = document.createElement("li");
      li.textContent = `${phrase.text} (${(phrase.score * 100).toFixed(2)}%)`;
      resultKeyphrases.appendChild(li);
    }

    resultSection.hidden = false;
    form.reset();
  } catch (err) {
    errorMessage.textContent = err.message;
    errorSection.hidden = false;
  }
});