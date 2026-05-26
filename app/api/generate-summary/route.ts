import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key-to-prevent-startup-crash");

export async function POST(req: NextRequest) {
  let body: any = {};
  
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ summary: "Failed to parse request.", isFallback: true }, { status: 200 });
  }

  let summary = '';
  let isFallback = false;

  try {
    const {
      teamSize,
      useCases,
      enabledTools,
      totalSpend,
      totalSavings,
      topRecommendations,
    } = body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    summary = result.response.text();

  } catch (aiError) {
    console.error("AI generation failed, using fallback:", aiError);
    isFallback = true;
    
    // Build fallback from the request data
    const toolCount = body.enabledTools?.length || 
      Object.values(body.tools || {}).filter((t: any) => t.enabled).length || 0;
    
    summary = `Your team of ${body.teamSize || 'your size'} is currently spending $${body.totalSpend || 0}/month across ${toolCount} AI tools. Our audit identified $${body.totalSavings || 0}/month in potential savings — $${(body.totalSavings || 0) * 12}/year. ${body.topRecommendations?.[0] || 'Review your subscriptions to eliminate overlap and right-size your plans.'} AI tool pricing changes frequently — quarterly reviews can compound savings significantly over time.`;
  }

  return NextResponse.json({ 
    summary, 
    isFallback 
  }, { status: 200 });
}
