// Shared in-memory user store (no PostgreSQL required for dev/demo)
export const users = new Map<string, any>();

const counter = { value: 1 };

export function nextUserId(): string {
  return `user-${counter.value++}`;
}

export function getUserByEmail(email: string) {
  return users.get(email.toLowerCase().trim());
}
