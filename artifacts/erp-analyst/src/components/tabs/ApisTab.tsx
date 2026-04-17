import { useState } from "react";
import type { ApiEndpoint } from "@/App";
import { ApiModal } from "@/components/ApiModal";

type Props = {
  apis: ApiEndpoint[];
};

export function ApisTab({ apis }: Props) {
  const [selectedApi, setSelectedApi] = useState<ApiEndpoint | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>("ALL");

  const methods = ["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"];
  const filtered = filterMethod === "ALL" ? apis : apis.filter((a) => a.method === filterMethod);

  return (
    <div className="space-y-4">
      {/* Method filter */}
      <div className="flex gap-2 flex-wrap">
        {methods.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMethod(m)}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: filterMethod === m ? "rgba(15,76,129,0.5)" : "rgba(255,255,255,0.05)",
              border: filterMethod === m ? "1px solid rgba(27,108,168,0.6)" : "1px solid rgba(255,255,255,0.08)",
              color: filterMethod === m ? "#60a5fa" : "rgba(255,255,255,0.5)",
            }}
          >
            {m} {m !== "ALL" && `(${apis.filter((a) => a.method === m).length})`}
          </button>
        ))}
      </div>

      {/* API List */}
      <div className="space-y-2">
        {filtered.map((api, i) => (
          <button
            key={i}
            onClick={() => setSelectedApi(api)}
            className="w-full glass-card card-hover rounded-xl px-4 py-3 flex items-center gap-4 text-left"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className={`px-2.5 py-1 rounded text-xs font-bold flex-shrink-0 method-${api.method.toLowerCase()}`}>
              {api.method}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{api.name}</p>
              <p className="text-xs font-mono mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                {api.endpoint}
              </p>
            </div>
            <div className="flex-shrink-0 max-w-64 hidden md:block">
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                {api.description}
              </p>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              No {filterMethod} endpoints found
            </p>
          </div>
        )}
      </div>

      {/* API Modal */}
      {selectedApi && (
        <ApiModal api={selectedApi} onClose={() => setSelectedApi(null)} />
      )}
    </div>
  );
}
