//

import {
  AkrantiainError,
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
    let content = module.findContent(this.name);
    if (content !== undefined) {
      let to = content.matchRight(stat, from, module);
      return to;
    } else {
      throw new AkrantiainError(9000, -1, "Cannot happen (at Identifier#matchRight)");
    }
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    let content = module.findContent(this.name);
    if (content !== undefined) {
      let from = content.matchLeft(stat, to, module);
      return from;
    } else {
      throw new AkrantiainError(9001, -1, "Cannot happen (at Identifier#matchLeft)");
    }
  }

  public isConcrete(): boolean {
    return true;
  }

  public equals(that: Identifier): boolean {
    return this.name === that.name;
  }

  public toString(): string {
    return this.name;
  }

}