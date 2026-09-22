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
        slug: slugify("TechNinja - Quiz"),
        category: "TECHNICAL",
        image: eventImage,
        name: "TechNinja - Quiz",
        rules: [
            "The quiz consists of three rounds: Preliminary Round, Second Round, and Final Round.",
            "The total duration of the quiz is 1.5–2 hours. Preliminary Round: 25 minutes. Second Round: 25 minutes. Final Round: 25 minutes.",
            "Each question will have four options, and participants must select only one correct answer.",
            "Each team must consist of two members. Solo participation is not allowed.",
            "Each team should bring one smartphone to participate in the quiz.",
            "Usage of AI tools or any search engines is strictly prohibited. Any team found using them will be immediately disqualified.",
            "Only the top 10 teams based on scores will qualify for the Second Round.",
            "Only the top 5 teams from the Second Round will qualify for the Final Round.",
            "Participants must maintain proper decorum during the event. Any team found cheating or causing disruptions will be disqualified.",
            "The Judge's decision will be final and binding in all matters related to the competition.",
            "Teams must report to the venue at least 15 minutes before the event begins. Latecomers may be disqualified.",
        ],
        coordinators: [
            { name: "M G Kousar", faculty: true },
            { name: "Sam Goldwin", phone: "+919739431299" },
            { name: "Rahul", phone: "+918792137157" },
        ],
    },
    {
        slug: slugify("VV CARE"),
        category: "GENERAL",
        image: eventImage,
        name: "VV CARE",
        rules: [
            "Set an objective for the video content.",
            "Capture a video with vendors and interview them, well in advance.",
            "Display the same video on the competition day and analyze the issues of vendors and give solution to the vendors' problems.",
            "Time limit for the competition is 6 minutes.",
            "NOTE: the Social Spotlight video must be recorded prior in advance with proper clarity.",
            "Team size: 2–3 members.",
            "Fee: ₹50 per head.",
            "If the number of teams is less than 6, the event will be cancelled.",
        ],
        coordinators: [
            { name: "Kousar", email: "kousar.cs@vvit.ac.in", faculty: true },
            { name: "Rajani", email: "rajanim.cs@vvit.ac.in", faculty: true },
            { name: "Srishty Singh", email: "srishty2005singh@gmail.com", phone: "+919741079214" },
            { name: "Lalitha Sreenivasan", email: "lalithasreenivasan93@gmail.com", phone: "+918105398761" },
        ],
    },
    {
        slug: slugify("BGMI & FreeFire"),
        category: "GAMING",
        image: eventImage,
        name: "BGMI & FreeFire",
        rules: [
            "Offline, campus-only squad competition for BGMI and Free Fire.",
            "Date: Friday, October 9, 2026.",
            "Prize pool: up to ₹5,000.",
            "Teams must consist of 4 student players.",
            "Players can only represent one team.",
            "Registration must be completed via the official link with accurate information.",
            "Players must use their own registered accounts, compatible devices, and internet connections.",
            "Individual technical issues will not pause the game unless a major tournament-wide issue occurs.",
            "The use of cheats, hacks, bug exploits, teaming with opponents, or fielding unregistered players will result in immediate disqualification.",
            "The In-Game Leader (IGL) acts as the primary point of contact with the organizers.",
            "All final decisions regarding disputes, scoring ties, and rule modifications rest entirely with the organizers and coordinators.",
        ],
        coordinators: [
            { name: "Subhrajit", email: "subhrajit.cs@vvit.ac.in", faculty: true },
            { name: "Kumari Manjunatha", email: "kummarimanjunatha295@gmail.com", faculty: true },
            { name: "Al Arshad", email: "alarshad007@gmail.com", phone: "+917795811484" },
            { name: "Charan", email: "charancharan63623@gmail.com", phone: "+916362348311" },
        ],
    },
    {
        slug: slugify("VVIT GOT LATENT"),
        category: "GENERAL",
        image: eventImage,
        name: "VVIT GOT LATENT",
        rules: [
            "Think you have a talent that deserves the spotlight? Whether you sing, dance, act, create, perform, entertain, or have a talent that's uniquely your own, VVIT GOT LATENT is your stage to show what you can do.",
            "Bring your talent, your personality, and your spontaneity and get ready for an unforgettable showdown!",
            "Open talent: participants can showcase any talent, including singing, dance, comedy, mimicry, magic, poetry, acting, beatboxing, instrumental music, storytelling, and more.",
            "Solo participation: VVIT GOT LATENT is a solo competition. Each participant will perform individually.",
            "Performance time: maximum 150 seconds (2 minutes 30 seconds).",
            "Special extension: if the organizers/panel feel that a performance is exceptionally engaging and worth continuing, they may grant an additional 60 seconds at their discretion. Any extension is entirely subject to the organizers' approval.",
            "Funny G-Form: participants will be required to answer a set of funny, unexpected, quirky, and creative questions in the registration form.",
            "On-stage questions: the panel may ask participants questions based on their responses in the Funny G-Form during the event.",
            "Languages: English, Hindi, Kannada, or a combination of these languages.",
            "Live performance: the talent must be performed live on stage. Fully pre-recorded performances are not allowed.",
            "Props: props may be used, subject to approval by the event coordinators.",
            "Content: all performances, form responses, and on-stage interactions must remain appropriate for a college event. Vulgar, sexually explicit, abusive, discriminatory, offensive, or inappropriate content is strictly prohibited.",
            "Judging: participants will be evaluated based on Talent/Skill, Creativity, Originality, Stage Presence, Humour/Wit, Entertainment Value, Panel Interaction, and Overall Performance.",
            "Winners: the Top 3 performers with the highest scores will be declared 1st, 2nd, and 3rd place, respectively.",
            "Final decision: the decision of the judges regarding the scores and final results will be final and binding.",
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
            "Eligibility & Registration: open only to undergraduate (UG) teams of 2–3 members. Registration fee: ₹50 per team.",
            "Theme & Content: teams will be assigned a specific theme on-the-spot with no prior preparation allowed. Final reel must be educational, entertaining, and respectful (max 90 seconds). Vulgar or 18+ content is strictly prohibited.",
            "Creation & AI ban: reels must be created, recorded, and edited entirely by team members during the event. The use of any Artificial Intelligence (AI) tools is strictly banned.",
            "Submission deadline: final videos must be emailed to harishhari781823@gmail.com or divyachavala05@gmail.com between 9:30 AM and 3:00 PM.",
            "Judging & Venue: completed reels will be showcased in Seminar Hall–2. Evaluated for creativity and teamwork, followed by on-the-spot prize distribution.",
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
            "Character & Costume: participants must portray an Indian historical, mythological, royal, or legendary character using appropriate traditional attire.",
            "Presentation & Time: each participant gets 2–3 minutes to walk, pose, and present their character. Background music should be submitted in advance.",
            "Props & Safety: decorative props such as crowns, shields, and toy swords are permitted. Sharp, dangerous, or harmful props are strictly prohibited.",
            "Registration & Eligibility: registration fee: ₹50 per participant. The chosen character must be submitted in advance. A minimum of 6 participants is required for the event to be conducted; otherwise, the event may be cancelled.",
            "Conduct & Important Notes: participants must report 30 minutes before the event and maintain respectful conduct. Vulgar, offensive, discriminatory, or inappropriate performances may lead to disqualification. Organisers' decision will be final.",
        ],
        coordinators: [
            { name: "MahaLakshmi", faculty: true },
        ],
    },
    {
        slug: slugify("AIR CRASH"),
        category: "GENERAL",
        image: eventImage,
        name: "AIR CRASH",
        rules: [
            "Eligibility: open to all regularly enrolled Undergraduate (UG) students from our campus, as well as Undergraduate (UG) students from all outside colleges and institutions. A valid college ID card is mandatory.",
            "Home preparation: students must get prepared of their chosen personas from their home itself before attending the event. No on-the-spot random chits will be given.",
            "Authentic real personas only: every participant must choose a real person from world history or the contemporary era (e.g., scientists, world leaders, industrialists, philosophers, humanitarians, athletes). Fictional characters (superheroes, anime figures, cinematic creations) and mythological entities are strictly prohibited.",
            "Mandatory pre-registration (first-come, first-served): participants must register their chosen persona via the official form prior to the event. No duplicate personas will be permitted. If two participants select the same figure, the participant with the earlier submission timestamp is assigned the persona; the second participant will be notified to pick an alternate.",
            "Language of delivery: the official language of the event is English. All speeches, rebuttals, and jury interactions must be conducted in English.",
            "Decorum & stage conduct: constructive critique of a historical figure's decisions, policies, and philosophy is actively encouraged. However, personal insults, derogatory slurs, or unparliamentary language directed at fellow student advocates will result in immediate disqualification.",
            "Props & presentation materials: subtle costumes, badges, or symbolic handheld props matching the persona are permitted. Reading directly from mobile phones or prepared papers on stage is strictly disallowed.",
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
        slug: slugify("PIXELS - Photography"),
        category: "GENERAL",
        image: eventImage,
        name: "PIXELS - Photography",
        rules: [
            "PIXELS is an on-campus photography competition organized under Innovate and Ignite 2026 at Vijaya Vittala Institute of Technology. The event encourages participants to capture visual stories and see the world through a different lens.",
            "Date: October 9, 2026 | Time: 9:30 AM onwards | Venue: Quadrangle | Registration fee: ₹50 per participant.",
            "Open to all registered students using smartphones or standard cameras (DSLR/Mirrorless).",
            "All photographs must be shot on campus during the event hours.",
            "Only basic editing (brightness, contrast, cropping, color correction) is permitted. Image manipulation, AI generation, or heavy compositing is strictly prohibited.",
            "Entries must be original photographs taken during the competition and submitted in JPEG/PNG format before the announced deadline.",
            "The judges' decision will be final, and participants cannot dispute or challenge the result.",
            "Each participant must register and participate individually. Team entries are not allowed.",
        ],
        coordinators: [
            { name: "Supriya", faculty: true },
        ],
    },
    {
        slug: slugify("DANCE.exe"),
        category: "DANCE",
        image: eventImage,
        name: "DANCE.exe",
        rules: [
            "Open to all VVIT students.",
            "Solo and group performances allowed (group of 2–12 members).",
            "Any dance style is allowed.",
            "Use of vulgar content is strictly prohibited.",
            "Performances should be within the given time limit.",
            "The decision of the judges will be final.",
        ],
        coordinators: [
            { name: "J Bharathi", faculty: true },
            { name: "Krishnaveni H K", phone: "+919743116619" },
            { name: "Lahari M", phone: "+918884084501" },
            { name: "Bhoomika" },
        ],
    },
    {
        slug: slugify("Mini Project Expo"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Mini Project Expo",
        rules: [
            "Team size: 3–4 members per team.",
            "Eligibility: open to all engineering students from CS, EC, AI/ML and allied branches.",
            "Project type: Hardware, Software, or Hybrid projects are allowed.",
            "Originality: projects must be original. Plagiarism or copied projects will lead to disqualification.",
            "Demonstration: teams must present and demonstrate their project within the allotted time.",
            "Team participation: all members should understand the project and be prepared for questions from the judges.",
            "Evaluation: projects will be judged on Innovation, Technical Implementation, Functionality, Practical Application, Presentation, and Team Knowledge.",
            "Equipment: teams must bring all required laptops, components, chargers, adapters, and other equipment.",
            "Discipline: participants must follow the instructions of the organizers and maintain proper conduct.",
            "Judges' decision: the judges' decision will be final.",
            "Disqualification: misconduct, plagiarism, false information, or violation of event rules may result in disqualification.",
            "Registration fee: ₹200 per team.",
            "Date: 8 October 2026 | Time: 1:30 PM – 4:30 PM | Venue: Room No. 201 & 202.",
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
        slug: slugify("Code conflux"),
        category: "TECHNICAL",
        image: eventImage,
        name: "Code conflux",
        rules: [
            "Team size: each team must consist of 2 participants.",
            "Eligibility: open to students from 1st to 4th year, all branches.",
            "The contest consists of 3 rounds: Debugging, Coding, and Problem Solving.",
            "Participants must report to the venue before the event begins.",
            "Participants must carry their college ID cards.",
            "Internet, mobile phones, or external assistance may not be used unless permitted by the coordinators.",
            "Any form of plagiarism, unfair assistance, or malpractice will result in immediate disqualification.",
            "Participants must follow the time limit and instructions announced for each round.",
            "Decisions made by the event coordinators/judges will be final.",
            "Participants are responsible for maintaining proper discipline and using the provided systems responsibly.",
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
            "The competition will have both Solo and Group singing categories.",
            "Each participant/team can perform only one song, with a maximum duration of 4 minutes.",
            "Participants may perform songs in any language and genre.",
            "Live instruments or instrumental/karaoke backing tracks are allowed; lip-syncing and pre-recorded lead vocals are strictly prohibited.",
            "Group participants may use vocal harmonies, improvisation, beatboxing, and creative arrangements.",
            "Songs containing offensive, discriminatory, hateful, or explicit content are not permitted.",
            "Performances will be judged on vocal quality, pitch, rhythm, expression, stage presence, creativity, and overall performance; the judges' decision will be final.",
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