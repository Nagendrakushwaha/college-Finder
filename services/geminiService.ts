
import { GoogleGenAI, Type } from "@google/genai";
import { CollegeDetails } from "../types";

export const fetchCollegeInfo = async (collegeName: string, state: string, district: string): Promise<CollegeDetails> => {
  // Correctly initialize with named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Find details for: ${collegeName}, ${district}, ${state}.
    Provide a JSON object with: 
    collegeName, state, district, universityAffiliation, collegeType, 
    coursesOffered (array), principalName, principalContact, principalEmail, 
    tpoName, tpoContact, tpoEmail, officialWebsite, aisheCode, 
    yearOfEstablishment, accreditationDetails, studentStrength, 
    facultyStrength, address, pinCode, confidenceScore (0-100).
    Use "Not Available" for missing fields.
  `;

  // Use ai.models.generateContent directly with correct model name 'gemini-3-flash-preview'
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          collegeName: { type: Type.STRING },
          state: { type: Type.STRING },
          district: { type: Type.STRING },
          universityAffiliation: { type: Type.STRING },
          collegeType: { type: Type.STRING },
          coursesOffered: { type: Type.ARRAY, items: { type: Type.STRING } },
          principalName: { type: Type.STRING },
          principalContact: { type: Type.STRING },
          principalEmail: { type: Type.STRING },
          tpoName: { type: Type.STRING },
          tpoContact: { type: Type.STRING },
          tpoEmail: { type: Type.STRING },
          officialWebsite: { type: Type.STRING },
          aisheCode: { type: Type.STRING },
          yearOfEstablishment: { type: Type.STRING },
          accreditationDetails: { type: Type.STRING },
          studentStrength: { type: Type.STRING },
          facultyStrength: { type: Type.STRING },
          address: { type: Type.STRING },
          pinCode: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ["collegeName", "state", "confidenceScore"]
      }
    }
  });

  const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingSources.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })).filter((s: any) => s.uri !== '#');

  // Use .text property (not a method)
  const data = JSON.parse(response.text || "{}");
  
  return {
    ...data,
    sources
  };
};
