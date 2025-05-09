import { NextResponse } from 'next/server';
import { processPropertyQuery, generatePropertyResponse, getConversationStage } from '@/lib/ai/gemini';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { Property } from '@/lib/models/property';
import { User } from '@/lib/models/user';

// Define types for MongoDB query and error handling
interface MongoQuery {
  propertyType?: { $in: string[] };
  bedrooms?: { $gte: number };
  bathrooms?: { $gte: number };
  price?: { $gte?: number; $lte?: number };
  address?: { $regex: RegExp };
  amenities?: { $in: string[] };
}

// Interface for property preferences
interface PropertyPreferences {
  intent?: string;
  propertyType?: string[];
  location?: string[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  priceRange?: { min?: number | null; max?: number | null };
  amenities?: string[];
  stage?: number;
  nextQuestion?: string;
  rawQuery?: string;
  [key: string]: unknown;
}

// Define Property type
interface Property {
  id: string;
  projectName: string;
  address: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  possessionDate: string;
  builder: string;
  amenities: string[];
  description: string;
  images: string[];
  ctaOptions: string[];
  [key: string]: unknown;
}

// Array of real property images for different property types
const propertyImages = {
  Apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'
  ],
  House: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60'
  ],
  Villa: [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmlsbGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmlsbGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1613977257592-4a9a032a9bb7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmlsbGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60'
  ],
  Condo: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y29uZG98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvbmRvfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1594484208280-efa00f96fc21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNvbmRvfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60'
  ]
};

// Special builder property images
const builderPropertyImages = {
  Godrej: [
    'https://images.unsplash.com/photo-1515263487990-61b07816b324?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'
  ],
  DLF: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bHV4dXJ5JTIwYXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'
  ],
  Prestige: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1600607687644-c7f34bc88f7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'
  ],
  Emaar: [
    'https://images.unsplash.com/photo-1600566753134-6d3f26828ba3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1600573472550-8090733a21e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'
  ],
  Sobha: [
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'
  ]
};

