//

import {
  AkrantiainError,
  Module,
  ModuleName
} from ".";
import {
  Parsers
} from "../parser/parsers";


export class Akrantiain {

  private readonly implicitModule?: Module;
  private readonly explicitModules: ReadonlyArray<Module>;

  public constructor(modules: Array<Module>) {
    let implicitModule;
    let explicitModules = [];
    for (let module of modules) {
      if (!module.isEmpty()) {
        if (module.name === null) {
          if (implicitModule === undefined) {
            implicitModule = module;
          } else {
            throw new AkrantiainError(1003, -1, "There are more than one implicit modules");
          }
        } else {
          let duplicated = explicitModules.findIndex((existingModule) => existingModule.name!.equals(module.name!)) >= 0;
          if (!duplicated) {
            explicitModules.push(module);
          } else {
            throw new AkrantiainError(1004, 1113, `Duplicate definition of module: '${module.name}'`);
          }
        }
      }
    }
    if (implicitModule === undefined) {
      throw new AkrantiainError(1002, -1, "No implicit module");
    }
    this.implicitModule = implicitModule;
    this.explicitModules = explicitModules;
    this.checkUnknownModuleName();
    this.checkCircularModuleName();
  }

  public static load(source: string): Akrantiain {
    let akrantiain = Parsers.akrantiain.tryParse(source);
    return akrantiain;
  }

  // 暗黙モジュールから与えられた文字列の変換を実行します。
  public convert(input: string): string {
    if (this.implicitModule !== undefined) {
      return this.implicitModule.convert(input, this);
    } else {
      throw new AkrantiainError(9003, -1, "Cannot happen (at Akrantiain#convert)");
    }
  }

  // モジュールチェーン文で存在しないモジュールを参照していないかチェックします。
  private checkUnknownModuleName(): void {
    let modules = [...this.explicitModules, this.implicitModule!];
    for (let module of modules) {
      let name = module.findUnknownModuleName(this);
      if (name !== undefined) {
        throw new AkrantiainError(1000, 1111, `No such module: '${name}'`);
      }
    }
  }

  // モジュールチェーン文でモジュールが循環参照していないかチェックします。
  // このメソッドは暗黙モジュールから参照されているもののみを調べるので、参照されていない明示モジュールの中での循環参照は検査しません。
  private checkCircularModuleName(): void {
    let name = this.implicitModule!.findCircularModuleName([], this);
    if (name !== undefined) {
      throw new AkrantiainError(1001, 1112, `Circular reference involving module: '${name}'`);
    }
  }

  public findModule(name: ModuleName): Module | undefined {
    for (let module of this.explicitModules) {
      if (module.name !== null && module.name.equals(name)) {
        return module;
      }
    }
    return undefined;
  }

  public toString(indent: number = 0): string {
    let string = "";
    if (this.implicitModule !== undefined) {
      string += this.implicitModule.toString(indent);
    }
    for (let module of this.explicitModules) {
      string += module.toString(indent);
    }
    return string;
  }

}