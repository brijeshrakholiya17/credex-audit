import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client. It will automatically use the ANTHROPIC_API_KEY environment variable.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key-to-prevent-startup-crash", 
});

export async function POST(req: NextRequest) {
  let body: any = {};
  
  try {
    body = await req.json();
    const {
      teamSize,
      useCases,
      enabledTools,
      totalSpend,
      totalSavings,
      topRecommendations,
    } = body;

    const toolCount = enabledTools?.length || 0;
    const firstRec =
      topRecommendations && topRecommendations.length > 0
        ? topRecommendations[0]
        : "";

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing ANTHROPIC_API_KEY environment variable");
    }

    const enabledToolsString = enabledTools?.join(", ") || "none";
    const recommendationsString =
      topRecommendations?.join("\n") || "No specific recommendations.";

    const prompt = `You are a CFO advising a startup founder.
Team: ${teamSize} people
AI tools they pay for: ${enabledToolsString}
Monthly AI spend: $${totalSpend}
Potential monthly savings found: $${totalSavings}
Top recommendations: ${recommendationsString}

Write a single 100-word paragraph summarizing their situation and most important next step. Be direct, specific, no fluff. No bullet points. Plain prose only.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ summary: text, isFallback: false });
  } catch (error) {
    console.error("Summary generation error:", error);
    
    // Fallback logic
    const teamSize = body?.teamSize || "unknown size";
    const totalSpend = body?.totalSpend || 0;
    const totalSavings = body?.totalSavings || 0;
    const toolCount = body?.enabledTools?.length || 0;
    const topRecs = body?.topRecommendations || [];
    const firstRec = topRecs.length > 0 ? topRecs[0] : "";
    
    const recSentence = firstRec ? ` ${firstRec}.` : "";

    const fallbackText = `Your team of ${teamSize} is spending $${totalSpend}/month across ${toolCount} AI tools. Our audit identified $${totalSavings}/month in potential savings — $${totalSavings * 12}/year.${recSentence} Review your subscriptions quarterly as AI tool pricing changes frequently.`;

    return NextResponse.json({
      summary: fallbackText,
      isFallback: true,
    });
  }
}
