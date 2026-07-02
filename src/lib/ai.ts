// AI helper — calls the Google Gemini API.
//
// Set this environment variable (locally in .env, and in Vercel Project Settings):
//   GEMINI_API_KEY  — your Gemini API key
//   GEMINI_MODEL    — (optional) defaults to gemini-2.5-flash

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type Role = "user" | "assistant";

function toGeminiContents(messages: { role: Role; content: string }[]) {
  // Gemini uses "user" / "model" roles instead of "user" / "assistant"
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

async function callGemini(
  contents: { role: string; parts: { text: string }[] }[],
  system: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const res = await fetch(
    `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: system }],
        },
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/**
 * Call the Gemini chat API.
 */
export async function aiChat(
  messages: { role: Role; content: string }[],
  system: string
): Promise<string> {
  const contents = toGeminiContents(messages);
  return callGemini(contents, system);
}

/**
 * Call the Gemini API and parse JSON from the response.
 */
export async function aiJSON<T>(userPrompt: string, system: string): Promise<T> {
  const fullSystem =
    system + "\nRespond with valid JSON only, no markdown fences.";

  const contents = [{ role: "user", parts: [{ text: userPrompt }] }];
  const raw = await callGemini(contents, fullSystem);
  return parseJSON<T>(raw);
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("AI did not return valid JSON");
  }
}
