# RightHome AI

A smart real estate assistant that helps users find their ideal home through natural language interactions, voice commands, and personalized recommendations.

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **AI Integration**: Gemini AI for natural language processing
- **Voice Recognition**: Whisper API for voice-to-text conversion
- **Voice Agent**: vAPI for interactive voice experiences
- **Database**: MongoDB for storing user preferences and property data

## Features

- Natural language chat interface for property search
- Voice commands for hands-free interaction
- Personalized property recommendations
- Detailed property listings and filtering
- User preference tracking

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- API keys for Gemini AI, Whisper API, and vAPI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd righthome-ai
```

2. Install dependencies:
```bash
npm install

```

3. Create a `.env.local` file with your API keys:
```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
VAPI_API_KEY=your_vapi_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `/app`: Next.js app router pages and components
- `/app/api`: API routes for properties and user data
- `/app/components`: Reusable UI components
- `/public`: Static assets

## Deployment

This project can be easily deployed to Vercel:

```bash
npm run build
vercel deploy
```

## License

[MIT](LICENSE)
