import { NextResponse } from 'next/server';
import dbConnect from '../../../../api/middleware/dbConnect';
import User from '../../../../api/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
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
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 