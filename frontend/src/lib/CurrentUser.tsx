import type { users } from "@/lib/type";

export const data: users = {
  name: "Marco Benzène",
  email: "kemognemarcobenzene@gmail.com",
  role: "ADMINISTRATEUR",
};
/** Initiales calculées à partir du nom complet, pour l'avatar. */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
