const API_BASE = "/api";

const refreshStatsBtn = document.getElementById("refresh-stats-btn");
const loadFeedbackBtn = document.getElementById("load-feedback-btn");
const sentimentFilter = document.getElementById("sentiment-filter");
const feedbackList = document.getElementById("feedback-list");
const adminErrorSection = document.getElementById("admin-error-section");
const adminErrorMessage = document.getElementById("admin-error-message");

async function loadStats() {
  try {
    adminErrorSection.hidden = true;

    const response = await fetch(`${API_BASE}/admin/stats/last-7-days`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Stats konnten nicht geladen werden" }));
      throw new Error(err.error || "Stats konnten nicht geladen werden");
    }

    const data = await response.json();

    document.getElementById("stat-positive").textContent = data.POSITIVE ?? 0;
    document.getElementById("stat-negative").textContent = data.NEGATIVE ?? 0;
    document.getElementById("stat-neutral").textContent = data.NEUTRAL ?? 0;
    document.getElementById("stat-mixed").textContent = data.MIXED ?? 0;
  } catch (err) {
    adminErrorMessage.textContent = err.message;
    adminErrorSection.hidden = false;
  }
}

async function loadFeedback() {
  try {
    adminErrorSection.hidden = true;
    feedbackList.innerHTML = "";

    const sentiment = sentimentFilter.value;
    const url = sentiment
      ? `${API_BASE}/admin/feedback?sentiment=${encodeURIComponent(sentiment)}`
      : `${API_BASE}/admin/feedback`;

    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Feedback konnte nicht geladen werden" }));
      throw new Error(err.error || "Feedback konnte nicht geladen werden");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      feedbackList.innerHTML = "<p>Keine Einträge gefunden.</p>";
      return;
    }

    for (const item of data.items) {
      const div = document.createElement("div");
      div.className = "feedback-item";

      div.innerHTML = `
        <span class="sentiment-badge">${item.sentiment}</span>
        <small>${new Date(item.created_at).toLocaleString("de-DE")}</small>
        <div>${escapeHtml(item.text)}</div>
      `;

      feedbackList.appendChild(div);
    }
  } catch (err) {
    adminErrorMessage.textContent = err.message;
    adminErrorSection.hidden = false;
  }
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

refreshStatsBtn.addEventListener("click", loadStats);
loadFeedbackBtn.addEventListener("click", loadFeedback);

loadStats();
loadFeedback();