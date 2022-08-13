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
  ModuleName,
  Rule,
  Stat
} from ".";


export class Module {

  public readonly name: ModuleName | null;
  private readonly definitions: ReadonlyArray<Definition>;
  private readonly rules: ReadonlyArray<Rule>;
  private readonly environments: ReadonlyArray<Environment>;
  private readonly moduleChain?: ModuleChain;

  public constructor(name: ModuleName | null, sentences: Array<Sentence>) {
    const definitions = [];
    const rules = [];
    const environments = [];
    let moduleChain;
    for (const sentence of sentences) {
      if (sentence instanceof ModuleChain) {
        if (definitions.length > 0 || rules.length > 0) {
          throw new AkrantiainError(1005, -1, `Module has both sentences and a module chain: '${name}'`);
        }
      } else {
        if (moduleChain !== undefined) {
          throw new AkrantiainError(1005, -1, `Module has both sentences and a module chain: '${name}'`);
        }
      }
      if (sentence instanceof Definition) {
        const duplicatedIndex = definitions.findIndex((definition) => {
          const castSentence = sentence ;
          return definition.identifier.equals(castSentence.identifier);
        });
        if (duplicatedIndex < 0) {
          definitions.push(sentence);
        } else {
          throw new AkrantiainError(1103, 210, `Duplicate definition of identifier: '${sentence.identifier}'`);
        }
      } else if (sentence instanceof Rule) {
        rules.push(sentence);
      } else if (sentence instanceof Environment) {
        environments.push(sentence);
      } else if (sentence instanceof ModuleChain) {
        if (moduleChain === undefined) {
          moduleChain = sentence;
        } else {
          throw new AkrantiainError(1006, -1, `Module has multiple module chains: '${name}'`);
        }
      } else {
        throw new Error("This cannot happen");
      }
    }
    this.name = name;
    this.definitions = definitions;
    this.rules = rules;
    this.environments = environments;
    this.moduleChain = moduleChain;
    this.checkUnknownIdentifier();
    this.checkCircularIdentifier();
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
      for (const rule of this.rules) {
        currentStat = rule.apply(currentStat, this);
      }
      const invalidElements = currentStat.getInvalidElements(this);
      if (invalidElements.length <= 0 || this.hasEnvironment("FALL_THROUGH")) {
        return currentStat.createOutput(this);
      } else {
        throw new AkrantiainError(2000, 210, "No rules that can handle some characters", invalidElements);
      }
    } else {
      return input;
    }
  }

  private convertByModuleChain(input: string, akrantiain: Akrantiain): string {
    let currentOutput = input;
    if (this.moduleChain !== undefined) {
      for (const name of this.moduleChain.names) {
        const module = akrantiain.findModule(name);
        if (module !== undefined) {
          currentOutput = module.convert(currentOutput, akrantiain);
        } else {
          throw new AkrantiainError(9002, -1, "Cannot happen (at Module#convertByModuleChain)");
        }
      }
    }
    return currentOutput;
  }

  // 識別子定義文や変換規則定義文でモジュール内に存在しない識別子を参照していないかチェックします。
  private checkUnknownIdentifier(): void {
    for (const definition of this.definitions) {
      const identifier = definition.findUnknownIdentifier(this);
      if (identifier !== undefined) {
        throw new AkrantiainError(1100, -1, `Unresolved identifier: '${identifier.text}' in '${definition}'`);
      }
    }
    for (const rule of this.rules) {
      const identifier = rule.findUnknownIdentifier(this);
      if (identifier !== undefined) {
        throw new AkrantiainError(1101, 335, `Unresolved identifier: '${identifier.text}' in '${rule}'`);
      }
    }
  }

  // 識別子定義文で識別子が循環参照していないかチェックします。
  private checkCircularIdentifier(): void {
    for (const definition of this.definitions) {
      const identifier = definition.findCircularIdentifier([], this);
      if (identifier !== undefined) {
        throw new AkrantiainError(1102, -1, `Circular reference involving identifier: '${identifier.text}' in '${definition}'`);
      }
    }
  }

  // 存在しないモジュール名を含んでいればそれを返し、そうでなければ undefined を返します。
  public findUnknownModuleName(akrantiain: Akrantiain): ModuleName | undefined {
    if (this.moduleChain !== undefined) {
      for (const name of this.moduleChain.names) {
        if (akrantiain.findModule(name) === undefined) {
          return name;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  }

  // モジュールチェーン文を全て展開したときに names に含まれるモジュール名が含まれていればそれを返し、そうでなければ undefined を返します。
  // モジュールチェーンが循環参照していないかを調べるのに用いられます。
  // なお、モジュールチェーン文で用いられているモジュールが存在することを仮定して動作するので、findUnknownModuleName メソッドを呼び出してから実行してください。
  public findCircularModuleName(names: Array<ModuleName>, akrantiain: Akrantiain): ModuleName | undefined {
    if (this.moduleChain !== undefined) {
      const name = names.find((name) => this.name === null || name.equals(this.name));
      if (name !== undefined) {
        return name;
      } else {
        const nextNames = (this.name === null) ? names : [...names, this.name];
        for (const searchName of this.moduleChain.names) {
          const module = akrantiain.findModule(searchName)!;
          const name = module.findCircularModuleName(nextNames, akrantiain);
          if (name !== undefined) {
            return name;
          }
        }
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  public findDefinition(identifier: Identifier): Definition | undefined {
    for (const definition of this.definitions) {
      if (definition.identifier.equals(identifier)) {
        return definition;
      }
    }
    return undefined;
  }

  public findContent(identifier: Identifier): Matchable | undefined {
    for (const definition of this.definitions) {
      if (definition.identifier.equals(identifier)) {
        return definition.content;
      }
    }
    return undefined;
  }

  public findPunctuationContent(): Matchable {
    for (const definition of this.definitions) {
      if (definition.identifier.text === "PUNCTUATION") {
        return definition.content;
      }
    }
    return new Disjunction([]);
  }

  public hasDefinition(identifier: Identifier): boolean {
    return this.definitions.findIndex((definition) => definition.identifier.equals(identifier)) >= 0;
  }

  public hasEnvironment(name: EnvironmentName): boolean {
    return this.environments.findIndex((environment) => environment.name === name) >= 0;
  }

  public isEmpty(): boolean {
    return this.definitions.length <= 0 && this.rules.length <= 0 && this.environments.length <= 0 && this.moduleChain === undefined;
  }

  public toString(indent: number = 0): string {
    let string = "";
    string += " ".repeat(indent) + `% ${this.name ?? "<implicit>"} {\n`;
    if (this.definitions.length > 0) {
      string += " ".repeat(indent + 2) + "definitions:\n";
      for (const definition of this.definitions) {
        string += " ".repeat(indent + 4) + `${definition}\n`;
      }
    }
    if (this.rules.length > 0) {
      string += " ".repeat(indent + 2) + "rules:\n";
      for (const rule of this.rules) {
        string += " ".repeat(indent + 4) + `${rule}\n`;
      }
    }
    if (this.environments.length > 0) {
      string += " ".repeat(indent + 2) + "environments:\n";
      for (const environment of this.environments) {
        string += " ".repeat(indent + 4) + `${environment}\n`;
      }
    }
    if (this.moduleChain) {
      string += " ".repeat(indent + 2) + "module chain:\n";
      string += " ".repeat(indent + 4) + `${this.moduleChain}\n`;
    }
    string += " ".repeat(indent) + "}\n";
    return string;
  }

}


export type Sentence = Definition | Rule | Environment | ModuleChain;