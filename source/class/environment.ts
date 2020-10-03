//

import {
  AkrantiainError
} from ".";


export class Environment {

  public name?: EnvironmentName;

  public constructor(rawName: string) {
    let upperRawName = rawName.toUpperCase();
    if (upperRawName === "CASE_SENSITIVE") {
      this.name = "CASE_SENSITIVE";
    } else if (upperRawName === "PRESERVE_CASE") {
      this.name = "PRESERVE_CASE";
    } else if (upperRawName.match(/^FALL_?(THROUGH|THRU)$/)) {
      this.name = "FALL_THROUGH";
    } else if (upperRawName === "USE_NFD") {
      this.name = "USE_NFD";
    } else {
      let caution = new AkrantiainError(2435, 3000, `Invalid environment name: '${rawName}'`);
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