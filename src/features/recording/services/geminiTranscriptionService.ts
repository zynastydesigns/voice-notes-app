/**
 * Calls Gemini directly from the client with the recorded audio as inline
 * data, asking for transcript + title + summary + action items back as a
 * single strict-JSON response — one request instead of a separate
 * speech-to-text pass followed by a separate summarization pass.
 *
 * This mirrors the same "client calls Gemini directly" pattern used
 * elsewhere in the Zynasty apps. Two things worth knowing:
 *  - The API key ships inside the app bundle (EXPO_PUBLIC_ prefix), so it is
 *    not a secret from someone inspecting the bundle. Restrict it in Google
 *    Cloud Console (API restrictions) and prefer moving this call behind a
 *    Cloud Function if/when one exists for this project.
 *  - Inline audio data has a request-size ceiling (Gemini's inline_data path
 *    tops out well under its Files API limit). A short-to-medium voice note
 *    is comfortably within that; for very long recordings, switch this to
 *    the Gemini Files API (upload once, reference by URI) instead of base64
 *    inlining the whole file.
 */

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface TranscriptionResult {
  title: string;
  transcript: string;
  summaryPreview: string;
  actionItems: string[];
}

const PROMPT = `You are transcribing and summarizing a personal voice note.

Listen to the attached audio and respond with ONLY a JSON object (no markdown, no code fences) with this exact shape:

{
  "title": "A short, specific title (5-8 words) capturing what this note is about",
  "transcript": "The full verbatim transcript of the speech in the audio",
  "summaryPreview": "A 1-2 sentence plain-language summary of the note",
  "actionItems": ["Any concrete tasks, follow-ups, or reminders the speaker mentioned - omit this array's entries entirely if none exist"]
}

If the audio is silent, unintelligible, or contains no speech, still return valid JSON with an empty transcript and a summaryPreview explaining that no speech was detected.`;

function guessMimeType(fileUri: string): string {
  const ext = fileUri.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "aac":
      return "audio/aac";
    case "wav":
      return "audio/wav";
    case "caf":
      return "audio/x-caf";
    default:
      return "audio/mp4";
  }
}

/** Strips accidental ```json fences in case the model ignores responseMimeType. */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

export async function transcribeAndSummarize(params: {
  base64Audio: string;
  fileUri: string;
}): Promise<TranscriptionResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file."
    );
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            {
              inline_data: {
                mime_type: guessMimeType(params.fileUri),
                data: params.base64Audio,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gemini request failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Gemini returned no content for this recording.");
  }

  let parsed: Partial<TranscriptionResult>;
  try {
    parsed = JSON.parse(extractJson(rawText));
  } catch {
    throw new Error("Gemini returned a response that couldn't be parsed as JSON.");
  }

  return {
    title: (parsed.title ?? "").trim() || "Untitled Recording",
    transcript: parsed.transcript ?? "",
    summaryPreview: (parsed.summaryPreview ?? "").trim(),
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.filter(Boolean) : [],
  };
}
