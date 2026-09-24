import prisma from "@/lib/db";
import { assignEventUsers, createEvent, updateEvent, updateEventStatus } from "@/app/admin/actions";
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
import { EventEditForm } from "@/components/admin/event-edit-form";

const STATUS_OPTIONS = ["DRAFT", "OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] as const;
const CATEGORIES = ["TECHNICAL", "GENERAL", "DANCE", "GAMING", "THEATRE", "FINE_ARTS"];

export default async function EventsPage() {
  const [events, coordinators, judges] = await Promise.all([
    prisma.event.findMany({
      orderBy: { date: "asc" },
      include: {
        coordinators: { include: { user: { select: { id: true, name: true, userRole: { select: { name: true } } } } } },
        judges: { include: { user: { select: { name: true } } } },
        _count: { select: { registrations: true, teams: true } },
      },
    }),
    prisma.user.findMany({
      where: { userRole: { name: { in: ["EVENT_COORDINATOR", "STUDENT_COORDINATOR"] } } },
      select: { id: true, name: true, email: true, userRole: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { userRole: { name: "JUDGE" } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-sm text-muted-foreground">
          Manage events, coordinators and judges.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create event</CardTitle>
          <CardDescription>Add a new event to the fest.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4"
              action={async (formData) => {
              "use server";
              const coordinatorIds = formData.getAll("coordinatorIds").map(String).filter(Boolean);
              // fallback for old single field
              const single = String(formData.get("coordinatorId") ?? "");
              if (single) coordinatorIds.push(single);
              await createEvent({
                name: String(formData.get("name") ?? ""),
                description: String(formData.get("description") ?? "") || undefined,
                type: (String(formData.get("type") ?? "SOLO") as never) ?? "SOLO",
                category: String(formData.get("category") ?? "GENERAL"),
                venue: String(formData.get("venue") ?? ""),
                price: Number(formData.get("price") ?? 0),
                priceMode: (String(formData.get("priceMode") ?? "PER_TEAM") as never) ?? "PER_TEAM",
                groupPrice: Number(formData.get("groupPrice") ?? 0) || undefined,
                minTeamSize: Number(formData.get("minTeamSize") ?? 1),
                maxTeamSize: Number(formData.get("maxTeamSize") ?? 1),
                date: String(formData.get("date") ?? ""),
                registrationStart: String(formData.get("registrationStart") ?? ""),
                registrationEnd: String(formData.get("registrationEnd") ?? ""),
                status: (String(formData.get("status") ?? "DRAFT") as never) ?? "DRAFT",
                coordinatorIds: coordinatorIds.length ? coordinatorIds : undefined,
                judgeId: String(formData.get("judgeId") ?? "") || undefined,
              });
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Techninja" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="GENERAL">
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="SOLO">
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOLO">SOLO</SelectItem>
                  <SelectItem value="TEAM">TEAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="DRAFT">
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" name="venue" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Price (INR)</Label>
              <Input id="price" name="price" type="number" min={0} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="priceMode">Pricing mode</Label>
              <Select name="priceMode" defaultValue="PER_TEAM">
                <SelectTrigger id="priceMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_TEAM">Per team (flat fee)</SelectItem>
                  <SelectItem value="PER_PARTICIPANT">Per participant</SelectItem>
                  <SelectItem value="SOLO_OR_GROUP">Solo / Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="groupPrice">Group price (for Solo/Group)</Label>
              <Input id="groupPrice" name="groupPrice" type="number" min={0} placeholder="e.g. 150" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minTeamSize">Min team size</Label>
              <Input id="minTeamSize" name="minTeamSize" type="number" min={1} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxTeamSize">Max team size</Label>
              <Input id="maxTeamSize" name="maxTeamSize" type="number" min={1} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="datetime-local" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="registrationStart">Reg opens</Label>
              <Input id="registrationStart" name="registrationStart" type="datetime-local" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="registrationEnd">Reg closes</Label>
              <Input id="registrationEnd" name="registrationEnd" type="datetime-local" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Faculty Coordinators</Label>
              <div className="grid gap-1 rounded-md border p-2 max-h-32 overflow-auto">
                {coordinators.filter((c: any) => c.userRole?.name === "EVENT_COORDINATOR").length === 0 ? (
                  <span className="text-xs text-muted-foreground">No faculty coordinators — create users with EVENT_COORDINATOR role first</span>
                ) : (
                  coordinators.filter((c: any) => c.userRole?.name === "EVENT_COORDINATOR").map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted px-1.5 py-1 rounded">
                      <input type="checkbox" name="coordinatorIds" value={c.id} className="h-3.5 w-3.5" />
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="text-muted-foreground truncate text-[11px]">{c.email}</span>
                      <Badge variant="default" className="ml-auto text-[10px] h-4">Faculty</Badge>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Student Coordinators</Label>
              <div className="grid gap-1 rounded-md border p-2 max-h-32 overflow-auto">
                {coordinators.filter((c: any) => c.userRole?.name === "STUDENT_COORDINATOR").length === 0 ? (
                  <span className="text-xs text-muted-foreground">No student coordinators — create users with STUDENT_COORDINATOR role first</span>
                ) : (
                  coordinators.filter((c: any) => c.userRole?.name === "STUDENT_COORDINATOR").map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted px-1.5 py-1 rounded">
                      <input type="checkbox" name="coordinatorIds" value={c.id} className="h-3.5 w-3.5" />
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="text-muted-foreground truncate text-[11px]">{c.email}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] h-4">Student</Badge>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="judgeId">Judge</Label>
              <Select name="judgeId">
                <SelectTrigger id="judgeId">
                  <SelectValue placeholder="Assign judge" />
                </SelectTrigger>
                <SelectContent>
                  {judges.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-4">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
            <div className="md:col-span-4">
              <Button type="submit">Create event</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {events.map((ev) => (
          <EventEditForm
            key={ev.id}
            event={{
              id: ev.id,
              name: ev.name,
              description: ev.description ?? "",
              type: ev.type,
              category: ev.category,
              venue: ev.venue ?? "",
              price: Number(ev.price),
              minTeamSize: ev.minTeamSize ?? 1,
              maxTeamSize: ev.maxTeamSize ?? 1,
              status: ev.status,
              time: ev.time ?? "",
            }}
            coordinators={coordinators.map((c: any) => ({ id: c.id, name: c.name, email: c.email, role: c.userRole?.name }))}
            judges={judges}
            assignedCoordinators={ev.coordinators.map((c) => c.user.name)}
            assignedCoordinatorsDetailed={ev.coordinators.map((c: any) => ({ id: c.user.id, name: c.user.name, role: c.user.userRole?.name }))}
            assignedJudges={ev.judges.map((j) => j.user.name)}
            registrationCount={ev._count.registrations}
            teamCount={ev._count.teams}
            onAssign={async (input) => {
              "use server";
              await assignEventUsers(input);
            }}
          />
        ))}
      </div>
    </div>
  );
}
