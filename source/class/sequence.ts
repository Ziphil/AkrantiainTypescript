//

import {
  Matchable,
  Module,
  Stat
} from ".";
import { Identifier } from "./identifier";


export class Sequence implements Matchable {

  public matchables: Array<Matchable>;

  public constructor(matchables: Array<Matchable>) {
    this.matchables = matchables;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    if (this.matchables.length > 0) {
      let pointer = from;
      for (let matchable of this.matchables) {
        let to = matchable.matchRight(stat, pointer, module);
        if (to >= 0) {
          pointer = to;
        } else {
          return -1;
        }
      }
      return pointer;
    } else {
      return -1;
    }
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    if (this.matchables.length > 0) {
      let pointer = to;
      for (let matchable of this.matchables.reverse()) {
        let from = matchable.matchLeft(stat, pointer, module);
        if (from >= 0) {
          pointer = from;
        } else {
          return -1;
        }
      }
      return pointer;
    } else {
      return -1;
    }
  }

  public isConcrete(): boolean {
    return this.matchables.length >= 2 || (this.matchables.length >= 1 && this.matchables[0].isConcrete());
  }

  public findUnknownIdentifier(module: Module): Identifier | undefined {
    for (let matchable of this.matchables) {
      let identifier = matchable.findUnknownIdentifier(module);
      if (identifier !== undefined) {
        return identifier;
      }
    }
    return undefined;
  }

  public findCircularIdentifier(identifiers: Array<Identifier>, module: Module): Identifier | undefined {
    for (let matchable of this.matchables) {
      let identifier = matchable.findCircularIdentifier(identifiers, module);
      if (identifier !== undefined) {
        return identifier;
      }
    }
    return undefined;
  }

  public toString(): string {
    let string = "";
    string += this.matchables.join(" ");
    return string;
  }

}