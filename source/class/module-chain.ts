//


export class ModuleName {

  public text: string | [string, string];

  public constructor(text: string, extraText?: string) {
    if (extraText !== undefined) {
      this.text = [text, extraText];
    } else {
      this.text = text;
    }
  }

  public equals(that: ModuleName): boolean {
    if (typeof this.text === "string" && typeof that.text === "string") {
      return this.text === that.text;
    } else if (Array.isArray(this.text) && Array.isArray(that.text)) {
      return this.text[0] === that.text[0] && this.text[1] === that.text[1];
    } else {
      return false;
    }
  }

  public toString(): string {
    let string = "";
    if (typeof this.text === "string") {
      string += this.text.toString();
    } else {
      string += this.text.join(" => ");
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
    string +=  `%% ${this.names.join(" >> ")};`;
    return string;
  }

}