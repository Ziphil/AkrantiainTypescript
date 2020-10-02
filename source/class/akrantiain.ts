//

import {
  Module
} from ".";


export class Akrantiain {

  private implicitModule!: Module;
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

  public toString(indent: number = 0): string {
    let string = "";
    string += this.implicitModule.toString(indent);
    for (let module of this.explicitModules) {
      string += module.toString(indent);
    }
    return string;
  }

}