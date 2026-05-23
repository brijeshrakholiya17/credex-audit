export interface ToolPlan {
  name: string;
  price: number;
  annualPrice?: number;
}

export const TOOL_PLANS: Record<string, ToolPlan[]> = {
  "chatgpt": [
    { name: "Free", price: 0 },
    { name: "Plus", price: 20, annualPrice: 200 },
    { name: "Team", price: 30, annualPrice: 300 },
  ],
  "claude": [
    { name: "Free", price: 0 },
    { name: "Pro", price: 20 },
    { name: "Team", price: 30 },
  ],
  "gemini": [
    { name: "Free", price: 0 },
    { name: "Advanced", price: 19.99 },
  ],
  "github-copilot": [
    { name: "Individual", price: 10, annualPrice: 100 },
    { name: "Business", price: 19 },
    { name: "Enterprise", price: 39 },
  ],
  "cursor": [
    { name: "Hobby", price: 0 },
    { name: "Pro", price: 20, annualPrice: 192 },
    { name: "Business", price: 40, annualPrice: 480 },
  ],
  "windsurf": [
    { name: "Free", price: 0 },
    { name: "Pro", price: 20 },
    { name: "Teams", price: 40 },
  ],
  "openai-api": [
    { name: "Pay-as-you-go", price: 0 },
  ],
  "anthropic-api": [
    { name: "Pay-as-you-go", price: 0 },
  ],
};

export const FORM_TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  "github-copilot": "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  "anthropic-api": "Anthropic API",
  "openai-api": "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};
