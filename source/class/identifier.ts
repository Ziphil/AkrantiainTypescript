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
      throw new AkrantiainError(undefined, 0, "cannot happen (at Identifier#matchRight)");
    }
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    let content = module.findContent(this.name);
    if (content !== undefined) {
      let from = content.matchLeft(stat, to, module);
      return from;
    } else {
      throw new AkrantiainError(undefined, 1, "cannot happen (at Identifier#matchLeft)");
    }
  }

  public toString(): string {
    return this.name;
  }

}