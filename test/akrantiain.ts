//

import {
  Akrantiain
} from "../source/class";


describe("normal", () => {
  test("simple", () => {
    let akrantiain = Akrantiain.load(`
      "a" -> /X/; "b" -> /Y/; "c" -> /Z/;
    `);
    expect(akrantiain.convert("abc")).toBe("XYZ");
    expect(akrantiain.convert("ab ca bbc")).toBe("XY ZX YYZ");
    expect(() => akrantiain.convert("aka")).toThrow();
  });
  test("simple module", () => {
    let akrantiain = Akrantiain.load(`
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

describe("examples by the original repository", () => {
  test("syntax", () => {
    let akrantiain = Akrantiain.load(`
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
    let akrantiain = Akrantiain.load(`
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
    let akrantiain = Akrantiain.load(`
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