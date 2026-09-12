import eventImage from "@/public/images/pexels-jidev-mohan-356965646-14469571.jpg";
import { StaticImageData } from "next/image";

export interface EventList {
    eventNo?: number;
    category: string;
    image: StaticImageData;
    name: string;
    rules: string[];
    coordinator?: { name: string; mobile: string; };
    coordinators?: { name: string; mobile: string; }[]
}

export const eventsList:EventList[]= [
    {
        eventNo: 1,
        category: "TECHNICAL",
        image: eventImage,
        name: "Techninja",
        rules: ["Faculty coordinator: M G Kousar", "Student coordinators: Sam Goldwin, Rahul", "Team size: 1-4", "Venue: VVIT Campus - Lab Block", "Bring college ID and team details"],
        coordinators: [{ name: "M G Kousar (Faculty)", mobile: "" }, { name: "Sam Goldwin", mobile: "" }, { name: "Rahul", mobile: "" }],
    },
    {
        eventNo: 2,
        category: "GENERAL",
        image: eventImage,
        name: "VV care",
        rules: ["Faculty coordinators: Rajani M, M G Kousar", "Student coordinators: Shrishty, Lalitha", "Team size: 2-5", "Venue: VVIT Campus - Open Ground", "Social service / awareness theme"],
        coordinators: [{ name: "Rajani M (Faculty)", mobile: "" }, { name: "M G Kousar (Faculty)", mobile: "" }, { name: "Shrishty", mobile: "" }, { name: "Lalitha", mobile: "" }],
    },
    {
        eventNo: 3,
        category: "GENERAL",
        image: eventImage,
        name: "Cooking Without Fire",
        rules: ["Faculty coordinator: Rashmi Rani Samantaray", "Student coordinators: Anushka S (+91 81971 97536), Arshiya (+91 90081 50803)", "Team size: 2-3", "Venue: VVIT Campus - Food Court", "No flame / heating allowed. Bring pre-cut ingredients as instructed."],
        coordinators: [{ name: "Rashmi Rani Samantaray (Faculty)", mobile: "" }, { name: "Anushka S", mobile: "+91 81971 97536" }, { name: "Arshiya", mobile: "+91 90081 50803" }],
    },
    {
        eventNo: 4,
        category: "GENERAL",
        image: eventImage,
        name: "Talent mania",
        rules: ["Faculty coordinator: Kavyashree J", "Student coordinators: Shree Kyathi, Harshitha", "Solo event", "Venue: Main Auditorium", "Any talent (singing, mimicry, instrument, etc.) 3-5 mins"],
        coordinators: [{ name: "Kavyashree J (Faculty)", mobile: "" }, { name: "Shree Kyathi", mobile: "" }, { name: "Harshitha", mobile: "" }],
    },
    {
        eventNo: 5,
        category: "FINE_ARTS",
        image: eventImage,
        name: "Collage (Best out of waste)",
        rules: ["Faculty coordinators: Sushma B M, Bharathi J", "Student coordinators: Harish 5th sem A sec (9901709596), Divya C 5th sem A sec (8074142405)", "Team size: 2-4", "Venue: Seminar Hall 1", "Use waste materials only. A2 sheet provided."],
        coordinators: [{ name: "Sushma B M (Faculty)", mobile: "" }, { name: "Bharathi J (Faculty)", mobile: "" }, { name: "Harish", mobile: "9901709596" }, { name: "Divya C", mobile: "8074142405" }],
    },
    {
        eventNo: 6,
        category: "GENERAL",
        image: eventImage,
        name: "ICEBREAKER",
        rules: ["Faculty coordinators: Swetha/Harini", "Student coordinators: Lokhapradeep (9632425042), Harish P (9901709596), Deekshitha A (7892563979)", "Team size: 3-6", "Venue: Open Air Theatre", "Fun team bonding games"],
        coordinators: [{ name: "Swetha/Harini (Faculty)", mobile: "" }, { name: "Lokhapradeep", mobile: "9632425042" }, { name: "Harish P", mobile: "9901709596" }, { name: "Deekshitha A", mobile: "7892563979" }],
    },
    {
        eventNo: 7,
        category: "THEATRE",
        image: eventImage,
        name: "Dumb charades",
        rules: ["Faculty coordinator: Supriya", "Student coordinators: Dhikshitha A (7892563979), Divya C (8792354155)", "Team size: 2-5", "Venue: Seminar Hall 2", "Standard dumb charades rules. No speaking."],
        coordinators: [{ name: "Supriya (Faculty)", mobile: "" }, { name: "Dhikshitha A", mobile: "7892563979" }, { name: "Divya C", mobile: "8792354155" }],
    },
    {
        eventNo: 8,
        category: "TECHNICAL",
        image: eventImage,
        name: "Code Conflux",
        rules: ["Faculty coordinators: V Vanitha, Rashmi Rani", "Student coordinators: Anushka (8197197536), Mohammed Ghouse, Daniel (9380987187)", "Team size: 1-3", "Venue: Central Computing Lab", "Bring laptop. Internet may be restricted."],
        coordinators: [{ name: "V Vanitha (Faculty)", mobile: "" }, { name: "Rashmi Rani (Faculty)", mobile: "" }, { name: "Anushka", mobile: "8197197536" }, { name: "Mohammed Ghouse", mobile: "" }, { name: "Daniel", mobile: "9380987187" }],
    },
    {
        eventNo: 9,
        category: "DANCE",
        image: eventImage,
        name: "Dance Elite",
        rules: ["Faculty coordinator: J Bharathi", "Student coordinators: Krishnaveni H K (9743116619), Lahari M (8884084501), Bhoomika (7975535763)", "Team size: 3-10", "Venue: Main Auditorium", "Any dance form. 5-7 mins. Bring track on pen drive."],
        coordinators: [{ name: "J Bharathi (Faculty)", mobile: "" }, { name: "Krishnaveni H K", mobile: "9743116619" }, { name: "Lahari M", mobile: "8884084501" }, { name: "Bhoomika", mobile: "7975535763" }],
    },
    {
        eventNo: 10,
        category: "GAMING",
        image: eventImage,
        name: "BGMI",
        rules: ["Faculty coordinator: Subhrajit Sengupta", "Student coordinators: Arshad (7795811494), Charan (6362348311)", "Squad size: 2-4", "Venue: E-Sports Arena", "Bring own device + headphones. Emulators not allowed."],
        coordinators: [{ name: "Subhrajit Sengupta (Faculty)", mobile: "" }, { name: "Arshad", mobile: "7795811494" }, { name: "Charan", mobile: "6362348311" }],
    },
];
