
import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Always use process.env.API_KEY directly and instantiate inside functions for most up-to-date key access.

export const getBeautyConsultation = async (query: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: "process.env.API_KEY" });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are a world-class beauty consultant and salon expert. Provide professional, encouraging, and luxurious advice on hair, skin, and spa treatments. Be concise but sophisticated.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Consultation Error:", error);
    return "I'm sorry, my aesthetic archives are momentarily unreachable. Please try again.";
  }
};

export const getSmartBookingLogic = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an AI beauty concierge. Extract the user's desired service, preferred time, and style preference. Output in a structured way that suggests the best salon or artist from the catalog.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            serviceType: { type: Type.STRING },
            suggestedSalonId: { type: Type.STRING },
            suggestedTime: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["serviceType", "explanation"]
        }
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Smart Booking Error:", error);
    return null;
  }
};
