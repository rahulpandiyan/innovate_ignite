import { PricingMode } from "@/lib/pricing";

export interface EventCategory {
    slug: string;
    eventName: string;
    category: string;
    priceMode: PricingMode;
    price: number;
    groupPrice?: number;
    minTeamSize: number;
    maxTeamSize: number;
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
        slug: slugify("TechNinja - Quiz"),
        eventName: "TechNinja - Quiz",
        category: "TECHNICAL",
        priceMode: "PER_TEAM",
        price: 50,
        minTeamSize: 2,
        maxTeamSize: 2,
    },
    {
        slug: slugify("VV CARE"),
        eventName: "VV CARE",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 2,
        maxTeamSize: 3,
    },
    {
        slug: slugify("Mini Project Expo"),
        eventName: "Mini Project Expo",
        category: "TECHNICAL",
        priceMode: "PER_TEAM",
        price: 200,
        minTeamSize: 3,
        maxTeamSize: 4,
    },
    {
        slug: slugify("Code conflux"),
        eventName: "Code conflux",
        category: "TECHNICAL",
        priceMode: "PER_TEAM",
        price: 200,
        minTeamSize: 2,
        maxTeamSize: 2,
    },
    {
        slug: slugify("Group Discussion"),
        eventName: "Group Discussion",
        category: "GENERAL",
        priceMode: "PER_TEAM",
        price: 100,
        minTeamSize: 2,
        maxTeamSize: 3,
    },
    {
        slug: slugify("AIR CRASH"),
        eventName: "AIR CRASH",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        slug: slugify("PIXELS - Photography"),
        eventName: "PIXELS - Photography",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        slug: slugify("DANCE.exe"),
        eventName: "DANCE.exe",
        category: "DANCE",
        priceMode: "SOLO_OR_GROUP",
        price: 50,
        groupPrice: 150,
        minTeamSize: 1,
        maxTeamSize: 12,
    },
    {
        slug: slugify("BGMI & FreeFire"),
        eventName: "BGMI & FreeFire",
        category: "GAMING",
        priceMode: "PER_TEAM",
        price: 200,
        minTeamSize: 4,
        maxTeamSize: 4,
    },
    {
        slug: slugify("VVIT GOT LATENT"),
        eventName: "VVIT GOT LATENT",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        slug: slugify("Reel Video Making"),
        eventName: "Reel Video Making",
        category: "GENERAL",
        priceMode: "PER_TEAM",
        price: 50,
        minTeamSize: 2,
        maxTeamSize: 3,
    },
    {
        slug: slugify("The Royal Walk"),
        eventName: "The Royal Walk",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        slug: slugify("Crucial Beats"),
        eventName: "Crucial Beats",
        category: "THEATRE",
        priceMode: "SOLO_OR_GROUP",
        price: 100,
        groupPrice: 150,
        minTeamSize: 1,
        maxTeamSize: 2,
    },
];

export const eventCategories = interDepartmentEvents;