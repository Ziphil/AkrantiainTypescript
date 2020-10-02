//

import {
  Definition,
  Identifier,
  Rule
} from ".";


export class Module {

  private name: ModuleName;
  private definitions: Array<Definition> = [];
  private rules: Array<Rule> = [];
  private moduleChain?: Array<ModuleName>;

  public constructor(name: ModuleName, sentences: Array<Sentence>) {
    this.name = name;
    for (let sentence of sentences) {
      if (sentence instanceof Definition) {
        this.definitions.push(sentence);
      } else if (sentence instanceof Rule) {
        this.rules.push(sentence);
      } else if (Array.isArray(sentence)) {
        this.moduleChain = sentence;
      }
    }
  }

  public toString(indent: number = 0): string {
    let string = "";
    string += " ".repeat(indent) + `% ${this.name} {\n`;
    if (this.definitions.length > 0) {
      string += " ".repeat(indent + 2) + "<definitions>\n";
      for (let definition of this.definitions) {
        string += " ".repeat(indent + 4) + `${definition}\n`;
      }
    }
    if (this.rules.length > 0) {
      string += " ".repeat(indent + 2) + "<rules>\n";
      for (let rule of this.rules) {
        string += " ".repeat(indent + 4) + `${rule}\n`;
      }
    }
    if (this.moduleChain) {
      string += " ".repeat(indent + 2) + "<module chain>\n";
      string += " ".repeat(indent + 4) + `%% ${this.moduleChain.join(" >> ")};\n`;
    }
    string += " ".repeat(indent) + "}\n";
    return string;
  }

}


export type ModuleName = ModuleSimpleName | ModuleChainName;
export type ModuleSimpleName = Identifier;
export type ModuleChainName = [Identifier, Identifier];
export type ModuleChain = Array<ModuleName>;

export type Sentence = Definition | Rule | ModuleChain;