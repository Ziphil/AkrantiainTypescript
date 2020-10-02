//

import {
  Module
} from ".";


export class Akrantiain {

  private implicitModule: Module;
  private explicitModules: Array<Module>;

  public constructor(implicitModule: Module, explicitModules: Array<Module>) {
    this.implicitModule = implicitModule;
    this.explicitModules = explicitModules;
  }

  public toString(indent: number = 0): string {
    let string = "";
    string += this.implicitModule.toString(indent);
    for (let module of this.explicitModules) {
      string += module.toString(indent);
    }
    return string;
  }

}