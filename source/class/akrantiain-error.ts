//

import {
  StatElement
} from ".";


export class AkrantiainError extends Error {

  public name: string = "AkrantiainError";
  public originalCode?: number;
  public code: number;
  public elements?: Array<StatElement>;

  public constructor(originalCode: number | undefined, code: number, shortMessage: string, elements?: Array<StatElement>) {
    super(AkrantiainError.createMessage(originalCode, code, shortMessage, elements));
    this.originalCode = originalCode;
    this.code = code;
    this.elements = elements;
  }

  private static createMessage(originalCode: number | undefined, code: number, shortMessage: string, elements?: Array<StatElement>): string {
    let message = "";
    message += `${code} (${originalCode ?? "**"}): ${shortMessage}`;
    if (elements !== undefined) {
      for (let element of elements) {
        message += " | ";
        message += `${element.part} (at column ${element.columnNumber ?? "?"})`;
      }
    }
    return message;
  }

}