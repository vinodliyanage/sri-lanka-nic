export const daylk = {
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

  isLeap(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },

  dayOfYear(year: number, month: number, day: number) {
    const totals = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const leapOffset = month > 2 && this.isLeap(year) ? 1 : 0;
    return totals[month - 1] + day + leapOffset;
  },

  totalDaysInYear(year: number) {
    return this.isLeap(year) ? 366 : 365;
  },
};
