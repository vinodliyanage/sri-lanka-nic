import { errors, ErrorCodes } from "./errors";

export class NICError extends Error {
  public readonly code: ErrorCodes;

  constructor(code: ErrorCodes, ...args: any[]) {
    const generateMessage = errors[code] as (...args: any[]) => string;
    super(generateMessage(...args));

    // prototype chain fix for some environments
    Object.setPrototypeOf(this, NICError.prototype);

    this.name = "NICError";
    this.code = code;
  }
}
