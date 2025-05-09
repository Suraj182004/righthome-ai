import React from "react";
import { Card,CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type Property = {
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

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onAction: (property: Property, action: string) => void;
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`;
  } else {
    return `₹${price.toLocaleString()}`;
  }
}

export function PropertyDetailModal({ property, onClose, onAction }: PropertyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold truncate">
            {property.projectName || property.address.split(",")[0]}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              {/* Image Gallery */}
              <div className="relative h-64 sm:h-80 bg-slate-100 rounded-lg overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img 
                      src={property.images[activeImageIndex]} 
                      alt={`Property ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {property.images.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                        {property.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={cn(
                              "w-2.5 h-2.5 rounded-full",
                              idx === activeImageIndex ? "bg-white" : "bg-white/60"
                            )}
                            aria-label={`View image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white"
                          aria-label="Previous image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white"
                          aria-label="Next image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-slate-400">No image available</span>
                  </div>
                )}
              </div>
              
              {/* Property Details */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Property Type</span>
                    <span className="font-medium">{property.propertyType}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="font-medium text-blue-700">{formatPrice(property.price)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Bedrooms</span>
                    <span className="font-medium">{property.bedrooms} BHK</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Bathrooms</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Area</span>
                    <span className="font-medium">{property.squareFeet} sq.ft</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 block">Possession</span>
                    <span className="font-medium">{property.possessionDate || "Ready to Move"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Location */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Location</h3>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-slate-700">{property.address}</span>
                </div>
              </div>
              
              {/* Builder Information */}
              {property.builder && (
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3">Builder Information</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-blue-800">{property.builder}</span>
                      <div className="flex items-center ml-auto">
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs ml-1 text-blue-600">(120+ projects)</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700">
                      Established builder with {Math.floor(Math.random() * 20) + 5}+ years experience
                    </p>
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Description</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{property.description}</p>
              </div>
              
              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="text-slate-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <CardFooter className="border-t px-6 py-4 flex-col sm:flex-row items-center gap-3">
          <div className="text-sm text-center sm:text-left sm:mr-auto">
            <span className="block text-slate-500">Interested in this property?</span>
            <span className="font-medium text-blue-600">Take the next step!</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            {property.ctaOptions && property.ctaOptions.map((cta, index) => (
              <Button
                key={index}
                variant={index === 0 ? "primary" : "outline"}
                size="sm"
                onClick={() => onAction(property, cta)}
              >
                {cta}
              </Button>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 