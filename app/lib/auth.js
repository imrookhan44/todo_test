import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function getServerSession() {
  try {
    const session = await nextAuthGetServerSession(authOptions);
    
    // In production, we don't want to log as much
    if (process.env.NODE_ENV === 'production') {
      console.log('Custom getServerSession - Session exists:', !!session);
    } else {
      console.log('Custom getServerSession - Raw session:', JSON.stringify(session, null, 2));
    }
    
    // If session exists but user ID is missing, try to extract it from other properties
    if (session && session.user && !session.user.id) {
      console.log('User ID missing, attempting to fix');
      
      // Try to get ID from token if available
      if (session.accessToken) {
        try {
          // Simple JWT parsing (without verification) to extract user ID
          const tokenParts = session.accessToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            
            if (process.env.NODE_ENV !== 'production') {
              console.log('Token payload:', JSON.stringify(payload, null, 2));
            }
            
            if (payload.userId) {
              console.log('Found userId in token:', payload.userId);
              session.user.id = payload.userId;
            } else if (payload.id) {
              console.log('Found id in token:', payload.id);
              session.user.id = payload.id;
            } else if (payload.dbUserId) {
              console.log('Found dbUserId in token:', payload.dbUserId);
              session.user.id = payload.dbUserId;
            } else if (payload.sub) {
              console.log('Found sub in token:', payload.sub);
              session.user.id = payload.sub;
            }
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    }
    
    // If we still don't have a user ID but have a provider, try to get the ID from the database
    if (session && session.user && !session.user.id && session.provider === 'google') {
      try {
        // This would require importing the User model and dbConnect
        // For simplicity, we'll just log this case for now
        console.log('Google user without ID, would need to look up in database by email');
      } catch (error) {
        console.error('Error looking up user by email:', error);
      }
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Custom getServerSession - Enhanced session:', JSON.stringify(session, null, 2));
    }
    
    return session;
  } catch (error) {
    console.error('Error in custom getServerSession:', error);
    return null;
  }
} 