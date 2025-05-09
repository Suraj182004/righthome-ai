import { Schema, model, models, Document } from 'mongoose';

export interface UserPreferences {
  budget: {
    min: number;
    max: number;
  };
  location: string[];
  propertyType: string[];
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider?: string;
  preferences?: UserPreferences;
  searchHistory?: { query: string; timestamp: Date }[];
  savedProperties?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      default: 'credentials',
    },
    preferences: {
      budget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
      location: [String],
      propertyType: [String],
      bedrooms: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
      amenities: [String],
    },
    searchHistory: [
      {
        query: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    savedProperties: [String],
  },
  {
    timestamps: true,
  }
);

// Use existing model or create a new one
export const User = models.User || model<IUser>('User', UserSchema); 