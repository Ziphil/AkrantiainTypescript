//

import {Identifier, Module, Stat} from ".";
import {Matchable} from "./matchable";


export class Quote extends Matchable {

  public readonly text: string;

  public constructor(text: string) {
    super();
    this.text = text;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    let to = -1;
    let matchedLength = 0;
    let pointer = from;
    if (this.text !== "") {
      const text = (module.hasEnvironment("USE_NFD")) ? this.text.normalize("NFD") : this.text;
      while (pointer < stat.elements.length) {
        const element = stat.elements[pointer];
        const elementPart = element.part;
        if (matchedLength + elementPart.length <= text.length) {
          const textSubstring = text.substring(matchedLength, matchedLength + elementPart.length);
          let adjustedTextSubstring = textSubstring;
          let adjustedElementPart = elementPart;
          if (!module.hasEnvironment("CASE_SENSITIVE")) {
            adjustedTextSubstring = adjustedTextSubstring.toLowerCase();
          }
          if (!module.hasEnvironment("CASE_SENSITIVE") && module.hasEnvironment("PRESERVE_CASE")) {
            adjustedElementPart = adjustedElementPart.toLowerCase();
          }
          if (adjustedTextSubstring === adjustedElementPart) {
            matchedLength += elementPart.length;
            if (matchedLength === text.length) {
              to = pointer + 1;
              break;
            }
          } else {
            break;
          }
        } else {
          break;
        }
        pointer ++;
      }
    } else {
      to = from;
    }
    return to;
  }

  public matchLeft(stat: Stat, to: number, module: Module): number {
    let from = -1;
    let matchedLength = 0;
    let pointer = to - 1;
    if (this.text !== "") {
      const text = (module.hasEnvironment("USE_NFD")) ? this.text.normalize("NFD") : this.text;
      while (pointer >= 0) {
        const element = stat.elements[pointer];
        const elementPart = element.part;
        if (matchedLength + elementPart.length <= text.length) {
          const textSubstring = text.substring(text.length - elementPart.length - matchedLength, text.length - matchedLength);
          let adjustedTextSubstring = textSubstring;
          let adjustedElementPart = elementPart;
          if (!module.hasEnvironment("CASE_SENSITIVE")) {
            adjustedTextSubstring = adjustedTextSubstring.toLowerCase();
          }
          if (!module.hasEnvironment("CASE_SENSITIVE") && module.hasEnvironment("PRESERVE_CASE")) {
            adjustedElementPart = adjustedElementPart.toLowerCase();
          }
          if (adjustedTextSubstring === adjustedElementPart) {
            matchedLength += elementPart.length;
            if (matchedLength === text.length) {
              from = pointer;
              break;
            }
          } else {
            break;
          }
        } else {
          break;
        }
        pointer --;
      }
    } else {
      from = to;
    }
    return from;
  }

  public isConcrete(): boolean {
    return true;
  }

  public findUnknownIdentifier(module: Module): Identifier | undefined {
    return undefined;
  }

  public findCircularIdentifier(identifiers: Array<Identifier>, module: Module): Identifier | undefined {
    return undefined;
  }

  public toString(): string {
    return `"${this.text}"`;
  }

}


export class Slash {

  public readonly text: string;

  public constructor(text: string) {
    this.text = text;
  }

  public toString(): string {
    return `/${this.text}/`;
  }

}