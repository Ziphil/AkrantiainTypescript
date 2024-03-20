//

import {StatElement} from ".";


export class AkrantiainError extends Error {

  public name: string = "AkrantiainError";
  public code: number;
  public originalCode: number;
  public elements?: Array<StatElement>;

  public constructor(code: number, originalCode: number, shortMessage: string, elements?: Array<StatElement>) {
    super(AkrantiainError.createMessage(code, originalCode, shortMessage, elements));
    this.code = code;
    this.originalCode = originalCode;
    this.elements = elements;
  }

  private static createMessage(code: number, originalCode: number, shortMessage: string, elements?: Array<StatElement>): string {
    let message = "";
    message += `${code} (${originalCode}) | ${shortMessage}`;
    if (elements !== undefined) {
      message += ": ";
      message += elements.map((element) => `'${element.part}' (at column ${element.columnNumber ?? "?"})`).join(", ");
    }
    return message;
  }

}