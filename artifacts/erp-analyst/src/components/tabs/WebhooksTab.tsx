import type { Webhook } from "@/App";

type Props = {
  webhooks: Webhook[];
};

export function WebhooksTab({ webhooks }: Props) {
  return (
    <div className="space-y-4">
      {webhooks.map((wh, i) => (
        <div key={i} className="glass-card rounded-xl p-5"
          style={{
            border: `1px solid ${wh.available ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
          }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl"
                style={{
                  background: wh.available ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                  border: `1px solid ${wh.available ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                }}>
                <svg className="w-5 h-5" style={{ color: wh.available ? "#4ade80" : "#f87171" }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{wh.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {wh.description}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              style={{
                background: wh.available ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                color: wh.available ? "#4ade80" : "#f87171",
                border: `1px solid ${wh.available ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
              {wh.available ? "Available" : "Not Available"}
            </span>
          </div>

          {wh.available && (
            <>
              {/* Events */}
              {wh.events && wh.events.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-2" style={{ color: "#90b8d8" }}>
                    Webhook Events
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {wh.events.map((event, j) => (
                      <span key={j} className="px-2.5 py-1 rounded-md text-xs font-mono"
                        style={{
                          background: "rgba(74,222,128,0.1)",
                          color: "#4ade80",
                          border: "1px solid rgba(74,222,128,0.2)",
                        }}>
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Payload Sample */}
              {wh.payloadSample && Object.keys(wh.payloadSample).length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
                    Payload Sample
                  </label>
                  <pre className="code-block px-4 py-3 rounded-lg text-xs">
                    {JSON.stringify(wh.payloadSample, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {webhooks.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            No webhook information found
          </p>
        </div>
      )}
    </div>
  );
}
