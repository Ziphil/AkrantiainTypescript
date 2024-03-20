//

import {ModuleName} from ".";


export class ModuleChain {

  public readonly names: ReadonlyArray<ModuleName>;

  public constructor(names: Array<ModuleName>) {
    this.names = names;
  }

  public toString(): string {
    let string = "";
    string += `%% ${this.names.join(" >> ")};`;
    return string;
  }

}