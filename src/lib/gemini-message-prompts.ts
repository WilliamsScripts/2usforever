export type MessagePromptContext = {
  occasion: string;
  headline?: string;
  sender?: string;
  recipient?: string;
};

function formatName(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function buildContextBlock(context: MessagePromptContext): string {
  const sender = formatName(context.sender, "the sender");
  const recipient = formatName(context.recipient, "their partner");
  const headline = context.headline?.trim();

  const lines = [
    `- From: ${sender}`,
    `- To: ${recipient}`,
    `- Occasion: ${context.occasion}`,
  ];

  if (headline) {
    lines.push(`- Headline / theme: "${headline}"`);
  }

  return lines.join("\n");
}

export function buildGenerateMessagePrompt(context: MessagePromptContext): string {
  const sender = formatName(context.sender, "the sender");
  const recipient = formatName(context.recipient, "their partner");
  const hasHeadline = Boolean(context.headline?.trim());

  return `You are helping ${sender} write a love message to ${recipient}.

Context:
${buildContextBlock(context)}

Write a short message (4-7 sentences) from ${sender} to ${recipient} for this ${context.occasion} moment.

Guidelines:
- Very romantic, sweet, genuine, and lovey-dovey — like someone deeply in love writing from the heart
- Address ${recipient} naturally by name; make it feel written just for them
- Match the emotional tone of the occasion
${hasHeadline ? `- Let the headline/theme inspire the mood or weave it in subtly — do not repeat it word-for-word unless it fits perfectly` : ""}
- Sound warm, intimate, and human — never generic, stiff, or obviously AI-written
- Avoid clichés and greeting-card fluff; prefer specific, tender feelings over empty praise
- Do not include a subject line, labels, or sign-off like "Love," — only the message body
- Return ONLY the message text, with no quotes, preamble, or explanation`;
}

export function buildImproveMessagePrompt(
  context: MessagePromptContext & { message: string },
): string {
  const sender = formatName(context.sender, "the sender");
  const recipient = formatName(context.recipient, "their partner");
  const hasHeadline = Boolean(context.headline?.trim());

  return `You are polishing a love message ${sender} wrote for ${recipient}. Improve it — do NOT rewrite it from scratch.

Context:
${buildContextBlock(context)}

Original message:
"""
${context.message.trim()}
"""

Guidelines:
- Keep the same core meaning, memories, and details the writer chose — this is THEIR message
- Make it warmer, more romantic, and more lovey-dovey while preserving their voice and emotional feel
- Do not replace their story with a completely different one
- Address ${recipient} by name where it fits naturally
- Let the occasion guide the tone${hasHeadline ? "; let the headline/theme gently shape the mood" : ""}
- Fix grammar and flow; elevate word choice without sounding fake or over-polished
- Stay close to the original length unless a small trim or expansion clearly helps
- Sound human and genuine, not AI-generated
- Return ONLY the improved message text, with no quotes, preamble, or explanation`;
}
