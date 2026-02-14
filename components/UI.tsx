
import React from 'react';

export const InputField: React.FC<{
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
}> = ({ label, placeholder, type = "text", value, onChange, error, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const TextArea: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  rows?: number;
  hint?: string;
}> = ({ label, placeholder, value, onChange, error, rows = 3, hint }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
    />
    {hint && <p className="mt-1 text-xs text-slate-400 italic">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Select: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const Stepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => (
  <div className="w-full mb-8">
    <div className="flex items-center justify-between">
      {steps.map((label, idx) => (
        <div key={label} className="flex flex-col items-center flex-1 relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 
            ${idx <= currentStep ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
            {idx + 1}
          </div>
          <span className={`mt-2 text-[10px] md:text-xs font-medium ${idx <= currentStep ? 'text-indigo-600' : 'text-slate-400'}`}>
            {label}
          </span>
          {idx < steps.length - 1 && (
            <div className={`absolute top-4 left-1/2 w-full h-[2px] ${idx < currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  </div>
);

export const ReviewCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-50 pb-2">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      {children}
    </div>
  </div>
);

export const ReviewItem: React.FC<{ label: string; value: string | string[] }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</p>
    <p className="text-sm text-slate-700 leading-relaxed">
      {Array.isArray(value) ? value.join(', ') : (value || 'N/A')}
    </p>
  </div>
);
