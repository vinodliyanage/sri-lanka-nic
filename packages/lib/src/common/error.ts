export class NICError extends Error {
  constructor(message: string) {
    super(message);

    // prototype chain fix for some environments
    Object.setPrototypeOf(this, NICError.prototype);

    this.name = "NICError";
  }
}
