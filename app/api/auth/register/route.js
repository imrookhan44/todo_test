import { NextResponse } from 'next/server';
import dbConnect from '../../../../api/middleware/dbConnect';
import User from '../../../../api/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { name, email, password } = await request.json();
    
    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Create user
    const user = await User.create({ name, email, password });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_LIFETIME || '30d' }
    );
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 