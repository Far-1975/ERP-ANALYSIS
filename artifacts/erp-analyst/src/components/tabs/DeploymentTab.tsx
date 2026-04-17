import type { DeploymentStep } from "@/App";

type Props = {
  steps: DeploymentStep[];
};

export function DeploymentTab({ steps }: Props) {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-1 text-white">Integration Deployment Flow</h3>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Follow these steps to complete your ERP integration
        </p>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(180deg, #0F4C81, transparent)" }} />

        <div className="space-y-4 pl-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              {/* Step number */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center z-10 text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, #0F4C81, #1B6CA8)",
                  border: "2px solid rgba(27,108,168,0.5)",
                  color: "#fff",
                  boxShadow: "0 0 16px rgba(15,76,129,0.4)",
                }}>
                {step.step}
              </div>

              {/* Content */}
              <div className="flex-1 glass-card rounded-xl p-4 mb-0"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <h4 className="text-sm font-semibold text-white mb-1">{step.title}</h4>
                <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {step.description}
                </p>

                {step.config && (
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#90b8d8" }}>
                      Configuration
                    </label>
                    <pre className="code-block px-3 py-2 rounded-lg text-xs whitespace-pre-wrap">
                      {step.config}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {steps.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            No deployment steps found
          </p>
        </div>
      )}
    </div>
  );
}
