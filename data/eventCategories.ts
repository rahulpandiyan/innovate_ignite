export interface EventCategory {
    id: string;
    eventNo: number;
    eventName: string;
    userId: string;
    maxParticipant: number;
    registeredParticipant: number;
    category: string;
    amount?: number;
}

export const interDepartmentEvents: EventCategory[] = [
    {
        eventNo: 1,
        eventName: "Techninja",
        category: "TECHNICAL",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        eventNo: 2,
        eventName: "VV care",
        category: "GENERAL",
        maxParticipant: 5,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        eventNo: 3,
        eventName: "Cooking Without Fire",
        category: "GENERAL",
        maxParticipant: 3,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 150,
    },
    {
        eventNo: 4,
        eventName: "Talent mania",
        category: "GENERAL",
        maxParticipant: 1,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        eventNo: 5,
        eventName: "Collage (Best out of waste)",
        category: "FINE_ARTS",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        eventNo: 6,
        eventName: "ICEBREAKER",
        category: "GENERAL",
        maxParticipant: 6,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        eventNo: 7,
        eventName: "Dumb charades",
        category: "THEATRE",
        maxParticipant: 5,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 100,
    },
    {
        eventNo: 8,
        eventName: "Code Conflux",
        category: "TECHNICAL",
        maxParticipant: 3,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 150,
    },
    {
        eventNo: 9,
        eventName: "Dance Elite",
        category: "DANCE",
        maxParticipant: 10,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 200,
    },
    {
        eventNo: 10,
        eventName: "BGMI",
        category: "GAMING",
        maxParticipant: 4,
        id: "",
        userId: "",
        registeredParticipant: 0,
        amount: 200,
    },
];

export const eventCategories = interDepartmentEvents;
