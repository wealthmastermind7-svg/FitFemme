import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

const MOONSHOT_API_URL = "https://api.moonshot.ai/v1/chat/completions";
const MOONSHOT_MODEL = "moonshot-v1-8k-vision-preview";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish (Spanish from Spain/Latin America)",
  pt: "Brazilian Portuguese",
};

function buildNutritionPrompt(language: string): string {
  const langName = LANGUAGE_NAMES[language] ?? "English";
  const examples: Record<string, string> = {
    en: `{"dish":"Vegetarian Plate","description":"A balanced vegetarian meal with eggs and vegetables.","ingredients":["Eggs","Carrots","Pasta","Green vegetables","Mushrooms"]}`,
    es: `{"dish":"Plato Vegetariano","description":"Una comida vegetariana equilibrada con huevos y verduras.","ingredients":["Huevos","Zanahorias","Pasta","Verduras verdes","Champiñones"]}`,
    pt: `{"dish":"Prato Vegetariano","description":"Uma refeição vegetariana equilibrada com ovos e legumes.","ingredients":["Ovos","Cenouras","Macarrão","Verduras","Cogumelos"]}`,
  };
  const example = examples[language] ?? examples.en;
  return `You are a professional nutritionist and food recognition expert.

CRITICAL LANGUAGE REQUIREMENT: You MUST write the values for "dish", "description", and every entry in "ingredients" in ${langName} ONLY. Do NOT use English unless ${langName} is English. This is mandatory — responses with English text when ${langName} is required will be rejected.

Return a JSON object ONLY — no extra text, no markdown, no code fences.

Required shape:
{
  "dish": "Name of the dish in ${langName}",
  "calories": <estimated number>,
  "protein": <grams>,
  "carbs": <grams>,
  "fat": <grams>,
  "fiber": <grams>,
  "healthScore": <integer 1-10>,
  "description": "One-sentence description of the dish in ${langName}.",
  "ingredients": ["ingredient1 in ${langName}", "ingredient2 in ${langName}", ...]
}

Example of a correct response in ${langName}:
${example}

Numeric values must remain numbers (not strings). Do not mix languages.

If no food is detected, return:
{"error": "No food detected in the image."}`;
}

async function analyzeFood(base64: string, language: string): Promise<object> {
  const key = process.env.MOONSHOT_API_KEY;
  if (!key) throw new Error("MOONSHOT_API_KEY is not configured.");

  const body = {
    model: MOONSHOT_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
          {
            type: "text",
            text: buildNutritionPrompt(language),
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 512,
  };

  const resp = await fetch(MOONSHOT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error("Moonshot error:", txt);
    throw new Error(`Moonshot API returned ${resp.status}`);
  }

  const data = await resp.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  // Strip possible markdown code fences
  const cleaned = content.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.error) throw new Error(parsed.error);
  return parsed;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ── Food scanner ────────────────────────────────────────────────────────
  app.post("/api/ai/analyze-food", async (req: Request, res: Response) => {
    try {
      const { imageBase64, language } = req.body as { imageBase64?: string; language?: string };
      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 is required." });
      }
      // Basic size guard (~10 MB base64 ≈ 7.5 MB image)
      if (imageBase64.length > 10_000_000) {
        return res.status(400).json({ error: "Image too large. Please use a smaller photo." });
      }
      const lang = language === "es" || language === "pt" ? language : "en";
      const result = await analyzeFood(imageBase64, lang);
      return res.json(result);
    } catch (err: any) {
      console.error("analyze-food error:", err);
      return res.status(500).json({ error: err.message ?? "Analysis failed." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
