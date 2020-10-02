//


export class Module {

  private name: ModuleName;

  public constructor(name: ModuleName) {
    this.name = name;
  }

  public toString(indent: number = 0): string {
    let string = "";
    string += " ".repeat(indent) + `% ${this.name} {\n`;
    string += " ".repeat(indent) + "}";
    return string;
  }

}


export type ModuleName = string | [string, string];