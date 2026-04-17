import { useState, useCallback } from "react";
import { ERPForm } from "@/components/ERPForm";
import { Dashboard } from "@/components/Dashboard";
import { LogTerminal } from "@/components/LogTerminal";

export type ERPFormData = {
  erpName: string;
  subscriptionAvailable: "yes" | "no";
  businessIntegrationType: "SCM" | "FS";
  parentWebsite: string;
  username: string;
  password: string;
  prompt: string;
};

export type ApiEndpoint = {
  name: string;
  method: string;
  endpoint: string;
  description: string;
  auth?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  requestBody?: Record<string, unknown>;
  response?: Record<string, unknown>;
  statusCode?: string;
  errorExample?: Record<string, unknown>;
  curlExample?: string;
  jsExample?: string;
  pythonExample?: string;
};

export type AuthMethod = {
  type: string;
  description: string;
  tokenUrl?: string | null;
  steps?: string[];
  example?: string;
};

export type Webhook = {
  name: string;
  description: string;
  available: boolean;
  events?: string[];
  payloadSample?: Record<string, unknown>;
};

export type DeploymentStep = {
  step: number;
  title: string;
  description: string;
  config?: string | null;
};

export type ERPResult = {
  erp: string;
  lastUpdated: string;
  integrationTypes: string[];
  apis: ApiEndpoint[];
  auth: AuthMethod[];
  webhooks: Webhook[];
  deploymentSteps: DeploymentStep[];
  customizationInfo?: Record<string, unknown>;
  sources?: string[];
};

function App() {
  const [result, setResult] = useState<ERPResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleGenerate = useCallback((formData: ERPFormData) => {
    setIsLoading(true);
    setResult(null);
    setLogs([]);
    setError(null);

    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const url = `${base}/api/erp/analyze`;

    // Simulate live agent logs while the analysis runs in background
    const agentLogs = [
      `[Planning Agent] Analyzing ERP: ${formData.erpName}`,
      `[Planning Agent] Business type: ${formData.businessIntegrationType}`,
      `[Planning Agent] Building research strategy...`,
      `[Planning Agent] Generated 5 search queries`,
      `[Planning Agent] Targeting developer portals and official docs`,
      `[Research Agent] Starting multi-level web search...`,
      `[Research Agent] Level 1: Executing targeted search queries...`,
      `[Research Agent] Searching: ${formData.erpName} REST API documentation`,
      `[Research Agent] Searching: ${formData.erpName} developer portal integration guide`,
      `[Research Agent] Searching: ${formData.erpName} API authentication OAuth`,
      `[Research Agent] Level 2: Filtering official sources...`,
      `[Research Agent] Level 3-4: Deep crawling and content extraction...`,
      `[Research Agent] Crawling developer portal...`,
      `[Research Agent] Crawling API reference pages...`,
      `[Research Agent] Deep crawling authentication docs...`,
      `[Research Agent] Level 5: Cleaning and deduplicating content...`,
      `[Reasoning Agent] Level 6: LLM reasoning and synthesis...`,
      `[Reasoning Agent] Extracting API endpoints from content...`,
      `[Reasoning Agent] Identifying authentication methods...`,
      `[Reasoning Agent] Analyzing webhook configurations...`,
      `[Reasoning Agent] Building deployment integration flow...`,
      `[Validation Agent] Validating and normalizing results...`,
      `[Orchestrator] Analysis complete! Rendering dashboard...`,
    ];

    // Start the real API call
    const fetchPromise = fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    // Stream fake logs progressively while waiting
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < agentLogs.length) {
        setLogs((prev) => [...prev, agentLogs[logIndex]]);
        logIndex++;
      }
    }, 800);

    fetchPromise
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        clearInterval(logInterval);
        // Flush remaining logs quickly
        const remaining = agentLogs.slice(logIndex);
        if (remaining.length > 0) {
          setLogs((prev) => [...prev, ...remaining]);
        }
        setTimeout(() => {
          setResult(data);
          setIsLoading(false);
        }, 300);
      })
      .catch((err) => {
        clearInterval(logInterval);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0B1F33" }}>
      {/* Left Panel */}
      <div className="w-[340px] min-w-[300px] flex-shrink-0 left-panel-bg flex flex-col overflow-y-auto">
        <div className="p-6 flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0F4C81, #1B6CA8)" }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">ERP Integration</h1>
                <p className="text-xs" style={{ color: "#5b9bd5" }}>Research Analyst</p>
              </div>
            </div>
          </div>

          <ERPForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,30,50,0.5)" }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white uppercase tracking-widest opacity-60">
              Integration Report
            </span>
            {result && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                Ready
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>Multi-Agent AI Research</span>
            <span>•</span>
            <span>6-Level Search Engine</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Log terminal during loading */}
          {(isLoading || logs.length > 0) && !result && (
            <div className="p-6">
              <LogTerminal logs={logs} isLoading={isLoading} />
            </div>
          )}

          {/* Error */}
          {error && !result && (
            <div className="p-6">
              <div className="glass-card rounded-xl p-4 border" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                <p className="text-sm text-red-400">Error: {error}</p>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {result ? (
            <Dashboard result={result} logs={logs} isLoading={isLoading} />
          ) : !isLoading && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center"
                style={{ background: "rgba(15,76,129,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <svg className="w-10 h-10" style={{ color: "#1B6CA8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">ERP Integration Research Analyst</h2>
              <p className="text-sm max-w-md" style={{ color: "rgba(255,255,255,0.4)" }}>
                Enter your ERP details in the left panel and click Generate to start the multi-agent analysis.
                The system will crawl official documentation, extract APIs, authentication flows, and build a complete integration report.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
                {["Planning Agent", "Research Agent", "Reasoning Agent"].map((agent) => (
                  <div key={agent} className="glass-card rounded-lg p-3 text-center">
                    <div className="w-6 h-6 rounded-full mx-auto mb-2"
                      style={{ background: "linear-gradient(135deg, #0F4C81, #1B6CA8)" }}/>
                    <p className="text-xs text-white font-medium">{agent}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
