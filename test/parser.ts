// @ts-nocheck

import {
  Circumflex,
  Disjunction,
  Identifier,
  Quote,
  Sequence
} from "../source/class";
import {
  Parsers
} from "../source/parser/parsers";


describe("Parsers", () => {
  test("Disjunction: Simple 1", () => {
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
  test("Disjunction: Simple 2", () => {
    let result = Parsers.disjunction.tryParse(`"foo" "bar" ^ literal | "baz" ^ some some`);
    expect(result).toBeInstanceOf(Disjunction);
    expect(result.matchables.length).toBe(2);
    expect(result.matchables[0]).toBeInstanceOf(Sequence);
    expect(result.matchables[0].matchables.length).toBe(4);
    expect(result.matchables[0].matchables[2]).toBeInstanceOf(Circumflex);
  });
  test("Disjunction: Complex", () => {
    let result = Parsers.disjunction.tryParse(`"string" (nest | nest ^ (nest) (nest | nest)) (nest nest) | "right"`);
    console.log(result.toString());
    expect(result).toBeInstanceOf(Disjunction);
  });
});