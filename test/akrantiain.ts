//

import {Akrantiain} from "../source/class";


describe("normal", () => {
  test("simple", () => {
    const akrantiain = Akrantiain.load(`
      "a" -> /X/; "b" -> /Y/; "c" -> /Z/;
    `);
    expect(akrantiain.convert("abc")).toBe("XYZ");
    expect(akrantiain.convert("ab ca bbc")).toBe("XY ZX YYZ");
    expect(() => akrantiain.convert("aka")).toThrow();
  });
  test("case conversion", () => {
    const akrantiain = Akrantiain.load(`
      "A" -> /X/; "b" -> /Y/; "C" -> /Z/;
      "Ж" -> /1/; "ш" -> /2/; "Θ" -> /3/; "ψ" -> /4/;
    `);
    expect(akrantiain.convert("AbC aBc")).toBe("XYZ XYZ");
    expect(akrantiain.convert("ЖшΘψ жШθΨ")).toBe("1234 1234");
  });
  test("case sensitive", () => {
    const akrantiain = Akrantiain.load(`
      @CASE_SENSITIVE
      "A" -> /X/; "b" -> /Y/; "C" -> /Z/;
    `);
    expect(akrantiain.convert("AbC")).toBe("XYZ");
    expect(() => akrantiain.convert("a")).toThrow();
  });
  test("diacritic", () => {
    const akrantiain = Akrantiain.load(`
      ("ë" | "ä") -> /S/;  # single
      ("ë" | "ä") -> /C/;  # combining
    `);
    expect(akrantiain.convert("ëäëäëä ëäëäëä")).toBe("SSSSSS CCCCCC");
  });
  test("diacritic (normalize)", () => {
    const akrantiain = Akrantiain.load(`
      @USE_NFD;
      ("ë" | "ä") -> /S/;  # single
      ("ë" | "ä") -> /C/;  # combining
    `);
    expect(akrantiain.convert("ëäëäëä ëäëäëä")).toBe("SSSSSS SSSSSS");
  });
  test("comment 1", () => {
    const akrantiain = Akrantiain.load(`
      "a" -> /X/; # comment
      # comment comment
      "b" -> /Y/;#comment
      # "c" -> /Z/;
    `);
    expect(akrantiain.convert("abab")).toBe("XYXY");
    expect(() => akrantiain.convert("c")).toThrow();
  });
  test("comment 2", () => {
    const akrantiain = Akrantiain.load(`
      # before
      # comment comment
      % foo { "a" -> /X/; }
      %% foo;
    `);
    expect(akrantiain.convert("a")).toBe("X");
  });
  test("simple module", () => {
    const akrantiain = Akrantiain.load(`
      % upper {
        "a" -> /A/; "b" -> /B/; "c" -> /C/;
      }
      % latin => cyrillic {
        "A" -> /Д/; "B" -> /Ж/; "C" -> /Ш/;
      }
      % cyrillic => greek {
        "Д" -> /Δ/; "Ж" -> /Ξ/; "Ш" -> /Ω/;
      }
      %% upper >> latin => cyrillic => greek;
    `);
    expect(akrantiain.convert("abc")).toBe("ΔΞΩ");
    expect(akrantiain.convert("ab ca bbc")).toBe("ΔΞ ΩΔ ΞΞΩ");
    expect(() => akrantiain.convert("aka")).toThrow();
  });
});

