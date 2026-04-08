import { GoogleGenAI, Type } from "@google/genai";
import { ReportContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function refineMedicalText(rawText: string, reportType: string): Promise<ReportContent> {
  const model = "gemini-3-flash-preview";
  
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
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
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

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ReportContent;
  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    throw error;
  }
}
