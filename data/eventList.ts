import eventImage from "@/public/images/pexels-jidev-mohan-356965646-14469571.jpg";
import { StaticImageData } from "next/image";

export interface EventList {
    slug?: string;
    category: string;
    image: StaticImageData;
    name: string;
    rules: string[];
    coordinators?: { name: string; email?: string; faculty?: boolean }[];
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export const eventsList: EventList[] = [
    {
        slug: slugify("Techninja"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Techninja",
        rules: [
            "Faculty coordinator: M G Kousar",
            "Student coordinators: Sam Goldwin, Rahul",
            "Team size: 1–4",
            "Bring college ID and team details.",
        ],
        coordinators: [
            { name: "M G Kousar", faculty: true },
            { name: "Sam Goldwin" },
            { name: "Rahul" },
        ],
    },
    {
        slug: slugify("VV CARE – Social Spotlight"),
        category: "GENERAL",
        image: eventImage,
        name: "VV CARE – Social Spotlight",
        rules: [
            "Set a clear objective for the video content.",
            "Record and interview vendors in advance.",
            "Present the video during the competition and analyze the vendors' issues and provide solutions.",
            "Maximum presentation time: 6 minutes.",
            "Team size: 2–3 members.",
            "The video must be recorded in advance with proper clarity.",
            "Minimum 6 teams are required; otherwise, the event may be cancelled.",
        ],
        coordinators: [
            { name: "Kousar", email: "kousar.cs@vvit.ac.in", faculty: true },
            { name: "Rajani", email: "rajanim.cs@vvit.ac.in", faculty: true },
            { name: "Srishty Singh", email: "srishty2005singh@gmail.com" },
            { name: "Lalitha Sreenivasan", email: "lalithasreenivasan93@gmail.com" },
        ],
    },
    {
        slug: slugify("BGMI & Free Fire"),
        category: "GAMING",
        image: eventImage,
        name: "BGMI & Free Fire",
        rules: [
            "Intercollegiate squad-based esports tournament.",
            "Games: BGMI and Free Fire.",
            "Conducted in online and offline modes.",
            "Each team consists of 4 players.",
            "One player must be designated as the In-Game Leader (IGL) and act as the primary contact with the organizers.",
        ],
        coordinators: [
            { name: "Subhrajit", email: "subhrajit.cs@vvit.ac.in", faculty: true },
            { name: "Kumari Manjunatha", email: "kummarimanjunatha295@gmail.com", faculty: true },
            { name: "Al Arshad", email: "alarshad007@gmail.com" },
            { name: "Charan", email: "charancharan63623@gmail.com" },
        ],
    },
    {
        slug: slugify("VVIT Got Latent"),
        category: "GENERAL",
        image: eventImage,
        name: "VVIT Got Latent",
        rules: [
            "Open talent competition including singing, dance, comedy, mimicry, magic, poetry, acting, beatboxing, instrumental music, storytelling, etc.",
            "Solo participation only.",
            "Maximum performance time: 150 seconds (2 minutes 30 seconds). The panel may grant an additional 60 seconds at its discretion.",
            "Participants must answer the creative/funny questions provided in the registration form.",
            "The panel may ask questions based on their responses.",
            "Languages allowed: English, Hindi, Kannada, or a combination.",
            "Performances must be live; fully pre-recorded performances are not allowed.",
            "Props require prior coordinator approval.",
            "Offensive, vulgar, sexually explicit, abusive, discriminatory, or inappropriate content is prohibited.",
            "Judging will consider talent/skill, creativity, originality, stage presence, humour/wit, entertainment value, panel interaction, and overall performance.",
            "The top three performers will receive 1st, 2nd, and 3rd place.",
            "Judges' decision is final.",
        ],
        coordinators: [
            { name: "Kavyashree", email: "kavyashreej.cs@vvit.ac.in", faculty: true },
            { name: "Shree Guggilam", email: "shreeguggilam16@gmail.com" },
            { name: "M. Harshitha", email: "mharshitha775@gmail.com" },
        ],
    },
    {
        slug: slugify("Reel Video Making"),
        category: "GENERAL",
        image: eventImage,
        name: "Reel Video Making",
        rules: [
            "Faculty coordinators: Sushma B M, Bharathi J",
            "Team size: 1–4",
            "Create a creative reel on the given theme.",
        ],
        coordinators: [
            { name: "Sushma B M", faculty: true },
            { name: "Bharathi J", faculty: true },
        ],
    },
    {
        slug: slugify("The Royal Walk"),
        category: "GENERAL",
        image: eventImage,
        name: "The Royal Walk",
        rules: [
            "Faculty coordinator: MahaLakshmi",
            "Solo event",
            "Fashion/walk event.",
        ],
        coordinators: [
            { name: "MahaLakshmi", faculty: true },
        ],
    },
    {
        slug: slugify("Air Crash"),
        category: "GENERAL",
        image: eventImage,
        name: "Air Crash",
        rules: [
            "Open to regularly enrolled undergraduate students from VVIT and other colleges/institutions.",
            "A valid college ID is mandatory.",
            "Participants must prepare their chosen persona before the event. No random on-the-spot persona selection.",
            "The persona must be a real person from history or the contemporary era. Fictional characters and mythological entities are not allowed.",
            "Personas must be registered in advance; duplicate personas are not allowed. If multiple participants select the same persona, the earlier registration gets priority.",
            "Official language: English.",
            "Criticism of a persona's decisions, policies, and philosophy is allowed. Personal insults and unparliamentary language are prohibited and may result in disqualification.",
            "Subtle costumes, badges, and symbolic handheld props are permitted.",
            "Reading directly from phones or prepared papers on stage is not allowed.",
        ],
        coordinators: [
            { name: "Harini", email: "harinis.cs@vvit.ac.in", faculty: true },
            { name: "Swetha", email: "swethap.cs@vvit.ac.in", faculty: true },
            { name: "Dhikshitha", email: "dhikshitha307@gmail.com" },
            { name: "Harish", email: "harishhari781823@gmail.com" },
            { name: "Lokicodgameplay", email: "lokicodgameplay@gmail.com" },
        ],
    },
    {
        slug: slugify("Photography"),
        category: "GENERAL",
        image: eventImage,
        name: "Photography",
        rules: [
            "Faculty coordinator: Supriya",
            "Solo event",
            "Bring your own camera/phone.",
        ],
        coordinators: [
            { name: "Supriya", faculty: true },
        ],
    },
    {
        slug: slugify("Dance Elite"),
        category: "DANCE",
        image: eventImage,
        name: "Dance Elite",
        rules: [
            "Faculty coordinator: J Bharathi",
            "Student coordinators: Krishnaveni H K, Lahari M, Bhoomika",
            "Team size: 3–10",
            "Any dance form. 5–7 minutes. Bring the track on a pen drive.",
        ],
        coordinators: [
            { name: "J Bharathi", faculty: true },
            { name: "Krishnaveni H K" },
            { name: "Lahari M" },
            { name: "Bhoomika" },
        ],
    },
    {
        slug: slugify("Mini Project Presentation"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Mini Project Presentation",
        rules: [
            "Team size: 3–4 members.",
            "Open to engineering students from CS, EC, AI/ML, and allied branches.",
            "Hardware, software, and hybrid projects are allowed.",
            "Projects must be original; plagiarism or copying will result in disqualification.",
            "Teams must present and demonstrate their project within the allotted time.",
            "All team members should understand the project and be prepared to answer questions.",
            "Evaluation will consider innovation, technical implementation, functionality, practical application, presentation, and team knowledge.",
            "Judges' decision is final.",
            "Misconduct, plagiarism, false information, or violation of event rules may result in disqualification.",
        ],
        coordinators: [
            { name: "Rashmi", email: "rashmirs.cs@vvit.ac.in", faculty: true },
            { name: "Vanitha", email: "vanithav.cs@vvit.ac.in", faculty: true },
            { name: "Anushka", email: "anushkasuryanshiafs@gmail.com" },
            { name: "Rajaditya Raj", email: "rajadityaraj005@gmail.com" },
            { name: "Sneha", email: "snehabr2005@gmail.com" },
        ],
    },
    {
        slug: slugify("Code Conflux"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Code Conflux",
        rules: [
            "Faculty coordinators: V Vanitha, Rashmi Rani",
            "Student coordinators: Anushka, Mohammed Ghouse, Daniel",
            "Team size: 1–3",
            "Bring laptop. Internet may be restricted.",
        ],
        coordinators: [
            { name: "V Vanitha", faculty: true },
            { name: "Rashmi Rani", faculty: true },
            { name: "Anushka" },
            { name: "Mohammed Ghouse" },
            { name: "Daniel" },
        ],
    },
    {
        slug: slugify("Crucial Beats"),
        category: "THEATRE",
        image: eventImage,
        name: "Crucial Beats",
        rules: [
            "Solo and group singing categories are available.",
            "One song per participant/team.",
            "Maximum performance duration: 4 minutes.",
            "Any language and genre are permitted.",
            "Live instruments and instrumental/karaoke backing tracks are allowed.",
            "Lip-syncing and pre-recorded lead vocals are prohibited.",
            "Group performances may include harmonies, improvisation, beatboxing, and creative arrangements.",
            "Offensive, discriminatory, hateful, or explicit songs are prohibited.",
            "Judging will consider vocal quality, pitch, rhythm, expression, stage presence, creativity, and overall performance.",
            "Judges' decision is final.",
        ],
        coordinators: [
            { name: "Agnes Stephen", email: "agnesstephen2010@gmail.com", faculty: true },
            { name: "Thannavee", email: "thannavee7204@gmail.com" },
            { name: "Lavanya", email: "0506lavanya000@gmail.com" },
        ],
    },
    {
        slug: slugify("Group Discussion"),
        category: "GENERAL",
        image: eventImage,
        name: "Group Discussion",
        rules: [
            "The topic will be announced at the venue.",
            "Teams must choose to speak FOR or AGAINST the topic.",
            "Team size: 2–3 members.",
            "Teams receive 5 minutes of preparation time after the topic is announced.",
            "Every team member must actively participate.",
            "Respectful communication is mandatory.",
            "Interruptions, personal attacks, and offensive language are prohibited.",
            "Arguments must remain relevant and should be supported by logical reasoning, facts, examples, or relevant viewpoints.",
        ],
        coordinators: [
            { name: "Agnes Stephen", email: "agnesstephen2010@gmail.com", faculty: true },
            { name: "Thannavee", email: "thannavee7204@gmail.com" },
            { name: "Lavanya", email: "0506lavanya000@gmail.com" },
        ],
    },
];