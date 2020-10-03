// @ts-nocheck

import {
  Akrantiain,
  Circumflex,
  Definition,
  Disjunction,
  Identifier,
  ModuleChain,
  Quote,
  Rule,
  Sequence,
  Slash
} from "../source/class";
import {
  Parsers
} from "../source/parser/parsers";


describe("parsers", () => {
  test("akrantiain: simple", () => {
    let result = Parsers.akrantiain.tryParse(`
      vowel = "a" | "e" | "i" | "o" | "u";
      vowel -> /@/;
    `.trim());
    console.log(result.toString());
    expect(result).toBeInstanceOf(Akrantiain);
    expect(result.explicitModules.length).toBe(0);
    expect(result.implicitModule.definitions.length).toBe(1);
    expect(result.implicitModule.rules.length).toBe(1);
  });
  test("akrantiain: complex", () => {
    let result = Parsers.akrantiain.tryParse(`
      % foo => bar {
        def = "a" | "b" "c" | "d";
        foo = def def | def ("hoge" "fuga" | "piyo") | "mofu"
        @FallThru;
        "rule" -> /mofu/; !"before" foo def -> /same/ $
        other = "other";
        @use_NFD
      }
      % neko {
        mochi = "m" "o" | "c" "h" "i"
        !"a" mochi !("a" | "b") -> /x/;
      }
      %% foo => bar >> neko;
    `.trim());
    console.log(result.toString());
    expect(result).toBeInstanceOf(Akrantiain);
    expect(result.explicitModules.length).toBe(2);
    expect(result.explicitModules[0].definitions.length).toBe(3);
    expect(result.explicitModules[0].rules.length).toBe(2);
  });
  test("definition", () => {
    let result = Parsers.definition.tryParse(`identifier = "foo" | "bar" | "baz" "two" "three";`);
    expect(result).toBeInstanceOf(Definition);
  });
  test("rule: simple 1", () => {
    let result = Parsers.rule.tryParse(`"u" "g" !vowel -> /u/ /w/;`);
    expect(result).toBeInstanceOf(Rule);
    expect(result.selections.length).toBe(2);
    expect(result.leftCondition).toBe(undefined);
    expect(result.rightCondition).toBeInstanceOf(Disjunction);
    expect(result.phonemes.length).toBe(2);
    expect(result.phonemes[1]).toBeInstanceOf(Slash);
    expect(result.phonemes[1].text).toBe("w");
  });
  test("rule: simple 2", () => {
    let result = Parsers.rule.tryParse(`"n" ^ ("m"|"p") -> /m/ $;`);
    expect(result).toBeInstanceOf(Rule);
  });
  test("rule: complex", () => {
    let result = Parsers.rule.tryParse(`!left some ^ ("com" pl | "ex") exam "ple" ^ !("r" | "i" "\\"g\\""| ht) -> /m/ $ /3/ /4/ /\\/5\\// $;`);
    console.log(result.toString());
    expect(result).toBeInstanceOf(Rule);
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
  test("module chain: simple", () => {
    let result = Parsers.moduleChain.tryParse(`%% A >> B >> C;`);
    expect(result).toBeInstanceOf(ModuleChain);
    expect(result.modules.length).toBe(3);
    expect(result.modules[1].name).toBe("B");
    expect(result.modules[2].name).toBe("C");
  });
  test("module chain: complex", () => {
    let result = Parsers.moduleChain.tryParse(`%% A >> (foo => bar => baz) >> B >> no => paren => no => paren >> C >> D;`);
    console.log(result.toString());
    expect(result).toBeInstanceOf(ModuleChain);
    expect(result.modules.length).toBe(9);
  });
});