export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: boolean | undefined | null }
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  function process(item: any) {
    if (!item) return;
    if (typeof item === "string" || typeof item === "number") {
      classes.push(String(item));
    } else if (Array.isArray(item)) {
      item.forEach(process);
    } else if (typeof item === "object") {
      for (const [key, value] of Object.entries(item)) {
        if (value) classes.push(key);
      }
    }
  }

  inputs.forEach(process);
  return Array.from(new Set(classes.join(" ").split(/\s+/).filter(Boolean))).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatTimeRemaining(targetDate: Date | string): string {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return "00h 00m 00s";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}
