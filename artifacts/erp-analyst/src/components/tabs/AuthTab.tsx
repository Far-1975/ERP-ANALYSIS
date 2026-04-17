import type { AuthMethod } from "@/App";

type Props = {
  auth: AuthMethod[];
};

export function AuthTab({ auth }: Props) {
  return (
    <div className="space-y-4">
      {auth.map((method, i) => (
        <div key={i} className="glass-card rounded-xl p-5"
          style={{ border: "1px solid rgba(167,139,250,0.15)" }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl"
              style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <svg className="w-5 h-5" style={{ color: "#a78bfa" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{method.type}</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                {method.description}
              </p>
            </div>
          </div>

          {/* Token URL */}
          {method.tokenUrl && (
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
                Token URL
              </label>
              <code className="block code-block px-3 py-2 rounded-lg text-xs">
                {method.tokenUrl}
              </code>
            </div>
          )}

          {/* Steps */}
          {method.steps && method.steps.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2" style={{ color: "#90b8d8" }}>
                Integration Steps
              </label>
              <div className="space-y-2">
                {method.steps.map((step, j) => (
                  <div key={j} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                      style={{
                        background: "rgba(167,139,250,0.2)",
                        color: "#a78bfa",
                        border: "1px solid rgba(167,139,250,0.3)",
                      }}>
                      {j + 1}
                    </div>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example */}
          {method.example && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#90b8d8" }}>
                Usage Example
              </label>
              <code className="block code-block px-3 py-2 rounded-lg text-xs" style={{ color: "#a78bfa" }}>
                {method.example}
              </code>
            </div>
          )}
        </div>
      ))}

      {auth.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            No authentication methods found
          </p>
        </div>
      )}
    </div>
  );
}
