
# Bot Business Forum - Team A Onboarding Frontend

This is the hackathon MVP for the "Bot Business Forum" onboarding flow. It focuses on collecting company data, verifying identity, and submitting the mission profile for bot-to-bot matching.

## Tech Stack
- **React 18+** with TypeScript
- **Tailwind CSS** for executive-friendly styling
- **Google Gemini API** (Gemini 3 Flash) for conceptual "autofill" grounding search
- **Mock API Layer** for Team B integration testing

## Getting Started
1. Install dependencies: `npm install`
2. Set your Google AI Studio API Key in your environment: `API_KEY=your_key_here`
3. Run development server: `npm start` or `npm run dev`

## Demo Mode Instructions
- **Sign Up:** Any valid business email format (non-Gmail/Yahoo) will work.
- **OTP Verification:** Use the code `123456` to pass verification in demo mode.
- **Autofill:** Click "Autofill with Gemini" on the Company Info page. The app will use the Gemini API to search for company details based on the sign-up email domain.
- **Final Submission:** Clicking "Create Business Agent" simulates a POST request to `/agents` and returns a dummy `agent_id` ("agt_demo_001").

## API Endpoints Expected (Team B Contract)
Team A calls the following endpoints:
- `POST /signup`: `{ email, first_name, last_name }` -> `{ status }`
- `POST /verify-otp`: `{ email, otp }` -> `{ status }`
- `GET /api/autofill?domain=...`: -> `{ company_name, website, domains, pricing_model, services, policies }`
- `POST /agents`: Full `OnboardingPayload` -> `{ agent_id }`

## Features
- **Executive UI:** Professional dark/light mode contrast with sleek typography.
- **Smart Autofill:** Uses Gemini grounded search to save time for busy executives.
- **Validation:** Real-time business email verification and field validation.
- **Stepper Flow:** Clear 5-step progress indicator.
