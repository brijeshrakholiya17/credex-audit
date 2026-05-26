# AI Summary Prompt Documentation

## Current Prompt

The application currently uses Google's Generative AI (`gemini-2.5-flash`) via the `@google/generative-ai` SDK in the API route (`app/api/generate-summary/route.ts`). Note: The architecture plan originally called for Anthropic, but Gemini was chosen instead for the implementation.

```text
You are a CFO advising a startup founder.
Team: ${teamSize} people
AI tools they pay for: ${enabledToolsString}
Monthly AI spend: $${totalSpend}
Potential monthly savings found: $${totalSavings}
Top recommendations: ${recommendationsString}

Write a single 100-word paragraph summarizing their situation and most important next step. Be direct, specific, no fluff. No bullet points. Plain prose only.
```

## Rationale
I designed the prompt this way to strictly constrain the model's output into a highly professional, authoritative, yet actionable tone—acting as a "CFO" speaking to a "founder". By explicitly providing the context variables (team size, tools, spend, savings, recommendations), the model has no room to hallucinate facts. The strict constraints ("single 100-word paragraph", "direct, specific, no fluff", and "No bullet points") force a concise output that fits perfectly into our tight UI layout.

## What I Tried That Didn't Work
- **Unconstrained Length:** Without the 100-word limit and "No bullet points" directive, the model tended to generate long lists and markdown formatting that looked terrible in our small summary card.
- **Generic Personas:** When the persona wasn't explicitly set to "CFO", the tone was often too conversational, generic, and lacked financial urgency.
- **Missing Fallback Logic:** Initially, API failures broke the page. Adding a hardcoded fallback string ensures users always get a summary even if the API rate limits or errors out.
