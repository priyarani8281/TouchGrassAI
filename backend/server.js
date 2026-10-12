const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve the TouchGrass AI website
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "TouchGrass AI backend is running!" });
});

// Generate outdoor activities using the local Ollama model
app.post("/api/activities", async (req, res) => {
  try {
    const minutes = [10, 20, 30].includes(Number(req.body.minutes))
      ? Number(req.body.minutes)
      : 20;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt: `Suggest exactly 3 safe, practical outdoor activities for a student with ${minutes} minutes available. Return a numbered list with a short title and one-sentence description for each. Avoid unsafe or inaccessible suggestions.`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Ollama returned HTTP " + response.status);
    }

    const data = await response.json();
    res.json({ activities: data.response });
  } catch (error) {
    console.error("AI request failed:", error.message);
    res.status(503).json({
      error: "Could not reach Ollama. Make sure Ollama is running and qwen2.5:3b is installed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`TouchGrass AI is running at http://localhost:${PORT}`);
});