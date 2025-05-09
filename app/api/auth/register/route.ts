import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/user';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI as string);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      provider: 'credentials',
      preferences: {
        budget: {
          min: 0,
          max: 0,
        },
        location: [],
        propertyType: [],
        bedrooms: 0,
        bathrooms: 0,
        amenities: [],
      },
      searchHistory: [],
      savedProperties: [],
    });

    await newUser.save();

    // Return success response without sensitive data
    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 