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
import { AssignCoordinatorForm } from "@/components/admin/assign-coordinator-form";

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

  const [totalUsers, users, colleges, events, allCoordinators] = await Promise.all([
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
    prisma.user.findMany({
      where: { userRole: { name: { in: ["EVENT_COORDINATOR", "STUDENT_COORDINATOR"] } } },
      select: { id: true, name: true, email: true, userRole: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / perPage));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <p className="text-sm text-muted-foreground">
          Create accounts, change roles, and assign coordinators to events. All changes are audited.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create user</CardTitle>
          <CardDescription>Pick Faculty (EVENT_COORDINATOR) or Student (STUDENT_COORDINATOR) here, then assign below.</CardDescription>
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
          <CardTitle className="text-base">Assign coordinator to event</CardTitle>
          <CardDescription>Select one coordinator and one event, then click Assign. Repeat to add more than 2. Shows all faculty & student coordinators.</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignCoordinatorForm
            coordinators={allCoordinators.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.userRole?.name ?? undefined }))}
            events={events}
            onAssign={async (input) => {
              "use server";
              await assignUserToEvents(input);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accounts</CardTitle>
          <CardDescription>
            {totalUsers} total · page {page} of {totalPages} · 12 per page
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
                <div className="w-1/6">
                  <form
                    action={async (formData) => {
                      "use server";
                      await setUserRole({
                        userId: u.id,
                        roleName: String(formData.get("role") ?? ""),
                      });
                    }}
                    className="flex flex-col gap-1"
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
                    <Button type="submit" size="sm" variant="outline" className="h-7 text-[11px] w-full">Save</Button>
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
