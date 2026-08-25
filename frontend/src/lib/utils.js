import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function mergeTranscriptions(transcriptions) {
  const merged = [];

  for (const msg of transcriptions) {
    const isAgent = msg.participantInfo.identity.startsWith("agent");
    const last = merged[merged.length - 1];

    if (last && last.isAgent === isAgent) {
      last.text = `${last.text} ${msg.text}`.trim();
    } else {
      merged.push({
        isAgent,
        text: msg.text,
        timestamp: msg.streamInfo.timestamp,
      });
    }
  }

  return merged;
}
