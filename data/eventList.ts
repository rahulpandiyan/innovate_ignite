import eventImage from "@/public/images/pexels-jidev-mohan-356965646-14469571.jpg";
import { StaticImageData } from "next/image";

export interface EventList {
    slug?: string;
    category: string;
    image: StaticImageData;
    name: string;
    rules: string[];
    coordinator?: { name: string; mobile: string; };
    coordinators?: { name: string; mobile: string; }[]
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export const eventsList:EventList[]= [
    {
        slug: slugify("Techninja"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Techninja",
        rules: ["Faculty coordinator: M G Kousar", "Student coordinators: Sam Goldwin, Rahul", "Team size: 1-4", "Bring college ID and team details"],
        coordinators: [{ name: "M G Kousar (Faculty)", mobile: "" }, { name: "Sam Goldwin", mobile: "" }, { name: "Rahul", mobile: "" }],
    },
    {
        slug: slugify("VV care"),
        category: "GENERAL",
        image: eventImage,
        name: "VV care",
        rules: ["Faculty coordinators: Rajani M, M G Kousar", "Student coordinators: Shrishty, Lalitha", "Team size: 2-5", "Social service / awareness theme"],
        coordinators: [{ name: "Rajani M (Faculty)", mobile: "" }, { name: "M G Kousar (Faculty)", mobile: "" }, { name: "Shrishty", mobile: "" }, { name: "Lalitha", mobile: "" }],
    },
    {
        slug: slugify("Mini Project [Presentation]"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Mini Project [Presentation]",
        rules: ["Faculty coordinator: Rashmi Rani Samantaray", "Team size: 1-4", "Present your mini project to judges"],
        coordinators: [{ name: "Rashmi Rani Samantaray (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("Code Conflux"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Code Conflux",
        rules: ["Faculty coordinators: V Vanitha, Rashmi Rani", "Student coordinators: Anushka, Mohammed Ghouse, Daniel", "Team size: 1-3", "Bring laptop. Internet may be restricted."],
        coordinators: [{ name: "V Vanitha (Faculty)", mobile: "" }, { name: "Rashmi Rani (Faculty)", mobile: "" }, { name: "Anushka", mobile: "" }, { name: "Mohammed Ghouse", mobile: "" }, { name: "Daniel", mobile: "" }],
    },
    {
        slug: slugify("Symposium (Group Discussion)"),
        category: "GENERAL",
        image: eventImage,
        name: "Symposium (Group Discussion)",
        rules: ["Faculty coordinator: Selva Agnes", "Team size: 1-4", "Group discussion on given topics"],
        coordinators: [{ name: "Selva Agnes (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("Air Crash"),
        category: "GENERAL",
        image: eventImage,
        name: "Air Crash",
        rules: ["Faculty coordinators: Swetha, Harini", "Team size: 2-4", "Problem-solving challenge"],
        coordinators: [{ name: "Swetha (Faculty)", mobile: "" }, { name: "Harini (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("Photography"),
        category: "GENERAL",
        image: eventImage,
        name: "Photography",
        rules: ["Faculty coordinator: Supriya", "Solo event", "Bring your own camera/phone"],
        coordinators: [{ name: "Supriya (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("Dance Elite"),
        category: "DANCE",
        image: eventImage,
        name: "Dance Elite",
        rules: ["Faculty coordinator: J Bharathi", "Student coordinators: Krishnaveni H K, Lahari M, Bhoomika", "Team size: 3-10", "Any dance form. 5-7 mins. Bring track on pen drive."],
        coordinators: [{ name: "J Bharathi (Faculty)", mobile: "" }, { name: "Krishnaveni H K", mobile: "" }, { name: "Lahari M", mobile: "" }, { name: "Bhoomika", mobile: "" }],
    },
    {
        slug: slugify("BGMI / Freefire"),
        category: "GAMING",
        image: eventImage,
        name: "BGMI / Freefire",
        rules: ["Faculty coordinator: Subhrajit Sengupta", "Squad size: 2-4", "Bring own device + headphones. Emulators not allowed."],
        coordinators: [{ name: "Subhrajit Sengupta (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("VVIT got Latent"),
        category: "GENERAL",
        image: eventImage,
        name: "VVIT got Latent",
        rules: ["Faculty coordinator: Kavyashree J", "Solo event", "Talent show — any talent (singing, mimicry, instrument, etc.) 3-5 mins"],
        coordinators: [{ name: "Kavyashree J (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("Reel Video Making"),
        category: "GENERAL",
        image: eventImage,
        name: "Reel Video Making",
        rules: ["Faculty coordinators: Sushma B M, Bharathi J", "Team size: 1-4", "Create a creative reel on given theme"],
        coordinators: [{ name: "Sushma B M (Faculty)", mobile: "" }, { name: "Bharathi J (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("The Royal Walk"),
        category: "GENERAL",
        image: eventImage,
        name: "The Royal Walk",
        rules: ["Faculty coordinator: MahaLakshmi", "Solo event", "Fashion/walk event"],
        coordinators: [{ name: "MahaLakshmi (Faculty)", mobile: "" }],
    },
    {
        slug: slugify("Crucial Beats (Singing)"),
        category: "THEATRE",
        image: eventImage,
        name: "Crucial Beats (Singing)",
        rules: ["Faculty coordinator: Selva Agnes", "Solo event", "Singing competition — 3-5 mins"],
        coordinators: [{ name: "Selva Agnes (Faculty)", mobile: "" }],
    },
];
