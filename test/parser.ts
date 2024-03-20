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
import {AkrantiainParser} from "../source/parser/parser";


const parser = new AkrantiainParser();

describe("akrantiain", () => {
  test("simple", () => {
    const result = parser.root.tryParse(`
      vowel = "a" | "e" | "i" | "o" | "u";
      vowel -> /@/;
    `.trim());
    expect(result).toBeInstanceOf(Akrantiain);
    expect(result.explicitModules.length).toBe(0);
    expect(result.implicitModule.definitions.length).toBe(1);
    expect(result.implicitModule.rules.length).toBe(1);
  });
  test("complex", () => {
    const result = parser.root.tryParse(`
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
    expect(result).toBeInstanceOf(Akrantiain);
    expect(result.explicitModules.length).toBe(2);
    expect(result.explicitModules[0].definitions.length).toBe(3);
    expect(result.explicitModules[0].rules.length).toBe(2);
  });
});

describe("definition", () => {
  test("simple", () => {
    const result = parser.definition.tryParse(`identifier = "foo" | "bar" | "baz" "two" "three";`);
    expect(result).toBeInstanceOf(Definition);
  });
});

describe("rule", () => {
  test("simple 1", () => {
    const result = parser.rule.tryParse(`"u" "g" !vowel -> /u/ /w/;`);
    expect(result).toBeInstanceOf(Rule);
    expect(result.selections.length).toBe(2);
    expect(result.phonemes.length).toBe(2);
    expect(result.phonemes[1]).toBeInstanceOf(Slash);
    expect(result.phonemes[1].text).toBe("w");
  });
  test("simple 2", () => {
    const result = parser.rule.tryParse(`"n" ^ ("m"|"p") -> /m/ $;`);
    expect(result).toBeInstanceOf(Rule);
  });
  test("complex", () => {
    const result = parser.rule.tryParse(`!left some ^ ("com" pl | "ex") exam "ple" ^ !("r" | "i" "\\"g\\""| ht) -> /m/ $ /\\/5\\// $;`);
    expect(result).toBeInstanceOf(Rule);
  });
  test("normalize simple 1", () => {
    const result = parser.rule.tryParse(`"a" "b" "c" "d" "e" "f" -> $ $ /c/ /d/ /e/ $;`);
    expect(result.toString()).toBe(`["a" "b"] "c" "d" "e" ["f"] -> /c/ /d/ /e/;`);
  });
  test("normalize simple 2", () => {
    const result = parser.rule.tryParse(`a "b" "c" -> $ $ /c/;`);
    expect(result.toString()).toBe(`[a "b"] "c" -> /c/;`);
  });
  test("normalize simple 3", () => {
    const result = parser.rule.tryParse(`a "b" "c" -> /a/ /b/ $;`);
    expect(result.toString()).toBe(`a "b" ["c"] -> /a/ /b/;`);
  });
  test("normalize circumplex", () => {
    const result = parser.rule.tryParse(`"a" ^ ^ "b" ^ "c" ^ "d" ^ "e" "f" ^ "g" -> $ $ /c/ /d/ $ $ $;`);
    expect(result.toString()).toBe(`["a" ^ ^ "b" ^] "c" ^ "d" [^ "e" "f" ^ "g"] -> /c/ /d/;`);
  });
  test("normalize complex", () => {
    const result = parser.rule.tryParse(`!"l" "a" ^ ^ "b" ^ "c" ^ "d" ^ "e" "f" ^ "g" !"r" -> $ $ /c/ /d/ $ $ $;`);
    expect(result.toString()).toBe(`[!("l") "a" ^ ^ "b" ^] "c" ^ "d" [^ "e" "f" ^ "g" !("r")] -> /c/ /d/;`);
  });
});

describe("disjunction", () => {
  test("simple 1", () => {
    const result = parser.disjunction.tryParse(`"foo" | "bar" | "baz" | literal`);
    expect(result).toBeInstanceOf(Disjunction);
    expect(result.matchables.length).toBe(4);
    expect(result.matchables[0]).toBeInstanceOf(Sequence);
    expect(result.matchables[0].matchables.length).toBe(1);
    expect(result.matchables[0].matchables[0]).toBeInstanceOf(Quote);
    expect(result.matchables[3]).toBeInstanceOf(Sequence);
    expect(result.matchables[3].matchables.length).toBe(1);
    expect(result.matchables[3].matchables[0]).toBeInstanceOf(Identifier);
  });
  test("simple 2", () => {
    const result = parser.disjunction.tryParse(`"foo" "bar" ^ literal | "baz" ^ some some`);
    expect(result).toBeInstanceOf(Disjunction);
    expect(result.matchables.length).toBe(2);
    expect(result.matchables[0]).toBeInstanceOf(Sequence);
    expect(result.matchables[0].matchables.length).toBe(4);
    expect(result.matchables[0].matchables[2]).toBeInstanceOf(Circumflex);
  });
  test("complex", () => {
    const result = parser.disjunction.tryParse(`"string" (nest | nest ^ (nest) (nest | nest)) (nest nest) | "right"`);
    expect(result).toBeInstanceOf(Disjunction);
  });
});

describe("module chain", () => {
  test("simple", () => {
    const result = parser.moduleChain.tryParse(`%% A >> B >> C;`);
    expect(result).toBeInstanceOf(ModuleChain);
    expect(result.names.length).toBe(3);
    expect(result.names[1].text).toBe("B");
    expect(result.names[2].text).toBe("C");
  });
  test("complex", () => {
    const result = parser.moduleChain.tryParse(`%% A >> (foo => bar => baz) >> B >> no => paren => no => paren >> C >> D;`);
    expect(result).toBeInstanceOf(ModuleChain);
    expect(result.names.length).toBe(9);
  });
});