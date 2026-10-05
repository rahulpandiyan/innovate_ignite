import { Music, Gamepad2, Star, Code } from "lucide-react";

export const categories = [
  {
    name: "Technical",
    count: 3,
    icon: Code,
    accent: "hsl(221 82% 55%)",
    accentLight: "hsl(221 82% 55% / 0.08)",
    accentBorder: "hsl(221 82% 55% / 0.2)",
    tags: ["TechNinja - Quiz", "Code conflux", "Mini Project Expo"],
  },
  {
    name: "Gaming",
    count: 1,
    icon: Gamepad2,
    accent: "hsl(258 70% 55%)",
    accentLight: "hsl(258 70% 55% / 0.08)",
    accentBorder: "hsl(258 70% 55% / 0.25)",
    tags: ["BGMI & FreeFire"],
  },
  {
    name: "General",
    count: 7,
    icon: Star,
    accent: "hsl(197 70% 45%)",
    accentLight: "hsl(197 70% 45% / 0.08)",
    accentBorder: "hsl(197 70% 45% / 0.22)",
    tags: ["VV CARE", "AIR CRASH", "VVIT GOT LATENT", "Group Discussion", "PIXELS - Photography", "Reel Video Making", "The Royal Walk"],
  },
  {
    name: "Dance",
    count: 1,
    icon: Music,
    accent: "hsl(331 73% 52%)",
    accentLight: "hsl(331 73% 52% / 0.08)",
    accentBorder: "hsl(331 73% 52% / 0.22)",
    tags: ["DANCE.exe"],
  },
];

export const marqueeItems = [
  "TechNinja - Quiz", "Code conflux", "Mini Project Expo", "BGMI & FreeFire", "VV CARE", "AIR CRASH", "VVIT GOT LATENT", "Group Discussion", "PIXELS - Photography", "DANCE.exe", "Reel Video Making", "The Royal Walk",
];