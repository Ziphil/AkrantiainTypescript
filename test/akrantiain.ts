//

import {
  Akrantiain
} from "../source/class";


describe("convert", () => {
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