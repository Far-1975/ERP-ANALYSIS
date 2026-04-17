import { useState } from "react";
import type { ERPResult } from "@/App";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { ApisTab } from "@/components/tabs/ApisTab";
import { AuthTab } from "@/components/tabs/AuthTab";
import { WebhooksTab } from "@/components/tabs/WebhooksTab";
import { CustomizationTab } from "@/components/tabs/CustomizationTab";
import { DeploymentTab } from "@/components/tabs/DeploymentTab";
import { LogTerminal } from "@/components/LogTerminal";

type Props = {
  result: ERPResult;
  logs: string[];
  isLoading: boolean;
};

type Tab = "overview" | "apis" | "authentication" | "webhooks" | "customization" | "deployment";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "apis", label: "APIs" },
  { id: "authentication", label: "Authentication" },
  { id: "webhooks", label: "Webhooks" },
  { id: "customization", label: "Customization" },
  { id: "deployment", label: "Deployment" },
];

function downloadPDF(result: ERPResult) {
  const content = `ERP Integration Report: ${result.erp}
Generated: ${result.lastUpdated}

INTEGRATION TYPES: ${result.integrationTypes.join(", ")}

=== API ENDPOINTS (${result.apis.length}) ===
${result.apis.map((a) => `${a.method} ${a.endpoint}\n  ${a.description}`).join("\n\n")}

=== AUTHENTICATION (${result.auth.length}) ===
${result.auth.map((a) => `${a.type}: ${a.description}`).join("\n\n")}

=== WEBHOOKS ===
${result.webhooks.map((w) => `${w.name}: ${w.available ? "Available" : "Not Available"}`).join("\n")}

=== DEPLOYMENT STEPS ===
${result.deploymentSteps.map((s) => `Step ${s.step}: ${s.title}\n  ${s.description}`).join("\n\n")}

=== SOURCES ===
${(result.sources ?? []).join("\n")}
`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${result.erp.replace(/\s+/g, "-")}-integration-report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Dashboard({ result, logs, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const webhooksAvailable = result.webhooks.some((w) => w.available);

  return (
    <div className="flex flex-col h-full">
      {/* Report Header */}
      <div className="px-6 py-4 flex-shrink-0" style={{ background: "rgba(10,30,50,0.4)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold mb-0.5 uppercase tracking-wider" style={{ color: "#5b9bd5" }}>
              Integration Report
            </p>
            <h1 className="text-2xl font-bold text-white">{result.erp}</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Last Updated: {result.lastUpdated}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {result.integrationTypes.map((type) => (
                <span key={type} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(15,76,129,0.4)",
                    border: "1px solid rgba(27,108,168,0.5)",
                    color: "#60a5fa",
                  }}>
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Download PDF */}
          <button
            onClick={() => downloadPDF(result)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white flex-shrink-0"
            style={{
              background: "rgba(15,76,129,0.3)",
              border: "1px solid rgba(27,108,168,0.4)",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b flex" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-3 text-xs font-semibold transition-all relative"
            style={{
              color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.4)",
              background: activeTab === tab.id ? "rgba(15,76,129,0.2)" : "transparent",
              borderBottom: activeTab === tab.id ? "2px solid #1B6CA8" : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === "overview" && (
          <OverviewTab result={result} onTabChange={setActiveTab} />
        )}
        {activeTab === "apis" && (
          <ApisTab apis={result.apis} />
        )}
        {activeTab === "authentication" && (
          <AuthTab auth={result.auth} />
        )}
        {activeTab === "webhooks" && (
          <WebhooksTab webhooks={result.webhooks} />
        )}
        {activeTab === "customization" && (
          <CustomizationTab
            integrationTypes={result.integrationTypes}
            customizationInfo={result.customizationInfo}
          />
        )}
        {activeTab === "deployment" && (
          <DeploymentTab steps={result.deploymentSteps} />
        )}

        {/* Sources + Logs at bottom */}
        {result.sources && result.sources.length > 0 && (
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-xs font-semibold mb-2" style={{ color: "#90b8d8" }}>
              Research Sources ({result.sources.length})
            </h4>
            <div className="space-y-1">
              {result.sources.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer"
                  className="block text-xs truncate hover:text-blue-300 transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  {src}
                </a>
              ))}
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2" style={{ color: "#90b8d8" }}>
              Execution Log
            </h4>
            <LogTerminal logs={logs} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
