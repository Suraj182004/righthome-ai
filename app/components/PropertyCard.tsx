import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type PropertyCardProps = {
  property: {
    id: string;
    projectName?: string;
    address: string;
    price: number;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    yearBuilt: number;
    possessionDate?: string;
    builder?: string;
    amenities: string[];
    description: string;
    images: string[];
    ctaOptions?: string[];
  };
  onSelect: (id: string) => void;
};

// Function to format price in Indian currency format (in lakhs/crores)
const formatIndianPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const { 
    id, 
    projectName, 
    address, 
    price, 
    propertyType, 
    bedrooms, 
    squareFeet, 
    builder,
    possessionDate,
    amenities 
  } = property;

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => onSelect(id)}
    >
      <div className="relative h-48 bg-slate-100">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={projectName || propertyType} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
        <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs m-2 rounded-md font-medium">
          {propertyType}
        </div>
        {builder && (
          <div className="absolute bottom-0 right-0 bg-black/60 text-white px-2 py-1 text-xs m-2 rounded-md">
            {builder}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-1 text-slate-800 truncate">{projectName || address.split(',')[0]}</h3>
        <p className="text-slate-500 text-sm mb-3 truncate">{address}</p>
        
        <div className="mb-3 text-xl font-bold text-blue-600">
          {formatIndianPrice(price)}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm text-slate-700">
          <div className="flex items-center space-x-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
            <span>{bedrooms} BHK</span>
          </div>
          
          <div className="flex items-center space-x-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{possessionDate || "Ready"}</span>
          </div>
          
          <div className="flex items-center space-x-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>{squareFeet} sq.ft</span>
          </div>
        </div>
        
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
          <Button 
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id);
            }}
          >
            View Details
          </Button>
          
          <Button 
            variant="primary"
            size="sm"
            className="text-white rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id);
            }}
          >
            Know More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard; 