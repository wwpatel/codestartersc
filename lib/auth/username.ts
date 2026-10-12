export const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function isValidUsername(username: string) {
  return USERNAME_RE.test(username);
}

export function usernameToEmail(username: string) {
  return `${username}@cs-dashboard.example`;
}
