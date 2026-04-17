import type { ERPResult } from "@/App";

type Props = {
  result: ERPResult;
  onTabChange: (tab: "overview" | "apis" | "authentication" | "webhooks" | "customization" | "deployment") => void;
};

export function OverviewTab({ result, onTabChange }: Props) {
  const webhooksAvailable = result.webhooks.some((w) => w.available);

  const cards = [
    {
      label: "API Endpoints",
      value: result.apis.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      tab: "apis" as const,
      color: "#60a5fa",
      bg: "rgba(59,130,246,0.1)",
      border: "rgba(59,130,246,0.2)",
    },
    {
      label: "Auth Methods",
      value: result.auth.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      tab: "authentication" as const,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.1)",
      border: "rgba(167,139,250,0.2)",
    },
    {
      label: "Webhooks",
      value: webhooksAvailable ? "Available" : "N/A",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      tab: "webhooks" as const,
      color: "#4ade80",
      bg: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.2)",
    },
    {
      label: "Integration Types",
      value: result.integrationTypes.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      tab: "customization" as const,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onTabChange(card.tab)}
            className="glass-card card-hover rounded-xl p-4 text-left cursor-pointer relative overflow-hidden"
            style={{ border: `1px solid ${card.border}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {card.label}
            </div>
          </button>
        ))}
      </div>

      {/* Integration Types detail */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-white">Integration Technologies</h3>
        <div className="flex flex-wrap gap-3">
          {result.integrationTypes.map((type) => (
            <div key={type} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: "rgba(15,76,129,0.3)",
                border: "1px solid rgba(27,108,168,0.5)",
                color: "#60a5fa",
              }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#1B6CA8" }} />
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Quick API Preview */}
      {result.apis.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top API Endpoints</h3>
            <button onClick={() => onTabChange("apis")}
              className="text-xs" style={{ color: "#60a5fa" }}>
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {result.apis.slice(0, 5).map((api, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className={`px-2 py-0.5 rounded text-xs font-bold method-${api.method.toLowerCase()}`}>
                  {api.method}
                </span>
                <span className="text-sm text-white font-mono truncate">{api.endpoint}</span>
                <span className="text-xs ml-auto truncate max-w-48" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {api.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auth Quick Summary */}
      {result.auth.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Authentication Methods</h3>
            <button onClick={() => onTabChange("authentication")}
              className="text-xs" style={{ color: "#a78bfa" }}>
              View details →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.auth.map((auth, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-lg"
                style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#a78bfa" }} />
                <div>
                  <p className="text-sm font-medium text-white">{auth.type}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {auth.description?.slice(0, 60)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
