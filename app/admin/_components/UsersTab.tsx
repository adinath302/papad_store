"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Shield, Check, X as XIcon } from "lucide-react";
import type { AdminUser, PermissionMap } from "./types";
import { RESOURCE_ACTIONS, RESOURCE_LABELS } from "./types";
import { fetchCsrf } from "@/lib/csrf-client";

type UsersTabProps = {
  admins: AdminUser[];
  isOwner: boolean;
  ownerEmail: string;
  toast: (msg: string, type: "success" | "error") => void;
  onAdminChange: () => void;
};

function toggleResourceAction(perms: PermissionMap, resource: string, action: string): PermissionMap {
  const updated = { ...perms };
  if (!updated[resource]) updated[resource] = {};
  if (updated[resource][action]) {
    const { [action]: _, ...rest } = updated[resource];
    updated[resource] = rest;
    if (Object.keys(updated[resource]).length === 0) delete updated[resource];
  } else {
    updated[resource] = { ...updated[resource], [action]: true };
  }
  return updated;
}

function ActionCheckboxes({ perms, onChange }: {
  perms: PermissionMap;
  onChange: (resource: string, action: string) => void;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(RESOURCE_ACTIONS).map(([resource, actions]) => (
        <div key={resource}>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
            {RESOURCE_LABELS[resource]}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {actions.map((act) => {
              const enabled = perms[resource]?.[act.value] === true;
              return (
                <button key={act.value} type="button" onClick={() => onChange(resource, act.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    enabled ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }`}>
                  {enabled && <Check size={10} strokeWidth={3} />}
                  {act.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UsersTab({ admins, isOwner, ownerEmail, toast, onAdminChange }: UsersTabProps) {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [addAdminPermissions, setAddAdminPermissions] = useState<PermissionMap>({});
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<PermissionMap>({});

  const addAdmin = async () => {
    if (!addAdminEmail.trim()) return;
    const res = await fetchCsrf("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addAdminEmail.trim(), permissions: addAdminPermissions }),
    });
    if (res.ok) {
      toast("Admin added successfully!", "success");
      setShowAddAdmin(false);
      setAddAdminEmail("");
      setAddAdminPermissions({});
      onAdminChange();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to add admin", "error");
    }
  };

  const updateAdminPermissions = async (id: string) => {
    const res = await fetchCsrf(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: editingPerms }),
    });
    if (res.ok) {
      toast("Permissions updated!", "success");
      setEditingAdminId(null);
      setEditingPerms({});
      onAdminChange();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to update", "error");
    }
  };

  const removeAdmin = async (id: string, email: string) => {
    if (!confirm(`Remove admin access for ${email}?`)) return;
    const res = await fetchCsrf(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Admin removed", "success");
      onAdminChange();
    } else {
      toast("Failed to remove admin", "error");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6 md:mb-8">
          <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Admin Users</h1>
          <p className="text-xs md:text-sm text-stone-500 mt-0.5">Manage who has access to the admin panel</p>
        </div>
        <button onClick={() => setShowAddAdmin(!showAddAdmin)}
          className="shrink-0 flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-stone-900 text-white rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold hover:bg-stone-800 transition-all shadow-sm">
          <Plus size={14} strokeWidth={2.5} />
          {showAddAdmin ? "Cancel" : "Add Admin"}
        </button>
      </div>

      {showAddAdmin && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Add New Admin</h2>
          <div className="space-y-4 max-w-md">
            <input type="email" value={addAdminEmail} onChange={(e) => setAddAdminEmail(e.target.value)}
              placeholder="Enter user email"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Granular Permissions</p>
              <ActionCheckboxes perms={addAdminPermissions}
                onChange={(resource, action) => setAddAdminPermissions((prev) => toggleResourceAction(prev, resource, action))} />
            </div>
            <button onClick={addAdmin} disabled={!addAdminEmail.trim()}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Add Admin</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Permissions</th>
                <th className="text-right px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-14 text-stone-400 text-sm">No admin users found</td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isOwnerUser = admin.email === ownerEmail;
                  const isEditing = editingAdminId === admin.id;
                  const permMap: PermissionMap = admin.permissions || {};
                  return (
                    <tr key={admin.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-800">{admin.name || "—"}</span>
                          {isOwnerUser && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Owner</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-stone-600">{admin.email}</td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <ActionCheckboxes perms={editingPerms}
                            onChange={(resource, action) => setEditingPerms((prev) => toggleResourceAction(prev, resource, action))} />
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {isOwnerUser ? (
                              <span className="text-[11px] text-amber-700 font-semibold">All permissions</span>
                            ) : Object.keys(permMap).length > 0 ? (
                              Object.entries(permMap).map(([resource, actions]) => {
                                const actionEntries = Object.entries(actions || {}).filter(([, val]) => val === true);
                                if (actionEntries.length === 0) return null;
                                return (
                                  <div key={resource} className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 min-w-[60px]">
                                      {RESOURCE_LABELS[resource] || resource}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {actionEntries.map(([action]) => (
                                        <span key={action} className="inline-flex items-center px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                                          {action.replace(/_/g, " ")}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-[11px] text-stone-400">No permissions</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isOwnerUser ? (
                          <span className="text-[11px] text-stone-400 italic">—</span>
                        ) : isEditing ? (
                          <>
                            <button onClick={() => updateAdminPermissions(admin.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all mr-1" title="Save">
                              <Check size={15} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => { setEditingAdminId(null); setEditingPerms({}); }}
                              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all" title="Cancel">
                              <XIcon size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingAdminId(admin.id); setEditingPerms(permMap); }}
                              className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all mr-1" title="Edit permissions">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => removeAdmin(admin.id, admin.email)}
                              className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Remove admin">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-stone-100">
          {admins.length === 0 ? (
            <div className="text-center py-14 text-stone-400 text-sm">No admin users found</div>
          ) : (
            admins.map((admin) => {
              const isOwnerUser = admin.email === ownerEmail;
              const isEditing = editingAdminId === admin.id;
              const permMap: PermissionMap = admin.permissions || {};
              return (
                <div key={admin.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-800 text-sm">{admin.name || "—"}</span>
                        {isOwnerUser && <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Owner</span>}
                      </div>
                      <p className="text-xs text-stone-500">{admin.email}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isOwnerUser ? (
                        <span className="text-[11px] text-stone-400 italic">—</span>
                      ) : isEditing ? (
                        <>
                          <button onClick={() => updateAdminPermissions(admin.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Save"><Check size={14} strokeWidth={2.5} /></button>
                          <button onClick={() => { setEditingAdminId(null); setEditingPerms({}); }} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg" title="Cancel"><XIcon size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingAdminId(admin.id); setEditingPerms(permMap); }} className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit permissions"><Pencil size={14} /></button>
                          <button onClick={() => removeAdmin(admin.id, admin.email)} className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Remove admin"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    {isEditing ? (
                      <ActionCheckboxes perms={editingPerms}
                        onChange={(resource, action) => setEditingPerms((prev) => toggleResourceAction(prev, resource, action))} />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {isOwnerUser ? (
                          <span className="text-[11px] text-amber-700 font-semibold">All permissions</span>
                        ) : Object.keys(permMap).length > 0 ? (
                          Object.entries(permMap).map(([resource, actions]) => {
                            const actionEntries = Object.entries(actions || {}).filter(([, val]) => val === true);
                            if (actionEntries.length === 0) return null;
                            return (
                              <span key={resource} className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                                {RESOURCE_LABELS[resource]}: {actionEntries.map(([a]) => a.replace(/_/g, " ")).join(", ")}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[11px] text-stone-400">No permissions</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
