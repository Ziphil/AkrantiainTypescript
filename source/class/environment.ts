//

import {
  AkrantiainError
} from ".";


export class Environment {

  public name: EnvironmentName;

  public constructor(rawName: string) {
    let upperRawName = rawName.toUpperCase();
    if (upperRawName === "CASE_SENSITIVE") {
      this.name = "CASE_SENSITIVE";
    } else if (upperRawName.match(/^FALL_?(THROUGH|THRU)$/)) {
      this.name = "FALL_THROUGH";
    } else if (upperRawName === "USE_NFD") {
      this.name = "USE_NFD";
    } else {
      throw new AkrantiainError(2435, 2001, "invalid environment name");
    }
  }

  public toString(): string {
    let string = "";
    string += `@${this.name};`;
    return string;
  }

}


export type EnvironmentName = "CASE_SENSITIVE" | "FALL_THROUGH" | "USE_NFD";