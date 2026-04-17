import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

const MOONSHOT_API_URL = "https://api.moonshot.ai/v1/chat/completions";
const MOONSHOT_MODEL = "moonshot-v1-8k-vision-preview";

const NUTRITION_PROMPT = `You are a professional nutritionist and food recognition expert.
Analyze the food in this image and return a JSON object ONLY — no extra text, no markdown.

The JSON must follow this exact shape:
{
  "dish": "Name of the dish",
  "calories": <estimated number>,
  "protein": <grams>,
  "carbs": <grams>,
  "fat": <grams>,
  "fiber": <grams>,
  "healthScore": <integer 1-10>,
  "description": "One-sentence description of the dish.",
  "ingredients": ["ingredient1", "ingredient2", ...]
}

Be accurate and realistic. If no food is detected, return:
{"error": "No food detected in the image."}`;

async function analyzeFood(base64: string): Promise<object> {
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
            text: NUTRITION_PROMPT,
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
      const { imageBase64 } = req.body as { imageBase64?: string };
      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 is required." });
      }
      // Basic size guard (~10 MB base64 ≈ 7.5 MB image)
      if (imageBase64.length > 10_000_000) {
        return res.status(400).json({ error: "Image too large. Please use a smaller photo." });
      }
      const result = await analyzeFood(imageBase64);
      return res.json(result);
    } catch (err: any) {
      console.error("analyze-food error:", err);
      return res.status(500).json({ error: err.message ?? "Analysis failed." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
