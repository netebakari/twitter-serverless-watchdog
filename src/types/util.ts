/* eslint-disable @typescript-eslint/no-explicit-any */
import { AssertionError } from "assert";

export const mustBeString = (arg: any, propertyName: string, undefinedAllowed = false): void => {
  const value = arg[propertyName];
  if (undefinedAllowed) {
    if (value !== undefined && typeof value !== "string") {
      throw new AssertionError({ message: `arg.${propertyName} is neigther undefined not string`, actual: value });
    }
  } else {
    if (typeof value !== "string") {
      throw new AssertionError({ message: `arg.${propertyName} is not string`, actual: value });
    }
  }
};

export const mustBeObject = (arg: any): void => {
  if (arg === undefined) {
    throw new AssertionError({ message: "arg is undefined" });
  }
  if (arg === null) {
    throw new AssertionError({ message: "arg is null" });
  }
  if (typeof arg !== "object") {
    throw new AssertionError({ message: "arg is not object" });
  }
};
