export const relativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const diff = (date.getTime() - Date.now()) / 1000; // seconds
    const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
      ["year", 60 * 60 * 24 * 365],
      ["month", 60 * 60 * 24 * 30],
      ["week", 60 * 60 * 24 * 7],
      ["day", 60 * 60 * 24],
      ["hour", 60 * 60],
      ["minute", 60],
      ["second", 1],
    ];
    for (const [unit, seconds] of ranges) {
      const amt = Math.round(diff / seconds);
      if (Math.abs(amt) >= 1) return rtf.format(amt, unit);
    }
    return "just now";
  };