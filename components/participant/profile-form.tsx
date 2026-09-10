"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export type ProfileFormData = {
  name: string;
  phone: string;
  collegeName: string;
  collegeIdNumber: string;
  aadhaarNumber: string;
  photoUrl: string;
};

export function ProfileForm({ initial }: { initial: ProfileFormData }) {
  const router = useRouter();
  const [form, setForm] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);

  function set<K extends keyof ProfileFormData>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, string> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v !== initial[k as keyof ProfileFormData]) body[k] = v;
      }
      if (Object.keys(body).length === 0) {
        toast.info("No changes to save");
        return;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Failed to update profile");
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile details</CardTitle>
        <CardDescription>Keep your contact and college details up to date.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pf-name">Full name</Label>
              <Input id="pf-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-phone">Phone (10 digits)</Label>
              <Input
                id="pf-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="9886000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-college">College name</Label>
              <Input
                id="pf-college"
                value={form.collegeName}
                onChange={(e) => set("collegeName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-id">College ID number</Label>
              <Input
                id="pf-id"
                value={form.collegeIdNumber}
                onChange={(e) => set("collegeIdNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-aadhaar">Aadhaar (12 digits)</Label>
              <Input
                id="pf-aadhaar"
                value={form.aadhaarNumber}
                onChange={(e) => set("aadhaarNumber", e.target.value)}
                placeholder="For eligibility verification"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-photo">Profile photo URL</Label>
              <Input
                id="pf-photo"
                value={form.photoUrl}
                onChange={(e) => set("photoUrl", e.target.value)}
                placeholder="https://…/photo.jpg"
                type="url"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}