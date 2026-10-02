"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Plus, Save, Trash2, X, Loader2, Users } from "lucide-react";

export type CoordinatorContact = {
  id: string;
  name: string;
  phone: string | null;
  isStaff: boolean;
};

type Props = {
  eventId: string;
  contacts: CoordinatorContact[];
  title?: string;
  description?: string;
};

export function CoordinatorContactsEditor({
  eventId,
  contacts: initialContacts,
  title = "Public coordinator contacts",
  description = "Names and numbers shown on the event page. Edit freely — changes appear immediately.",
}: Props) {
  const [contacts, setContacts] = React.useState<CoordinatorContact[]>(initialContacts);
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({ name: "", phone: "", isStaff: false });
  const [editDraft, setEditDraft] = React.useState({ name: "", phone: "", isStaff: false });
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const staff = contacts.filter((c) => c.isStaff);
  const students = contacts.filter((c) => !c.isStaff);

  async function call(method: "POST" | "PATCH" | "DELETE", body?: unknown, id?: string) {
    const url = `/api/events/${eventId}/coordinator-contacts${id ? `?id=${encodeURIComponent(id)}` : ""}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error?.message ?? "Request failed");
    return data?.data;
  }

  async function handleAdd() {
    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy(true);
    try {
      const { contact } = await call("POST", {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        isStaff: draft.isStaff,
      });
      setContacts((prev) => [...prev, contact]);
      setDraft({ name: "", phone: "", isStaff: false });
      setAdding(false);
      toast.success("Contact added");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add contact");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(c: CoordinatorContact) {
    setEditingId(c.id);
    setEditDraft({ name: c.name, phone: c.phone ?? "", isStaff: c.isStaff });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    if (!editDraft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy(true);
    try {
      const { contact } = await call(
        "PATCH",
        {
          id: editingId,
          name: editDraft.name.trim(),
          phone: editDraft.phone.trim(),
          isStaff: editDraft.isStaff,
        },
        editingId
      );
      setContacts((prev) => prev.map((c) => (c.id === editingId ? contact : c)));
      setEditingId(null);
      toast.success("Contact updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update contact");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(c: CoordinatorContact) {
    setBusy(true);
    try {
      await call("DELETE", undefined, c.id);
      setContacts((prev) => prev.filter((x) => x.id !== c.id));
      toast.success("Contact removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove contact");
    } finally {
      setBusy(false);
    }
  }

  function renderRow(c: CoordinatorContact) {
    const isEditing = editingId === c.id;
    return (
      <li
        key={c.id}
        className="flex flex-wrap items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-white px-3 py-2"
      >
        {isEditing ? (
          <>
            <Input
              value={editDraft.name}
              onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
              placeholder="Name"
              className="h-8 min-w-[9rem] flex-1 text-sm"
            />
            <Input
              value={editDraft.phone}
              onChange={(e) => setEditDraft({ ...editDraft, phone: e.target.value })}
              placeholder="Phone (optional)"
              className="h-8 min-w-[9rem] flex-1 text-sm"
            />
            <label className="flex items-center gap-1.5 text-xs text-[#0F172A]/70">
              <Switch
                checked={editDraft.isStaff}
                onCheckedChange={(v) => setEditDraft({ ...editDraft, isStaff: v })}
              />
              Staff
            </label>
            <Button size="sm" onClick={handleSaveEdit} disabled={busy} className="h-8">
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingId(null)}
              disabled={busy}
              className="h-8"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 text-sm font-medium">{c.name}</span>
            {c.phone ? (
              <a
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="font-mono text-xs text-[#2362EC] hover:underline"
              >
                {c.phone}
              </a>
            ) : (
              <span className="font-mono text-xs text-muted-foreground">no number</span>
            )}
            <Badge variant={c.isStaff ? "default" : "secondary"} className="text-[10px]">
              {c.isStaff ? "Staff" : "Student"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEdit(c)}
              disabled={busy}
              className="h-7 text-[11px]"
            >
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(c)}
              disabled={busy}
              className="h-7 text-[11px] text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </li>
    );
  }

  function renderGroup(title: string, people: CoordinatorContact[]) {
    if (people.length === 0) return null;
    return (
      <div>
        <p className="mb-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">
          {title}
        </p>
        <ul className="space-y-1.5">{people.map(renderRow)}</ul>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2362EC]/20 bg-[#EFF6FF]/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#2362EC]">{title}</p>
          <p className="text-xs text-[#0F172A]/60">{description}</p>
        </div>
        {!adding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            disabled={busy}
            className="h-8"
          >
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button>
        )}
      </div>

      {adding && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#2362EC]/20 bg-white p-2">
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Name"
            className="h-8 min-w-[9rem] flex-1 text-sm"
          />
          <Input
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            placeholder="Phone (optional)"
            className="h-8 min-w-[9rem] flex-1 text-sm"
          />
          <label className="flex items-center gap-1.5 text-xs text-[#0F172A]/70">
            <Switch
              checked={draft.isStaff}
              onCheckedChange={(v) => setDraft({ ...draft, isStaff: v })}
            />
            Staff
          </label>
          <Button size="sm" onClick={handleAdd} disabled={busy} className="h-8">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAdding(false);
              setDraft({ name: "", phone: "", isStaff: false });
            }}
            disabled={busy}
            className="h-8"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="mt-3 space-y-3">
        {renderGroup("Staff coordinators", staff)}
        {renderGroup("Student coordinators", students)}
        {contacts.length === 0 && !adding && (
          <p className="text-xs text-muted-foreground">
            No contacts yet — add the faculty and student coordinators for this event.
          </p>
        )}
      </div>
    </div>
  );
}
