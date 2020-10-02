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
  ModuleName
} from "../class";
import {
  toTry
} from "./util";


export class Parsers {

  public static explicitModule: Parser<Module> = lazy(() => {
    let parser = seqMap(
      seq(Parsimmon.string("%%"), Parsers.blank),
      Parsers.moduleName,
      seq(Parsers.blank, Parsimmon.string("{"), Parsers.blank),
      Parsers.moduleContent,
      seq(Parsers.blank, Parsimmon.string("}")),
      (...results) => {
        let name = results[1];
        let module = new Module(name);
        return module;
      }
    );
    return parser;
  });

  public static moduleContent: Parser<any> = lazy(() => {
    let parser = Parsers.blank;
    return parser;
  });

  public static moduleName: Parser<ModuleName> = lazy(() => {
    let parser = alt(Parsers.moduleChainName.thru(toTry), Parsers.moduleSimpleName);
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
    let parser = Parsimmon.regexp(/\s*/).result(null);
    return parser;
  });

}