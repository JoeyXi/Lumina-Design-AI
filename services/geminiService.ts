import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in process.env");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Generates a new image based on the input image and a prompt.
 * Uses 'gemini-2.5-flash-image' (Nano banana).
 */
export const generateRoomDesign = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    // Remove header if present to get raw base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, or detect from string
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // No responseMimeType for nano banana
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in the response");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

/**
 * Chat with the AI about the room.
 * Uses 'gemini-3-pro-preview'.
 */
export const chatWithDesignConsultant = async (
  chatHistory: ChatMessage[],
  currentImageBase64: string | null,
  userMessage: string
): Promise<string> => {
  try {
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // If we have an image, we send it with the latest prompt for context
    const parts: any[] = [{ text: userMessage }];
    
    if (currentImageBase64) {
      const base64Data = currentImageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.unshift({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        }
      });
    }

    // We don't use chat.sendMessage with history explicitly here for simplicity with image context
    // Instead we do a single turn generation with system instruction or just prompt engineering
    // To maintain history properly with images in previous turns is complex in stateless calls,
    // but gemini-3-pro supports multimodal history. 
    // For this demo, we will just send the current image and the user's question as a fresh query 
    // but inject the last few text messages as context if needed.
    
    // Simpler approach: Just send current image + question. 
    // The prompt asks for "Context-aware".
    
    const systemInstruction = `You are an expert Interior Design Consultant. 
    Analyze the provided room image. Answer the user's questions about design, color matching, 
    furniture placement, and style. 
    If asked for recommendations, provide specific types of products that would fit the style.
    Format your response using Markdown. Use bolding for product names.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction
      }
    });

    return response.text || "I couldn't generate a text response.";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I'm having trouble connecting to the design service right now.";
  }
};
