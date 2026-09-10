"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MailPlus } from "lucide-react";

export function InviteMember({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Invite failed");
      toast.success("Invite sent");
      setEmail("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleInvite} className="flex w-full gap-2">
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="member@college.edu"
        type="email"
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={loading || !email.trim()}>
        <MailPlus className="mr-1 h-4 w-4" />
        {loading ? "Sending…" : "Invite"}
      </Button>
    </form>
  );
}