//


export class Module {

  private name: ModuleName;
  private moduleChain: Array<ModuleName> = [];

  public constructor(name: ModuleName, moduleChain: Array<ModuleName>) {
    this.name = name;
    this.moduleChain = moduleChain;
  }

  public toString(indent: number = 0): string {
    let string = "";
    string += " ".repeat(indent) + `% ${this.name} {\n`;
    string += " ".repeat(indent + 2) + "<module chain>\n";
    string += " ".repeat(indent + 4) + `%% ${this.moduleChain.join(" >> ")};\n`;
    string += " ".repeat(indent) + "}\n";
    return string;
  }

}


export type ModuleName = string | [string, string];
export type ModuleChain = Array<ModuleName>;