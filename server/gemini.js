import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are TravaAI, a friendly and knowledgeable AI Travel Concierge.

Your job is to help users plan trips by considering their budget, travel style, and trip details.
You have access to the user's current trip data below — use it to give specific, personalized advice
instead of generic suggestions. Reference actual numbers, destinations, or dates from their data when relevant.

Keep responses conversational, concise, and helpful. Avoid long lists unless the user asks for one.
If their trip data shows a budget, factor it into your suggestions and flag if something seems out of range.`;

app.post("/api/chat", async (req, res) => {
  const { message, tripContext } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const contextBlock = tripContext
      ? `\n\nUser's current trip data:\n${JSON.stringify(tripContext, null, 2)}`
      : "";

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + contextBlock,
      },
    });

    res.json({ text: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));