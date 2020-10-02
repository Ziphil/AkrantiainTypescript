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

  public constructor(ruleLeft: RuleLeft, ruleRight: RuleRight) {
    this.selections = ruleLeft.selections;
    this.leftCondition = ruleLeft.leftCondition;
    this.rightCondition = ruleLeft.rightCondition;
    this.phonemes = ruleRight;
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
    string += ";";
    return string;
  }

}


export type RuleLeft = {selections: Array<Matchable>, leftCondition?: Matchable, rightCondition?: Matchable};
export type RuleRight = Array<Phoneme>;
export type Phoneme = Slash | Dollar;