// Function to get random images for a property
function getPropertyImages(propertyType: string, builder?: string): string[] {
  let images: string[] = [];
  
  // First try to get builder-specific images
  if (builder) {
    const builderKey = Object.keys(builderPropertyImages).find(key => 
      builder.toLowerCase().includes(key.toLowerCase())
    );
    
    if (builderKey && builderPropertyImages[builderKey as keyof typeof builderPropertyImages]) {
      images = [...builderPropertyImages[builderKey as keyof typeof builderPropertyImages]];
      if (images.length >= 2) return images;
    }
  }
  
  // If no builder images, use property type images
  const typeKey = Object.keys(propertyImages).find(key => 
    propertyType.toLowerCase().includes(key.toLowerCase())
  ) || 'Apartment'; // Default to Apartment
  
  if (typeKey && propertyImages[typeKey as keyof typeof propertyImages]) {
    images = [...images, ...propertyImages[typeKey as keyof typeof propertyImages]];
  }
  
  // Fallback to generic images if nothing matches
  if (!images || images.length === 0) {
    return ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=60'];
  }
  
  return images;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { message, userId = 'guest' } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Check if Gemini API key is set
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }
    
    // Get the current conversation stage
    const conversationState = getConversationStage(userId);
    console.log(`User ${userId} is in stage ${conversationState.stage}`);
    
    // Process the user's query to extract property preferences using Gemini AI
    let propertyPreferences: PropertyPreferences;
    try {
      propertyPreferences = await processPropertyQuery(message, userId);
      // Add the raw message to the preferences for better property matching
      propertyPreferences.rawQuery = message;
      console.log('Property preferences extracted:', propertyPreferences);
    } catch (error) {
      console.error('Error processing query with Gemini AI:', error);
      return NextResponse.json(
        { error: 'Failed to process your query with our AI assistant. Please try again.' },
        { status: 500 }
      );
    }
    
    // Only search for properties if in stage 5 (recommendations)
    let properties: Property[] = [];
    if (propertyPreferences.stage === 5) {
      try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        
        // Build query based on extracted preferences
        const mongoQuery: MongoQuery = {};
        
        // Add property type filter if specified
        if (propertyPreferences.propertyType && Array.isArray(propertyPreferences.propertyType) && propertyPreferences.propertyType[0]) {
          mongoQuery.propertyType = { $in: propertyPreferences.propertyType };
        }
        
        // Add bedroom filter if specified
        if (propertyPreferences.bedrooms && !isNaN(Number(propertyPreferences.bedrooms))) {
          mongoQuery.bedrooms = { $gte: Number(propertyPreferences.bedrooms) };
        }
        
        // Add bathroom filter if specified
        if (propertyPreferences.bathrooms && !isNaN(Number(propertyPreferences.bathrooms))) {
          mongoQuery.bathrooms = { $gte: Number(propertyPreferences.bathrooms) };
        }
        
        // Add price range filter if specified
        if (propertyPreferences.priceRange) {
          mongoQuery.price = {};
          
          if (propertyPreferences.priceRange.min && !isNaN(Number(propertyPreferences.priceRange.min))) {
            mongoQuery.price.$gte = Number(propertyPreferences.priceRange.min);
          }
          
          if (propertyPreferences.priceRange.max && !isNaN(Number(propertyPreferences.priceRange.max))) {
            mongoQuery.price.$lte = Number(propertyPreferences.priceRange.max);
          }
        }
        
        // Add location filter if specified
        if (propertyPreferences.location && Array.isArray(propertyPreferences.location) && propertyPreferences.location[0]) {
          // Simple text search for now, in a real app would use geospatial queries
          const locationRegex = propertyPreferences.location.map((loc: string) => new RegExp(loc, 'i'));
          mongoQuery.address = { $regex: locationRegex[0] };
        }
        
        // Add amenities filter if specified
        if (propertyPreferences.amenities && Array.isArray(propertyPreferences.amenities) && propertyPreferences.amenities.length > 0) {
          mongoQuery.amenities = { $in: propertyPreferences.amenities };
        }
        
        console.log('Database query:', JSON.stringify(mongoQuery));
        
        // Search for properties based on query
        properties = await Property.find(mongoQuery).limit(5);
        console.log(`Found ${properties.length} matching properties in database`);
        
      } catch (error) {
        console.error('Error connecting to database or searching properties:', error);
        // Continue with simulated data if there's a database error
      }
      
      // If no properties found in the database, use simulated data
      if (!properties || properties.length === 0) {
        console.log('No properties found in database, using simulated data');
        properties = simulatePropertyResults(propertyPreferences);
      }
    }
    
    // Generate response using Gemini AI
    let aiResponse;
    try {
      aiResponse = await generatePropertyResponse(message, properties, userId);
    } catch (error) {
      console.error('Error generating property response with Gemini AI:', error);
      // Fallback message if AI fails
      aiResponse = conversationState.stage === 5 
        ? `I found ${properties.length} properties that match your criteria. You can view them below.`
        : "I'm here to help you find the perfect property. Could you tell me more about what you're looking for?";
    }
    
    // Save the user's query to search history if user is authenticated
    try {
      const session = await getServerSession();
      if (session?.user?.email) {
        await User.findOneAndUpdate(
          { email: session.user.email },
          { 
            $push: { 
              searchHistory: {
                query: message,
                timestamp: new Date(),
              } 
            } 
          }
        );
        console.log('Saved search to user history');
      }
    } catch (error) {
      console.error('Error saving search history:', error);
      // Continue even if saving search history fails
    }
    
    return NextResponse.json({
      message: aiResponse,
      properties: propertyPreferences.stage === 5 ? properties : [],
      preferences: propertyPreferences,
      stage: propertyPreferences.stage || conversationState.stage,
      nextQuestion: propertyPreferences.nextQuestion,
    });
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while processing your message' },
      { status: 500 }
    );
  }
}

