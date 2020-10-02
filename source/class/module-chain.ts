//

import {
  ModuleName
} from ".";


export class ModuleChain {

  public modules: Array<ModuleName>;

  public constructor(modules: Array<ModuleName>) {
    this.modules = modules;
  }

  public toString(): string {
    let string = "";
    string += this.modules.join(" >> ");
    return string;
  }

}