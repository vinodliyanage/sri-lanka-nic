export const daylk = {
  now() {
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

  isLeap(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },

  totalDaysInYear(year: number) {
    return this.isLeap(year) ? 366 : 365;
  },
};
