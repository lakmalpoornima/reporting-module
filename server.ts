import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "MedReport AI Server is running" });
  });

  app.post("/api/refine", async (req, res) => {
    const { rawText, reportType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const genAI = new (GoogleGenAI as any)(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a professional medical transcription assistant specializing in ${reportType} reports. 
      Refine the following raw medical dictation/text into a structured report for a ${reportType} examination.
      Fix medical spelling, use professional terminology, and structure it into these specific sections: 
      1. 'technique': A list of sequences or methods used (e.g., T1, T2 weighted images).
      2. 'clinicalFindings': Detailed observations.
      3. 'diagnosis': The clinical diagnosis.
      4. 'recommendation': Follow-up or advice.
      5. 'impression': A concise, bolded summary of the most important findings.
      
      Raw Text: "${rawText}"
    `;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technique: { type: Type.ARRAY, items: { type: Type.STRING } },
              clinicalFindings: { type: Type.STRING },
              diagnosis: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              impression: { type: Type.STRING },
            },
            required: ["technique", "clinicalFindings", "diagnosis", "recommendation", "impression"],
          },
        },
      });

      const responseText = result.response.text();
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to refine medical text" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
