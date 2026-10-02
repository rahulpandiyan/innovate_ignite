import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
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
import { ExportExcelButton } from "@/components/ui/export-excel";
import { format } from "date-fns";
import { Search } from "lucide-react";

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

export default async function UsersPage({ searchParams }: { searchParams?: Promise<{ page?: string; q?: string; role?: string; assigned?: string }> }) {
  const sp = searchParams ? await searchParams : {};
  const q = (sp.q ?? "").trim();
  // "ALL"/"all" are the visible "no filter" options; normalise them away.
  const roleFilter = sp.role && sp.role !== "ALL" ? sp.role : "";
  const assignedFilter = sp.assigned && sp.assigned !== "all" ? sp.assigned : "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const perPage = 12;
  const skip = (page - 1) * perPage;

  // Same filter set drives both the visible page and the total count so the
  // pagination footer never disagrees with the rows on screen.
  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { collegeName: { contains: q, mode: "insensitive" } },
            { college: { code: { contains: q, mode: "insensitive" } } },
            { participant: { participantId: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(roleFilter ? { userRole: { name: roleFilter } } : {}),
    ...(assignedFilter === "yes" ? { coordinators: { some: {} } } : {}),
    ...(assignedFilter === "no" ? { coordinators: { none: {} } } : {}),
  };

  const [totalUsers, users, colleges, events, allCoordinators, allUsersForExport] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
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
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        email: true,
        phone: true,
        collegeName: true,
        userRole: { select: { name: true } },
        role: true,
        college: { select: { code: true, name: true } },
        createdAt: true,
        coordinators: { select: { event: { select: { name: true } } } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / perPage));
  const hasFilter = Boolean(q || roleFilter || assignedFilter);
  // Keep every filter in the URL so search + pagination + export stay in sync.
  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, role: roleFilter, assigned: assignedFilter, page: String(page), ...over };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, k === "page" && v === "1" ? "" : v);
    }
    const s = p.toString();
    return s ? `/admin/users?${s}` : "/admin/users";
  };

  const usersExport = allUsersForExport.map((u) => ({
    Name: u.name,
    Email: u.email,
    Phone: u.phone,
    College: u.collegeName,
    CollegeCode: u.college?.code ?? "",
    Role: u.userRole?.name ?? u.role,
    AssignedEvents: u.coordinators.map((c: any) => c.event.name).join(", "),
    CreatedAt: format(u.createdAt, "yyyy-MM-dd HH:mm"),
  }));

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
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Accounts</CardTitle>
              <CardDescription>
                {hasFilter ? `${totalUsers} matching` : `${totalUsers} total`} · page {page} of{" "}
                {totalPages} · 12 per page
              </CardDescription>
            </div>
            <ExportExcelButton data={usersExport} filename={`users-${format(new Date(), "yyyy-MM-dd")}`} sheetName="Users" label={`Export ${usersExport.length}`} />
          </div>
        </CardHeader>
        <CardContent>
          {/* GET form: filters live in the URL so a search can be shared or
              bookmarked and pagination keeps the same result set. */}
          <form method="GET" className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Search name, email, phone, participant ID or college…"
                  className="pl-9"
                  aria-label="Search accounts"
                />
              </div>
              <Select name="role" defaultValue={roleFilter || "ALL"}>
                <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by role">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select name="assigned" defaultValue={assignedFilter || "all"}>
                <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by assignment">
                  <SelectValue placeholder="Any assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any assignment</SelectItem>
                  <SelectItem value="yes">Assigned to an event</SelectItem>
                  <SelectItem value="no">Not assigned yet</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-9">
                  Search
                </Button>
                {hasFilter && (
<Button asChild size="sm" variant="outline" className="h-9">
                      <a href="/admin/users">Reset</a>
                    </Button>
                )}
              </div>
            </div>
            {hasFilter && (
              <p className="text-xs text-muted-foreground">
                {totalUsers === 0
                  ? "No account matches this search."
                  : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, totalUsers)} of ${totalUsers} matching account${totalUsers === 1 ? "" : "s"}.`}
              </p>
            )}
          </form>

          <div className="flex items-center justify-between border-b py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="w-1/4">User</span>
            <span className="w-1/6">College</span>
            <span className="w-1/6">Role</span>
            <span className="w-1/4">Assigned events</span>
            <span className="w-1/6 text-right">Change role</span>
          </div>
          <div className="divide-y">
            {users.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No accounts match your search.
              </div>
            )}
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
              {totalUsers === 0
                ? "No accounts to show"
                : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, totalUsers)} of ${totalUsers}`}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={qs({ page: String(page - 1) })}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>Previous</Button>
              )}
              {page < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={qs({ page: String(page + 1) })}>Next</Link>
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
