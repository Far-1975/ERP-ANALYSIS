import { useEffect, useRef } from "react";

type Props = {
  logs: string[];
  isLoading: boolean;
};

export function LogTerminal({ logs, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (msg: string) => {
    if (msg.includes("[Planning Agent]")) return "#60a5fa";
    if (msg.includes("[Research Agent]")) return "#4ade80";
    if (msg.includes("[Reasoning Agent]")) return "#f59e0b";
    if (msg.includes("[Validation Agent]")) return "#a78bfa";
    if (msg.includes("[Orchestrator]")) return "#34d399";
    if (msg.includes("Error")) return "#f87171";
    return "#94a3b8";
  };

  return (
    <div className="rounded-xl overflow-hidden log-terminal">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b"
        style={{ borderColor: "rgba(33,150,243,0.15)", background: "rgba(0,0,0,0.3)" }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          Agent Execution Log
        </span>
        {isLoading && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
            </div>
            <span className="text-xs text-green-400">Running</span>
          </div>
        )}
      </div>

      {/* Log content */}
      <div className="p-4 max-h-64 overflow-y-auto space-y-0.5">
        {logs.length === 0 && isLoading && (
          <div className="flex items-center gap-2">
            <div className="spinner w-3 h-3" />
            <span className="text-xs" style={{ color: "#4ade80" }}>Initializing agents...</span>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2 text-xs leading-relaxed">
            <span style={{ color: "rgba(255,255,255,0.2)", minWidth: "24px", fontFamily: "monospace" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ color: getLogColor(log) }}>{log}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
