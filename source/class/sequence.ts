//

import {Identifier, Module, Stat} from ".";
import {Matchable} from "./matchable";


export class Sequence extends Matchable {

  private readonly matchables: ReadonlyArray<Matchable>;

  public constructor(matchables: Array<Matchable>) {
    super();
    this.matchables = matchables;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    if (this.matchables.length > 0) {
      let pointer = from;
      for (const matchable of this.matchables) {
        const to = matchable.matchRight(stat, pointer, module);
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
      for (const matchable of this.matchables.slice().reverse()) {
        const from = matchable.matchLeft(stat, pointer, module);
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
    for (const matchable of this.matchables) {
      const identifier = matchable.findUnknownIdentifier(module);
      if (identifier !== undefined) {
        return identifier;
      }
    }
    return undefined;
  }

  public findCircularIdentifier(identifiers: Array<Identifier>, module: Module): Identifier | undefined {
    for (const matchable of this.matchables) {
      const identifier = matchable.findCircularIdentifier(identifiers, module);
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