import { ReportContent } from "../types";

export async function refineMedicalText(rawText: string, reportType: string): Promise<ReportContent> {
  try {
    const response = await fetch("/api/refine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rawText, reportType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to refine medical text");
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    throw error;
  }
}
