"use client";

import { useState, useEffect } from "react";

type ActivityLog = {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityLogTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState("");

  const fetchLogs = async (p: number, resource: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("limit", "50");
    if (resource) params.set("resource", resource);
    const res = await fetch(`/api/activity-logs?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setTotalCount(data.totalCount);
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs(page, resourceFilter);
  }, [page, resourceFilter]);

  const resources = [...new Set(logs.map((l) => l.resource))];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Activity Log</h1>
          <p className="text-sm text-stone-500 mt-1">{totalCount} event{totalCount !== 1 ? "s" : ""} • System audit trail</p>
        </div>
        <select
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-stone-400 bg-white"
        >
          <option value="">All Resources</option>
          {resources.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Date/Time</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Action</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Resource</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-5 py-4 text-stone-500 text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="px-5 py-4">
                        {log.user ? (
                          <div>
                            <p className="font-semibold text-stone-800 text-sm">{log.user.name || "Unknown"}</p>
                            <p className="text-[11px] text-stone-400">{log.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">System</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-[11px] font-medium">{log.action}</span>
                      </td>
                      <td className="px-5 py-4 text-stone-600 text-xs">
                        {log.resource}
                        {log.resourceId && <span className="text-stone-400 ml-1 text-[10px] font-mono">#{log.resourceId.slice(0, 8)}</span>}
                      </td>
                      <td className="px-5 py-4 text-stone-500 text-xs max-w-[300px] truncate">{log.details || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100">
                <p className="text-xs text-stone-400">
                  Page {page} of {totalPages} ({totalCount} total)
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                          p === page ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-stone-400 text-sm">No activity logs found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
