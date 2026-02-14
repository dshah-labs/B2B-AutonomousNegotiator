
export enum PricingModel {
  SUBSCRIPTION = 'Subscription',
  USAGE_BASED = 'Usage-based',
  ENTERPRISE = 'Enterprise',
  FREEMIUM = 'Freemium',
  OTHER = 'Other'
}

export interface UserData {
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  company_domain: string;
  created_at?: string;
  verified: boolean;
  verification_method: string;
  role_title?: string;
}

export interface CompanyData {
  company_name: string;
  ein: string;
  website: string;
  domains: string[];
  policies: string;
  pricing_model: PricingModel;
  services: string[];
}

export interface GoalsData {
  short_term: string;
  long_term: string;
}

export interface AgentData {
  agent_id: string;
  owner_user_id: string;
  status: 'draft' | 'active';
  created_at: string;
  company_context: CompanyData;
  goals: GoalsData;
}

export interface OnboardingPayload {
  user: UserData;
  agent: Partial<AgentData>;
}

export enum Step {
  SIGN_UP = 0,
  VERIFY_OTP = 1,
  COMPANY_INFO = 2,
  GOALS = 3,
  REVIEW = 4,
  SUCCESS = 5
}
