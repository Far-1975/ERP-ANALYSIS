import { useState } from "react";
import type { ERPFormData } from "@/App";

type Props = {
  onGenerate: (data: ERPFormData) => void;
  isLoading: boolean;
};

export function ERPForm({ onGenerate, isLoading }: Props) {
  const [form, setForm] = useState<ERPFormData>({
    erpName: "",
    subscriptionAvailable: "yes",
    businessIntegrationType: "SCM",
    parentWebsite: "",
    username: "",
    password: "",
    prompt: "Extract all available REST API endpoints, authentication methods, webhooks, and integration flows. Provide comprehensive documentation for integration purposes.",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.erpName.trim()) return;
    onGenerate(form);
  };

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1 focus:ring-blue-400/50`;
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ERP Name */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
          ERP Name *
        </label>
        <input
          className={inputClass}
          style={inputStyle}
          placeholder="e.g. SAP, Oracle, NetSuite..."
          value={form.erpName}
          onChange={(e) => setForm({ ...form, erpName: e.target.value })}
          required
        />
      </div>

      {/* Subscription Available */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
          Subscription Available
        </label>
        <div className="flex gap-4">
          {(["yes", "no"] as const).map((val) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  className="sr-only"
                  name="subscription"
                  value={val}
                  checked={form.subscriptionAvailable === val}
                  onChange={() => setForm({ ...form, subscriptionAvailable: val })}
                />
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: form.subscriptionAvailable === val ? "#1B6CA8" : "rgba(255,255,255,0.2)",
                    background: form.subscriptionAvailable === val ? "rgba(27,108,168,0.2)" : "transparent",
                  }}>
                  {form.subscriptionAvailable === val && (
                    <div className="w-2 h-2 rounded-full" style={{ background: "#1B6CA8" }} />
                  )}
                </div>
              </div>
              <span className="text-sm capitalize" style={{ color: "rgba(255,255,255,0.8)" }}>{val}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Business Integration Type */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
          Business Integration Type
        </label>
        <select
          className={inputClass}
          style={{ ...inputStyle, appearance: "none" }}
          value={form.businessIntegrationType}
          onChange={(e) => setForm({ ...form, businessIntegrationType: e.target.value as "SCM" | "FS" })}
        >
          <option value="SCM" style={{ background: "#0A3A5A" }}>SCM – Supply Chain Management</option>
          <option value="FS" style={{ background: "#0A3A5A" }}>FS – Financial Services</option>
        </select>
      </div>

      {/* Parent Website */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
          Parent Website to Search
        </label>
        <input
          className={inputClass}
          style={inputStyle}
          placeholder="e.g. https://developer.sap.com"
          value={form.parentWebsite}
          onChange={(e) => setForm({ ...form, parentWebsite: e.target.value })}
        />
      </div>

      {/* Credentials */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
          Credentials <span className="font-normal opacity-60">(optional)</span>
        </label>
        <div className="space-y-2">
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="off"
          />
          <input
            className={inputClass}
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
          Prompt
        </label>
        <textarea
          className={`${inputClass} resize-none`}
          style={inputStyle}
          rows={5}
          placeholder="Describe what you want to extract..."
          value={form.prompt}
          onChange={(e) => setForm({ ...form, prompt: e.target.value })}
        />
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isLoading || !form.erpName.trim()}
        className="w-full btn-primary rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="spinner w-4 h-4" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generate</span>
          </>
        )}
      </button>

      {/* Info note */}
      <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
        Multi-agent AI • 6-level search • Real-time analysis
      </p>
    </form>
  );
}
