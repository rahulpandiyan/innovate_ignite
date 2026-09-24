"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export function InviteMember({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Add failed");
      toast.success(data.message ?? "Member added to team");
      setName("");
      setEmail("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAdd} className="flex w-full flex-col gap-2 sm:flex-row">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Member name"
        className="flex-1"
      />
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="member@college.edu"
        type="email"
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={loading || !email.trim() || !name.trim()}>
        <UserPlus className="mr-1 h-4 w-4" />
        {loading ? "Adding…" : "Add to team"}
      </Button>
    </form>
  );
}