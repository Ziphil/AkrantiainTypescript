//

import Parsimmon from "parsimmon";
import {
  Parser,
  alt,
  lazy,
  seq
} from "parsimmon";
import {
  Akrantiain,
  Circumflex,
  Definition,
  Disjunction,
  Dollar,
  Environment,
  Identifier,
  Matchable,
  Module,
  ModuleChain,
  ModuleName,
  Quote,
  Rule,
  RuleLeft,
  RuleRight,
  Sentence,
  Sequence,
  Slash
} from "../class";
import {
  attempt
} from "./util";


export class Parsers {

  public static akrantiain: Parser<Akrantiain> = lazy(() => {
    let parser = seq(
      Parsers.blankOrBreak,
      alt(Parsers.implicitModule, Parsers.explicitModule).sepBy(Parsers.blankOrBreak),
      Parsers.blankOrBreak,
      Parsimmon.eof
    ).map(([, modules]) => new Akrantiain(modules));
    return parser;
  });

  private static implicitModule: Parser<Module> = lazy(() => {
    let parser = Parsers.sentences.map((sentences) => new Module(null, sentences));
    return parser;
  });

  private static explicitModule: Parser<Module> = lazy(() => {
    let parser = seq(
      seq(Parsimmon.string("%"), Parsers.blank),
      Parsers.moduleName,
      seq(Parsers.blankOrBreak, Parsimmon.string("{"), Parsers.blankOrBreak),
      Parsers.sentences,
      seq(Parsers.blankOrBreak, Parsimmon.string("}"))
    ).map(([, name, , sentences]) => new Module(name, sentences));
    return parser;
  });

  private static sentences: Parser<Array<Sentence>> = lazy(() => {
    let parser = Parsers.sentence.atLeast(1).map((sentences) => {
      let filteredSentences = sentences.filter((sentence) => sentence !== null) as Array<Sentence>;
      return filteredSentences;
    });
    return parser;
  });

  private static sentence: Parser<Sentence | null> = lazy(() => {
    let parser = alt(Parsers.definition, Parsers.rule, Parsers.environment, Parsers.moduleChain, Parsers.comment);
    return parser;
  });

  private static definition: Parser<Definition> = lazy(() => {
    let parser = seq(
      Parsers.identifier,
      Parsimmon.string("=").trim(Parsers.blank),
      Parsers.disjunction,
      seq(Parsers.blank, Parsers.semicolon)
    ).map(([identifier, , content]) => new Definition(identifier, content));
    return parser;
  });

  private static rule: Parser<Rule> = lazy(() => {
    let parser = seq(
      Parsers.ruleLeft,
      Parsimmon.string("->").trim(Parsers.blank),
      Parsers.ruleRight,
      seq(Parsers.blank, Parsers.semicolon)
    ).map(([ruleLeft, , ruleRight]) => new Rule(ruleLeft, ruleRight));
    return parser;
  });

  private static ruleLeft: Parser<RuleLeft> = lazy(() => {
    let parser = seq(
      Parsers.condition.times(0, 1).map((result) => result[0]),
      Parsers.blank,
      Parsers.selection.sepBy1(Parsers.blank),
      Parsers.blank,
      Parsers.condition.times(0, 1).map((result) => result[0])
    ).map(([leftCondition, , selections, , rightCondition]) => ({selections, leftCondition, rightCondition}));
    return parser;
  });

  private static ruleRight: Parser<RuleRight> = lazy(() => {
    let elementParser = alt(Parsers.quote, Parsers.slash, Parsers.dollar);
    let parser = elementParser.sepBy1(Parsers.blank);
    return parser;
  });

  private static disjunction: Parser<Disjunction> = lazy(() => {
    let parser = Parsers.sequence.sepBy1(Parsimmon.string("|").trim(Parsers.blank)).map((sequences) => new Disjunction(sequences, false));
    return parser;
  });

  private static sequence: Parser<Sequence> = lazy(() => {
    let parser = Parsers.selection.sepBy1(Parsers.blank).map((selections) => new Sequence(selections));
    return parser;
  });

  private static condition: Parser<Matchable> = lazy(() => {
    let parser = seq(
      Parsimmon.string("!"),
      Parsers.blank,
      Parsers.selection
    ).map(([, , selection]) => new Disjunction([selection], true));
    return parser;
  });

  private static selection: Parser<Matchable> = lazy(() => {
    let disjunctionParser = Parsers.disjunction.thru(Parsers.parened);
    let parser = alt(Parsers.quote, Parsers.circumflex, Parsers.identifier, disjunctionParser);
    return parser;
  });

  private static environment: Parser<Environment> = lazy(() => {
    let parser = seq(
      seq(Parsimmon.string("@"), Parsers.blank),
      Parsers.identifierText,
      seq(Parsers.blank, Parsers.semicolon)
    ).map(([, rawName]) => new Environment(rawName));
    return parser;
  });

  private static moduleChain: Parser<ModuleChain> = lazy(() => {
    let chainElementParser = alt(Parsers.moduleChainElement, Parsers.moduleChainElement.thru(Parsers.parened));
    let chainParser = chainElementParser.sepBy1(Parsimmon.string(">>").trim(Parsers.blank)).map((chainElements) => {
      let modules = [];
      for (let chainElement of chainElements) {
        modules.push(...chainElement);
      }
      let chain = new ModuleChain(modules);
      return chain;
    });
    let parser = seq(
      seq(Parsimmon.string("%%"), Parsers.blank),
      chainParser,
      seq(Parsers.blank, Parsers.semicolon)
    ).map(([, chain]) => chain);
    return parser;
  });

