import { NextResponse } from 'next/server';
import { getServerSession } from '../../lib/auth';
import dbConnect from '../../../api/middleware/dbConnect';
import Todo from '../../../api/models/Todo';
import mongoose from 'mongoose';

// Helper function to get user ID from session
async function getUserId() {
  try {
    const session = await getServerSession();
    console.log('Session in getUserId:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log('No session found');
      return null;
    }
    
    if (!session.user) {
      console.log('Session exists but no user object found');
      return null;
    }
    
    // Try different ways to get the user ID
    let userId = null;
    
    if (session.user.id) {
      userId = session.user.id;
      console.log('User ID found in session.user.id:', userId);
    } else if (session.user._id) {
      userId = session.user._id;
      console.log('User ID found in session.user._id:', userId);
    } else if (session.user.dbUserId) {
      userId = session.user.dbUserId;
      console.log('User ID found in session.user.dbUserId:', userId);
    } else if (session.accessToken) {
      // Try to extract from JWT token
      try {
        const tokenParts = session.accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          if (payload.userId) {
            userId = payload.userId;
            console.log('User ID extracted from token:', userId);
          } else if (payload.id) {
            userId = payload.id;
            console.log('User ID (id) extracted from token:', userId);
          } else if (payload.dbUserId) {
            userId = payload.dbUserId;
            console.log('User ID (dbUserId) extracted from token:', userId);
          }
        }
      } catch (tokenError) {
        console.error('Error extracting user ID from token:', tokenError);
      }
    }
    
    if (!userId) {
      console.log('Could not find user ID in session');
      return null;
    }
    
    // Log the type of userId for debugging
    console.log('User ID type:', typeof userId, 'Length:', userId.length);
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

// Get all todos
export async function GET() {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view your todos' },
        { status: 401 }
      );
    }
    
    console.log(`Fetching todos for user ID: ${userId}`);
    
    // Ensure userId is treated as a string
    const todos = await Todo.find({ user: String(userId) }).sort('-createdAt');
    console.log(`Found ${todos.length} todos for user ${userId}`);
    
    return NextResponse.json({ todos, count: todos.length });
  } catch (error) {
    console.error('Get todos error:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Create a new todo
export async function POST(request) {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to add a todo' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Ensure userId is stored as a string
    data.user = String(userId);
    
    console.log('Creating todo with data:', {
      title: data.title,
      user: data.user,
      userIdType: typeof data.user
    });
    
    const todo = await Todo.create(data);
    console.log('Todo created successfully:', todo._id);
    
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Create todo error:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 