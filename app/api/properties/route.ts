import { NextResponse } from 'next/server';

// Mock property data
const mockProperties = [
  {
    id: '1',
    address: '123 Ballard Ave, Seattle, WA 98107',
    price: 645000,
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1850,
    yearBuilt: 2005,
    amenities: ['Renovated Kitchen', 'Hardwood Floors', 'Spacious Backyard'],
    description: 'Beautiful 3-bedroom house in the Ballard neighborhood with a newly renovated kitchen, hardwood floors, and a spacious backyard.',
    images: ['https://placehold.co/600x400/e6e6e6/gray?text=Property+1'],
    location: {
      type: 'Point',
      coordinates: [-122.3864, 47.6686]
    }
  },
  {
    id: '2',
    address: '456 Downtown Blvd, Seattle, WA 98101',
    price: 520000,
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    yearBuilt: 2015,
    amenities: ['Rooftop Pool', 'Fitness Center', '24-hour Concierge'],
    description: 'Modern 2-bedroom apartment with city views, located in downtown Seattle. Includes access to a rooftop pool, fitness center, and 24-hour concierge service.',
    images: ['https://placehold.co/600x400/e6e6e6/gray?text=Property+2'],
    location: {
      type: 'Point',
      coordinates: [-122.3321, 47.6062]
    }
  },
  {
    id: '3',
    address: '789 Suburban Dr, Bellevue, WA 98004',
    price: 875000,
    propertyType: 'House',
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2500,
    yearBuilt: 2010,
    amenities: ['Large Backyard', 'Top-rated Schools', 'Garage'],
    description: 'Spacious 4-bedroom house in the suburbs with a large backyard. Located near top-rated schools and with easy access to parks and shopping centers.',
    images: ['https://placehold.co/600x400/e6e6e6/gray?text=Property+3'],
    location: {
      type: 'Point',
      coordinates: [-122.2008, 47.6101]
    }
  },
  {
    id: '4',
    address: '321 Kirkland Way, Kirkland, WA 98033',
    price: 850000,
    propertyType: 'House',
    bedrooms: 4,
    bathrooms: 2.5,
    squareFeet: 2300,
    yearBuilt: 2008,
    amenities: ['In-ground Pool', 'Outdoor Entertaining Area', 'Large Backyard'],
    description: 'Beautiful 4-bedroom house in Kirkland with a large backyard, in-ground pool, and outdoor entertaining area. Perfect for families who love outdoor activities.',
    images: ['https://placehold.co/600x400/e6e6e6/gray?text=Property+4'],
    location: {
      type: 'Point',
      coordinates: [-122.2090, 47.6769]
    }
  },
  {
    id: '5',
    address: '555 Capitol Hill St, Seattle, WA 98102',
    price: 495000,
    propertyType: 'Condo',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 850,
    yearBuilt: 2018,
    amenities: ['Balcony', 'Modern Kitchen', 'Secure Building'],
    description: 'Modern 1-bedroom condo in Capitol Hill with a balcony offering city views. Features a stylish kitchen with stainless steel appliances and is within walking distance to restaurants and nightlife.',
    images: ['https://placehold.co/600x400/e6e6e6/gray?text=Property+5'],
    location: {
      type: 'Point',
      coordinates: [-122.3222, 47.6217]
    }
  }
];

export async function GET(request: Request) {
  // Get the URL parameters
  const { searchParams } = new URL(request.url);
  const bedrooms = searchParams.get('bedrooms');
  const bathrooms = searchParams.get('bathrooms');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const propertyType = searchParams.get('propertyType');
  const location = searchParams.get('location');
  
  // Filter properties based on search parameters
  let filteredProperties = [...mockProperties];
  
  if (bedrooms) {
    filteredProperties = filteredProperties.filter(
      property => property.bedrooms === parseInt(bedrooms)
    );
  }
  
  if (bathrooms) {
    filteredProperties = filteredProperties.filter(
      property => property.bathrooms >= parseFloat(bathrooms)
    );
  }
  
  if (minPrice) {
    filteredProperties = filteredProperties.filter(
      property => property.price >= parseInt(minPrice)
    );
  }
  
  if (maxPrice) {
    filteredProperties = filteredProperties.filter(
      property => property.price <= parseInt(maxPrice)
    );
  }
  
  if (propertyType) {
    filteredProperties = filteredProperties.filter(
      property => property.propertyType.toLowerCase() === propertyType.toLowerCase()
    );
  }
  
  if (location) {
    filteredProperties = filteredProperties.filter(
      property => property.address.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  return NextResponse.json(filteredProperties);
} 