// Function to simulate property results for development
function simulatePropertyResults(preferences: PropertyPreferences): Property[] {
  const types = preferences.propertyType && Array.isArray(preferences.propertyType) && preferences.propertyType[0]
    ? preferences.propertyType
    : ['House', 'Apartment', 'Condo'];
    
  const locations = preferences.location && Array.isArray(preferences.location) && preferences.location[0]
    ? preferences.location
    : ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Dubai'];
    
  const bedroomsMin = preferences.bedrooms && !isNaN(Number(preferences.bedrooms))
    ? Number(preferences.bedrooms)
    : 2;
    
  const bathroomsMin = preferences.bathrooms && !isNaN(Number(preferences.bathrooms))
    ? Number(preferences.bathrooms)
    : 1;
    
  const priceMin = preferences.priceRange?.min && !isNaN(Number(preferences.priceRange.min))
    ? Number(preferences.priceRange.min)
    : 5000000; // 50 Lakh default
    
  const priceMax = preferences.priceRange?.max && !isNaN(Number(preferences.priceRange.max))
    ? Number(preferences.priceRange.max)
    : 20000000; // 2 Cr default
  
  const properties: Property[] = [];
  
  // Check if specific properties were mentioned in the query
  const queryText = preferences.rawQuery?.toLowerCase() || '';
  const mentionsGodrej = queryText.includes('godrej');
  const mentionsDLF = queryText.includes('dlf');
  const mentionsPrestige = queryText.includes('prestige');
  const mentionsEmaar = queryText.includes('emaar');
  const mentionsSobha = queryText.includes('sobha');
  const mentionsResidency = queryText.includes('residency');
  
  // Generate specific property if mentioned builders exist
  if (mentionsGodrej) {
    const address = locations[Math.floor(Math.random() * locations.length)];
    properties.push({
      id: `godrej-1`,
      projectName: `Godrej Emerald Heights`,
      address: `Godrej Emerald Heights, Sector 45, ${address}`,
      price: Math.round((priceMin + Math.random() * (priceMax - priceMin)) / 100000) * 100000,
      propertyType: 'Apartment',
      bedrooms: bedroomsMin + 1,
      bathrooms: bathroomsMin + 1,
      squareFeet: 1420 + Math.floor(Math.random() * 300),
      yearBuilt: 2023,
      possessionDate: 'Ready to Move',
      builder: 'Godrej Properties',
      amenities: ['Swimming Pool', 'Club House', 'Gym', '24x7 Security', 'Children\'s Play Area', 'Landscaped Gardens'],
      description: `Luxury apartment in the heart of ${address} by Godrej Properties. Features include spacious interiors, premium finishes, and world-class amenities. Located near schools, hospitals, and shopping centers.`,
      images: getPropertyImages('Apartment', 'Godrej'),
      ctaOptions: ['Know More', 'Book a Call', 'Schedule Site Visit'],
    });
  }
  
  if (mentionsDLF) {
    const address = locations[Math.floor(Math.random() * locations.length)];
    properties.push({
      id: `dlf-1`,
      projectName: `DLF The Crest`,
      address: `DLF The Crest, Golf Course Road, ${address}`,
      price: Math.round((priceMin * 1.2 + Math.random() * (priceMax - priceMin)) / 100000) * 100000,
      propertyType: 'Apartment',
      bedrooms: bedroomsMin + 2,
      bathrooms: bathroomsMin + 1,
      squareFeet: 1850 + Math.floor(Math.random() * 400),
      yearBuilt: 2022,
      possessionDate: 'Ready to Move',
      builder: 'DLF Limited',
      amenities: ['Infinity Pool', 'Spa', 'Gym', 'Tennis Court', 'Smart Home Features', 'Concierge Services', 'Private Theater'],
      description: `Ultra-luxury apartment in the prestigious Golf Course Road of ${address} by DLF Limited. Experience the epitome of luxury with top-notch amenities, panoramic views, and exquisite interiors.`,
      images: getPropertyImages('Apartment', 'DLF'),
      ctaOptions: ['Know More', 'Book a Call', 'Schedule Site Visit'],
    });
  }
  
  if (mentionsPrestige) {
    const address = locations[Math.floor(Math.random() * locations.length)];
    properties.push({
      id: `prestige-1`,
      projectName: `Prestige Lakeside Habitat`,
      address: `Prestige Lakeside Habitat, Varthur Road, ${address}`,
      price: Math.round((priceMin + Math.random() * (priceMax - priceMin)) / 100000) * 100000,
      propertyType: 'Apartment',
      bedrooms: bedroomsMin + 1,
      bathrooms: bathroomsMin + 1,
      squareFeet: 1650 + Math.floor(Math.random() * 350),
      yearBuilt: 2021,
      possessionDate: 'Ready to Move',
      builder: 'Prestige Group',
      amenities: ['Lake View', 'Clubhouse', 'Swimming Pool', 'Jogging Track', 'Multipurpose Court', 'Party Hall'],
      description: `Beautiful lake-facing apartment in ${address} by Prestige Group. Enjoy serene views, spacious layouts, and community living with top-class amenities.`,
      images: getPropertyImages('Apartment', 'Prestige'),
      ctaOptions: ['Know More', 'Book a Call', 'Schedule Site Visit'],
    });
  }
  
  if (mentionsEmaar) {
    const address = locations[Math.floor(Math.random() * locations.length)];
    properties.push({
      id: `emaar-1`,
      projectName: `Emaar Palm Heights`,
      address: `Emaar Palm Heights, Golf Estate, ${address}`,
      price: Math.round((priceMin * 1.3 + Math.random() * (priceMax - priceMin)) / 100000) * 100000,
      propertyType: 'Apartment',
      bedrooms: bedroomsMin + 2,
      bathrooms: bathroomsMin + 2,
      squareFeet: 2100 + Math.floor(Math.random() * 500),
      yearBuilt: 2022,
      possessionDate: 'Ready to Move',
      builder: 'Emaar Properties',
      amenities: ['Golf Course View', 'Private Terrace', 'Swimming Pool', 'Spa', 'Concierge', 'Smart Home', 'Private Elevator'],
      description: `Luxury apartment with panoramic golf course views in ${address} by Emaar Properties. Featuring premium finishes, smart home technology, and exclusive amenities.`,
      images: getPropertyImages('Apartment', 'Emaar'),
      ctaOptions: ['Know More', 'Book a Call', 'Schedule Site Visit'],
    });
  }
  
  if (mentionsSobha) {
    const address = locations[Math.floor(Math.random() * locations.length)];
    properties.push({
      id: `sobha-1`,
      projectName: `Sobha Forest Edge`,
      address: `Sobha Forest Edge, New City Road, ${address}`,
      price: Math.round((priceMin * 1.1 + Math.random() * (priceMax - priceMin)) / 100000) * 100000,
      propertyType: 'Villa',
      bedrooms: bedroomsMin + 1,
      bathrooms: bathroomsMin + 1,
      squareFeet: 1800 + Math.floor(Math.random() * 400),
      yearBuilt: 2022,
      possessionDate: 'Ready to Move',
      builder: 'Sobha Limited',
      amenities: ['Nature View', 'Private Garden', 'Swimming Pool', 'Gym', 'Tennis Court', 'Club House', 'Jogging Track'],
      description: `Premium villa surrounded by nature in ${address} by Sobha Limited. Enjoy world-class construction quality with beautiful interiors and exteriors.`,
      images: getPropertyImages('Villa', 'Sobha'),
      ctaOptions: ['Know More', 'Book a Call', 'Schedule Site Visit'],
    });
  }
  
  if (mentionsResidency) {
    const address = locations[Math.floor(Math.random() * locations.length)];
    properties.push({
      id: `residency-1`,
      projectName: `Sobha Limited Residency`,
      address: `Sobha Limited Residency, Main Road, ${address}`,
      price: Math.round((priceMin + Math.random() * (priceMax - priceMin)) / 100000) * 100000,
      propertyType: 'Apartment',
      bedrooms: bedroomsMin,
      bathrooms: bathroomsMin,
      squareFeet: 1500 + Math.floor(Math.random() * 300),
      yearBuilt: 2023,
      possessionDate: 'Ready to Move',
      builder: 'Sobha Limited',
      amenities: ['Swimming Pool', 'Club House', 'Gym', '24x7 Security', 'Park', 'Landscaped Gardens'],
      description: `Premium apartment by Sobha Limited in ${address}. Enjoy high-quality construction, premium finishes, and excellent amenities.`,
      images: getPropertyImages('Apartment', 'Sobha'),
      ctaOptions: ['Know More', 'Book a Call', 'Schedule Site Visit'],
    });
  }
  
  // Generate generic properties if we don't have enough
  const numGenericToAdd = 4 - properties.length;
  
  for (let i = 0; i < numGenericToAdd; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const address = locations[Math.floor(Math.random() * locations.length)];
    const bedrooms = bedroomsMin + Math.floor(Math.random() * 3);
    
    properties.push({
      id: `property-${i}`,
      projectName: `${['Sky', 'Ocean', 'Mountain', 'Forest'][Math.floor(Math.random() * 4)]} ${['View', 'Heights', 'Towers', 'Residency'][Math.floor(Math.random() * 4)]}`,
      address: `${Math.floor(Math.random() * 100) + 1}, ${['Main Road', 'Park Avenue', 'Green Street', 'Lake View Road'][Math.floor(Math.random() * 4)]}, ${address}`,
      price: Math.round((priceMin + Math.random() * (priceMax - priceMin)) / 100000) * 100000,
      propertyType: type,
      bedrooms: bedrooms,
      bathrooms: Math.max(1, bedrooms - 1),
      squareFeet: 900 + bedrooms * 200 + Math.floor(Math.random() * 300),
      yearBuilt: 2018 + Math.floor(Math.random() * 6),
      possessionDate: Math.random() > 0.7 ? 'Under Construction' : 'Ready to Move',
      builder: `${['Alliance', 'Prestige', 'Aparna', 'SunTech', 'GreenSpace'][Math.floor(Math.random() * 5)]} Builders`,
      amenities: [
        'Gym',
        'Swimming Pool',
        '24x7 Security',
        'Power Backup',
        'Children\'s Play Area',
        'Landscaped Gardens',
        'Clubhouse',
        'Indoor Games',
      ].slice(0, 4 + Math.floor(Math.random() * 4)),
      description: `Beautiful ${bedrooms} BHK ${type?.toLowerCase() || 'property'} located in ${address}. Features spacious rooms, modern amenities, and is ${Math.random() > 0.7 ? 'under construction' : 'ready to move in'}.`,
      images: getPropertyImages(type),
      ctaOptions: ['Know More', 'Book a Call', 'Schedule Site Visit'],
    });
  }
  
  return properties;
}