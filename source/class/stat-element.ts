//

import {Module} from ".";
import {Stat} from "./stat";


export class StatElement {

  public part: string;
  public result: string | null;
  public columnNumber?: number;

  public constructor(part: string, result: string | null, columnNumber?: number) {
    this.part = part;
    this.result = result;
    this.columnNumber = columnNumber;
  }

  public divide(): Array<StatElement> {
    const elements = [];
    for (const char of this.part) {
      const element = new StatElement(char, null);
      elements.push(element);
    }
    return elements;
  }

  /** この要素が正当に変換されていれば `true` を返し、そうでなければ `false` を返します。
   * ここで「正当に変換されている」とは、変換後の文字列が `null` でないか、変換前の文字列が句読点かスペースのみで構成されていることを意味します。*/
  public isValid(module: Module): boolean {
    if (this.result === null) {
      if (this.part.match(/^\s*$/)) {
        return true;
      } else {
        const stat = new Stat([this]);
        if (module.findPunctuationContent().matchRight(stat, 0, module) >= 0) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return true;
    }
  }

  public isConverted(): boolean {
    return this.result !== null;
  }

}