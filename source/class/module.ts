//

import {
  Akrantiain,
  AkrantiainError,
  Definition,
  Disjunction,
  Environment,
  EnvironmentName,
  Identifier,
  Matchable,
  ModuleChain,
  Rule,
  Stat
} from ".";


export class Module {

  public name: ModuleName | null;
  private definitions: Array<Definition> = [];
  private rules: Array<Rule> = [];
  private environments: Array<Environment> = [];
  private moduleChain?: ModuleChain;

  public constructor(name: ModuleName | null, sentences: Array<Sentence>) {
    this.name = name;
    for (let sentence of sentences) {
      if (sentence instanceof Definition) {
        this.definitions.push(sentence);
      } else if (sentence instanceof Rule) {
        this.rules.push(sentence);
      } else if (sentence instanceof Environment) {
        this.environments.push(sentence);
      } else if (sentence instanceof ModuleChain) {
        this.moduleChain = sentence;
      } else {
        throw new Error("this cannot happen");
      }
    }
  }

  // 与えられた文字列の変換を実行します。
  public convert(input: string, akrantiain: Akrantiain): string {
    let currentOutput = input;
    currentOutput = this.convertByRule(currentOutput, akrantiain);
    currentOutput = this.convertByModuleChain(currentOutput, akrantiain);
    return currentOutput;
  }

  private convertByRule(input: string, akrantiain: Akrantiain): string {
    if (this.rules.length > 0) {
      let currentStat = Stat.create(input, this);
      for (let rule of this.rules) {
        currentStat = rule.apply(currentStat, this);
      }
      let invalidElements = currentStat.getInvalidElements(this);
      if (invalidElements.length <= 0 || this.hasEnvironment("FALL_THROUGH")) {
        return currentStat.createOutput(this);
      } else {
        throw new AkrantiainError(210, 1000, "No rules that can handle some characters", invalidElements);
      }
    } else {
      return input;
    }
  }

  private convertByModuleChain(input: string, akrantiain: Akrantiain): string {
    let currentOutput = input;
    if (this.moduleChain !== undefined) {
      for (let moduleName of this.moduleChain.modules) {
        let module = akrantiain.findModule(moduleName);
        if (module !== undefined) {
          currentOutput = module.convert(currentOutput, akrantiain);
        } else {
          throw new AkrantiainError(undefined, 2, "cannot happen (at Module#convertByModuleChain)");
        }
      }
    }
    return currentOutput;
  }

  public findContent(name: string): Matchable | undefined {
    for (let definition of this.definitions) {
      if (definition.identifier.name === name) {
        return definition.content;
      }
    }
    return undefined;
  }

  public findPunctuationContent(): Matchable {
    for (let definition of this.definitions) {
      if (definition.identifier.name === "PUNCTUATION") {
        return definition.content;
      }
    }
    return new Disjunction([]);
  }

  public hasEnvironment(name: EnvironmentName): boolean {
    return this.environments.findIndex((environment) => environment.name === name) >= 0;
  }

  public static equalsModuleName(first: ModuleName, second: ModuleName): boolean {
    if (first instanceof Identifier && second instanceof Identifier) {
      return first.equals(second);
    } else if (Array.isArray(first) && Array.isArray(second)) {
      return first[0].equals(second[0]) && first[1].equals(second[1]);
    } else {
      return false;
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
    if (this.environments.length > 0) {
      string += " ".repeat(indent + 2) + "environments:\n";
      this.environments.forEach((environment) => {
        string += " ".repeat(indent + 4) + `${environment}\n`;
      });
    }
    if (this.moduleChain) {
      string += " ".repeat(indent + 2) + "module chain:\n";
      string += " ".repeat(indent + 4) + `%% ${this.moduleChain};\n`;
    }
    string += " ".repeat(indent) + "}\n";
    return string;
  }

}


export type ModuleSimpleName = Identifier;
export type ModuleChainName = [Identifier, Identifier];
export type ModuleName = ModuleSimpleName | ModuleChainName;
export type Sentence = Definition | Rule | Environment | ModuleChain;