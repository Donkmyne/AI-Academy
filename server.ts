import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

// Ensure the Gemini API key is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment variables.");
}

// Lazy helper to get Gemini client or throw descriptive error
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    throw new Error("Gemini API key is missing. Please define GEMINI_API_KEY in Settings > Secrets or in the environment.");
  }
  return aiClient;
}

// Lazy helper to get Stripe client or throw descriptive error
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined. Please configure it in Settings > Secrets or in the environment.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(stripeKey, {
      apiVersion: "2025-02-18-preview" as any,
    });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // API Route: Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasApiKey: !!apiKey });
  });

  // API Route: Explain / AI Tutor
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { topic, context } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const client = getAiClient();
      const prompt = `You are an expert interactive AI Tutor at the Neonmorphic AI Learning Academy. 
Explain the following topic with maximum clarity, beauty, and structure using Markdown format. 
Make sure it sounds professional, deep, yet easy to digest. Use bullet points, bold text, code examples if relevant, and key takeaways.
Topic: ${topic}
Additional Context: ${context || "None"}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a supportive, insightful, and brilliant AI mentor. Format responses in clean Markdown.",
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Explain error:", error);
      res.status(500).json({ error: error.message || "An error occurred with the AI Tutor." });
    }
  });

  // API Route: Generate Quiz
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { topic, difficulty = "Intermediate" } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const client = getAiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a 5-question multiple choice quiz on the topic: "${topic}". Difficulty level: ${difficulty}. Ensure that each question has exactly 4 options, only 1 is correct, and the correctAnswerIndex is a 0-based index. Include a short helpful explanation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswerIndex: { type: Type.INTEGER, description: "0-based index (0, 1, 2, or 3) of the correct answer" },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswerIndex", "explanation"]
            }
          }
        }
      });

      const jsonStr = response.text?.trim() || "[]";
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ error: error.message || "An error occurred during quiz generation." });
    }
  });

  // API Route: Personalized roadmap
  app.post("/api/ai/personalized-roadmap", async (req, res) => {
    try {
      const { subject, duration = 4, focus = "General Knowledge" } = req.body;
      if (!subject) {
        return res.status(400).json({ error: "Subject is required" });
      }

      const client = getAiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a highly structured personalized learning roadmap for: "${subject}". Duration: ${duration} weeks. Focus target: ${focus}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              weeks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    weekNumber: { type: Type.INTEGER },
                    topic: { type: Type.STRING },
                    description: { type: Type.STRING },
                    milestones: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    resources: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["weekNumber", "topic", "description", "milestones", "resources"]
                }
              }
            },
            required: ["title", "description", "weeks"]
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("Roadmap generation error:", error);
      res.status(500).json({ error: error.message || "An error occurred during roadmap generation." });
    }
  });

  // API Route: Get Stripe Configuration State
  app.get("/api/stripe/config", (req, res) => {
    res.json({
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
    });
  });

  // API Route: Create Stripe Checkout Session
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { itemName, itemPrice, itemType } = req.body;
      if (!itemName || !itemPrice) {
        return res.status(400).json({ error: "Item name and price are required" });
      }

      // Format price to cents (Stripe expects integers in cents)
      const amountInCents = Math.round(parseFloat(itemPrice.toString().replace(/[^0-9.]/g, "")) * 100);

      const origin = req.headers.origin || `http://localhost:3000`;
      const stripe = getStripe();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: itemName,
                description: itemType === "subscription" 
                  ? `Neonmorphic Academy Portal - ${itemName} Tier`
                  : `Neonmorphic Standard Masterpath - ${itemName}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?payment=success&item=${encodeURIComponent(itemName)}`,
        cancel_url: `${origin}/?payment=cancel`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe session creation error:", error);
      res.status(500).json({ error: error.message || "An error occurred during Stripe checkout creation." });
    }
  });

  // Vite middleware for development vs static asset serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
