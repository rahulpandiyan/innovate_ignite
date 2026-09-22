export interface ScheduleItem {
    name: string;
    slug: string;
    category: string;
    faculty: string;
    venue: string;
}

export interface ScheduleSlot {
    time: string;
    items: ScheduleItem[];
}

export interface ScheduleDay {
    day: string;
    date: string;
    short: string;
    slots: ScheduleSlot[];
    runsAlongside?: ScheduleItem & { time: string };
}

export const festSchedule: ScheduleDay[] = [
    {
        day: "DAY 1",
        date: "8 October 2026",
        short: "Oct 8",
        slots: [
            {
                time: "09:30 AM – 01:00 PM",
                items: [
                    { name: "Code conflux", slug: "code-conflux", category: "TECHNICAL", faculty: "V Vanitha, Rashmi Rani", venue: "Ground Floor Labs" },
                    { name: "Group Discussion", slug: "group-discussion", category: "GENERAL", faculty: "Selva Agnes", venue: "Placement Cell" },
                    { name: "VV CARE", slug: "vv-care", category: "GENERAL", faculty: "Rajani M, M G Kousar", venue: "Seminar Hall – 1" },
                ],
            },
            {
                time: "01:30 PM – 04:30 PM",
                items: [
                    { name: "Mini Project Expo", slug: "mini-project-expo", category: "TECHNICAL", faculty: "Rashmi Rani Samantaray", venue: "2nd Floor Labs & Classes" },
                    { name: "TechNinja - Quiz", slug: "techninja-quiz", category: "TECHNICAL", faculty: "M G Kousar", venue: "Ground Floor Labs" },
                ],
            },
        ],
    },
    {
        day: "DAY 2",
        date: "9 October 2026",
        short: "Oct 9",
        slots: [
            {
                time: "09:30 AM – 11:30 AM",
                items: [
                    { name: "AIR CRASH", slug: "air-crash", category: "GENERAL", faculty: "Swetha, Harini", venue: "Quadrangle" },
                ],
            },
            {
                time: "09:30 AM – 01:30 PM",
                items: [
                    { name: "Reel Video Making", slug: "reel-video-making", category: "GENERAL", faculty: "Sushma BM", venue: "Seminar Hall – 2" },
                ],
            },
            {
                time: "09:30 AM – 04:00 PM",
                items: [
                    { name: "BGMI & FreeFire", slug: "bgmi-freefire", category: "GAMING", faculty: "Subhrajit Sengupta", venue: "Classrooms" },
                ],
            },
            {
                time: "09:30 AM – 01:00 PM",
                items: [
                    { name: "VVIT GOT LATENT", slug: "vvit-got-latent", category: "GENERAL", faculty: "Kavyashree J", venue: "Seminar Hall – 1" },
                ],
            },
            {
                time: "12:00 PM – 01:00 PM",
                items: [
                    { name: "The Royal Walk", slug: "the-royal-walk", category: "GENERAL", faculty: "Bharathi, Harini", venue: "Quadrangle" },
                ],
            },
            {
                time: "02:00 PM – 04:30 PM",
                items: [
                    { name: "DANCE.exe", slug: "danceexe", category: "DANCE", faculty: "J Bharathi", venue: "Quadrangle" },
                    { name: "Crucial Beats", slug: "crucial-beats", category: "THEATRE", faculty: "Selva Agnes", venue: "Seminar Hall – 1" },
                ],
            },
        ],
        runsAlongside: {
            name: "PIXELS - Photography",
            slug: "pixels-photography",
            category: "GENERAL",
            faculty: "Supriya",
            venue: "Quadrangle",
            time: "Open – 09:30 AM",
        },
    },
];
