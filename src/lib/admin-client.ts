export function getAdminSecret(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/admin_secret=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}
