import prisma from "@/lib/db";
import { createAdminUser, setUserRole } from "@/app/admin/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ROLE_OPTIONS = [
  "SUPER_ADMIN",
  "COLLEGE_ADMIN",
  "TEAM_LEADER",
  "PARTICIPANT",
  "EVENT_COORDINATOR",
  "JUDGE",
  "ATTENDANCE_STAFF",
  "FINANCE_ADMIN",
  "CERTIFICATE_ADMIN",
];

export default async function UsersPage() {
  const [users, colleges] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        collegeName: true,
        role: true,
        userRole: { select: { name: true } },
        college: { select: { code: true } },
        createdAt: true,
      },
    }),
    prisma.college.findMany({ select: { code: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <p className="text-sm text-muted-foreground">
          Platform accounts and their RBAC role. Role changes are audit logged.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create user</CardTitle>
          <CardDescription>Adds an account to the new RBAC user store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-3"
            action={async (formData) => {
              "use server";
              await createAdminUser({
                name: String(formData.get("name") ?? ""),
                email: String(formData.get("email") ?? ""),
                phone: String(formData.get("phone") ?? ""),
                collegeName: String(formData.get("collegeName") ?? ""),
                password: String(formData.get("password") ?? ""),
                roleName: String(formData.get("roleName") ?? "PARTICIPANT"),
                collegeCode: String(formData.get("collegeCode") ?? "") || undefined,
              });
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="collegeName">College name</Label>
              <Input id="collegeName" name="collegeName" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="collegeCode">College code</Label>
              <Select name="collegeCode">
                <SelectTrigger id="collegeCode">
                  <SelectValue placeholder="Select college (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="roleName">Role</Label>
              <Select name="roleName" defaultValue="PARTICIPANT">
                <SelectTrigger id="roleName">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit">Create user</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between border-b py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="w-1/3">User</span>
            <span className="w-1/6">College</span>
            <span className="w-1/3">Role</span>
            <span className="w-1/6 text-right">Change role</span>
          </div>
          <div className="divide-y">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div className="w-1/3 min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="w-1/6 text-sm text-muted-foreground">
                  {u.college?.code ?? "—"}
                </div>
                <div className="w-1/3">
                  <Badge variant="secondary">{u.userRole?.name ?? u.role}</Badge>
                </div>
                <div className="w-1/6 text-right">
                  <form
                    action={async (formData) => {
                      "use server";
                      await setUserRole({
                        userId: u.id,
                        roleName: String(formData.get("role") ?? ""),
                      });
                    }}
                  >
                    <Select name="role" defaultValue={u.userRole?.name ?? "PARTICIPANT"}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button type="submit" className="sr-only">
                      Update
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}