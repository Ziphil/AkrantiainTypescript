// @ts-nocheck

import {
  Circumflex,
  Definition,
  Disjunction,
  Identifier,
  Quote,
  Sequence
} from "../source/class";
import {
  Parsers
} from "../source/parser/parsers";


describe("Parsers", () => {
  test("module chain: simple", () => {
    let result = Parsers.moduleChain.tryParse(`%% A >> B >> C;`);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
    expect(result[1].name).toBe("B");
    expect(result[2].name).toBe("C");
  });
  test("module chain: complex", () => {
    let result = Parsers.moduleChain.tryParse(`%% A >> (foo => bar => baz) >> B >> no => paren => no => paren >> C >> D;`);
    console.log(result.join(" >> "));
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(9);
  });
  test("definition", () => {
    let result = Parsers.definition.tryParse(`identifier = "foo" | "bar" | "baz" "two" "three";`);
    expect(result).toBeInstanceOf(Definition);
  });
  test("disjunction: simple 1", () => {
    let result = Parsers.disjunction.tryParse(`"foo" | "bar" | "baz" | literal`);
    expect(result).toBeInstanceOf(Disjunction);
    expect(result.matchables.length).toBe(4);
    expect(result.matchables[0]).toBeInstanceOf(Sequence);
    expect(result.matchables[0].matchables.length).toBe(1);
    expect(result.matchables[0].matchables[0]).toBeInstanceOf(Quote);
    expect(result.matchables[3]).toBeInstanceOf(Sequence);
    expect(result.matchables[3].matchables.length).toBe(1);
    expect(result.matchables[3].matchables[0]).toBeInstanceOf(Identifier);
  });
  test("disjunction: simple 2", () => {
    let result = Parsers.disjunction.tryParse(`"foo" "bar" ^ literal | "baz" ^ some some`);
    expect(result).toBeInstanceOf(Disjunction);
    expect(result.matchables.length).toBe(2);
    expect(result.matchables[0]).toBeInstanceOf(Sequence);
    expect(result.matchables[0].matchables.length).toBe(4);
    expect(result.matchables[0].matchables[2]).toBeInstanceOf(Circumflex);
  });
  test("disjunction: complex", () => {
    let result = Parsers.disjunction.tryParse(`"string" (nest | nest ^ (nest) (nest | nest)) (nest nest) | "right"`);
    console.log(result.toString());
    expect(result).toBeInstanceOf(Disjunction);
  });
});