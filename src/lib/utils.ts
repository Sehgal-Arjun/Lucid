import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const moodKeywordGroups: Record<string, string[]> = {
  Happy: [
    "joy", "cheerful", "delighted", "content", "pleased", "smile", "grateful", "optimistic", "elated", "glad"
  ],
  Peaceful: [
    "peaceful", "calm", "serene", "tranquil", "relaxed", "zen", "still", "quiet", "soothing", "composed"
  ],
  Excited: [
    "excited", "thrilled", "eager", "enthusiastic", "animated", "lively", "energetic", "buzzing", "pumped", "ecstatic"
  ],
  Thoughtful: [
    "thoughtful", "reflective", "pensive", "contemplative", "meditative", "introspective", "pondering", "considering", "curious", "inquiring"
  ],
  Sad: [
    "sad", "down", "unhappy", "depressed", "gloomy", "melancholy", "tearful", "blue", "miserable", "sorrow"
  ],
  Tired: [
    "tired", "exhausted", "sleepy", "fatigued", "weary", "drowsy", "drained", "sluggish", "lethargic", "spent"
  ],
  Frustrated: [
    "frustrated", "annoyed", "irritated", "agitated", "upset", "disappointed", "discouraged", "bothered", "exasperated", "impatient"
  ],
  Loved: [
    "loved", "adored", "cherished", "valued", "treasured", "cared", "appreciated", "embraced", "special", "affection"
  ]
};

export const moodKeywords: Record<string, string> = Object.entries(moodKeywordGroups)
  .flatMap(([mood, keywords]) => keywords.map(word => [word, mood] as [string, string]))
  .reduce((acc, [word, mood]) => {
    acc[word] = mood;
    return acc;
  }, {} as Record<string, string>);

export function getMoodFromEntry(entry: string): string {
  const words = entry.toLowerCase().split(/\s+/);
  let lastMood: string | undefined;
  for (const word of words) {
    if (moodKeywords[word]) {
      lastMood = moodKeywords[word];
    }
  }
  return lastMood ?? "happy";
}

function capitalizeMood(mood: string) {
  return mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
}
