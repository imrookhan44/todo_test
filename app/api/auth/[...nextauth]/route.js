import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../../api/middleware/dbConnect';
import User from '../../../../api/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        // Customize the profile returned from Google
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Store the Google ID separately
          googleId: profile.sub
        };
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('Authorizing with credentials:', credentials.email);
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          
          const data = await res.json();
          console.log('Login response data:', JSON.stringify(data, null, 2));
          
          if (res.ok && data.user) {
            console.log('User authenticated successfully:', data.user.id);
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              token: data.token
            };
          }
          
          console.log('Authentication failed');
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - user before:', JSON.stringify(user, null, 2));
      console.log('SignIn callback - account:', JSON.stringify(account, null, 2));
      console.log('SignIn callback - profile:', JSON.stringify(profile, null, 2));
      
      try {
        if (account.provider === 'google') {
          try {
            await dbConnect();
            
            // Store the original Google ID
            const googleId = user.googleId || user.id;
            console.log('Original Google ID:', googleId);
            
            // Check if user exists by email
            let dbUser = await User.findOne({ email: user.email });
            console.log('Database user found:', dbUser ? 'Yes' : 'No');
            
            if (!dbUser) {
              // Create new user if doesn't exist
              console.log('Creating new user for Google auth');
              try {
                dbUser = await User.create({
                  name: user.name,
                  email: user.email,
                  image: user.image || '',
                  provider: 'google',
                  googleId: googleId,
                  // No password needed for Google auth
                });
                console.log('New user created with ID:', dbUser._id.toString());
              } catch (createError) {
                console.error('Error creating user:', createError);
                // Continue with Google ID as fallback
                console.log('Continuing with Google ID as fallback');
                return true;
              }
            } else if (!dbUser.googleId) {
              // Update existing user with Google ID if they don't have one
              console.log('Updating existing user with Google ID');
              try {
                dbUser.googleId = googleId;
                dbUser.provider = 'google';
                await dbUser.save();
                console.log('User updated with Google ID, MongoDB ID:', dbUser._id.toString());
              } catch (updateError) {
                console.error('Error updating user:', updateError);
                // Continue with existing user ID
                console.log('Continuing with existing user ID');
              }
            } else {
              console.log('Existing user found with ID:', dbUser._id.toString());
            }
            
            if (dbUser && dbUser._id) {
              // IMPORTANT: Set the ID to the MongoDB user ID, not the Google ID
              user.id = dbUser._id.toString();
              user.dbUserId = dbUser._id.toString(); // Add an extra property for clarity
              user.googleId = googleId; // Keep the Google ID for reference
              console.log('User ID set to MongoDB ID:', user.id);
            } else {
              console.log('No database user ID available, keeping Google ID');
            }
          } catch (error) {
            console.error('Error in Google sign in:', error);
            // Don't fail the sign-in process, just log the error
            console.log('Continuing with Google sign in despite error');
          }
        }
        
        console.log('SignIn callback - user after:', JSON.stringify(user, null, 2));
        return true;
      } catch (error) {
        console.error('Unexpected error in signIn callback:', error);
        // Don't fail the sign-in process for unexpected errors
        return true;
      }
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback - token before:', JSON.stringify(token, null, 2));
      console.log('JWT callback - user:', user ? JSON.stringify(user, null, 2) : 'No user');
      
      if (user) {
        // Make sure we're using the MongoDB user ID
        token.id = user.id;
        token.dbUserId = user.dbUserId; // Store the explicit DB user ID if available
        token.googleId = user.googleId; // Store the Google ID if available
        token.accessToken = user.token;
        
        // Store provider information
        if (account) {
          token.provider = account.provider;
        }
      }
      
      console.log('JWT callback - token after:', JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - session before:', JSON.stringify(session, null, 2));
      console.log('Session callback - token:', JSON.stringify(token, null, 2));
      
      if (token) {
        if (!session.user) {
          session.user = {};
        }
        
        // Use the MongoDB user ID from the token
        session.user.id = token.id || token.dbUserId || token.sub;
        session.user.googleId = token.googleId; // Add Google ID to session
        session.accessToken = token.accessToken;
        session.provider = token.provider; // Add provider info to session
      }
      
      console.log('Session callback - session after:', JSON.stringify(session, null, 2));
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 