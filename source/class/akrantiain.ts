//

import {
  Module
} from ".";


export class Akrantiain {

  public implicitModule: Module;
  public modules: Array<Module>;

  public constructor(implicitModule: Module, modules: Array<Module>) {
    this.implicitModule = implicitModule;
    this.modules = modules;
  }

  public toString(indent: number = 0) {
    let string = "";
    string += this.implicitModule.toString(indent);
    for (let modules of this.modules) {
      string += modules.toString(indent);
    }
    return string;
  }
  
}