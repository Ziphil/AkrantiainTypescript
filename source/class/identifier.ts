//

import {
  Matchable,
  Module,
  Stat
} from ".";


export class Identifier implements Matchable {

  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    return -1;
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    return -1;
  }

  public toString(): string {
    return this.name;
  }

}