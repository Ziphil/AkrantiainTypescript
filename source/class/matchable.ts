//

import {
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

  // 変換先をもつならば true を返し、そうでなければ false を返します。
  isConcrete(): boolean;

}