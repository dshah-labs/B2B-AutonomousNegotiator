
import { OnboardingPayload } from "../types";
import { DEMO_AGENT_ID, DEMO_OTP } from "../constants";

const DEMO_MODE = true; // In real Next.js this would be process.env.NEXT_PUBLIC_DEMO_MODE

export const api = {
  signup: async (email: string, firstName: string, lastName: string) => {
    console.log("POST /signup", { email, firstName, lastName });
    await new Promise(res => setTimeout(res, 800));
    return { status: "success" };
  },

  verifyOtp: async (email: string, otp: string) => {
    console.log("POST /verify-otp", { email, otp });
    await new Promise(res => setTimeout(res, 800));
    if (DEMO_MODE && otp === DEMO_OTP) return { status: "success" };
    if (!DEMO_MODE) return { status: "success" }; // Simulate backend success
    throw new Error("Invalid OTP");
  },

  createAgent: async (payload: OnboardingPayload) => {
    console.log("POST /agents", payload);
    await new Promise(res => setTimeout(res, 1500));
    return { agent_id: DEMO_AGENT_ID };
  }
};
