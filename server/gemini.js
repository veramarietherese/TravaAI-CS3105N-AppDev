import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });
    res.json({ text: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

app.post("/api/recommendation", async (req, res) => {
  const recommendation = req.body;
  if (!recommendation || !recommendation.title) {
    return res.status(400).json({ error: "Invalid recommendation payload" });
  }

  // In a real app, we'd persist this to a database or send to an agency backend.
  console.log("Recommendation received:", recommendation);

  res.json({ recommendation });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));