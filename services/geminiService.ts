
import { GoogleGenAI, Type } from "@google/genai";
import { CollegeDetails } from "../types";

export const fetchCollegeInfo = async (collegeName: string, state: string, district: string): Promise<CollegeDetails> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // ULTRA-FAST EXTRACTION PROMPT
  const prompt = `
    ULTRA-FAST MODE: Extract data for ${collegeName}, ${district} ${state}, India.
    
    STRICT RULES:
    1. Deliver schema-perfect, hallucination-free data.
    2. No deep reasoning. If not found quickly, return "Not Available".
    3. Total Student Count & Faculty Count must be INTEGERS ONLY. No ranges.
    4. Skip any field requiring inference; return "Not Available" immediately.
    
    COLUMNS (ORDER MATTERS):
    College Name, State, District, University Affiliation, College Type, Standalone Type, Courses, 
    Principal Name, Principal Email, Principal Contact Number, TPO Name, TPO Email, 
    Official College Website, AISHE Code, Year of Establishment, NAAC / NIRF Accreditation, 
    Total Student Count, Faculty Count, Address, PIN Code, Data Source, Data Confidence Score.
  `;

  try {
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
            standaloneType: { type: Type.STRING },
            coursesOffered: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Courses column" },
            principalName: { type: Type.STRING },
            principalEmail: { type: Type.STRING },
            principalContact: { type: Type.STRING },
            tpoName: { type: Type.STRING },
            tpoEmail: { type: Type.STRING },
            officialWebsite: { type: Type.STRING },
            aisheCode: { type: Type.STRING },
            yearOfEstablishment: { type: Type.STRING },
            accreditationDetails: { type: Type.STRING },
            studentStrength: { type: Type.STRING, description: "Total Student Count (Integer string or Not Available)" },
            facultyStrength: { type: Type.STRING, description: "Faculty Count (Integer string or Not Available)" },
            address: { type: Type.STRING },
            pinCode: { type: Type.STRING },
            dataSource: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["collegeName", "state", "confidenceScore"]
        }
      }
    });

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingSources.map((chunk: any) => ({
      title: chunk.web?.title || 'Verified Source',
      uri: chunk.web?.uri || '#'
    })).filter((s: any) => s.uri !== '#');

    const data = JSON.parse(response.text || "{}");
    
    return {
      ...data,
      sources
    };
  } catch (error: any) {
    return {
      collegeName,
      state,
      district,
      errorNote: "Fast-mode skip or error",
      confidenceScore: 0,
      sources: [],
      universityAffiliation: "Not Available",
      collegeType: "Not Available",
      standaloneType: "Not Available",
      coursesOffered: [],
      principalName: "Not Available",
      principalContact: "Not Available",
      principalEmail: "Not Available",
      tpoName: "Not Available",
      tpoEmail: "Not Available",
      tpoContact: "Not Available",
      officialWebsite: "Not Available",
      aisheCode: "Not Available",
      yearOfEstablishment: "Not Available",
      accreditationDetails: "Not Available",
      studentStrength: "Not Available",
      facultyStrength: "Not Available",
      address: "Not Available",
      pinCode: "Not Available",
      dataSource: "N/A"
    } as any;
  }
};
