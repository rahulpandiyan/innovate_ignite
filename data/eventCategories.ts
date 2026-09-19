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
        slug: slugify("Techninja"),
        eventName: "Techninja",
        category: "TECHNICAL",
        priceMode: "PER_TEAM",
        price: 100,
        minTeamSize: 1,
        maxTeamSize: 4,
    },
    {
        slug: slugify("VV CARE – Social Spotlight"),
        eventName: "VV CARE – Social Spotlight",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 2,
        maxTeamSize: 3,
    },
    {
        slug: slugify("Mini Project Presentation"),
        eventName: "Mini Project Presentation",
        category: "TECHNICAL",
        priceMode: "PER_TEAM",
        price: 200,
        minTeamSize: 3,
        maxTeamSize: 4,
    },
    {
        slug: slugify("Code Conflux"),
        eventName: "Code Conflux",
        category: "TECHNICAL",
        priceMode: "PER_TEAM",
        price: 150,
        minTeamSize: 1,
        maxTeamSize: 3,
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
        slug: slugify("Air Crash"),
        eventName: "Air Crash",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        slug: slugify("Photography"),
        eventName: "Photography",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 100,
        minTeamSize: 1,
        maxTeamSize: 1,
    },
    {
        slug: slugify("Dance Elite"),
        eventName: "Dance Elite",
        category: "DANCE",
        priceMode: "PER_TEAM",
        price: 200,
        minTeamSize: 3,
        maxTeamSize: 10,
    },
    {
        slug: slugify("BGMI & Free Fire"),
        eventName: "BGMI & Free Fire",
        category: "GAMING",
        priceMode: "PER_PARTICIPANT",
        price: 50,
        minTeamSize: 4,
        maxTeamSize: 4,
    },
    {
        slug: slugify("VVIT Got Latent"),
        eventName: "VVIT Got Latent",
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
        price: 100,
        minTeamSize: 1,
        maxTeamSize: 4,
    },
    {
        slug: slugify("The Royal Walk"),
        eventName: "The Royal Walk",
        category: "GENERAL",
        priceMode: "PER_PARTICIPANT",
        price: 100,
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