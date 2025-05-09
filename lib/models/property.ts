import { Schema, model, models, Document } from 'mongoose';

export interface IProperty extends Document {
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
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['House', 'Apartment', 'Condo', 'Townhouse', 'Land'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
    },
    squareFeet: {
      type: Number,
      required: [true, 'Square footage is required'],
    },
    yearBuilt: {
      type: Number,
    },
    amenities: [String],
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    images: [String],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create a geospatial index on the location field
PropertySchema.index({ location: '2dsphere' });

// Use existing model or create a new one
export const Property = models.Property || model<IProperty>('Property', PropertySchema); 