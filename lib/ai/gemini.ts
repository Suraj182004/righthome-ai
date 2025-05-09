import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Initialize the Gemini AI client
 */
export function initGeminiAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  return { genAI, model };
}

/**
 * Get the Gemini AI client
 */
export function getGeminiAI() {
  if (!genAI || !model) {
    return initGeminiAI();
  }
  
  return { genAI, model };
}

// Track conversation stage for each user
const conversationStages = new Map<string, {
  stage: number;
  requirementMap: Record<string, any>;
}>();

/**
 * Get or initialize conversation stage for a user
 */
export function getConversationStage(userId: string) {
  if (!conversationStages.has(userId)) {
    conversationStages.set(userId, {
      stage: 1,
      requirementMap: {}
    });
  }
  return conversationStages.get(userId)!;
}

/**
 * Update conversation stage for a user
 */
export function updateConversationStage(userId: string, stage: number, requirementMap: Record<string, any>) {
  conversationStages.set(userId, { stage, requirementMap });
}

/**
 * Process a user's real estate query
 * @param query The user's query text
 * @param userId The user's ID for tracking conversation state
 */
export async function processPropertyQuery(query: string, userId: string = 'guest') {
  const { model } = getGeminiAI();
  const conversationState = getConversationStage(userId);
  
  try {
    // If this is the first message, extract initial requirements
    if (conversationState.stage === 1) {
      const prompt = `
      You are RightHome AI, a smart real estate assistant. 
      Parse the following initial real estate query to extract preferences:
      
      User Query: "${query}"
      
      Return a JSON object with the following structure:
      {
        "intent": "buy" | "rent" | "invest" | "info",
        "propertyType": ["House", "Apartment", "Flat", "Condo", "Townhouse", null],
        "location": ["City", "Area", null],
        "bedrooms": [number or null],
        "bathrooms": [number or null],
        "priceRange": {
          "min": [number or null],
          "max": [number or null]
        },
        "currency": ["INR", "USD", "AED", null],
        "amenities": ["Pool", "Garden", "Garage", etc.],
        "stage": 2,
        "nextQuestion": "What's your goal - personal use or investment?"
      }
      
      Only include fields that are explicitly or implicitly mentioned in the query.
      Set values to null if not specified.
      Always set stage to 2 and include a suitable nextQuestion for follow-up.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract the JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Update conversation state
        updateConversationStage(userId, parsedData.stage || 2, parsedData);
        
        return parsedData;
      }
      
      throw new Error("Failed to parse JSON response");
    } 
    // Stage 2-4: Collecting more specific requirements
    else if (conversationState.stage >= 2 && conversationState.stage <= 4) {
      const requirements = conversationState.requirementMap;
      
      const prompt = `
      You are RightHome AI, a smart real estate assistant.
      The user is in stage ${conversationState.stage} of the real estate conversation.
      
      Current requirements: ${JSON.stringify(requirements)}
      
      User's response: "${query}"
      
      Update the requirements based on this new response and return the updated JSON object.
      If the user has provided enough information (location, property type, and at least one of: budget, bedrooms, or purpose),
      set stage to 5 to move to recommendations.
      Otherwise, increment the stage by 1 and include a nextQuestion for the most important missing information.
      
      Return the full updated JSON object.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract the JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Update conversation state
        const newStage = parsedData.stage || conversationState.stage + 1;
        updateConversationStage(userId, newStage, parsedData);
        
        return parsedData;
      }
      
      throw new Error("Failed to parse JSON response");
    }
    // Stage 5+: Handling objections and adjusting recommendations
    else {
      const requirements = conversationState.requirementMap;
      
      const prompt = `
      You are RightHome AI, a smart real estate assistant.
      The user is in stage ${conversationState.stage} of the real estate conversation.
      
      Current requirements: ${JSON.stringify(requirements)}
      
      User's response: "${query}"
      
      If the user is expressing dissatisfaction or has new requirements, update the JSON object
      and keep stage as 5 for refined recommendations.
      
      If the user is asking for a summary or follow-up actions, set stage to 6.
      
      Return the full updated JSON object.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract the JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Update conversation state
        const newStage = parsedData.stage || conversationState.stage;
        updateConversationStage(userId, newStage, parsedData);
        
        return parsedData;
      }
      
      throw new Error("Failed to parse JSON response");
    }
  } catch (error) {
    console.error('Error processing property query:', error);
    
    // Return a fallback response
    return {
      intent: "unknown",
      stage: conversationState.stage,
      error: "Failed to process query",
      nextQuestion: "Could you provide more details about what you're looking for?"
    };
  }
}

/**
 * Generate a response to a user query based on conversation stage
 */
export async function generatePropertyResponse(query: string, properties: any[], userId: string = 'guest') {
  const { model } = getGeminiAI();
  const conversationState = getConversationStage(userId);
  
  try {
    let prompt = '';
    
    // Stage 1: Greeting message
    if (conversationState.stage === 1) {
      prompt = `
      You are RightHome AI, a property co-pilot for real estate customers.
      The user has just started the conversation.
      
      User Query: "${query}"
      
      Respond with a friendly greeting that includes:
      1. A brief introduction: "Hi, I'm your property co-pilot. Looking for a home or investment? I'll help you shortlist the best ones and book visits too."
      2. Then respond directly to their query if possible
      3. If they haven't specified preferences yet, ask about their goals (personal use/investment)
      
      Keep your response friendly, concise, and helpful.
      `;
    }
    // Stage 2-4: Gathering requirements
    else if (conversationState.stage >= 2 && conversationState.stage <= 4) {
      const requirements = conversationState.requirementMap;
      
      prompt = `
      You are RightHome AI, a property co-pilot for real estate customers.
      You're helping the user find properties that match their needs.
      
      Current requirements: ${JSON.stringify(requirements)}
      User Query: "${query}"
      
      Respond in a friendly, conversational tone. Acknowledge what you've learned so far,
      then ask about the next most important missing information:

      - If purpose is unknown: "What's your goal – personal use or investment?"
      - If budget is unknown: "What's your budget range?"
      - If location is unknown: "Which city or localities are you interested in?"
      - If property type is unknown: "Are you looking for an apartment, house, or another property type?"
      - If bedrooms are unknown: "How many bedrooms do you need?"
      
      Only ask ONE question at a time, and make sure it's for information they haven't provided yet.
      `;
    }
    // Stage 5: Recommendations
    else if (conversationState.stage === 5) {
      prompt = `
      You are RightHome AI, a property co-pilot for real estate customers.
      The user has provided enough information and you're presenting property recommendations.
      
      Requirements: ${JSON.stringify(conversationState.requirementMap)}
      Available Properties: ${JSON.stringify(properties, null, 2)}
      
      Create a response that:
      1. Briefly summarizes what you understand about their needs
      2. Presents the matching properties (3-5 options)
      3. For each property, highlight 2-3 key features that match their requirements
      4. End with "Would you like to know more about any of these properties or schedule a site visit?"
      
      Keep your tone friendly and helpful.
      `;
    }
    // Stage 6: Follow-up and summary
    else if (conversationState.stage === 6) {
      prompt = `
      You are RightHome AI, a property co-pilot for real estate customers.
      The conversation is wrapping up and you're providing a summary.
      
      Requirements: ${JSON.stringify(conversationState.requirementMap)}
      Properties shown: ${JSON.stringify(properties, null, 2)}
      
      Create a response that:
      1. Summarizes their requirements and the properties shown
      2. Offers to "email or WhatsApp this list to you"
      3. Mentions "We'll keep tracking better options and alert you if prices change"
      4. Suggests they can always come back with more questions
      
      Keep your tone appreciative and helpful.
      `;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating property response:', error);
    
    // Return fallback responses based on stage
    if (conversationState.stage === 1) {
      return "Hi, I'm your property co-pilot. Looking for a home or investment? I'll help you shortlist the best ones and book visits too. What type of property are you looking for?";
    } else if (conversationState.stage >= 2 && conversationState.stage <= 4) {
      return "Thanks for that information. Could you tell me more about your budget range and location preferences?";
    } else if (conversationState.stage === 5) {
      return `I found ${properties.length} properties matching your criteria. Would you like to know more about any of these properties or schedule a site visit?`;
    } else {
      return "Thank you for your interest. I've noted your preferences and will keep you updated on new properties that match your criteria.";
    }
  }
} 