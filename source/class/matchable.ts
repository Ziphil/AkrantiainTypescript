//

import {
  Identifier,
  Module,
  Stat
} from ".";


export interface Matchable {

  // ちょうど from で与えられた位置から右向きにマッチするかどうかを調べます。
  // マッチした場合はマッチした範囲の右端のインデックス (範囲にそのインデックス自体は含まない) を返します。
  // マッチしなかった場合は -1 を返します。
  matchRight(stat: Stat, from: number, module: Module): number;

  // ちょうど to で与えられた位置から左向きにマッチするかどうかを調べます。
  // マッチした場合はマッチした範囲の左端のインデックス (範囲にそのインデックス自体を含む) を返します。
  // マッチしなかった場合は -1 を返します。
  matchLeft(stat: Stat, to: number, module: Module): number;

  // 対応する変換先文字列が必要ならば true を返し、そうでなければ false を返します。
  // 現状、変換先文字列を必要としないのは「^」(とそれ 1 つだけから成る Sequence か Disjunction) だけなので、この場合に false を返し、それ以外の場合では true を返します。
  isConcrete(): boolean;

  // モジュール内に存在しない識別子を含んでいればそれを返し、そうでなければ undefined を返します。
  findUnknownIdentifier(module: Module): Identifier | undefined;

  // 識別子定義文を全て展開したときに identifiers に含まれる識別子が含まれていればそれを返し、そうでなければ undefined を返します。
  // 識別子の定義が循環参照していないかを調べるのに用いられます。
  findCircularIdentifier(identifiers: Array<Identifier>, module: Module): Identifier | undefined;

}