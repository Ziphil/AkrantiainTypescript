//

import {
  AkrantiainError
} from ".";


export class Environment {

  public readonly name?: EnvironmentName;

  public constructor(rawName: string) {
    const upperRawName = rawName.toUpperCase();
    if (upperRawName === "CASE_SENSITIVE") {
      this.name = "CASE_SENSITIVE";
    } else if (upperRawName === "PRESERVE_CASE") {
      this.name = "PRESERVE_CASE";
    } else if (upperRawName.match(/^FALL_?(THROUGH|THRU)$/)) {
      this.name = "FALL_THROUGH";
    } else if (upperRawName === "USE_NFD") {
      this.name = "USE_NFD";
    } else {
      const caution = new AkrantiainError(3000, 2435, `Invalid environment name: '${rawName}'`);
      console.warn(caution.message);
    }
  }

  public toString(): string {
    let string = "";
    if (this.name !== undefined) {
      string += `@${this.name};`;
    } else {
      string += "@<undefined>;";
    }
    return string;
  }

}


export type EnvironmentName = "CASE_SENSITIVE" | "PRESERVE_CASE" | "FALL_THROUGH" | "USE_NFD";