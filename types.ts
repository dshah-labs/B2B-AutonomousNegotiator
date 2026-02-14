
export enum PricingModel {
  SUBSCRIPTION = 'Subscription',
  USAGE_BASED = 'Usage-based',
  ENTERPRISE = 'Enterprise',
  FREEMIUM = 'Freemium',
  OTHER = 'Other'
}

export interface UserData {
  first_name: string;
  last_name: string;
  email: string;
}

export interface CompanyData {
  company_name: string;
  ein: string;
  website: string;
  domains: string[];
  policies: string;
  pricing_model: PricingModel;
  services: string;
}

export interface GoalsData {
  short_term: string;
  long_term: string;
}

export interface OnboardingPayload {
  user: UserData;
  company: CompanyData;
  goals: GoalsData;
}

export enum Step {
  SIGN_UP = 0,
  VERIFY_OTP = 1,
  COMPANY_INFO = 2,
  GOALS = 3,
  REVIEW = 4,
  SUCCESS = 5
}
