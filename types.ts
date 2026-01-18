export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export interface TextPart {
  text: string;
}

export type ContentPart = ImagePart | TextPart;

export interface ToolConfig {
  googleSearch?: {};
  googleMaps?: {};
  retrievalConfig?: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface GenerationConfig {
  systemInstruction?: string;
  topK?: number;
  topP?: number;
  temperature?: number;
  responseMimeType?: string;
  seed?: number;
  maxOutputTokens?: number;
  thinkingConfig?: {
    thinkingBudget: number;
  };
  responseSchema?: {
    type: string;
    items?: {};
    properties?: {};
    propertyOrdering?: string[];
  };
  tools?: {
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: {};
    googleMaps?: {};
  }[];
  imageConfig?: {
    aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
    imageSize?: "1K" | "2K" | "4K";
  };
}

export interface FunctionDeclaration {
  name: string;
  parameters: {
    type: string;
    description?: string;
    properties?: {
      [key: string]: {
        type: string;
        description?: string;
      };
    };
    required?: string[];
  };
}
