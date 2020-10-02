//

import {
  Dollar,
  Matchable,
  Slash
} from ".";


export class Rule {

  public selections: Array<Matchable>;
  public leftCondition?: Matchable;
  public rightCondition?: Matchable;
  public phonemes: Array<Phoneme>;

  public constructor(selections: Array<Matchable>, leftCondition: Matchable | undefined, rightCondition: Matchable | undefined, phonemes: Array<Phoneme>) {
    this.selections = selections;
    this.leftCondition = leftCondition;
    this.rightCondition = rightCondition;
    this.phonemes = phonemes;
  }

  public toString(): string {
    let string = "";
    if (this.leftCondition) {
      string += `${this.leftCondition.toString()} `;
    }
    string += this.selections.join(" ");
    if (this.rightCondition) {
      string += ` ${this.rightCondition.toString()}`;
    }
    string += " -> ";
    string += this.phonemes.join(" ");
    return string;
  }

}


export type RuleLeft = {selections: Array<Matchable>, leftCondition?: Matchable, rightCondition?: Matchable};
export type RuleRight = Array<Phoneme>;
export type Phoneme = Slash | Dollar;