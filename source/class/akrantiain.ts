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
    modules.forEach((module) => {
      if (module.name === null) {
        this.implicitModule = module;
      } else {
        this.explicitModules.push(module);
      }
    });
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
      throw new AkrantiainError(undefined, 3, "cannot happen (at Akrantiain#convert)");
    }
  }

  public findModule(name: ModuleName): Module | undefined {
    for (let module of this.explicitModules) {
      if (module.name !== null && Module.equalsModuleName(module.name, name)) {
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