/**
 * Utility for parsing and formatting duty log durations from Discord bot logs,
 * FiveM game server scripts, or manual entries.
 *
 * Handles cases like:
 * - "1 Hours, 1.783333333333 menit" (float minutes bug from Discord bots)
 * - "1 Hours, 1.783333333333 Minutes"
 * - "51 Minutes"
 * - "1 Jam 30 Menit"
 * - "1.5 Hours" / "1,5 Jam"
 * - "1 Hours, 1 Minutes, 47 Seconds"
 * - "01:30:00" / "01:30"
 * - Bare number e.g. "45"
 */

export function parseDutyDurationTextToMinutes(durationText: string): number {
  if (!durationText) return 0;
  const text = durationText.trim();
  if (!text) return 0;

  // 1. Time string format HH:MM:SS or HH:MM (e.g. 01:45:30 or 1:30)
  const timeFormatMatch = text.match(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/);
  if (timeFormatMatch) {
    const hours = parseInt(timeFormatMatch[1], 10);
    const mins = parseInt(timeFormatMatch[2], 10);
    const secs = timeFormatMatch[3] ? parseInt(timeFormatMatch[3], 10) : 0;
    const total = hours * 60 + mins + secs / 60;
    return total > 0 ? Math.max(1, Math.round(total)) : 0;
  }

  let totalMinutes = 0;
  let matchedAny = false;

  // 2. Hours / Jam (e.g. "1 Hours", "1.5 Jam", "2 hrs", "1h")
  // Captures integer or floating point number with dot or comma
  const hMatch = text.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*(?:jam|hours?|hrs?|h)\b/i);
  if (hMatch) {
    const val = parseFloat(hMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      totalMinutes += val * 60;
      matchedAny = true;
    }
  }

  // 3. Minutes / Menit (e.g. "1.783333333333 menit", "51 Minutes", "30 mins", "45m")
  // Captures full integer or decimal number before the minute unit
  const mMatch = text.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*(?:menit|minutes?|mins?|min|m)\b/i);
  if (mMatch) {
    const val = parseFloat(mMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      totalMinutes += val;
      matchedAny = true;
    }
  }

  // 3b. Fallback for bot logs where minutes might follow hours without "menit" keyword (e.g. "1 Hours, 1.783333333333")
  if (hMatch && !mMatch) {
    const trailingNumMatch = text.match(/(?:jam|hours?|hrs?|h)\s*[,+&]?\s*([0-9]+(?:[.,][0-9]+)?)\s*$/i);
    if (trailingNumMatch) {
      const val = parseFloat(trailingNumMatch[1].replace(',', '.'));
      if (!isNaN(val) && val > 0) {
        totalMinutes += val;
        matchedAny = true;
      }
    }
  }

  // 4. Seconds / Detik (e.g. "47 Seconds", "30 detik", "15s")
  const sMatch = text.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*(?:detik|seconds?|secs?|sec|s)\b/i);
  if (sMatch) {
    const val = parseFloat(sMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      totalMinutes += val / 60;
      matchedAny = true;
    }
  }

  // 5. Bare number fallback (e.g. "45" or "90.5")
  if (!matchedAny) {
    const numOnly = text.match(/^\s*([0-9]+(?:[.,][0-9]+)?)\s*$/);
    if (numOnly) {
      const val = parseFloat(numOnly[1].replace(',', '.'));
      if (!isNaN(val) && val > 0) {
        totalMinutes = val;
        matchedAny = true;
      }
    }
  }

  if (totalMinutes <= 0) return 0;
  // Return clean rounded whole minutes (at least 1 minute if positive)
  return Math.max(1, Math.round(totalMinutes));
}

/**
 * Formats integer or float minutes into clean standard readable Indonesian format
 * e.g. 62 -> "1 Jam 2 Menit", 51 -> "51 Menit", 120 -> "2 Jam"
 */
export function formatMinutesToCleanDuration(rawMins: number): string {
  if (rawMins <= 0) return '0 Menit';
  const totalMins = Math.round(rawMins);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0 && m > 0) return `${h} Jam ${m} Menit`;
  if (h > 0) return `${h} Jam`;
  return `${m} Menit`;
}
