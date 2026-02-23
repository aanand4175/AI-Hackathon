import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

export const generateInsights = async (req: Request, res: Response) => {
  try {
    const { cropName, regionName, totalCost, netProfit, profitMargin, risks } =
      req.body;

    const model = getModel();

    const prompt = `
      You are "Krishi Mitra" (Agricultural Friend), an expert AI assistant for Indian farmers. 
      Analyze the following profitability estimation scenario and provide a concise, actionable summary (max 3-4 short paragraphs).
      
      Scenario Details:
      - Crop: ${cropName}
      - Region: ${regionName}
      - Estimated Total Cost: ₹${totalCost}/Acre
      - Estimated Net Profit: ₹${netProfit}/Acre
      - Profit Margin: ${profitMargin}%
      
      Risks Analysis (0-100 scale, higher is worse):
      - Weather Risk: ${risks.weather}
      - Water Risk: ${risks.water}
      - Price Volatility: ${risks.price}
      - Pest Risk: ${risks.pest}
      - Infrastructure Risk: ${risks.infrastructure}

      Include:
      1. A brief sentence on the overall viability.
      2. 1-2 specific, highly actionable cost-saving or operational tips based on the crop and region.
      3. A clear warning about the most significant risk (whichever is highest) and a practical mitigation step.
      
      Use bullet points for readability. DO NOT start with a generic greeting, jump straight into the insights. Keep the tone professional, encouraging, and easy to understand.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({
      success: true,
      data: { insights: text },
    });
  } catch (error: any) {
    console.error("Error generating AI insights:", error);
    res.status(error.message?.includes("API key") ? 500 : 400).json({
      success: false,
      message:
        error.message ||
        "Failed to generate AI insights. Please try again later.",
    });
  }
};

export const generateRecommendationInsights = async (
  req: Request,
  res: Response,
) => {
  try {
    const { region, topCrops } = req.body;
    const model = getModel();

    const prompt = `
      You are "Krishi Mitra", an expert AI advisor for Indian farmers. 
      The user is considering crops for the region of ${region.district}, ${region.state}.
      The region has:
      - Soil: ${region.soilType}
      - Rainfall: ${region.avgRainfallMM} mm annually
      - Irrigation: ${region.irrigationAvailability}
      
      Our algorithm has recommended the following top crops based on suitability and profitability:
      ${topCrops.map((c: any, i: number) => `${i + 1}. ${c.cropName} (Suitability: ${c.suitabilityScore}/100)`).join("\n")}

      Provide a short, 1-2 sentence explanation of *WHY* the top 1 or 2 crops are great choices for this specific geography and soil type. Be encouraging and concise. Do not use generic greetings.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({
      success: true,
      data: { insights: text },
    });
  } catch (error: any) {
    console.error("Error generating Recommendation insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendation insights.",
    });
  }
};

