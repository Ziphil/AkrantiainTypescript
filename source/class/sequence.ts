//

import {
  Identifier,
  Matchable,
  Module,
  Stat
} from ".";


export class Sequence implements Matchable {

  private readonly matchables: ReadonlyArray<Matchable>;

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
      return from;
    }
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    if (this.matchables.length > 0) {
      let pointer = to;
      for (let matchable of this.matchables.slice().reverse()) {
        let from = matchable.matchLeft(stat, pointer, module);
        if (from >= 0) {
          pointer = from;
        } else {
          return -1;
        }
      }
      return pointer;
    } else {
      return to;
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