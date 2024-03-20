//

import {Identifier, Module, Stat} from ".";
import {Matchable} from "./matchable";


export class Circumflex extends Matchable {

  public matchRight(stat: Stat, from: number, module: Module): number {
    let to = -1;
    let matched = false;
    let pointer = from;
    while (pointer <= stat.elements.length) {
      const element = stat.elements[pointer];
      if (element !== undefined) {
        const elementPart = element.part;
        let punctuationTo = -1;
        if (elementPart.match(/^\s*$/)) {
          matched = true;
          pointer ++;
        } else if ((punctuationTo = module.findPunctuationContent().matchRight(stat, pointer, module)) >= 0) {
          matched = true;
          pointer = punctuationTo;
        } else {
          if (matched || from === 0) {
            to = pointer;
          }
          break;
        }
      } else {
        to = pointer;
        break;
      }
    }
    return to;
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    let from = -1;
    let matched = false;
    let pointer = to - 1;
    while (pointer >= -1) {
      const element = (pointer >= 0) ? stat.elements[pointer] : undefined;
      if (element !== undefined) {
        const elementPart = element.part;
        let punctuationFrom = -1;
        if (elementPart.match(/^\s*$/)) {
          matched = true;
          pointer --;
        } else if ((punctuationFrom = module.findPunctuationContent().matchLeft(stat, pointer, module)) >= 0) {
          matched = true;
          pointer = punctuationFrom;
        } else {
          if (matched || to === stat.elements.length) {
            from = pointer + 1;
          }
          break;
        }
      } else {
        from = pointer + 1;
        break;
      }
    }
    return from;
  }

  public isConcrete(): boolean {
    return false;
  }

  public findUnknownIdentifier(module: Module): Identifier | undefined {
    return undefined;
  }

  public findCircularIdentifier(identifiers: Array<Identifier>, module: Module): Identifier | undefined {
    return undefined;
  }

  public toString(): string {
    return "^";
  }

}


export class Dollar {

  public toString(): string {
    return "$";
  }

}