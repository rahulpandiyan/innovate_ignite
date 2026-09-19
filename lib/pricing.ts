export type PricingMode = "PER_TEAM" | "PER_PARTICIPANT" | "SOLO_OR_GROUP";

export function computeEventPrice(opts: {
  price: number;
  priceMode: PricingMode;
  teamSize: number;
  groupPrice?: number | null;
}): number {
  const { price, priceMode, teamSize, groupPrice } = opts;
  if (priceMode === "PER_PARTICIPANT") return price * Math.max(teamSize, 1);
  if (priceMode === "SOLO_OR_GROUP") return teamSize > 1 ? (groupPrice ?? price) : price;
  return price;
}

export function formatPriceLabel(opts: {
  price: number;
  priceMode: PricingMode;
  groupPrice?: number | null;
}): string {
  const { price, priceMode, groupPrice } = opts;
  if (priceMode === "PER_PARTICIPANT") return `₹${price} per member`;
  if (priceMode === "SOLO_OR_GROUP") return `Solo ₹${price} · Group ₹${groupPrice ?? price}`;
  return `₹${price} per team`;
}

export function memberCountLabel(minTeamSize: number, maxTeamSize: number) {
  const min = minTeamSize || 1;
  const max = maxTeamSize || min;
  if (min === 1 && max === 1) return "Solo";
  if (min === max) return `Team of ${max}`;
  return `Team of ${min}–${max}`;
}

export interface TeamSizeOption {
  value: number;
  label: string;
  price: number;
}

export function teamSizeOptions(opts: {
  price: number;
  priceMode: PricingMode;
  minTeamSize: number;
  maxTeamSize: number;
  groupPrice?: number | null;
}): TeamSizeOption[] {
  const min = opts.minTeamSize || 1;
  const max = Math.max(opts.maxTeamSize || min, min);

  if (opts.priceMode === "SOLO_OR_GROUP") {
    const soloPrice = computeEventPrice({ price: opts.price, priceMode: "SOLO_OR_GROUP", teamSize: 1, groupPrice: opts.groupPrice });
    const groupPrice = computeEventPrice({ price: opts.price, priceMode: "SOLO_OR_GROUP", teamSize: Math.max(2, max), groupPrice: opts.groupPrice });
    const options: TeamSizeOption[] = [{ value: 1, label: "Solo", price: soloPrice }];
    if (max >= 2) options.push({ value: Math.max(2, max), label: "Group", price: groupPrice });
    return options;
  }

  const options: TeamSizeOption[] = [];
  for (let size = min; size <= max; size++) {
    options.push({
      value: size,
      label: size === 1 ? `${size} member (you)` : `${size} members (incl. you)`,
      price: computeEventPrice({ price: opts.price, priceMode: opts.priceMode, teamSize: size, groupPrice: opts.groupPrice }),
    });
  }
  return options;
}