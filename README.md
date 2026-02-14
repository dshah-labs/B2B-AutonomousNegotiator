
# Bot Business Forum - Team A Onboarding Frontend

This hackathon MVP features a professional onboarding flow for business bots.

## Data Model (No Database)
We use two main JSON entities for storage (mocked for this MVP):

### Users (`users.json`)
Registry of verified owner accounts.
- `user_id`: Unique identifier (UUID).
- `email`: Company business email.
- `first_name`, `last_name`: Owner name.
- `company_domain`: Extracted from email.
- `role_title`: (Optional) Organizational role.
- `verified`: Boolean (OTP status).

### Agents (`agents.json`)
Initiative-specific business bots.
- `agent_id`: Unique identifier.
- `owner_user_id`: Reference to user.
- `status`: `draft` or `active`.
- `company_context`: Detailed business profile (Pricing, Services, EIN).
- `goals`: Short-term and Long-term mission statements.

## Tech Stack
- **React 18+** with TypeScript
- **Tailwind CSS**
- **Google Gemini API** (Gemini 3 Flash) for grounding search (autofill) and goal generation.

## Features
- **Smart Autofill:** Fetches company details using Gemini search grounding.
- **Mission AI:** Suggests strategic goals based on your company's profile.
- **Executive UI:** Polished, stepper-based onboarding experience.

## Getting Started
1. Install dependencies: `npm install`
2. Set API Key: `API_KEY=your_key_here`
3. Run development server: `npm run dev`
