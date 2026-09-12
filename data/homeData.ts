import { Clapperboard, Music, Gamepad2, Palette, Star, Code, ChefHat } from "lucide-react";

export const categories = [
  {
    name: "Technical",
    count: 2,
    icon: Code,
    accent: "hsl(221 82% 55%)",
    accentLight: "hsl(221 82% 55% / 0.08)",
    accentBorder: "hsl(221 82% 55% / 0.2)",
    tags: ["Techninja", "Code Conflux"],
  },
  {
    name: "Dance",
    count: 1,
    icon: Music,
    accent: "hsl(46 90% 51%)",
    accentLight: "hsl(46 90% 51% / 0.08)",
    accentBorder: "hsl(46 90% 51% / 0.25)",
    tags: ["Dance Elite"],
  },
  {
    name: "Gaming",
    count: 1,
    icon: Gamepad2,
    accent: "hsl(258 70% 55%)",
    accentLight: "hsl(258 70% 55% / 0.08)",
    accentBorder: "hsl(258 70% 55% / 0.25)",
    tags: ["BGMI"],
  },
  {
    name: "Theatre",
    count: 1,
    icon: Clapperboard,
    accent: "hsl(224 68% 30%)",
    accentLight: "hsl(224 68% 30% / 0.08)",
    accentBorder: "hsl(224 68% 30% / 0.2)",
    tags: ["Dumb charades"],
  },
  {
    name: "Fine Arts",
    count: 1,
    icon: Palette,
    accent: "hsl(12 76% 50%)",
    accentLight: "hsl(12 76% 50% / 0.08)",
    accentBorder: "hsl(12 76% 50% / 0.22)",
    tags: ["Collage"],
  },
  {
    name: "General",
    count: 4,
    icon: Star,
    accent: "hsl(197 70% 45%)",
    accentLight: "hsl(197 70% 45% / 0.08)",
    accentBorder: "hsl(197 70% 45% / 0.22)",
    tags: ["VV care", "Cooking", "Talent mania", "ICEBREAKER"],
  },
];

export const marqueeItems = [
  "Techninja", "VV care", "Cooking Without Fire", "Talent mania", "Collage", "ICEBREAKER", "Dumb charades", "Code Conflux", "Dance Elite", "BGMI",
];
