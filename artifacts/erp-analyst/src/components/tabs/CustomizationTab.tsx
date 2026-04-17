type Props = {
  integrationTypes: string[];
  customizationInfo?: Record<string, unknown>;
};

export function CustomizationTab({ integrationTypes, customizationInfo }: Props) {
  const info = customizationInfo ?? {};

  const dataFormats = Array.isArray(info.dataFormats) ? info.dataFormats as string[] : ["JSON"];
  const extensionMethods = Array.isArray(info.extensionMethods)
    ? info.extensionMethods as string[]
    : [
        "REST API Integration",
        "Webhook Event Subscriptions",
        "Custom Field Mapping",
        "Batch Processing APIs",
      ];

  return (
    <div className="space-y-4">
      {/* Integration Types */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">Integration Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {integrationTypes.map((type) => (
            <div key={type} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(15,76,129,0.2)",
                border: "1px solid rgba(27,108,168,0.3)",
              }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#1B6CA8" }} />
              <span className="text-sm font-semibold text-white">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">Integration Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CapabilityItem
            label="SDK Available"
            value={info.sdkAvailable === true ? "Yes" : "Check vendor"}
            available={info.sdkAvailable === true}
          />
          <CapabilityItem
            label="Sandbox Environment"
            value={info.sandboxEnvironment === true ? "Yes" : "Contact vendor"}
            available={info.sandboxEnvironment === true}
          />
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.1)" }}>
              <svg className="w-4 h-4" style={{ color: "#f59e0b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Rate Limits</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                {typeof info.rateLimits === "string" ? info.rateLimits : "Contact vendor"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Formats */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">Supported Data Formats</h3>
        <div className="flex flex-wrap gap-3">
          {dataFormats.map((fmt) => (
            <span key={fmt} className="px-3 py-1.5 rounded-lg text-sm font-mono font-semibold"
              style={{
                background: "rgba(96,165,250,0.1)",
                color: "#60a5fa",
                border: "1px solid rgba(96,165,250,0.2)",
              }}>
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Extension Methods */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">Extension Capabilities</h3>
        <div className="space-y-2">
          {extensionMethods.map((method, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#1B6CA8" }} />
              <span className="text-sm text-white">{method}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CapabilityItem({ label, value, available }: { label: string; value: string; available: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-lg"
        style={{ background: available ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)" }}>
        <svg className="w-4 h-4" style={{ color: available ? "#4ade80" : "#f87171" }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {available ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{value}</p>
      </div>
    </div>
  );
}
