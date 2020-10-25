//

import {
  Identifier,
  Matchable,
  Module
} from ".";


export class Definition {

  public readonly identifier: Identifier;
  public readonly content: Matchable;

  public constructor(identifier: Identifier, content: Matchable) {
    this.identifier = identifier;
    this.content = content;
  }

  public findUnknownIdentifier(module: Module): Identifier | undefined {
    return this.content.findUnknownIdentifier(module);
  }

  public findCircularIdentifier(identifiers: Array<Identifier>, module: Module): Identifier | undefined {
    let nextIdentifiers = [...identifiers, this.identifier];
    return this.content.findCircularIdentifier(nextIdentifiers, module);
  }

  public toString(): string {
    let string = "";
    string += this.identifier.toString();
    string += " = ";
    string += this.content.toString();
    string += ";";
    return string;
  }

}