export const generateComparisonInsights = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      cropName,
      regionName,
      scenarioA,
      scenarioB,
      winner,
      profitDifference,
    } = req.body;
    const model = getModel();

    const prompt = `
      You are "Krishi Mitra", an expert AI advisor. 
      A farmer is comparing two scenarios for growing ${cropName} in ${regionName}.

      Scenario A: ${scenarioA.landSize} Acres, ${scenarioA.irrigationType} irrigation
      - Profit: ₹${scenarioA.profitAtMSP}
      - ROI: ${scenarioA.roiAtMSP}%

      Scenario B: ${scenarioB.landSize} Acres, ${scenarioB.irrigationType} irrigation
      - Profit: ₹${scenarioB.profitAtMSP}
      - ROI: ${scenarioB.roiAtMSP}%

      The system has identified Scenario ${winner} as the winner by ₹${profitDifference}.
      
      Provide a brief (2-3 sentences max) "Verdict". Explain *why* the winning scenario is better (e.g., economies of scale, better irrigation efficiency). Also mention if the losing scenario has any redeeming qualities (like lower initial investment if it uses canal vs drip). Keep it very concise and professional.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({
      success: true,
      data: { insights: text },
    });
  } catch (error: any) {
    console.error("Error generating Comparison insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate comparison insights.",
    });
  }
};

export const generateHeatmapInsights = async (req: Request, res: Response) => {
  try {
    const { cropName, regionName, data } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key not found");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Find optimal size in data
    const optimal = data.reduce(
      (best: any, d: any) => (d.roi > best.roi ? d : best),
      data[0],
    );

    const prompt = `
      You are "Krishi Mitra", an expert AI advisor mapping profitability in ${regionName} for ${cropName}.
      The user is checking a profitability heatmap across different land sizes.
      
      Data points (Land Size -> ROI):
      ${data.map((d: any) => `${d.landSize} Acres -> ${d.roi}% ROI (${d.profit > 0 ? "Profit" : "Loss"}: ₹${d.profit})`).join("\n")}

      The mathematical "sweet spot" (highest ROI) is at ${optimal.landSize} Acres.
      
      Provide a brief 1-2 sentence explanation of *why* ${optimal.landSize} acres is the optimal land size for this crop (e.g., economies of scale making irrigation cheaper, but larger sizes facing diminishing returns due to labor costs). Keep it engaging, professional, and do not use generic greetings.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ success: true, data: { insights: text } });
  } catch (error: any) {
    console.error("Error generating Heatmap insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate heatmap insights.",
    });
  }
};

export const generateSensitivityInsights = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      cropName,
      regionName,
      variations,
      baseProfit,
      adjustedProfit,
      baseRoi,
      adjustedRoi,
    } = req.body;

    console.log("Sensitivity Analysis Payload:", {
      cropName,
      regionName,
      variations,
      baseProfit,
      adjustedProfit,
      baseRoi,
      adjustedRoi,
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key not found");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Protect against division by zero
    const profitForCalc = Math.abs(baseProfit) === 0 ? 1 : Math.abs(baseProfit);
    const diffRaw = adjustedProfit - baseProfit;
    const diffPercent = ((diffRaw / profitForCalc) * 100).toFixed(1);

    const prompt = `
      You are "Krishi Mitra", an expert AI advisor for ${regionName} farmers growing ${cropName}.
      The farmer is running a Sensitivity Analysis (stress testing their farm).
      
      They adjusted the following parameters:
      - Market Price expected change: ${variations.price > 0 ? "+" : ""}${variations.price}%
      - Weather/Yield expected change: ${variations.yield > 0 ? "+" : ""}${variations.yield}%
      - Cost expected change: ${variations.cost > 0 ? "+" : ""}${variations.cost}% (Positive means costs increased)
      
      Resulting Impact:
      - Profit changed from ₹${baseProfit} to ₹${adjustedProfit} (Change: ${diffPercent}%)
      - ROI changed from ${baseRoi}% to ${adjustedRoi}%
      
      Provide a very short, punchy 2-sentence analysis. Explain what this scenario means for their financial safety and give one practical tip to hedge against the specific risk they simulated (e.g. if they simulated low yield, suggest drought-resistant seeds). Do not write a generic greeting.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ success: true, data: { insights: text } });
  } catch (error: any) {
    console.error("Error generating Sensitivity insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate sensitivity insights.",
    });
  }
};

export const chatWithKrishiMitra = async (req: Request, res: Response) => {
  try {
    const { history, message } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key not found");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are 'Krishi Mitra', a helpful, knowledgeable agricultural expert AI for Indian farmers. Answer their questions clearly, practically, and empathetically. Keep your answers concise, structured (use bullet points if helpful), and tailored to the Indian agricultural context. If they ask a non-farming question, politely steer them back to agriculture.",
    });

    // Map history to Gemini expected format: [{role: 'user'|'model', parts: [{text: string}]}]
    const chatSession = model.startChat({
      history: history || [],
    });

    const result = await chatSession.sendMessage(message);
    const text = result.response.text();

    res.status(200).json({
      success: true,
      data: { reply: text },
    });
  } catch (error: any) {
    console.error("Error in Krishi Mitra chat:", error);
    res.status(500).json({
      success: false,
      message: "Chat failed.",
    });
  }
};
