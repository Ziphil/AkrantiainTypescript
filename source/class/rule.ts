//

import {
  Dollar,
  Matchable,
  Module,
  Slash,
  Stat,
  StatElement
} from ".";


export class Rule {

  private selections: Array<Matchable>;
  private leftCondition?: Matchable;
  private rightCondition?: Matchable;
  private phonemes: Array<Phoneme>;

  public constructor(ruleLeft: RuleLeft, ruleRight: RuleRight) {
    this.selections = ruleLeft.selections;
    this.leftCondition = ruleLeft.leftCondition;
    this.rightCondition = ruleLeft.rightCondition;
    this.phonemes = ruleRight;
  }

  public apply(stat: Stat, module: Module): Stat {
    let appliedGroup = new Stat([]);
    let pointer = 0;
    while (pointer <= stat.elements.length) {
      let result = this.applyOnce(stat, pointer, module);
      if (result !== null) {
        appliedGroup.elements.push(...result.addedElements);
        if (pointer < result.to) {
          pointer = result.to;
        } else {
          if (pointer < stat.elements.length) {
            appliedGroup.elements.push(stat.elements[pointer]);
          }
          pointer ++;
        }
      } else {
        if (pointer < stat.elements.length) {
          appliedGroup.elements.push(stat.elements[pointer]);
        }
        pointer ++;
      }
    }
    return appliedGroup;
  }

  // ちょうど from で与えられた位置から規則を適用します。
  // 規則がマッチして適用できた場合は、変化後の要素のリストとマッチした範囲の右側のインデックス (範囲にそのインデックス自体は含まない) を返します。
  // そもそも規則にマッチせず適用できなかった場合は null を返します。
  private applyOnce(group: Stat, from: number, module: Module): RuleResult | null {
    if (this.checkLeftCondition(group, from, module)) {
      let result = this.applyOnceSelections(group, from, module);
      if (result !== null) {
        let to = result.to;
        if (this.checkRightCondition(group, to, module)) {
          return result;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private applyOnceSelections(group: Stat, from: number, module: Module): RuleResult | null {
    let addedElements = [];
    let pointer = from;
    let phonemeIndex = 0;
    for (let selection of this.selections) {
      let to = selection.matchRight(group, pointer, module);
      if (to >= 0) {
        if (selection.isConcrete()) {
          let phoneme = this.phonemes[phonemeIndex];
          if (phoneme instanceof Slash) {
            if (group.isNoneConverted(pointer, to)) {
              let addedElement = group.merge(pointer, to);
              addedElement.result = phoneme.text;
              addedElements.push(addedElement);
            } else {
              return null;
            }
          } else if (phoneme instanceof Dollar) {
            for (let i = pointer ; i < to ; i ++) {
              addedElements.push(group.elements[i]);
            }
          }
          phonemeIndex ++;
        } else {
          for (let i = pointer ; i < to ; i ++) {
            addedElements.push(group.elements[i]);
          }
        }
        pointer = to;
      } else {
        return null;
      }
    }
    return {addedElements, to: pointer};
  }

  private checkLeftCondition(group: Stat, to: number, module: Module): boolean {
    if (this.leftCondition !== undefined) {
      let leftStat = group.divide(0, to);
      let rightStat = group.divide(to, group.elements.length);
      return this.leftCondition.matchLeft(leftStat.plus(rightStat), leftStat.elements.length, module) >= 0;
    } else {
      return true;
    }
  }

  private checkRightCondition(group: Stat, from: number, module: Module): boolean {
    if (this.rightCondition !== undefined) {
      let leftStat = group.divide(0, from);
      let rightStat = group.divide(from, group.elements.length);
      return this.rightCondition.matchRight(leftStat.plus(rightStat), leftStat.elements.length, module) >= 0;
    } else {
      return true;
    }
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

type RuleResult = {addedElements: Array<StatElement>, to: number};