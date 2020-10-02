//

import Parsimmon from "parsimmon";
import {
  Parser,
  alt,
  lazy,
  seq,
  seqMap
} from "parsimmon";
import {
  Akrantiain,
  Module,
  ModuleChain,
  ModuleName
} from "../class";
import {
  attempt,
  between
} from "./util";


export class Parsers {

  public static explicitModule: Parser<Module> = lazy(() => {
    let parser = seqMap(
      seq(Parsimmon.string("%"), Parsers.blank),
      Parsers.moduleName,
      seq(Parsers.blank, Parsimmon.string("{"), Parsers.blank),
      Parsers.moduleContent,
      seq(Parsers.blank, Parsimmon.string("}")),
      (...results) => {
        let name = results[1];
        let content = results[3];
        let module = new Module(name, content);
        return module;
      }
    );
    return parser;
  });

  public static moduleContent: Parser<ModuleChain> = lazy(() => {
    let parser = Parsers.moduleChain;
    return parser;
  });

  public static moduleChain: Parser<ModuleChain> = lazy(() => {
    let chainParser = Parsers.moduleChainElement.sepBy1(Parsimmon.string(">>").trim(Parsers.blank)).map((results) => {
      let chain = [];
      for (let chainElement of results) {
        chain.push(...chainElement);
      }
      return chain;
    });
    let parser = seq(Parsimmon.string("%%"), Parsers.blank, chainParser).map((results) => results[2]);
    return parser;
  });

  // モジュールチェイン素をパースします。
  // パースした結果は、推移型モジュールを 1 つずつに分解したモジュール名の配列になります。
  // 例えば、「A => B => C => D」という文字列は、「A => B」「B => C」「C => D」の 3 つのモジュール名からなる配列にパースされます。
  public static moduleChainElement: Parser<ModuleChain> = lazy(() => {
    let innerParser = Parsers.identifier.sepBy1(Parsimmon.string("=>").trim(Parsers.blank));
    let parenedParser = innerParser.thru(between("(", ")"));
    let parser = alt(parenedParser, innerParser).map((strings) => {
      if (strings.length === 1) {
        return [strings[0]];
      } else {
        let names = [];
        for (let i = 0 ; i < strings.length - 1; i ++) {
          let name = [strings[i], strings[i + 1]] as [string, string];
          names.push(name);
        }
        return names;
      }
    });
    return parser;
  });

  public static moduleName: Parser<ModuleName> = lazy(() => {
    let parser = alt(Parsers.moduleChainName.thru(attempt), Parsers.moduleSimpleName);
    return parser;
  });

  public static moduleSimpleName: Parser<string> = lazy(() => {
    return Parsers.identifier;
  });

  public static moduleChainName: Parser<[string, string]> = lazy(() => {
    let parser = seqMap(
      Parsers.identifier,
      seq(Parsers.blank, Parsimmon.string("=>"), Parsers.blank),
      Parsers.identifier,
      (...results) => {
        let name = [results[0], results[2]] as [string, string];
        return name;
      }
    );
    return parser;
  });

  public static identifier: Parser<string> = lazy(() => {
    let parser = Parsimmon.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
    return parser;
  });

  public static blank: Parser<null> = lazy(() => {
    let parser = Parsimmon.regexp(/[^\S\n]*/).result(null);
    return parser;
  });

}