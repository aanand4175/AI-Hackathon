const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key configured:", !!apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey,
    );
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach((m) =>
      console.log(m.name, "-", m.supportedGenerationMethods),
    );
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
