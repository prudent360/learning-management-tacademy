"use client";

import { useState, useTransition, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PERMISSION_SECTIONS, permissionKey } from "@/lib/permissions";
import { updateRolePermissions, listUsersForRole, type AdminRoleRow } from "@/app/actions/roles";
import {
  ShieldIcon,
  LockIcon,
  TeamIcon,
  PencilIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { Avatar } from "@/components/Avatar";

const ROLE_ACCENT: Record<string, string> = {
  super_admin: "border-l-red-500 bg-red-50/40",
  admin: "border-l-orange bg-orange/5",
  manager: "border-l-blue-600 bg-blue-50/40",
  staff: "border-l-amber-500 bg-amber-50/40",
  instructor: "border-l-brand-green bg-green-50/40",
};

export function RolesPermissionsView({ initialRoles }: { initialRoles: AdminRoleRow[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? "");
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0];

  const [editing, setEditing] = useState(false);
  const [draftKeys, setDraftKeys] = useState<Set<string>>(new Set());
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setEditing(false);
    setError(null);
    setUsersLoading(true);
    listUsersForRole(selected.key)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (!selected) {
    return (
      <div className="space-y-6">
        <PageHeader title="Roles & Permissions" subtitle="Manage user roles and their permissions." />
        <p className="text-sm text-muted">No roles found.</p>
      </div>
    );
  }

  const startEditing = () => {
    setDraftKeys(new Set(selected.permissionKeys));
    setEditing(true);
    setError(null);
  };

  const toggleKey = (key: string) => {
    setDraftKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSectionAll = (sectionKeys: string[], allGranted: boolean) => {
    setDraftKeys((prev) => {
      const next = new Set(prev);
      sectionKeys.forEach((k) => (allGranted ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const handleSave = () => {
    setError(null);
    startSaving(async () => {
      const result = await updateRolePermissions(selected.id, Array.from(draftKeys));
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, permissionKeys: Array.from(draftKeys) } : r,
        ),
      );
      setEditing(false);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" subtitle="Manage user roles and their permissions." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Roles list */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <ShieldIcon className="h-5 w-5 text-navy" />
            <h2 className="text-sm font-bold text-slate-800">Roles ({roles.length})</h2>
          </div>
          <div className="divide-y divide-line">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`block w-full border-l-4 px-5 py-3.5 text-left transition-colors ${
                  r.id === selected.id
                    ? (ROLE_ACCENT[r.key] ?? "border-l-navy bg-navy-50/40")
                    : "border-l-transparent hover:bg-surface-muted"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{r.description}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
                      <LockIcon className="h-3 w-3" />
                      {r.isSystem ? "All permissions" : `${r.permissionKeys.length} permissions`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted">
                    <p className="font-bold text-slate-700">{r.userCount}</p>
                    <p>users</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Role detail */}
        <div className="space-y-6 rounded-2xl border border-line bg-surface p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-muted">{selected.name}</p>
              <h2 className="text-lg font-bold text-slate-800">{selected.description}</h2>
            </div>
            {!selected.isSystem &&
              (editing ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditing}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-orange px-4 py-2 text-sm font-bold text-white hover:bg-orange/90"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Permissions
                </button>
              ))}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <TeamIcon className="h-4 w-4 text-navy" />
              Users with this role ({users.length})
            </h3>
            {usersLoading ? (
              <p className="text-xs text-muted">Loading…</p>
            ) : users.length === 0 ? (
              <p className="text-xs text-muted">No users have this role yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <span
                    key={u.id}
                    className="flex items-center gap-2 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <Avatar name={u.name} accent="navy" size={20} />
                    {u.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <LockIcon className="h-4 w-4 text-navy" />
              Permissions
            </h3>
            <div className="space-y-2">
              {PERMISSION_SECTIONS.map((section) => {
                const sectionKeys = section.actions.map((a) => permissionKey(section.key, a));
                const activeKeys = editing ? draftKeys : new Set(selected.permissionKeys);
                const grantedCount = sectionKeys.filter((k) => activeKeys.has(k)).length;
                const allGranted = grantedCount === sectionKeys.length;

                return (
                  <details key={section.key} className="group rounded-xl bg-surface-muted">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">{section.label}</span>
                      <span className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            grantedCount === 0 ? "text-muted" : "text-navy"
                          }`}
                        >
                          {grantedCount}/{sectionKeys.length}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <div className="flex flex-wrap gap-3 px-4 pb-3">
                      {editing && (
                        <button
                          type="button"
                          onClick={() => toggleSectionAll(sectionKeys, allGranted)}
                          className="text-[11px] font-semibold text-orange hover:underline"
                        >
                          {allGranted ? "Clear all" : "Grant all"}
                        </button>
                      )}
                      {section.actions.map((action) => {
                        const key = permissionKey(section.key, action);
                        const granted = activeKeys.has(key);
                        return (
                          <label
                            key={key}
                            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium capitalize ${
                              granted
                                ? "border-navy-50 bg-navy-50 text-navy"
                                : "border-line bg-surface text-muted"
                            } ${editing ? "cursor-pointer" : ""}`}
                          >
                            {editing ? (
                              <input
                                type="checkbox"
                                checked={granted}
                                onChange={() => toggleKey(key)}
                                className="h-3.5 w-3.5 accent-navy"
                              />
                            ) : (
                              granted && <CheckIcon className="h-3 w-3" />
                            )}
                            {action}
                          </label>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
