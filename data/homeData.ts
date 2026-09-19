import { Music, Gamepad2, Star, Code, Clapperboard } from "lucide-react";

export const categories = [
  {
    name: "Technical",
    count: 1,
    icon: Code,
    accent: "hsl(221 82% 55%)",
    accentLight: "hsl(221 82% 55% / 0.08)",
    accentBorder: "hsl(221 82% 55% / 0.2)",
    tags: ["Mini Project Presentation"],
  },
  {
    name: "Gaming",
    count: 1,
    icon: Gamepad2,
    accent: "hsl(258 70% 55%)",
    accentLight: "hsl(258 70% 55% / 0.08)",
    accentBorder: "hsl(258 70% 55% / 0.25)",
    tags: ["BGMI & Free Fire"],
  },
  {
    name: "Theatre",
    count: 1,
    icon: Clapperboard,
    accent: "hsl(224 68% 30%)",
    accentLight: "hsl(224 68% 30% / 0.08)",
    accentBorder: "hsl(224 68% 30% / 0.2)",
    tags: ["Crucial Beats"],
  },
  {
    name: "General",
    count: 4,
    icon: Star,
    accent: "hsl(197 70% 45%)",
    accentLight: "hsl(197 70% 45% / 0.08)",
    accentBorder: "hsl(197 70% 45% / 0.22)",
    tags: ["VV CARE – Social Spotlight", "VVIT Got Latent", "Air Crash", "Group Discussion"],
  },
];

export const marqueeItems = [
  "VV CARE – Social Spotlight", "BGMI & Free Fire", "VVIT Got Latent", "Air Crash", "Mini Project Presentation", "Crucial Beats", "Group Discussion",
];