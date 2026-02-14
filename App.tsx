
import React, { useState, useEffect } from 'react';
import { Step, UserData, CompanyData, GoalsData, PricingModel, OnboardingPayload } from './types';
import { STEP_LABELS, FREE_DOMAINS, DEMO_OTP } from './constants';
import { Stepper, InputField, TextArea, Select, ReviewCard, ReviewItem } from './components/UI';
import { api } from './services/api';
import { autofillCompanyDetails, generateBusinessGoals } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.SIGN_UP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Form State
  const [user, setUser] = useState<UserData>({ first_name: '', last_name: '', email: '' });
  const [otp, setOtp] = useState('');
  const [company, setCompany] = useState<CompanyData>({
    company_name: '',
    ein: '',
    website: '',
    domains: [],
    policies: '',
    pricing_model: PricingModel.SUBSCRIPTION,
    services: ''
  });
  const [goals, setGoals] = useState<GoalsData>({ short_term: '', long_term: '' });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return "Invalid email format";
    const domain = email.split('@')[1];
    if (FREE_DOMAINS.includes(domain)) return "Please use a business email";
    return null;
  };

  const handleNext = () => {
    if (currentStep === Step.SIGN_UP) {
      const emailErr = validateEmail(user.email);
      if (emailErr) {
        setFieldErrors({ email: emailErr });
        return;
      }
      if (!user.first_name || !user.last_name) {
        setFieldErrors({ first_name: user.first_name ? '' : 'Required', last_name: user.last_name ? '' : 'Required' });
        return;
      }
      setFieldErrors({});
      setLoading(true);
      api.signup(user.email, user.first_name, user.last_name)
        .then(() => setCurrentStep(Step.VERIFY_OTP))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } 
    else if (currentStep === Step.VERIFY_OTP) {
      if (otp.length < 6) return;
      setLoading(true);
      api.verifyOtp(user.email, otp)
        .then(() => setCurrentStep(Step.COMPANY_INFO))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
    else if (currentStep === Step.COMPANY_INFO) {
      if (!company.company_name || !company.website) return;
      setCurrentStep(Step.GOALS);
    }
    else if (currentStep === Step.GOALS) {
      setCurrentStep(Step.REVIEW);
    }
  };

  const handleAutofill = async () => {
    const domain = user.email.split('@')[1];
    setLoading(true);
    try {
      const data = await autofillCompanyDetails(domain);
      setCompany({
        ...company,
        ...data,
        ein: '' // Keep EIN blank for manual entry
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGoals = async () => {
    setLoading(true);
    try {
      const generated = await generateBusinessGoals(company);
      setGoals(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    setLoading(true);
    const payload: OnboardingPayload = { user, company, goals };
    api.createAgent(payload)
      .then(res => {
        setAgentId(res.agent_id);
        setCurrentStep(Step.SUCCESS);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const renderContent = () => {
    switch (currentStep) {
      case Step.SIGN_UP:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800">Welcome to Bot Business Forum</h2>
            <p className="text-slate-500 mb-6">Let's get your company bot verified and active.</p>
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="First Name" 
                value={user.first_name} 
                onChange={(v) => setUser({...user, first_name: v})} 
                error={fieldErrors.first_name}
                required
              />
              <InputField 
                label="Last Name" 
                value={user.last_name} 
                onChange={(v) => setUser({...user, last_name: v})} 
                error={fieldErrors.last_name}
                required
              />
            </div>
            <InputField 
              label="Business Email" 
              placeholder="you@company.com" 
              value={user.email} 
              onChange={(v) => setUser({...user, email: v})} 
              error={fieldErrors.email}
              required
            />
            <button 
              onClick={handleNext}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : "Send OTP"}
            </button>
          </div>
        );

      case Step.VERIFY_OTP:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800">Verify your identity</h2>
            <p className="text-slate-500 mb-6">We've sent a 6-digit code to <span className="font-semibold text-slate-700">{user.email}</span>.</p>
            <InputField 
              label="OTP Code" 
              placeholder="123456" 
              value={otp} 
              onChange={setOtp} 
              error={error || undefined}
            />
            <p className="text-xs text-slate-400">Demo Tip: Use "123456"</p>
            <button 
              onClick={handleNext}
              disabled={loading || otp.length < 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : "Verify"}
            </button>
          </div>
        );

      case Step.COMPANY_INFO:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-slate-800">Company Context</h2>
              <button 
                onClick={handleAutofill}
                disabled={loading}
                className="text-xs font-semibold text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                {loading ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : '✨ Autofill with Gemini'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Company Name" value={company.company_name} onChange={(v) => setCompany({...company, company_name: v})} required />
              <InputField label="EIN (Optional)" value={company.ein} onChange={(v) => setCompany({...company, ein: v})} />
              <InputField label="Website" placeholder="https://..." value={company.website} onChange={(v) => setCompany({...company, website: v})} required />
              <Select 
                label="Pricing Model" 
                options={Object.values(PricingModel)} 
                value={company.pricing_model} 
                onChange={(v) => setCompany({...company, pricing_model: v as PricingModel})} 
              />
            </div>
            <InputField 
              label="Domains (comma separated)" 
              placeholder="e.g. logistics, supply-chain" 
              value={company.domains.join(', ')} 
              onChange={(v) => setCompany({...company, domains: v.split(',').map(s => s.trim())})} 
            />
            <TextArea 
              label="Services Offered" 
              placeholder="Describe your core business services..." 
              value={company.services} 
              onChange={(v) => setCompany({...company, services: v})} 
            />
            <TextArea 
              label="Business Policies" 
              placeholder="Summarize key operational or compliance policies..." 
              value={company.policies} 
              onChange={(v) => setCompany({...company, policies: v})} 
            />
            <button 
              onClick={handleNext}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
            >
              Continue to Goals
            </button>
          </div>
        );

      case Step.GOALS:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-slate-800">What is your Bot's mission?</h2>
              <button 
                onClick={handleGenerateGoals}
                disabled={loading}
                className="text-xs font-semibold text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                {loading ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : '✨ Auto-generate with Gemini'}
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-sm">This helps our matching engine find the right partners.</p>
            <TextArea 
              label="Short-term Goals" 
              placeholder="What do you want to achieve in the next 3-6 months?" 
              value={goals.short_term} 
              onChange={(v) => setGoals({...goals, short_term: v})} 
              hint="Examples: reduce cloud costs, find distribution partners in EMEA..."
              rows={4}
            />
            <TextArea 
              label="Long-term Goals" 
              placeholder="What is the strategic vision for this initiative?" 
              value={goals.long_term} 
              onChange={(v) => setGoals({...goals, long_term: v})} 
              hint="Examples: establish market leadership in web3 payments..."
              rows={4}
            />
            <button 
              onClick={handleNext}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
            >
              Review Application
            </button>
          </div>
        );

      case Step.REVIEW:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800">Final Review</h2>
            <p className="text-slate-500 mb-6">Review your information before deploying your business bot.</p>
            
            <ReviewCard title="Point of Contact">
              <ReviewItem label="Name" value={`${user.first_name} ${user.last_name}`} />
              <ReviewItem label="Email" value={user.email} />
            </ReviewCard>

            <ReviewCard title="Company Profile">
              <ReviewItem label="Company Name" value={company.company_name} />
              <ReviewItem label="Website" value={company.website} />
              <ReviewItem label="EIN" value={company.ein || "Not provided"} />
              <ReviewItem label="Pricing" value={company.pricing_model} />
              <ReviewItem label="Domains" value={company.domains} />
              <ReviewItem label="Services" value={company.services} />
            </ReviewCard>

            <ReviewCard title="Initiative Goals">
              <ReviewItem label="Short-term" value={goals.short_term} />
              <ReviewItem label="Long-term" value={goals.long_term} />
            </ReviewCard>

            <button 
              onClick={handleCreateAgent}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : "🚀 Create Business Agent"}
            </button>
          </div>
        );

      case Step.SUCCESS:
        return (
          <div className="text-center py-12 animate-bounceIn">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Agent created successfully</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Your bot is now scanning the network for partnership opportunities. We'll notify you when matches are found.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg inline-block border border-slate-200">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Agent ID</p>
              <code className="text-lg font-mono text-indigo-600 font-bold">{agentId}</code>
            </div>
            <div className="mt-12">
              <button 
                onClick={() => window.location.reload()}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
        
        {/* Left Sidebar - Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/3 bg-slate-900 p-8 flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight">BBF</h1>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automate your B2B partnerships. Join the world's first verified bot business network.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            &copy; 2024 Bot Business Forum. <br/>All rights reserved.
          </div>
        </div>

        {/* Right Content - Onboarding Flow */}
        <div className="flex-1 p-6 md:p-12">
          {currentStep !== Step.SUCCESS && (
            <Stepper steps={STEP_LABELS} currentStep={currentStep} />
          )}
          {renderContent()}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.95); opacity: 0; }
          70% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounceIn { animation: bounceIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
