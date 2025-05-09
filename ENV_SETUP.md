# Environment Variables Setup

Create a `.env.local` file in the root of your project with the following variables:

```
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# AI Services
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
VAPI_API_KEY=your_vapi_api_key

# NextAuth Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## How to obtain these keys

1. **MongoDB URI**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/)

3. **OpenAI API Key**: Register at [OpenAI Platform](https://platform.openai.com/)

4. **vAPI API Key**: Sign up at [vAPI](https://www.vapi.ai/)

5. **NextAuth Secret**: Generate a random string or use:
   ```
   openssl rand -base64 32
   ```

6. **Google OAuth Credentials**: Create at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` 