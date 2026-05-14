import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

export class ChatService {
  private ai: any;
  private chat: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.chat = this.ai.chats.create({
      model: "gemini-3.1-pro-preview", // Use pro for better chat reasoning
      config: {
        systemInstruction: `
          Bạn là NOMAD (NOMAD AI), một chuyên gia du lịch AI thông minh và nhiệt tình của NOMADMAP.
          Nhiệm vụ của bạn là hỗ trợ người dùng lên kế hoạch cho các chuyến đi, gợi ý địa điểm, ẩm thực và văn hóa, đặc biệt là tại Việt Nam.
          
          PHONG CÁCH PHỤC VỤ:
          1. Ngôn ngữ: Luôn trả lời bằng tiếng Việt.
          2. Giọng điệu: Thân thiện, hiện đại, chuyên nghiệp nhưng vẫn "vibe" du mục.
          3. Kiến thức: Hiểu biết sâu về các địa điểm du lịch, mẹo tiết kiệm, và những "Hidden Gems" ít người biết.
          4. Ngắn gọn: Trả lời súc tích, đi thẳng vào vấn đề trừ khi người dùng yêu cầu chi tiết.
          
          HÀNH VI:
          - Nếu người dùng hỏi về một địa điểm đã có trong lịch trình của họ, hãy đưa ra thêm thông tin chi tiết hoặc mẹo thú vị.
          - Luôn luôn khuyến khích người dùng khám phá và trải nghiệm văn hóa địa phương.
        `,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const result = await this.chat.sendMessage({ message });
      return result.text || "Xin lỗi, tôi gặp chút trục trặc. Bạn có thể thử lại không?";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Rất tiếc, tôi không thể kết nối được lúc này. Vui lòng kiểm tra lại kết nối của bạn.";
    }
  }

  async sendMessageStream(message: string, onChunk: (text: string) => void): Promise<void> {
    try {
      const result = await this.chat.sendMessageStream({ message });
      let fullText = "";
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }
    } catch (error) {
      console.error("Chat Stream Error:", error);
      onChunk("\n[Lỗi kết nối: Không thể tiếp tục trả lời]");
    }
  }
}

export const chatService = new ChatService();
