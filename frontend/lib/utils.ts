import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const absoluteUrl = (path: string) =>
  new URL(path, siteUrl).toString();

export const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const copyToClipboard = async (value: string) => {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }

  await navigator.clipboard.writeText(value);
  return true;
};
