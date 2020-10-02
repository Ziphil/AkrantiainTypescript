//


export class AkrantiainError extends Error {

  public name: string = "AkrantiainError";
  public originalCode?: number;
  public code: number;

  public constructor(originalCode: number | undefined, code: number, message: string) {
    super(message);
    this.originalCode = originalCode;
    this.code = code;
  }

}