describe("extension", () => {
  test("simple", () => {
    const akrantiain = Akrantiain.load(`
      vowel = "a" | "e" | "i" | "o" | "u";
      vowel2 = vowel vowel;
      vowel3 = vowel2 vowel;
      vowel4 = vowel2 vowel2;
      "s" vowel3 -> /before3/ //;
      "s" vowel2 -> /before2/ //;
      "t" !vowel2 -> /not2/;
      "t" !vowel3 -> /not3/;
      "s" -> /S/; "t" -> /T/;
      vowel4 -> /[4]/; vowel3 -> /[3]/; vowel2 -> /[2]/; vowel -> /[1]/;
    `);
    expect(akrantiain.convert("aeia aou au oa u")).toBe("[4] [3] [2] [2] [1]");
    expect(akrantiain.convert("aeioaeioaei")).toBe("[4][4][3]");
    expect(akrantiain.convert("saei saa souu")).toBe("before3 before2 before3");
    expect(akrantiain.convert("ta tei tuao")).toBe("not2[1] not3[2] T[3]");
  });
  test("right-hand quote", () => {
    const akrantiain = Akrantiain.load(`
      "a" -> "X"; "b" -> "Y";
    `);
    expect(akrantiain.convert("aba")).toBe("XYX");
  });
});

