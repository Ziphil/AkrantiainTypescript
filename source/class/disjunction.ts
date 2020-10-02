//

import {
  Matchable,
  Module,
  Stat
} from ".";


export class Disjunction implements Matchable {

  public matchables: Array<Matchable>;
  public negated: boolean;

  public constructor(matchables: Array<Matchable>, negated: boolean) {
    this.matchables = matchables;
    this.negated = negated;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    return -1;
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    return -1;
  }

  public toString(): string {
    let string = "";
    if (this.negated) {
      string += "!";
    }
    string += `(${this.matchables.join(" | ")})`;
    return string;
  }

}