  // モジュールチェイン素をパースします。
  // パースした結果は、推移型モジュールを 1 つずつに分解したモジュール名の配列になります。
  // 例えば、「A => B => C => D」という文字列は、「A => B」と「B => C」と「C => D」の 3 つのモジュール名からなる配列にパースされます。
  private static moduleChainElement: Parser<Array<ModuleName>> = lazy(() => {
    let parser = Parsers.identifierText.sepBy1(Parsimmon.string("=>").trim(Parsers.blank)).map((texts) => {
      if (texts.length === 1) {
        let name = new ModuleName(texts[0]);
        return [name];
      } else {
        let names = [];
        for (let i = 0 ; i < texts.length - 1; i ++) {
          let name = new ModuleName(texts[i], texts[i + 1]);
          names.push(name);
        }
        return names;
      }
    });
    return parser;
  });

  private static moduleName: Parser<ModuleName> = lazy(() => {
    let parser = alt(Parsers.moduleChainName.thru(attempt), Parsers.moduleSimpleName);
    return parser;
  });

  private static moduleSimpleName: Parser<ModuleName> = lazy(() => {
    return Parsers.identifierText.map((text) => new ModuleName(text));
  });

  private static moduleChainName: Parser<ModuleName> = lazy(() => {
    let parser = seq(
      Parsers.identifierText,
      Parsimmon.string("=>").trim(Parsers.blank),
      Parsers.identifierText
    ).map(([text, , extraText]) => new ModuleName(text, extraText));
    return parser;
  });

  private static quote: Parser<Quote> = lazy(() => {
    let parser = seq(
      Parsimmon.string("\""),
      alt(Parsers.quoteEscape, Parsers.quoteContent).many().tie(),
      Parsimmon.string("\"")
    ).map(([, text]) => new Quote(text));
    return parser;
  });

  private static quoteEscape: Parser<string> = lazy(() => {
    let parser = seq(
      Parsimmon.string("\\"),
      alt(Parsimmon.regexp(/u[A-Fa-f0-9]{4}/), Parsimmon.oneOf("\\\""))
    ).map(([, escape]) => {
      if (escape.startsWith("u")) {
        let code = parseInt(escape.substr(1, 4), 16);
        let char = String.fromCharCode(code);
        return char;
      } else {
        return escape;
      }
    });
    return parser;
  });

  private static quoteContent: Parser<string> = lazy(() => {
    let parser = Parsimmon.noneOf("\\\"");
    return parser;
  });

  private static slash: Parser<Slash> = lazy(() => {
    let parser = seq(
      Parsimmon.string("/"),
      alt(Parsers.slashEscape, Parsers.slashContent).many().tie(),
      Parsimmon.string("/")
    ).map(([, text]) => new Slash(text));
    return parser;
  });

  private static slashEscape: Parser<string> = lazy(() => {
    let parser = seq(
      Parsimmon.string("\\"),
      alt(Parsimmon.regexp(/u[A-Fa-f0-9]{4}/), Parsimmon.oneOf("\\/"))
    ).map(([, escape]) => {
      if (escape.startsWith("u")) {
        let code = parseInt(escape.substr(1, 4), 16);
        let char = String.fromCharCode(code);
        return char;
      } else {
        return escape;
      }
    });
    return parser;
  });

  private static slashContent: Parser<string> = lazy(() => {
    let parser = Parsimmon.noneOf("\\/");
    return parser;
  });

  private static circumflex: Parser<Circumflex> = lazy(() => {
    let parser = Parsimmon.string("^").result(new Circumflex());
    return parser;
  });

  private static dollar: Parser<Dollar> = lazy(() => {
    let parser = Parsimmon.string("$").result(new Dollar());
    return parser;
  });

  private static comment: Parser<null> = lazy(() => {
    let parser = seq(
      Parsimmon.string("#"),
      Parsimmon.noneOf("\n").many(),
      Parsers.blankOrBreak
    ).result(null);
    return parser;
  });

  // 文末の (省略されているかもしれない) セミコロンおよびその後の改行を含むスペースをパースします。
  private static semicolon: Parser<null> = lazy(() => {
    let semicolonParser = seq(Parsimmon.string(";"), Parsers.blankOrBreak);
    let breakParser = seq(Parsers.break, Parsers.blankOrBreak);
    let otherParser = Parsimmon.lookahead(alt(Parsimmon.string("#"), Parsimmon.string("}"), Parsimmon.eof));
    let parser = alt(semicolonParser, breakParser, otherParser).result(null);
    return parser;
  });

  private static identifier: Parser<Identifier> = lazy(() => {
    let parser = Parsers.identifierText.map((text) => new Identifier(text));
    return parser;
  });

  private static identifierText: Parser<string> = lazy(() => {
    let parser = Parsimmon.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
    return parser;
  });

  private static blankOrBreak: Parser<null> = lazy(() => {
    let parser = Parsimmon.regexp(/\s*/).result(null);
    return parser;
  });

  private static blank: Parser<null> = lazy(() => {
    let parser = Parsimmon.regexp(/[^\S\n]*/).result(null);
    return parser;
  });

  private static break: Parser<null> = lazy(() => {
    let parser = Parsimmon.string("\n").result(null);
    return parser;
  });

  private static parened<T>(parser: Parser<T>): Parser<T> {
    let leftParser = seq(Parsimmon.string("("), Parsers.blank);
    let rightParser = seq(Parsers.blank, Parsimmon.string(")"));
    let wrappedParser = seq(leftParser, parser, rightParser).map((result) => result[1]);
    return wrappedParser;
  }

}