'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertyCard from '../components/PropertyCard';

type Property = {
  id: string;
  address: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  amenities: string[];
  description: string;
  images: string[];
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchParams, setSearchParams] = useState({
    bedrooms: '',
    bathrooms: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    location: '',
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // Build query string from search params
        const queryParams = new URLSearchParams();
        
        if (searchParams.bedrooms) queryParams.append('bedrooms', searchParams.bedrooms);
        if (searchParams.bathrooms) queryParams.append('bathrooms', searchParams.bathrooms);
        if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
        if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);
        if (searchParams.propertyType) queryParams.append('propertyType', searchParams.propertyType);
        if (searchParams.location) queryParams.append('location', searchParams.location);
        
        const query = queryParams.toString();
        const endpoint = `/api/properties${query ? `?${query}` : ''}`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);
  
  const handlePropertySelect = (id: string) => {
    const property = properties.find(p => p.id === id);
    if (property) {
      setSelectedProperty(property);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the search
  };
  
  const closePropertyDetail = () => {
    setSelectedProperty(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
          </svg>
          Back to Chat
        </Link>
        <h1 className="text-2xl font-bold">Property Listings</h1>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={searchParams.location}
              onChange={handleSearchChange}
              placeholder="City, neighborhood, zip code"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              id="propertyType"
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <select
              id="bedrooms"
              name="bedrooms"
              value={searchParams.bedrooms}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <select
              id="bathrooms"
              name="bathrooms"
              value={searchParams.bathrooms}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={searchParams.minPrice}
              onChange={handleSearchChange}
              placeholder="Min Price"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={searchParams.maxPrice}
              onChange={handleSearchChange}
              placeholder="Max Price"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Search Properties
          </button>
        </div>
      </form>
      
      {/* Property Listings */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No properties found</h3>
          <p className="text-gray-600">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={{
                id: property.id,
                address: property.address,
                price: property.price,
                propertyType: property.propertyType,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                squareFeet: property.squareFeet,
                yearBuilt: property.yearBuilt,
                amenities: property.amenities,
                description: property.description,
                images: property.images
              }}
              onSelect={handlePropertySelect}
            />
          ))}
        </div>
      )}
      
      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64 w-full">
              <img 
                src={selectedProperty.images[0] || "https://placehold.co/600x400/e6e6e6/gray?text=Property+Image"} 
                alt={`Property at ${selectedProperty.address}`}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={closePropertyDetail}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold">{selectedProperty.address}</h2>
              <p className="text-blue-600 font-bold text-2xl mt-1">${selectedProperty.price.toLocaleString()}</p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Bedrooms:</span>
                  <span>{selectedProperty.bedrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Bathrooms:</span>
                  <span>{selectedProperty.bathrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Sq Ft:</span>
                  <span>{selectedProperty.squareFeet.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Year Built:</span>
                  <span>{selectedProperty.yearBuilt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span>{selectedProperty.propertyType}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedProperty.description}</p>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button className="bg-white border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                  Save Property
                </button>
                <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Contact Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 