"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type MeUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  collegeName: string | null;
  collegeIdNumber: string | null;
  photoUrl: string | null;
  role: string;
};

function isIncomplete(u: MeUser): boolean {
  const needsPhone =
    !u.phone || u.phone.startsWith("+google-") || u.phone.length < 10;
  const needsCollege = !u.collegeName || u.collegeName.trim().length === 0;
  return needsPhone || needsCollege;
}

function homeFor(u: MeUser): string {
  return u.role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
}

export default function GoogleSigninSuccessPage() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "incomplete" | "done">("loading");
  const [user, setUser] = useState<MeUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [collegeIdNumber, setCollegeIdNumber] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/me");
      if (!data.success || !data.data?.user) {
        router.replace("/auth/signin");
        return;
      }
      const me = data.data.user as MeUser;
      if (!isIncomplete(me)) {
        router.replace(homeFor(me));
        return;
      }
      setUser(me);
      setPhone(me.phone && !me.phone.startsWith("+google-") ? me.phone : "");
      setCollege(me.collegeName ?? "");
      setCollegeIdNumber(me.collegeIdNumber ?? "");
      setState("incomplete");
    } catch {
      router.replace("/auth/signin");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const { data } = await axios.patch("/api/profile", {
        phone,
        collegeName: college,
        collegeIdNumber,
      });
      if (data.success) {
        toast.success("Profile saved!", {
          description: "Welcome to VVIT Innovate Ignite.",
        });
        router.replace(homeFor({ ...user, phone, collegeName: college }));
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error?.message as string)
        : "Failed to save profile.";
      toast.error(msg ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (state !== "incomplete" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">Almost there!</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Hi {user.name}, we still need a couple of details to complete your
          VVIT Innovate Ignite profile.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number (10 digits)</Label>
            <Input
              id="phone"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College / institute name</Label>
            <Input
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. VVIT, Guntur"
            />
          </div>
          <div className="space-y-2">
              <Label htmlFor="collegeIdNumber">USN (University Seat Number)</Label>
            <Input
              id="collegeIdNumber"
              value={collegeIdNumber}
              onChange={(e) => setCollegeIdNumber(e.target.value)}
              placeholder="Enter your college ID number"
            />
          </div>
          <Button
            onClick={save}
            disabled={saving || phone.length < 10 || college.trim().length === 0}
            className="w-full"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
