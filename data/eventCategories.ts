export interface EventCategory {
    id: string;
    slug: string;
    eventName: string;
    userId: string;
    maxParticipant: number;
    registeredParticipant: number;
    category: string;
    amount?: number;
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export const interDepartmentEvents: EventCategory[] = [
    {
        slug: slugify("Techninja"),
        eventName: "Techninja",
        category: "TECHNICAL",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("VV care"),
        eventName: "VV care",
        category: "GENERAL",
        maxParticipant: 5,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("Mini Project [Presentation]"),
        eventName: "Mini Project [Presentation]",
        category: "TECHNICAL",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("Code Conflux"),
        eventName: "Code Conflux",
        category: "TECHNICAL",
        maxParticipant: 3,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 150,
    },
    {
        slug: slugify("Symposium (Group Discussion)"),
        eventName: "Symposium (Group Discussion)",
        category: "GENERAL",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("Air Crash"),
        eventName: "Air Crash",
        category: "GENERAL",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("Photography"),
        eventName: "Photography",
        category: "GENERAL",
        maxParticipant: 1,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("Dance Elite"),
        eventName: "Dance Elite",
        category: "DANCE",
        maxParticipant: 10,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 200,
    },
    {
        slug: slugify("BGMI / Freefire"),
        eventName: "BGMI / Freefire",
        category: "GAMING",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 200,
    },
    {
        slug: slugify("VVIT got Latent"),
        eventName: "VVIT got Latent",
        category: "GENERAL",
        maxParticipant: 1,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("Reel Video Making"),
        eventName: "Reel Video Making",
        category: "GENERAL",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("The Royal Walk"),
        eventName: "The Royal Walk",
        category: "GENERAL",
        maxParticipant: 1,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        slug: slugify("Crucial Beats (Singing)"),
        eventName: "Crucial Beats (Singing)",
        category: "THEATRE",
        maxParticipant: 1,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
];

export const eventCategories = interDepartmentEvents;
