export const daylk = {
  // The Sri Lankan government treats every year as having 366 days when encoding
  // birthdays in NICs. February is always 29 days, regardless of whether the birth
  // year is actually a leap year. This is the official NIC calendar convention.
  MONTH_DAYS: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  TOTAL_DAYS_IN_YEAR: 366,

  get now() {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hourCycle: "h23",
    }).formatToParts(now);

    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);

    return {
      year: get("year"),
      month: get("month"),
      day: get("day"),
    };
  },

  dayOfYear(month: number, day: number) {
    let total = 0;
    for (let i = 0; i < month - 1; i++) total += this.MONTH_DAYS[i];

    return total + day;
  },

  currentDayOfYear() {
    const now = this.now;
    return this.dayOfYear(now.month, now.day);
  },
};
