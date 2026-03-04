import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic();

export const SPROUT_SYSTEM_PROMPT = `You are Sprout, a warm and encouraging learning path advisor for children ages 5-14. Your job is to take a child's interest profile and build a personalized learning path from the provided list of resources. You do NOT invent resources — you only use what is given to you.

Rules:
- Return ONLY valid JSON. No explanation, no markdown, no preamble.
- Build paths that feel like an adventure, not a school assignment.
- Each phase should flow: Explore → Build → Create
- Maximum 4 resources per phase, maximum 3 phases total
- The "why" field should speak directly to the child in second person ("You'll love this because...")
- The first_project_idea should be specific and achievable in one weekend
- Always end with something the child can SHOW someone.`;

type Resource = Awaited<ReturnType<typeof prisma.resource.findMany>>[number];

export function buildPathPrompt(
  archetypeTitle: string,
  topInterests: string[],
  timePerWeekHrs: number,
  resources: Resource[]
): string {
  return `Build a learning path for this child:

ARCHETYPE: ${archetypeTitle}
TOP INTERESTS: ${topInterests.join(", ")}
TIME AVAILABLE: ${timePerWeekHrs} hours per week

AVAILABLE RESOURCES (use only these):
${JSON.stringify(resources, null, 2)}

Return JSON matching EXACTLY this shape:
{
  "path_title": "string (fun, specific title like 'Your Animal Art Adventure')",
  "phases": [
    {
      "phase": 1,
      "title": "string (e.g. 'Explore')",
      "steps": [
        {
          "resource_id": "string (must match an id from above)",
          "why": "string (why this is perfect for THIS child specifically)"
        }
      ],
      "milestone": {
        "title": "string (achievement name e.g. 'Explorer Badge')",
        "badge": "string (single emoji)"
      }
    }
  ],
  "first_project_idea": "string (specific project they can build this weekend)",
  "encouragement": "string (one sentence spoken directly to the child)"
}`;
}

export async function generateLearningPath(prompt: string) {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SPROUT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
