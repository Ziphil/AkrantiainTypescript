//

import {
  Identifier,
  Matchable
} from ".";


export class Definition {

  public identifier: Identifier;
  public content: Matchable;

  public constructor(identifier: Identifier, content: Matchable) {
    this.identifier = identifier;
    this.content = content;
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