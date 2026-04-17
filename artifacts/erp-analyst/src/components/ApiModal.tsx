import { useEffect, useState, useRef } from "react";
import type { ApiEndpoint } from "@/App";

type Props = {
  api: ApiEndpoint;
  onClose: () => void;
};

type CodeTab = "curl" | "javascript" | "python";

export function ApiModal({ api, onClose }: Props) {
  const [codeTab, setCodeTab] = useState<CodeTab>("curl");
  const [copied, setCopied] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const codeExamples: Record<CodeTab, string> = {
    curl: api.curlExample ?? `curl -X ${api.method} "${api.endpoint}"`,
    javascript: api.jsExample ?? `fetch("${api.endpoint}", { method: "${api.method}" })`,
    python: api.pythonExample ?? `import requests\nrequests.${api.method.toLowerCase()}("${api.endpoint}")`,
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="modal-enter w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: "#0d2137",
          border: "1px solid rgba(27,108,168,0.4)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0d2137" }}>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded text-sm font-bold method-${api.method.toLowerCase()}`}>
              {api.method}
            </span>
            <h2 className="text-base font-semibold text-white">{api.name}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Section */}
          <Section title="Request">
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#90b8d8" }}>Endpoint URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 code-block px-3 py-2 rounded-lg text-sm">
                    {api.endpoint}
                  </code>
                  <CopyButton text={api.endpoint} label="url" copied={copied} onCopy={copy} />
                </div>
              </div>

              {api.headers && Object.keys(api.headers).length > 0 && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#90b8d8" }}>Headers</label>
                  <pre className="code-block px-3 py-2 rounded-lg text-xs">
                    {JSON.stringify(api.headers, null, 2)}
                  </pre>
                </div>
              )}

              {api.params && Object.keys(api.params).length > 0 && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#90b8d8" }}>Query Params</label>
                  <pre className="code-block px-3 py-2 rounded-lg text-xs">
                    {JSON.stringify(api.params, null, 2)}
                  </pre>
                </div>
              )}

              {api.requestBody && Object.keys(api.requestBody).length > 0 && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#90b8d8" }}>Request Body</label>
                  <div className="relative">
                    <pre className="code-block px-3 py-2 rounded-lg text-xs">
                      {JSON.stringify(api.requestBody, null, 2)}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <CopyButton
                        text={JSON.stringify(api.requestBody, null, 2)}
                        label="body"
                        copied={copied}
                        onCopy={copy}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Response Section */}
          <Section title="Response">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                  {api.statusCode ?? "200"}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Success</span>
              </div>
              {api.response && (
                <pre className="code-block px-3 py-2 rounded-lg text-xs">
                  {JSON.stringify(api.response, null, 2)}
                </pre>
              )}

              {api.errorExample && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#f87171" }}>Error Example</label>
                  <pre className="code-block px-3 py-2 rounded-lg text-xs" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                    {JSON.stringify(api.errorExample, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Section>

          {/* Auth Section */}
          {api.auth && (
            <Section title="Authentication">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#a78bfa" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>{api.auth}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Authorization: Bearer {"{access_token}"}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* Code Examples */}
          <Section title="Code Examples">
            <div className="space-y-3">
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                {(["curl", "javascript", "python"] as CodeTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCodeTab(tab)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: codeTab === tab ? "rgba(15,76,129,0.5)" : "transparent",
                      color: codeTab === tab ? "#60a5fa" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {tab === "curl" ? "cURL" : tab === "javascript" ? "JavaScript" : "Python"}
                  </button>
                ))}
              </div>

              <div className="relative">
                <pre className="code-block px-4 py-3 rounded-lg text-xs whitespace-pre-wrap">
                  {codeExamples[codeTab]}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton
                    text={codeExamples[codeTab]}
                    label={`code-${codeTab}`}
                    copied={copied}
                    onCopy={copy}
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#5b9bd5" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function CopyButton({
  text, label, copied, onCopy
}: {
  text: string;
  label: string;
  copied: string | null;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(text, label)}
      className="px-2 py-1 rounded text-xs transition-all flex items-center gap-1"
      style={{
        background: copied === label ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)",
        color: copied === label ? "#4ade80" : "rgba(255,255,255,0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {copied === label ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
