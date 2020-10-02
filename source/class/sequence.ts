//

import {
  Matchable,
  Module,
  Stat
} from ".";


export class Sequence implements Matchable {

  public matchables: Array<Matchable>;

  public constructor(matchables: Array<Matchable>) {
    this.matchables = matchables;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    return -1;
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    return -1;
  }

  public toString(): string {
    let string = "";
    string += this.matchables.join(" ");
    return string;
  }

}