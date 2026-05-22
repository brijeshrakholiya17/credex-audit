# Vendor Pricing Data

*Last Updated: 2026-05-22*

This document compiles the official pricing data for the AI tools supported by the Credex Audit Engine. All prices are listed in USD per user/seat unless otherwise noted.

## General Purpose / Chat

| Tool | Plan | Monthly Price | Annual Price (per month) | Vendor URL |
| :--- | :--- | :--- | :--- | :--- |
| **ChatGPT** | Plus | $20.00 | $20.00* | [OpenAI Pricing](https://openai.com/chatgpt/pricing) |
| **ChatGPT** | Team | $30.00 | $25.00 | [OpenAI Pricing](https://openai.com/chatgpt/pricing) |
| **Claude** | Pro | $20.00 | N/A | [Anthropic Pricing](https://www.anthropic.com/pricing) |
| **Claude** | Team | $30.00 | N/A | [Anthropic Pricing](https://www.anthropic.com/pricing) |
| **Gemini** | Advanced | $19.99 | N/A | [Google One Pricing](https://gemini.google.com/advanced) |

*\*ChatGPT Plus currently does not offer a discounted annual tier for individual users.*

## Coding Assistants

| Tool | Plan | Monthly Price | Annual Price (per month) | Vendor URL |
| :--- | :--- | :--- | :--- | :--- |
| **GitHub Copilot** | Individual | $10.00 | $8.33 ($100/yr) | [GitHub Pricing](https://github.com/pricing) |
| **Cursor** | Pro | $20.00 | $16.00 ($192/yr) | [Cursor Pricing](https://cursor.sh/pricing) |
| **Windsurf** | Pro | $20.00 | $15.00 ($180/yr) | [Windsurf Pricing](https://windsurf.com/pricing) |
| **Windsurf** | Teams | $40.00 | $30.00 | [Windsurf Pricing](https://windsurf.com/pricing) |

## APIs (Consumption Based)

| Tool | Type | Cost structure | Vendor URL |
| :--- | :--- | :--- | :--- |
| **OpenAI API** | Pay-as-you-go | Per Token (e.g. GPT-4o: $5.00/1M In) | [OpenAI API Pricing](https://openai.com/api/pricing) |
| **Anthropic API**| Pay-as-you-go | Per Token (e.g. Opus: $15.00/1M In) | [Anthropic API Pricing](https://www.anthropic.com/pricing#anthropic-api) |

## Financial Heuristics for the Audit Engine

The Credex Audit Engine utilizes the data above to drive its recommendations:
1. **Team Size Overkill**: Flagging small teams (1-5 users) utilizing "Team" or "Business/Enterprise" plans when individual "Pro" licenses would suffice (e.g., ChatGPT Team vs ChatGPT Plus).
2. **Cheaper Vendor Plan**: Identifying users on a Pro plan who could downgrade if their use is minimal (or utilizing identical models elsewhere).
3. **Cheaper Alternative Tool**: Recommending GitHub Copilot ($10/mo) for pure autocomplete versus Cursor/Windsurf Pro ($20/mo) depending on the team's primary use case ("Coding").
4. **Retail vs. Credits**: Flagging total annual spend over $1,000 to recommend leveraging startup credits (via Credex) instead of paying retail on a corporate card.
