import prisma from "@/lib/db";
import { assignEventUsers, createEvent, updateEventStatus } from "@/app/admin/actions";
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

const STATUS_OPTIONS = ["DRAFT", "OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] as const;
const CATEGORIES = ["DANCE", "MUSIC", "THEATRE", "ART", "LITERARY", "TECHNICAL", "SPORTS"];

export default async function EventsPage() {
  const [events, coordinators, judges] = await Promise.all([
    prisma.event.findMany({
      orderBy: { date: "asc" },
      include: {
        coordinators: { include: { user: { select: { name: true } } } },
        judges: { include: { user: { select: { name: true } } } },
        _count: { select: { registrations: true, teams: true } },
      },
    }),
    prisma.user.findMany({
      where: { userRole: { name: "EVENT_COORDINATOR" } },
      select: { id: true, name: true, email: true },
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
          Create events and assign coordinators & judges per the PRD.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create event</CardTitle>
          <CardDescription>A registration window is opened by Super Admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4"
            action={async (formData) => {
              "use server";
              await createEvent({
                name: String(formData.get("name") ?? ""),
                description: String(formData.get("description") ?? "") || undefined,
                type: (String(formData.get("type") ?? "SOLO") as never) ?? "SOLO",
                category: String(formData.get("category") ?? "DANCE"),
                venue: String(formData.get("venue") ?? ""),
                price: Number(formData.get("price") ?? 0),
                minTeamSize: Number(formData.get("minTeamSize") ?? 1),
                maxTeamSize: Number(formData.get("maxTeamSize") ?? 1),
                date: String(formData.get("date") ?? ""),
                registrationStart: String(formData.get("registrationStart") ?? ""),
                registrationEnd: String(formData.get("registrationEnd") ?? ""),
                status: (String(formData.get("status") ?? "DRAFT") as never) ?? "DRAFT",
                coordinatorId: String(formData.get("coordinatorId") ?? "") || undefined,
                judgeId: String(formData.get("judgeId") ?? "") || undefined,
              });
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Battle of Bands" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="DANCE">
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
              <Input id="venue" name="venue" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Price (INR)</Label>
              <Input id="price" name="price" type="number" min={0} required />
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
              <Input id="date" name="date" type="datetime-local" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="registrationStart">Reg opens</Label>
              <Input id="registrationStart" name="registrationStart" type="datetime-local" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="registrationEnd">Reg closes</Label>
              <Input id="registrationEnd" name="registrationEnd" type="datetime-local" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="coordinatorId">Coordinator</Label>
              <Select name="coordinatorId">
                <SelectTrigger id="coordinatorId">
                  <SelectValue placeholder="Assign coordinator" />
                </SelectTrigger>
                <SelectContent>
                  {coordinators.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <Card key={ev.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{ev.name}</CardTitle>
                <CardDescription>
                  {ev.category} · {ev.type} ·{" "}
                  {ev.date ? new Date(ev.date).toLocaleDateString() : "TBA"} · {ev.venue} · ₹
                  {Number(ev.price)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{ev.status}</Badge>
                <form
                  action={async (formData) => {
                    "use server";
                    await updateEventStatus({
                      eventId: ev.id,
                      status: String(formData.get("status") ?? ev.status),
                    });
                  }}
                >
                  <Select name="status" defaultValue={ev.status}>
                    <SelectTrigger className="h-8 text-xs">
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
                  <button type="submit" className="sr-only">
                    Update
                  </button>
                </form>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{ev._count.registrations} registrations</Badge>
                <Badge variant="secondary">{ev._count.teams} teams</Badge>
                <span className="text-muted-foreground">
                  Coordinator: {ev.coordinators.map((c) => c.user.name).join(", ") || "None"}
                </span>
                <span className="text-muted-foreground">
                  Judge: {ev.judges.map((j) => j.user.name).join(", ") || "None"}
                </span>
              </div>
              <form
                action={async (formData) => {
                  "use server";
                  await assignEventUsers({
                    eventId: ev.id,
                    coordinatorId:
                      String(formData.get("coordinatorId") ?? "") || undefined,
                    judgeId: String(formData.get("judgeId") ?? "") || undefined,
                    unassignCoordinator: formData.get("clearCoordinator") === "on",
                    unassignJudge: formData.get("clearJudge") === "on",
                  });
                }}
                className="flex items-center gap-2"
              >
                <Select name="coordinatorId">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    {coordinators.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select name="judgeId">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Judge" />
                  </SelectTrigger>
                  <SelectContent>
                    {judges.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" variant="outline">
                  Assign
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}