describe("errors", () => {
  test("unresolved module name", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        % foo { %% bar => baz; }
        % bar { "b" -> /B/; }
        % baz { "c" -> /C/; }
        "d" -> /D/;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1000);
    }
  });
  test("circular module name", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        % foo { %% bar; }
        % bar { %% baz; }
        % baz { %% qux; }
        % qux { %% bar; }
        %% foo;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1001);
    }
  });
  test("no implicit module", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        % foo { "a" -> /A/; }
        % bar { "b" -> /B/; }
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1002);
    }
  });
  test("more than one implicit modules", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        @FALL_THROUGH;
        % foo { "a" -> /A/; }
        % bar { "b" -> /B/; }
        "c" -> /C/;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1003);
    }
  });
  test("duplicate module name", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        % foo => bar { "a" -> /A/; }
        % bar { "b" -> /B/; }
        % foo => bar { "c" -> /C/; }
        "d" -> /D/;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1004);
    }
  });
  test("module chain and sentences", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        % error {
          "a" -> /A/;
          %% dummy;
        }
        % dummy { "x" -> /X/; }
        %% error;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1005);
    }
  });
  test("mutiple module chains", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        % module { "a" -> /A/; }
        %% module;
        %% module;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1006);
    }
  });
  test("unresolved identifier (in definition)", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        foo = "a" | "b";
        bar = undefined;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1100);
    }
  });
  test("unresolved identifier (in rule)", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        foo = "a" | "b";
        foo -> /a/;
        foo undefined -> /b/ /c/;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1101);
    }
  });
  test("circular identifier", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        foo = bar | circular;
        circular = bar | baz;
        baz = foo;
        bar = "a" | "b";
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1102);
    }
  });
  test("duplicate identifier", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        foo = "a" | "b";
        bar = "c";
        baz = "d";
        foo = "e" | "f";
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1103);
    }
  });
  test("mismatched terms", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        !"a" "b" "c" !"d" -> /b/ /c/ /?/;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1104);
    }
  });
  test("non-concrete", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        "a" "b" "c" -> $ $ $;
      `);
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(1105);
    }
  });
  test("no rule", () => {
    expect.assertions(2);
    try {
      const akrantiain = Akrantiain.load(`
        "a" -> /X/; "b" -> /Y/; "c" -> /Z/;
      `);
      akrantiain.convert("d");
    } catch (error) {
      expect(error.name).toBe("AkrantiainError");
      expect(error.code).toBe(2000);
    }
  });
});

describe("suspicious behaviours", () => {
  test("aimez", () => {
    const akrantiain = Akrantiain.load(`
      "ez" ^ -> /e/;
      "ai" -> /ɛ/;
      "m" ("a" | "e" | "i" | "o" | "u" | "y") -> /m/ $
    `);
    expect(akrantiain.convert("aimez")).toBe("ɛme");
  });
  test("empty string 1", () => {
    const akrantiain = Akrantiain.load(`
      "" -> /X/; "a" -> /A/
    `);
    expect(akrantiain.convert("aaa a aa")).toBe("XAXAXAX XAX XAXAX");
  });
  test("empty string 2", () => {
    const akrantiain = Akrantiain.load(`
      "" "n" -> /c/ $
      "" "n" -> /b/ $
      "n" -> /n/
    `);
    expect(akrantiain.convert("nnn nnn nnnn nn")).toBe("bcbnbcbnbcbn bcbnbcbnbcbn bcbnbcbnbcbnbcbn bcbnbcbn");
    expect(akrantiain.convert("n n n n nnn nnn")).toBe("bcbn bcbn bcbn bcbn bcbnbcbnbcbn bcbnbcbnbcbn");
  });
});

describe("examples by the original repository", () => {
  test("syntax", () => {
    const akrantiain = Akrantiain.load(`
      % baz { %% foobar >> (foo) >> (A => B => C) ; }
      %foobar {
        @FALL_THRU;
        "a" -> /\u3042/
      }
      % foo {
        @CASE_SENSITIVE;
        "\u3042" -> /a/
        sample = "foo" | "bar" "baz" | "foobar";
        PUNCTUATION = "." | "," | "!" | "?";
        "n" ^ ("m"|"p") -> /m/ $
        "m" -> /m/
        "p" -> /p/
        "n" -> /n/
        "a" -> /a/
        "i" -> /i/;
        "u" -> /u/
        "g" -> /g/
      }
      % A=>B {
        @FALLTHRU;
        vowel = "a" | "i";
        "u" "g" !vowel -> /u/ /u/;
      }
      % B=>C {
        @FALL_THROUGH;
        "a" -> /aa/;
      }
      %% baz;
    `);
    expect(akrantiain.convert("aiu")).toBe("aaiu");
    expect(akrantiain.convert("a! gug, mun. Mip")).toBe("aa  guu  mum  mip");
    expect(akrantiain.convert("papa")).toBe("paapaa");
  });
  test("lineparine", () => {
    const akrantiain = Akrantiain.load(`
      % font_transcription => IPA {
        @CASE_SENSITIVE;
        vowel = "a" | "i" | "u" | "e" | "o" | "y"
        palat = "X" | "x" | "ch" | "sh"
        PUNCTUATION = "." | "," | "!" | "?"
        ^ "edioll" ^ -> /edjol/
        ^ "wioll" ^ -> /wjol/
        ^ "woll" ^ -> /wol/
        "vsfafgh" -> /vusfafuguh/
        "simfgh" -> /zimfuguh/
        "sh" -> /ʃ/
        palat "i" vowel -> $ // $
        vowel "i" !"r" -> $ /j/
        palat "i" "u" -> $ $ /u/
        vowel "u" !"r" -> $ /w/
        "ni" vowel -> /ɲ/ $;
        "nj" vowel -> /ɲ/ $;
        "i" vowel -> /j/ $
        "s" "j" !vowel -> /z/ $;
        "s" !vowel -> /s/
        !vowel "j" !vowel -> /i/
        vowel "y" !vowel -> $ /ɥ/
        !vowel ("rkh" | "Rkh") -> /ʁ/
        !vowel ("r" | "R") -> /r/
        vowel "r" -> $ /ː/
        "y" vowel -> /ɥ/ $
        "tz" -> /t͡st͡s/;
        "sx" -> /ʃʃ/;
        "dX" -> /d͡ʑd͡ʑ/;
        "en" ^ -> /ən/;
        "ts" -> /t͡s/
        "ch" -> /t͡ʃ/
        "ng" -> /ŋ/
        "th" -> /θ/
        "dh" -> /ð/
        "kh" -> /x/
        "rl" -> /ɹ/
        "Rl" -> /ɹ/
        "ph" -> /p/
        "a" -> /a/; "i" -> /i/; "u" -> /u/; "e" -> /e/; "o" -> /o/; "y" -> /y/
        "p" -> /p/; "b" -> /b/; "t" -> /t/; "d" -> /d/; "k" -> /k/; "g" -> /g/;
        "m" -> /m/; "n" -> /n/; "f" -> /f/; "v" -> /v/;
        "c" -> /s/; "z" -> /t͡s/;
        "s" -> /z/
        "x" -> /ʃ/
        "h" -> /h/
        "w" -> /w/
        "j" -> /j/
        "l" -> /l/
        "q" -> /kw/
        "'" -> //
        "X" -> /d͡ʑ/
        "F"  -> /ɸ/
        "V"  -> /β/
      }
      %% font_transcription => IPA;
    `);
    expect(akrantiain.convert("sashimi")).toBe("zaʃimi");
    expect(akrantiain.convert("stoxiet")).toBe("stoʃet");
    expect(akrantiain.convert("exiu")).toBe("eʃu");
    expect(akrantiain.convert("selxiunk")).toBe("zelʃunk");
    expect(akrantiain.convert("mi")).toBe("mi");
    expect(akrantiain.convert("liaxa")).toBe("ljaʃa");
    expect(akrantiain.convert("lineparine")).toBe("linepaːine");
    expect(akrantiain.convert("krante")).toBe("krante");
    expect(akrantiain.convert("lkurftlesse'd")).toBe("lkuːftleszed");
    expect(akrantiain.convert("xorlnemj")).toBe("ʃoːlnemi");
    expect(akrantiain.convert("ayplerde")).toBe("aɥpleːde");
    expect(akrantiain.convert("akrantiain")).toBe("akrantjajn");
    expect(akrantiain.convert("aus")).toBe("aws");
    expect(akrantiain.convert("panqa'dy")).toBe("pankwady");
  });
  test("base conversion", () => {
    const akrantiain = Akrantiain.load(`
      % i {
        @FALL_THROUGH;
        a = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "A" | "B";
        ^ "" a -> /A/ $;
      }
      % i4 { %%i>>i>>i>>i;}
      % i16 { %%i4>>i4>>i4>>i4;}
      % i64 { %%i16>>i16>>i16>>i16;}
      % b {
        @FALL_THROUGH;
        "A0" -> /0A/;
        "A1" -> /0B/;
        "A2" -> /1A/;
        "A3" -> /1B/;
        "A4" -> /2A/;
        "A5" -> /2B/;
        "A6" -> /3A/;
        "A7" -> /3B/;
        "A8" -> /4A/;
        "A9" -> /4B/;
        "B0" -> /5A/;
        "B1" -> /5B/;
        "B2" -> /6A/;
        "B3" -> /6B/;
        "B4" -> /7A/;
        "B5" -> /7B/;
        "B6" -> /8A/;
        "B7" -> /8B/;
        "B8" -> /9A/;
        "B9" -> /9B/;
      }
      % b4 { %%b>>b>>b>>b;}
      % b16 { %%b4>>b4>>b4>>b4;}
      % b64 { %%b16>>b16>>b16>>b16;}
      % f {
        @FALL_THROUGH;
        ^ "0" -> //;
        ^ "A" -> //;
      }
      % f4 { %%f>>f>>f>>f;}
      % f16 { %%f4>>f4>>f4>>f4;}
      % f64 { %%f16>>f16>>f16>>f16;}
      % e {
        "A" -> /0/;
        "B" -> /1/;
      }
      %% i64 >> b64 >> f64 >> e;
    `);
    expect(akrantiain.convert("26")).toBe("11010");
    expect(akrantiain.convert("17")).toBe("10001");
    expect(akrantiain.convert("44")).toBe("101100");
    expect(akrantiain.convert("113")).toBe("1110001");
    expect(akrantiain.convert("804")).toBe("1100100100");
    expect(akrantiain.convert("181")).toBe("10110101");
    expect(akrantiain.convert("844")).toBe("1101001100");
    expect(akrantiain.convert("32640")).toBe("111111110000000");
  });
});