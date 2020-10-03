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

  private implicitModule?: Module;
  private explicitModules: Array<Module> = [];

  public constructor(modules: Array<Module>) {
    for (let module of modules) {
      if (module.name === null) {
        if (this.implicitModule === undefined) {
          this.implicitModule = module;
        } else {
          throw new AkrantiainError(1001, -1, "There are more than one implicit modules");
        }
      } else {
        let duplicated = this.explicitModules.findIndex((existingModule) => existingModule.name!.equals(module.name!));
        if (!duplicated) {
          this.explicitModules.push(module);
        } else {
          throw new AkrantiainError(1002, 1113, `Duplicate definition of modules: ${module.name}`);
        }
      }
    }
    if (this.implicitModule === undefined) {
      throw new AkrantiainError(1000, -1, "No implicit module");
    }
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