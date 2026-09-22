import eventImage from "@/public/images/pexels-jidev-mohan-356965646-14469571.jpg";
import { StaticImageData } from "next/image";

export interface EventList {
    slug?: string;
    category: string;
    image: StaticImageData;
    name: string;
    rules: string[];
    coordinators?: { name: string; email?: string; phone?: string; faculty?: boolean }[];
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
            "Each team must consist of two members. Solo participation is not allowed.",
            "Bring college ID and team details.",
        ],
        coordinators: [
            { name: "M G Kousar", faculty: true },
            { name: "Sam Goldwin", phone: "+919739431299" },
            { name: "Rahul", phone: "+918792137157" },
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
            { name: "Srishty Singh", email: "srishty2005singh@gmail.com", phone: "+919741079214" },
            { name: "Lalitha Sreenivasan", email: "lalithasreenivasan93@gmail.com", phone: "+918105398761" },
        ],
    },
    {
        slug: slugify("BGMI"),
        category: "GAMING",
        image: eventImage,
        name: "BGMI",
        rules: [
            "Intercollegiate squad-based BGMI esports tournament.",
            "Conducted in online and offline modes.",
            "Each team consists of 4 players.",
            "Registration fee: ₹200 per team.",
            "One player must be designated as the In-Game Leader (IGL) and act as the primary contact with the organizers.",
        ],
        coordinators: [
            { name: "Subhrajit", email: "subhrajit.cs@vvit.ac.in", faculty: true },
            { name: "Kumari Manjunatha", email: "kummarimanjunatha295@gmail.com", faculty: true },
            { name: "Al Arshad", email: "alarshad007@gmail.com", phone: "+917795811484" },
            { name: "Charan", email: "charancharan63623@gmail.com", phone: "+916362348311" },
        ],
    },
    {
        slug: slugify("Free Fire"),
        category: "GAMING",
        image: eventImage,
        name: "Free Fire",
        rules: [
            "Intercollegiate squad-based Free Fire esports tournament.",
            "Conducted in online and offline modes.",
            "Each team consists of 4 players.",
            "Registration fee: ₹200 per team.",
            "One player must be designated as the In-Game Leader (IGL) and act as the primary contact with the organizers.",
        ],
        coordinators: [
            { name: "Subhrajit", email: "subhrajit.cs@vvit.ac.in", faculty: true },
            { name: "Kumari Manjunatha", email: "kummarimanjunatha295@gmail.com", faculty: true },
            { name: "Al Arshad", email: "alarshad007@gmail.com", phone: "+917795811484" },
            { name: "Charan", email: "charancharan63623@gmail.com", phone: "+916362348311" },
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
            { name: "Shree Khyathi R", email: "shreeguggilam16@gmail.com", phone: "+917975199059" },
            { name: "M. Harshitha", email: "mharshitha775@gmail.com", phone: "+917975026732" },
        ],
    },
    {
        slug: slugify("Reel Video Making"),
        category: "GENERAL",
        image: eventImage,
        name: "Reel Video Making",
        rules: [
            "Vijaya Vittala Institute of Technology is organizing a Reel Video Making Program to encourage creativity, teamwork, spontaneous thinking, and effective communication among undergraduate students.",
            "Eligibility: participation is open exclusively to undergraduate students.",
            "Eligibility: each team must consist of 2–3 members.",
            "Registration: each participating team must pay a registration fee of ₹50.",
            "Registration: teams will be considered officially registered only after completing the registration process and paying the prescribed fee.",
            "Theme allocation: a specific theme will be assigned to each registered team after enrollment.",
            "Theme allocation: themes will be allotted individually to participating teams.",
            "Theme allocation: participants must create their reel on the spot without any prior preparation, ideas, or pre-planned content related to the assigned theme.",
            "Reel content: the reel must be educational and entertaining in nature.",
            "Reel content: the maximum permitted reel duration is 90 seconds.",
            "Reel content: content must be appropriate, respectful, and suitable for an academic environment.",
            "Reel content: vulgar, obscene, offensive, adult, or 18+ content is strictly prohibited.",
            "Reel content: any reel containing such content will not be entertained and will be removed or disqualified from the program.",
            "Preparation and submission: teams must create, record, and edit their reels within the allotted activity period.",
            "Preparation and submission: the completed reel must be submitted to the coordinators between 9:30 AM to 3:00 PM.",
            "Preparation and submission: after completing the recording and editing process, each team must share its final reel video with the student coordinators through email at harishhari781823@gmail.com or divyachavala05@gmail.com.",
            "Preparation and submission: teams are advised to ensure that the submitted video is the final edited version before sending it.",
            "Preparation and submission: reels submitted after the specified deadline may not be accepted.",
            "Presentation venue: the completed reels will be presented at Seminar Hall–2.",
            "Evaluation: submitted reels will be reviewed and evaluated on event guidelines, creativity, educational and entertainment value, originality, teamwork, and adherence to the assigned theme.",
            "Evaluation: after the finalization of the selected teams and their winning reels, prize distribution will be conducted on the spot at the venue.",
            "Evaluation: the decision of the event coordinators regarding selection and prize distribution will be final.",
            "General instructions: all participants must maintain discipline and decorum throughout the event.",
            "General instructions: teams are responsible for ensuring that their content follows the assigned theme and all event guidelines.",
            "General instructions: participants must not use vulgar, obscene, adult, or inappropriate content in any form.",
            "General instructions: participants are expected to demonstrate creativity, originality, teamwork, and responsible content creation.",
            "General instructions: the decision of the event coordinators regarding content acceptance, participation, and disqualification will be final.",
            "Use of AI tools: the use of Artificial Intelligence (AI) tools for creating, generating, editing, modifying, or enhancing the reel is strictly prohibited.",
            "Use of AI tools: all videos must be created and edited entirely by the participating team members.",
            "Use of AI tools: teams must submit original content produced through their own efforts and creativity.",
            "Event coordinators — faculty: Sushma BM – 9902077624, Bharathi J – 9606605509. Student: Harish P – 9901709596, Divya C – 8792354155.",
            "All participants are requested to follow the above rules and regulations strictly to ensure the smooth and successful conduct of the Reel Video Making Program.",
        ],
        coordinators: [
            { name: "Divya", phone: "8792354155" },
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
            { name: "Dhikshitha", email: "dhikshitha307@gmail.com", phone: "+917892563979" },
            { name: "Harish", email: "harishhari781823@gmail.com", phone: "+919901709596" },
            { name: "Lokicodgameplay", email: "lokicodgameplay@gmail.com", phone: "+919632425042" },
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
            "Both solo and group participation are allowed.",
            "Solo Dance: 1 participant. Registration fee: ₹50.",
            "Solo Dance: any dance form. Maximum performance time: 5 minutes. Bring the track on a pen drive.",
            "Group Dance: 2–10 members. Registration fee: ₹150 per group.",
            "Group Dance: any dance form. 5–7 minutes. Bring the track on a pen drive.",
        ],
        coordinators: [
            { name: "J Bharathi", faculty: true },
            { name: "Krishnaveni H K", phone: "+919743116619" },
            { name: "Lahari M", phone: "+918884084501" },
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
            { name: "Anushka", email: "anushkasuryanshiafs@gmail.com", phone: "+918197197536" },
            { name: "Rajaditya Raj", email: "rajadityaraj005@gmail.com", phone: "+919341606324" },
            { name: "Sneha", email: "snehabr2005@gmail.com", phone: "+919341435924" },
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
            { name: "Anushka", phone: "+918197197536" },
            { name: "Mohammed Ghouse", phone: "+917892786089" },
            { name: "Daniel", phone: "+919380987187" },
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
            { name: "Thannavee", email: "thannavee7204@gmail.com", phone: "+917204967325" },
            { name: "Lavanya", email: "0506lavanya000@gmail.com", phone: "+917204967325" },
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
            { name: "Thannavee", email: "thannavee7204@gmail.com", phone: "+917204967325" },
            { name: "Lavanya", email: "0506lavanya000@gmail.com", phone: "+917204967325" },
        ],
    },
];