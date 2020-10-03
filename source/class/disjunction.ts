//

import {
  Matchable,
  Module,
  Stat
} from ".";


export class Disjunction implements Matchable {

  public matchables: Array<Matchable>;
  public negated: boolean;

  public constructor(matchables: Array<Matchable>, negated: boolean = false) {
    this.matchables = matchables;
    this.negated = negated;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    let to = -1;
    if (this.matchables.length > 0) {
      for (let matchable of this.matchables.reverse()) {
        let singleTo = matchable.matchRight(stat, from, module);
        if (singleTo >= 0) {
          to = singleTo;
          break;
        }
      }
    }
    if (this.negated) {
      return (to === -1) ? from : -1;
    } else {
      return to;
    }
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    let from = -1;
    if (this.matchables.length > 0) {
      for (let matchable of this.matchables.reverse()) {
        let singleFrom = matchable.matchLeft(stat, to, module);
        if (singleFrom >= 0) {
          from = singleFrom;
          break;
        }
      }
    }
    if (this.negated) {
      return (from === -1) ? to : -1;
    } else {
      return from;
    }
  }

  public isConcrete(): boolean {
    return this.matchables.length >= 2 || (this.matchables.length >= 1 && this.matchables[0].isConcrete());
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