
import { GoogleGenAI, Type } from "@google/genai";
import { PricingModel, CompanyData } from "../types";

export async function autofillCompanyDetails(domain: string): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search and provide detailed company profile information for the domain "${domain}". Use your grounding tools.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            company_name: { type: Type.STRING },
            website: { type: Type.STRING },
            domains: { type: Type.ARRAY, items: { type: Type.STRING } },
            pricing_model: { 
              type: Type.STRING, 
              description: "Must be one of: Subscription, Usage-based, Enterprise, Freemium, Other" 
            },
            services: { type: Type.STRING },
            policies: { type: Type.STRING }
          },
          required: ["company_name", "website", "domains", "pricing_model", "services", "policies"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("Gemini Autofill Error:", error);
    return {
      company_name: domain.split('.')[0].toUpperCase() + " Corp",
      website: `https://${domain}`,
      domains: [domain],
      pricing_model: "Enterprise",
      services: "Advanced AI solutions and B2B automation tools.",
      policies: "Standard enterprise security and data privacy policies apply."
    };
  }
}

export async function generateBusinessGoals(company: CompanyData): Promise<{ short_term: string; long_term: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `Based on the following company profile, suggest high-impact short-term (3-6 months) and long-term (1-3 years) business initiative goals for an automated business agent (bot).
    
    Company Name: ${company.company_name}
    Services: ${company.services}
    Pricing Model: ${company.pricing_model}
    Domains: ${company.domains.join(', ')}
    
    The goals should be strategic, partnership-oriented, and suitable for a B2B automated matching platform.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            short_term: { 
              type: Type.STRING,
              description: "A paragraph outlining 2-3 specific short term objectives."
            },
            long_term: { 
              type: Type.STRING,
              description: "A paragraph outlining the long term strategic vision."
            }
          },
          required: ["short_term", "long_term"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Goal Generation Error:", error);
    return {
      short_term: "Identify 5 new strategic distribution partners and reduce operational costs by 15% through automated procurement matches.",
      long_term: "Establish a dominant presence in the global B2B ecosystem by automating 80% of partnership discovery and initial deal structuring."
    };
  }
}
