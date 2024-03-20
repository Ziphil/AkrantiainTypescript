//

import {Module, StatElement} from ".";


export class Stat {

  public elements: Array<StatElement>;

  public constructor(elements: Array<StatElement>) {
    this.elements = elements;
  }

  public static create(input: string, module: Module): Stat {
    if (!module.hasEnvironment("CASE_SENSITIVE") && !module.hasEnvironment("PRESERVE_CASE")) {
      input = input.toLowerCase();
    }
    if (module.hasEnvironment("USE_NFD")) {
      input = input.normalize("NFD");
    }
    const elements = [];
    for (let i = 0 ; i < input.length ; i ++) {
      const element = new StatElement(input[i], null, i + 1);
      elements.push(element);
    }
    const stat = new Stat(elements);
    return stat;
  }

  /** インデックスが `from` から `to` まで (`to` は含まない) の要素を 1 つに合成した要素を返します。
   * 返される要素の `part` の値は、合成前の `part` をインデックス順に繋げたものになります。
   * 返される要素の `result` の値は、合成前の各要素の `result` の値に関わらず `null` になります。*/
  public merge(from: number, to: number): StatElement {
    let part = "";
    for (let i = from ; i < to ; i ++) {
      part += this.elements[i].part;
    }
    const columnNumber = (from < this.elements.length) ? this.elements[from].columnNumber : this.elements[this.elements.length - 1].columnNumber;
    const element = new StatElement(part, null, columnNumber);
    return element;
  }

  /** インデックスが `from` から `to` まで (`to` は含まない) の要素を 1 文字ごとに分割した要素グループを返します。
   * 返される要素グループに含まれる全ての要素の `result` の値は、常に `null` になります。*/
  public divide(from: number, to: number): Stat {
    const elements = [];
    for (let i = from ; i < to ; i ++) {
      elements.push(...this.elements[i].divide());
    }
    const stat = new Stat(elements);
    return stat;
  }

  public plus(that: Stat): Stat {
    const elements = [];
    elements.push(...this.elements);
    elements.push(...that.elements);
    const stat = new Stat(elements);
    return stat;
  }

  /** 各要素の変換後の文字列を連結し、出力文字列を作成します。
   * 変換がなされていない要素が含まれていた場合は、句読点類であればスペース 1 つを連結し、そうでなければ変換前の文字列を連結します。
   * したがって、このメソッドを実行する前に、全ての要素が正当であるかどうかを `invalidElements` メソッドなどで確認してください。*/
  public createOutput(module: Module): string {
    let output = "";
    for (const element of this.elements) {
      if (element.result !== null) {
        output += element.result;
      } else {
        if (element.isValid(module)) {
          output += " ";
        } else {
          output += element.part;
        }
      }
    }
    if (module.hasEnvironment("USE_NFD")) {
      output = output.normalize("NFD");
    }
    return output;
  }

  public getInvalidElements(module: Module): Array<StatElement> {
    const invalidElements = [];
    for (const element of this.elements) {
      if (!element.isValid(module)) {
        invalidElements.push(element);
      }
    }
    return invalidElements;
  }

  public isAllConverted(from: number, to: number): boolean {
    let result = true;
    for (let i = from ; i < to ; i ++) {
      if (!this.elements[i].isConverted()) {
        result = false;
        break;
      }
    }
    return result;
  }

  public isNoneConverted(from: number, to: number): boolean {
    let result = true;
    for (let i = from ; i < to ; i ++) {
      if (this.elements[i].isConverted()) {
        result = false;
        break;
      }
    }
    return result;
  }

}