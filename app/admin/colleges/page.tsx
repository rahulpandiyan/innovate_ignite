import prisma from "@/lib/db";
import { createCollege } from "@/app/admin/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function CollegesPage() {
  const colleges = await prisma.college.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          users: true,
          participants: true,
          teams: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Colleges</h1>
        <p className="text-sm text-muted-foreground">Participating colleges on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a college</CardTitle>
          <CardDescription>Requests to join are approved by Super Admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            action={async (formData) => {
              "use server";
              await createCollege({
                name: String(formData.get("name") ?? ""),
                code: String(formData.get("code") ?? "").toUpperCase(),
                region: String(formData.get("region") ?? "") || undefined,
                address: String(formData.get("address") ?? "") || undefined,
              });
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="name">College name</Label>
              <Input id="name" name="name" required placeholder="B.M.S. COLLEGE..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" required placeholder="BMS-021" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="region">Region</Label>
              <Input id="region" name="region" placeholder="Bengaluru" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="Bengaluru, Karnataka" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Create college</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {colleges.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-base">{c.name}</CardTitle>
              <CardDescription>
                {c.code} · {c.region ?? "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 text-sm text-muted-foreground">
              <span>{c._count.users} users</span>
              <span>{c._count.participants} participants</span>
              <span>{c._count.teams} teams</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}