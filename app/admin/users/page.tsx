import prisma from "@/lib/db";
import { createAdminUser, setUserRole, assignUserToEvents } from "@/app/admin/actions";
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
import Link from "next/link";

const ROLE_OPTIONS = [
  "SUPER_ADMIN",
  "COLLEGE_ADMIN",
  "TEAM_LEADER",
  "PARTICIPANT",
  "EVENT_COORDINATOR",
  "STUDENT_COORDINATOR",
  "JUDGE",
  "ATTENDANCE_STAFF",
  "FINANCE_ADMIN",
  "CERTIFICATE_ADMIN",
];

export default async function UsersPage({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const sp = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const perPage = 12;
  const skip = (page - 1) * perPage;

  const [totalUsers, users, colleges, events] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
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
        coordinators: { select: { eventId: true, event: { select: { name: true } } } },
      },
    }),
    prisma.college.findMany({ select: { code: true, name: true }, orderBy: { name: "asc" } }),
    prisma.event.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / perPage));

  // coordinator candidates for assignment dropdown
  const coordinators = users.filter((u) => ["EVENT_COORDINATOR", "STUDENT_COORDINATOR"].includes(u.userRole?.name ?? ""));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <p className="text-sm text-muted-foreground">
          Platform accounts and their RBAC role. Role changes are audit logged. Assign student/faculty coordinators to events here or in Events.
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
          <CardTitle className="text-base">Assign coordinator to events</CardTitle>
          <CardDescription>Pick a faculty or student coordinator and the events they should manage. You can assign more than one event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              const userId = String(formData.get("userId") ?? "");
              const eventIds = formData.getAll("eventIds").map(String).filter(Boolean);
              if (!userId) return;
              await assignUserToEvents({ userId, eventIds });
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Coordinator</Label>
                <Select name="userId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const list = coordinators.length ? coordinators : users.filter((u) => u.userRole?.name?.includes("COORDINATOR"));
                      if (list.length === 0) return <SelectItem value="none" disabled>No coordinators yet — create one above</SelectItem>;
                      return list.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} — {u.userRole?.name ?? u.role} ({u.email})
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Events (select multiple)</Label>
                <div className="grid max-h-40 overflow-auto rounded-md border p-2 gap-1">
                  {events.map((e) => (
                    <label key={e.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted px-1.5 py-1 rounded">
                      <input type="checkbox" name="eventIds" value={e.id} className="h-3.5 w-3.5" />
                      <span className="truncate">{e.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">Checked events will be assigned; unchecked will be removed for that user.</p>
              </div>
            </div>
            <Button type="submit" size="sm" variant="outline">Save assignment</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accounts</CardTitle>
          <CardDescription>
            {totalUsers} total · page {page} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between border-b py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="w-1/4">User</span>
            <span className="w-1/6">College</span>
            <span className="w-1/6">Role</span>
            <span className="w-1/4">Assigned events</span>
            <span className="w-1/6 text-right">Change role</span>
          </div>
          <div className="divide-y">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 gap-2">
                <div className="w-1/4 min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="w-1/6 text-sm text-muted-foreground truncate">
                  {u.college?.code ?? "—"}
                </div>
                <div className="w-1/6">
                  <Badge variant={u.userRole?.name === "STUDENT_COORDINATOR" ? "secondary" : u.userRole?.name === "EVENT_COORDINATOR" ? "default" : "secondary"} className="text-[10px]">{u.userRole?.name ?? u.role}</Badge>
                </div>
                <div className="w-1/4 min-w-0">
                  {u.coordinators.length ? (
                    <div className="flex flex-wrap gap-1">
                      {u.coordinators.map((c: any) => (
                        <Badge key={c.eventId} variant="outline" className="text-[10px] font-normal">{c.event.name}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
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
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalUsers)} of {totalUsers}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/users?page=${page - 1}`}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>Previous</Button>
              )}
              {page < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/users?page=${page + 1}`}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>Next</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
