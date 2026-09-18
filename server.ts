import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: "15mb" }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing in server environment");
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// NVIDIA NIM Configuration
const NVIDIA_NIM_KEY =
  process.env.NVIDIA_NIM_API_KEY ||
  "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";
const NVIDIA_NIM_BASE_URL =
  process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "openai/gpt-oss-20b";

// Health check and Model Info
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: "NVIDIA NIM",
    model: NVIDIA_MODEL,
    timestamp: Date.now(),
  });
});

app.get("/api/model/info", (req, res) => {
  res.json({
    provider: "NVIDIA NIM Inference Microservice",
    model: NVIDIA_MODEL,
    baseUrl: NVIDIA_NIM_BASE_URL,
    features: [
      "OpenAI GPT-OSS-20B 21B MoE Reasoning",
      "Full Chain-of-Thought Extraction",
      "Real-time Executive Briefing Synthesis",
      "Action-Item & Sentiment Analysis",
    ],
  });
});

/**
 * Summarize email endpoint powered by NVIDIA NIM gpt-oss-20b
 */
app.post("/api/email/summarize", async (req, res) => {
  const startTime = Date.now();
  try {
    const { sender, senderName, subject, bodySnippet, date } = req.body;
    if (!subject && !bodySnippet) {
      return res.status(400).json({ error: "Missing email contents" });
    }

    const systemPrompt = `You are an executive email audio assistant for a busy professional.
Analyze the email and output ONLY valid JSON without backticks, markdown code blocks, or preamble.
The JSON object must strictly have these fields:
- headline: A 1-sentence punchy summary of what this email is about.
- keyPoints: Array of 2 to 4 concise bullet points explaining key updates.
- actionItems: Array of specific next steps, required replies, deadlines, or ["None"] if purely informational.
- sentiment: Exactly one of "positive", "urgent", "neutral", "action_required".
- priority: Exactly one of "high", "medium", "low".
- category: Exactly one of "work", "personal", "updates", "finance", "general".
- audioNarrationText: A natural, spoken-style narration script (approx 20-35 seconds spoken aloud) starting with: "Email from ${senderName || sender}: [Punchy Headline]..." then summarizing the key takeaway and required action clearly as if a personal executive assistant is briefing the user on headphones.
- estimatedReadSeconds: Estimated number of seconds to read this summary (e.g. 15).`;

    const userPrompt = `Summarize this email for mobile audio digest:
Sender: ${senderName || sender} <${sender}>
Date: ${date || "Recent"}
Subject: ${subject}
Content:
${(bodySnippet || "").slice(0, 3000)}`;

    const nimResponse = await fetch(`${NVIDIA_NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_NIM_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 900,
      }),
    });

    if (!nimResponse.ok) {
      const errText = await nimResponse.text();
      console.error(`NVIDIA NIM API error (${nimResponse.status}):`, errText);
      throw new Error(`NVIDIA NIM error: ${errText}`);
    }

    const nimData: any = await nimResponse.json();
    const message = nimData.choices?.[0]?.message;
    const rawContent = message?.content || "";
    const reasoning = message?.reasoning_content || message?.reasoning || "";

    // Clean JSON content if wrapped in markdown code fence
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsedSummary: any;
    try {
      parsedSummary = JSON.parse(cleanJson);
    } catch (parseErr) {
      // Fallback: extract first JSON object with regex
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedSummary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Unable to parse JSON from NVIDIA NIM output");
      }
    }

    if (reasoning) {
      parsedSummary.reasoning = reasoning;
    }

    const latencyMs = Date.now() - startTime;
    return res.json({
      summary: parsedSummary,
      model: NVIDIA_MODEL,
      provider: "NVIDIA NIM",
      latencyMs,
    });
  } catch (error: any) {
    console.error("Error summarizing email with NVIDIA NIM:", error);
    return res.status(500).json({
      error: error.message || "Failed to summarize email via NVIDIA NIM",
    });
  }
});

/**
 * Text-to-Speech endpoint converting email narration to audio using gemini-3.1-flash-tts-preview
 */
app.post("/api/email/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text to synthesize" });
    }

    const ai = getGenAI();

    // Voice names allowed: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const allowedVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const selectedVoice = allowedVoices.includes(voiceName) ? voiceName : "Kore";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text.slice(0, 1000) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = audioPart?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({ error: "No audio data returned from Gemini TTS" });
    }

    return res.json({
      audioBase64: base64Audio,
      format: "pcm",
      sampleRate: 24000,
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate speech" });
  }
});

/**
 * Start Server with Vite middleware
 */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Email Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
