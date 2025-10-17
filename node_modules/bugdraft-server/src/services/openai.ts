import fetch from 'node-fetch';
import { BugDraft, DraftRequest } from '../types.js';
import 'dotenv/config';


function makeAdfFromPlaintext(text: string) {
  return {
    type: 'doc' as const,
    version: 1 as const,
    content: [
      {
        type: 'paragraph' as const,
        content: [
          {
            type: 'text' as const,
            text,
          },
        ],
      },
    ],
  };
}

export async function generateDraft(req: DraftRequest): Promise<BugDraft> {
  // Mock mode if no OPENAI_API_KEY
  if (!process.env.OPENAI_API_KEY) {
    const plaintext = 'Precondition: User is logged in\nSteps: Navigate to checkout and click Pay\nExpected: Payment succeeds\nActual: Spinner keeps spinning and error toast appears';
    return {
      summary: 'Checkout payment fails with indefinite spinner',
      descriptionPlaintext: plaintext,
      descriptionDoc: makeAdfFromPlaintext(plaintext),
    };
  }

  const systemPrompt = `You are drafting structured Jira bug content. Output well-formed JSON only. No markdown. Include four clear sections with these exact labels: "Precondition:", "Steps:", "Expected:", "Actual:". Keep titles concise. The ADF content must be a single paragraph whose text includes those labels and the user’s details separated by newlines. Do not include extra keys.`;

  const userPayload = {
    userText: req.userText,
    preferParentKey: req.preferParentKey,
    preferIssueType: req.preferIssueType,
    preferPriority: req.preferPriority,
    currentSummary: req.currentSummary,
    currentDescription: req.currentDescription,
  };

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Using OpenAI Responses API-like shape via fetch to avoid SDK requirement
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Return JSON with keys summary, descriptionPlaintext, descriptionDoc (ADF). Input: ${JSON.stringify(
            userPayload
          )}`,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const error: any = new Error(`OpenAI error ${response.status}: ${errText}`);
    error.status = response.status;
    throw error;
  }

  const data: any = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from OpenAI');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI did not return valid JSON');
  }

  const summary: string = String(parsed.summary || '').trim();
  let descriptionPlaintext: string = String(parsed.descriptionPlaintext || '').trim();
  // Ensure four sections exist; minimal guard
  const hasAllSections = ['Precondition:', 'Steps:', 'Expected:', 'Actual:'].every((s) =>
    descriptionPlaintext.includes(s)
  );
  if (!hasAllSections) {
    descriptionPlaintext = 'Precondition:\nSteps:\nExpected:\nActual:';
  }

  // Trim summary to 255 chars
  const safeSummary = summary.slice(0, 255);

  return {
    summary: safeSummary,
    descriptionPlaintext,
    descriptionDoc: makeAdfFromPlaintext(descriptionPlaintext),
  };
}


