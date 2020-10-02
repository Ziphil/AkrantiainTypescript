//

import {
  Matchable,
  Module,
  Stat
} from ".";


export class Quote implements Matchable {

  public string: string;

  public constructor(string: string) {
    this.string = string;
  }

  public matchRight(stat: Stat, from: number, module: Module): number {
    let to = -1;
    let matchedLength = 0;
    let pointer = from;
    if (this.string !== "") {
      let text = (module.hasEnvironment("USE_NFD")) ? this.string.normalize("NFD") : this.string;
      while (pointer < stat.elements.length) {
        let element = stat.elements[pointer];
        let elementPart = element.part;
        if (matchedLength + elementPart.length <= text.length) {
          let textSubstring = text.substring(matchedLength, matchedLength + elementPart.length);
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
    if (this.string !== "") {
      let text = (module.hasEnvironment("USE_NFD")) ? this.string.normalize("NFD") : this.string;
      while (pointer >= 0) {
        let element = stat.elements[pointer];
        let elementPart = element.part;
        if (matchedLength + elementPart.length <= text.length) {
          let textSubstring = text.substring(text.length - elementPart.length - matchedLength, text.length - matchedLength);
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

  public toString(): string {
    return `"${this.string}"`;
  }

}


export class Slash {

  public string: string;

  public constructor(string: string) {
    this.string = string;
  }

  public toString(): string {
    return `/${this.string}/`;
  }

}


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


export class Circumflex implements Matchable {

  public matchRight(stat: Stat, from: number, module: Module): number {
    let to = -1;
    let matched = false;
    let pointer = from;
    while (pointer <= stat.elements.length) {
      let element = stat.elements[pointer];
      if (element !== undefined) {
        let elementPart = element.part;
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
      let element = (pointer >= 0) ? stat.elements[pointer] : undefined;
      if (element !== undefined) {
        let elementPart = element.part;
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

  public toString(): string {
    return "^";
  }

}


export class Dollar {

  public toString(): string {
    return "$";
  }

}