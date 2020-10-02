//

import {
  Definition,
  Environment,
  Identifier,
  Rule
} from ".";


export class Module {

  public name: ModuleName | null;
  private definitions: Array<Definition> = [];
  private rules: Array<Rule> = [];
  private environments: Set<Environment> = new Set();
  private moduleChain?: Array<ModuleName>;

  public constructor(name: ModuleName | null, sentences: Array<Sentence>) {
    this.name = name;
    for (let sentence of sentences) {
      if (sentence instanceof Definition) {
        this.definitions.push(sentence);
      } else if (sentence instanceof Rule) {
        this.rules.push(sentence);
      } else if (sentence instanceof Environment) {
        this.environments.add(sentence);
      } else if (Array.isArray(sentence)) {
        this.moduleChain = sentence;
      } else {
        throw new Error("this cannot happen");
      }
    }
  }

  public toString(indent: number = 0): string {
    let string = "";
    string += " ".repeat(indent) + `% ${this.name ?? "<implicit>"} {\n`;
    if (this.definitions.length > 0) {
      string += " ".repeat(indent + 2) + "definitions:\n";
      this.definitions.forEach((definition) => {
        string += " ".repeat(indent + 4) + `${definition}\n`;
      });
    }
    if (this.rules.length > 0) {
      string += " ".repeat(indent + 2) + "rules:\n";
      this.rules.forEach((rule) => {
        string += " ".repeat(indent + 4) + `${rule}\n`;
      });
    }
    if (this.environments.size > 0) {
      string += " ".repeat(indent + 2) + "environments:\n";
      this.environments.forEach((environment) => {
        string += " ".repeat(indent + 4) + `${environment}\n`;
      });
    }
    if (this.moduleChain) {
      string += " ".repeat(indent + 2) + "module chain:\n";
      string += " ".repeat(indent + 4) + `%% ${this.moduleChain.join(" >> ")};\n`;
    }
    string += " ".repeat(indent) + "}\n";
    return string;
  }

}


export type ModuleSimpleName = Identifier;
export type ModuleChainName = [Identifier, Identifier];
export type ModuleName = ModuleSimpleName | ModuleChainName;
export type ModuleChain = Array<ModuleName>;
export type Sentence = Definition | Rule | Environment | ModuleChain;