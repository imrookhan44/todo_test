import { NextResponse } from 'next/server';
import { getServerSession } from '../../../lib/auth';
import dbConnect from '../../../../api/middleware/dbConnect';
import Todo from '../../../../api/models/Todo';
import mongoose from 'mongoose';

// Helper function to get user ID from session
async function getUserId() {
  try {
    const session = await getServerSession();
    console.log('Session in [id] getUserId:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log('No session found in [id]');
      return null;
    }
    
    if (!session.user) {
      console.log('Session exists but no user object found in [id]');
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
      console.log('Could not find user ID in session in [id]');
      return null;
    }
    
    // Log the type of userId for debugging
    console.log('User ID type in [id]:', typeof userId, 'Length:', userId.length);
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID in [id]:', error);
    return null;
  }
}

// Get a single todo
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view this todo' },
        { status: 401 }
      );
    }
    
    const todoId = params.id;
    console.log(`Fetching todo ${todoId} for user ${userId}`);
    
    const todo = await Todo.findOne({
      _id: todoId,
      user: String(userId)
    });
    
    if (!todo) {
      console.log(`No todo found with id: ${todoId} for user ${userId}`);
      return NextResponse.json(
        { error: `No todo with id: ${todoId}` },
        { status: 404 }
      );
    }
    
    console.log(`Found todo ${todoId} for user ${userId}`);
    return NextResponse.json({ todo });
  } catch (error) {
    console.error('Get todo error:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Update a todo
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to update this todo' },
        { status: 401 }
      );
    }
    
    const todoId = params.id;
    const data = await request.json();
    
    console.log(`Updating todo ${todoId} for user ${userId} with data:`, data);
    
    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, user: String(userId) },
      data,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      console.log(`No todo found with id: ${todoId} for user ${userId}`);
      return NextResponse.json(
        { error: `No todo with id: ${todoId}` },
        { status: 404 }
      );
    }
    
    console.log(`Todo ${todoId} updated successfully`);
    return NextResponse.json({ todo });
  } catch (error) {
    console.error('Update todo error:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Delete a todo
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to delete this todo' },
        { status: 401 }
      );
    }
    
    const todoId = params.id;
    console.log(`Deleting todo ${todoId} for user ${userId}`);
    
    const todo = await Todo.findOneAndDelete({
      _id: todoId,
      user: String(userId)
    });
    
    if (!todo) {
      console.log(`No todo found with id: ${todoId} for user ${userId}`);
      return NextResponse.json(
        { error: `No todo with id: ${todoId}` },
        { status: 404 }
      );
    }
    
    console.log(`Todo ${todoId} deleted successfully`);
    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 