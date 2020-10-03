//

import {
  Identifier
} from ".";


export class ModuleName {

  public identifier: Identifier | [Identifier, Identifier];

  public constructor(identifier: Identifier, extraIdentifier?: Identifier) {
    if (extraIdentifier !== undefined) {
      this.identifier = [identifier, extraIdentifier];
    } else {
      this.identifier = identifier;
    }
  }

  public equals(that: ModuleName): boolean {
    if (this.identifier instanceof Identifier && that.identifier instanceof Identifier) {
      return this.identifier.equals(that.identifier);
    } else if (Array.isArray(this.identifier) && Array.isArray(that.identifier)) {
      return this.identifier[0].equals(that.identifier[0]) && this.identifier[1].equals(that.identifier[1]);
    } else {
      return false;
    }
  }

  public toString(): string {
    let string = "";
    if (this.identifier instanceof Identifier) {
      string += this.identifier.toString();
    } else {
      string += `(${this.identifier.join(" => ")})`;
    }
    return string;
  }

}


export class ModuleChain {

  public names: Array<ModuleName>;

  public constructor(names: Array<ModuleName>) {
    this.names = names;
  }

  public toString(): string {
    let string = "";
    string += this.names.join(" >> ");
    return string;
  }

}