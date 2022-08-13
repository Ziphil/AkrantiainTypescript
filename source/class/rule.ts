//

import {
  AkrantiainError,
  Dollar,
  Identifier,
  Matchable,
  Module,
  Quote,
  Sequence,
  Slash,
  Stat,
  StatElement
} from ".";


export class Rule {

  private readonly selections: ReadonlyArray<Matchable>;
  private readonly leftCondition?: Matchable;
  private readonly rightCondition?: Matchable;
  private readonly phonemes: ReadonlyArray<Phoneme>;

  public constructor(ruleLeft: RuleLeft, ruleRight: RuleRight) {
    this.selections = ruleLeft.selections;
    this.leftCondition = ruleLeft.leftCondition;
    this.rightCondition = ruleLeft.rightCondition;
    this.phonemes = ruleRight;
    this.checkLength();
    this.checkConcrete();
    this.normalize();
  }

  public apply(stat: Stat, module: Module): Stat {
    const appliedGroup = new Stat([]);
    let pointer = 0;
    while (pointer <= stat.elements.length) {
      const result = this.applyOnce(stat, pointer, module);
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
    if (this.testLeftCondition(group, from, module)) {
      const result = this.applyOnceSelections(group, from, module);
      if (result !== null) {
        const to = result.to;
        if (this.testRightCondition(group, to, module)) {
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
    const addedElements = [];
    let pointer = from;
    let phonemeIndex = 0;
    for (const selection of this.selections) {
      const to = selection.matchRight(group, pointer, module);
      if (to >= 0) {
        if (selection.isConcrete()) {
          const phoneme = this.phonemes[phonemeIndex];
          if (phoneme instanceof Quote || phoneme instanceof Slash) {
            if (group.isNoneConverted(pointer, to)) {
              const addedElement = group.merge(pointer, to);
              addedElement.result = phoneme.text;
              addedElements.push(addedElement);
            } else {
              return null;
            }
          } else if (phoneme instanceof Dollar) {
            for (let i = pointer ; i < to ; i ++) {
              addedElements.push(group.elements[i]);
            }
          } else {
            throw new Error("This cannot happen");
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

  private testLeftCondition(group: Stat, to: number, module: Module): boolean {
    if (this.leftCondition !== undefined) {
      const leftStat = group.divide(0, to);
      const rightStat = group.divide(to, group.elements.length);
      return this.leftCondition.matchLeft(leftStat.plus(rightStat), leftStat.elements.length, module) >= 0;
    } else {
      return true;
    }
  }

  private testRightCondition(group: Stat, from: number, module: Module): boolean {
    if (this.rightCondition !== undefined) {
      const leftStat = group.divide(0, from);
      const rightStat = group.divide(from, group.elements.length);
      return this.rightCondition.matchRight(leftStat.plus(rightStat), leftStat.elements.length, module) >= 0;
    } else {
      return true;
    }
  }

  private checkLength(): void {
    let concreteSelectionLength = 0;
    const phonemeLength = this.phonemes.length;
    for (const selection of this.selections) {
      if (selection.isConcrete()) {
        concreteSelectionLength ++;
      }
    }
    if (concreteSelectionLength !== phonemeLength) {
      throw new AkrantiainError(1104, 333, `Mismatched number of concrete terms in left- and right-hand side: '${this}'`);
    }
  }

  // この規則によって何らかの変換が行われ得るかどうかをチェックします。
  // 現状では、右辺に「$」以外の文字列リテラルが 1 つ以上含まれているときに、何らかの変換が行われ得ると見なされます。
  private checkConcrete(): void {
    let concrete = false;
    for (const phoneme of this.phonemes) {
      if (!(phoneme instanceof Dollar)) {
        concrete = true;
      }
    }
    if (!concrete) {
      throw new AkrantiainError(1105, 336, `Right-hand side of a sentence consists solely of dollars: '${this}'`);
    }
  }

  // 先頭もしくは末尾から連続して変換先が「$」になっている部分を condtion に移動させます。
  // condition のチェックでは Stat の状態に関わらず入力を 1 文字ずつ走査するので、これによりいわゆる aimez バグに対処できます。
  private normalize(): void {
    let leftIndex = 0;
    let rightIndex = this.phonemes.length;
    for (let i = 0 ; i < this.phonemes.length ; i ++) {
      const phoneme = this.phonemes[i];
      if (!(phoneme instanceof Dollar)) {
        leftIndex = i;
        break;
      }
    }
    for (let i = this.phonemes.length - 1 ; i >= 0 ; i --) {
      const phoneme = this.phonemes[i];
      if (!(phoneme instanceof Dollar)) {
        rightIndex = i + 1;
        break;
      }
    }
    let leftSelectionIndex = 0;
    let rightSelectionIndex = this.selections.length;
    let leftConcreteCount = 0;
    let rightConcreteCount = 0;
    for (let i = 0 ; i < this.selections.length ; i ++) {
      const selection = this.selections[i];
      if (selection.isConcrete()) {
        leftConcreteCount ++;
      }
      if (leftConcreteCount >= leftIndex + 1) {
        leftSelectionIndex = i;
        break;
      }
    }
    for (let i = this.selections.length - 1 ; i >= 0 ; i --) {
      const selection = this.selections[i];
      if (selection.isConcrete()) {
        rightConcreteCount ++;
      }
      if (rightConcreteCount >= this.phonemes.length - rightIndex + 1) {
        rightSelectionIndex = i + 1;
        break;
      }
    }
    const nextSelections = this.selections.slice(leftSelectionIndex, rightSelectionIndex);
    const nextLeftCondition = (() => {
      if (this.leftCondition !== undefined) {
        return new Sequence([this.leftCondition, ...this.selections.slice(0, leftSelectionIndex)]);
      } else {
        if (leftSelectionIndex !== 0) {
          return new Sequence(this.selections.slice(0, leftSelectionIndex));
        } else {
          return undefined;
        }
      }
    })();
    const nextRightCondition = (() => {
      if (this.rightCondition !== undefined) {
        return new Sequence([...this.selections.slice(rightSelectionIndex, this.selections.length), this.rightCondition]);
      } else {
        if (rightSelectionIndex !== this.selections.length) {
          return new Sequence(this.selections.slice(rightSelectionIndex, this.selections.length));
        } else {
          return undefined;
        }
      }
    })();
    const nextPhonemes = this.phonemes.slice(leftIndex, rightIndex);
    const anyThis = this as any;
    anyThis.selections = nextSelections;
    anyThis.leftCondition = nextLeftCondition;
    anyThis.rightCondition = nextRightCondition;
    anyThis.phonemes = nextPhonemes;
  }

  public findUnknownIdentifier(module: Module): Identifier | undefined {
    for (const selection of this.selections) {
      const identifier = selection.findUnknownIdentifier(module);
      if (identifier !== undefined) {
        return identifier;
      }
    }
    if (this.leftCondition !== undefined) {
      const identifier = this.leftCondition.findUnknownIdentifier(module);
      if (identifier !== undefined) {
        return identifier;
      }
    }
    if (this.rightCondition !== undefined) {
      const identifier = this.rightCondition.findUnknownIdentifier(module);
      if (identifier !== undefined) {
        return identifier;
      }
    }
    return undefined;
  }

  public toString(): string {
    let string = "";
    if (this.leftCondition) {
      string += `[${this.leftCondition.toString()}] `;
    }
    string += this.selections.join(" ");
    if (this.rightCondition) {
      string += ` [${this.rightCondition.toString()}]`;
    }
    string += " -> ";
    string += this.phonemes.join(" ");
    string += ";";
    return string;
  }

}


export type RuleLeft = {selections: Array<Matchable>, leftCondition?: Matchable, rightCondition?: Matchable};
export type RuleRight = Array<Phoneme>;
export type Phoneme = Quote | Slash | Dollar;

type RuleResult = {addedElements: Array<StatElement>, to: number};