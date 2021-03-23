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


export class AkrantiainParser {

  public constructor() {
  }

  public tryParse(input: string): Akrantiain {
    return this.root.tryParse(input);
  }

  private root: Parser<Akrantiain> = lazy(() => {
    let parser = seq(
      this.blankOrBreak,
      alt(this.implicitModule, this.explicitModule).sepBy(this.blankOrBreak),
      this.blankOrBreak,
      Parsimmon.eof
    ).map(([, modules]) => new Akrantiain(modules));
    return parser;
  });

  private implicitModule: Parser<Module> = lazy(() => {
    let parser = this.sentences.map((sentences) => new Module(null, sentences));
    return parser;
  });

  private explicitModule: Parser<Module> = lazy(() => {
    let parser = seq(
      seq(Parsimmon.string("%"), this.blank),
      this.moduleName,
      seq(this.blankOrBreak, Parsimmon.string("{"), this.blankOrBreak),
      this.sentences,
      seq(this.blankOrBreak, Parsimmon.string("}"))
    ).map(([, name, , sentences]) => new Module(name, sentences));
    return parser;
  });

  private sentences: Parser<Array<Sentence>> = lazy(() => {
    let parser = this.sentence.atLeast(1).map((sentences) => {
      let filteredSentences = sentences.filter((sentence) => sentence !== null) as Array<Sentence>;
      return filteredSentences;
    });
    return parser;
  });

  private sentence: Parser<Sentence | null> = lazy(() => {
    let parser = alt(this.definition, this.rule, this.environment, this.moduleChain, this.comment);
    return parser;
  });

  private definition: Parser<Definition> = lazy(() => {
    let parser = seq(
      this.identifier,
      Parsimmon.string("=").trim(this.blank),
      this.disjunction,
      seq(this.blank, this.semicolon)
    ).map(([identifier, , content]) => new Definition(identifier, content));
    return parser;
  });

  private rule: Parser<Rule> = lazy(() => {
    let parser = seq(
      this.ruleLeft,
      Parsimmon.string("->").trim(this.blank),
      this.ruleRight,
      seq(this.blank, this.semicolon)
    ).map(([ruleLeft, , ruleRight]) => new Rule(ruleLeft, ruleRight));
    return parser;
  });

  private ruleLeft: Parser<RuleLeft> = lazy(() => {
    let parser = seq(
      this.condition.times(0, 1).map((result) => result[0]),
      this.blank,
      this.selection.sepBy1(this.blank),
      this.blank,
      this.condition.times(0, 1).map((result) => result[0])
    ).map(([leftCondition, , selections, , rightCondition]) => ({selections, leftCondition, rightCondition}));
    return parser;
  });

  private ruleRight: Parser<RuleRight> = lazy(() => {
    let elementParser = alt(this.quote, this.slash, this.dollar);
    let parser = elementParser.sepBy1(this.blank);
    return parser;
  });

  private disjunction: Parser<Disjunction> = lazy(() => {
    let parser = this.sequence.sepBy1(Parsimmon.string("|").trim(this.blank)).map((sequences) => new Disjunction(sequences, false));
    return parser;
  });

  private sequence: Parser<Sequence> = lazy(() => {
    let parser = this.selection.sepBy1(this.blank).map((selections) => new Sequence(selections));
    return parser;
  });

  private condition: Parser<Matchable> = lazy(() => {
    let parser = seq(
      Parsimmon.string("!"),
      this.blank,
      this.selection
    ).map(([, , selection]) => new Disjunction([selection], true));
    return parser;
  });

  private selection: Parser<Matchable> = lazy(() => {
    let disjunctionParser = this.disjunction.thru(this.parened.bind(this));
    let parser = alt(this.quote, this.circumflex, this.identifier, disjunctionParser);
    return parser;
  });

  private environment: Parser<Environment> = lazy(() => {
    let parser = seq(
      seq(Parsimmon.string("@"), this.blank),
      this.identifierText,
      seq(this.blank, this.semicolon)
    ).map(([, rawName]) => new Environment(rawName));
    return parser;
  });

  private moduleChain: Parser<ModuleChain> = lazy(() => {
    let chainElementParser = alt(this.moduleChainElement, this.moduleChainElement.thru(this.parened.bind(this)));
    let chainParser = chainElementParser.sepBy1(Parsimmon.string(">>").trim(this.blank)).map((chainElements) => {
      let modules = [];
      for (let chainElement of chainElements) {
        modules.push(...chainElement);
      }
      let chain = new ModuleChain(modules);
      return chain;
    });
    let parser = seq(
      seq(Parsimmon.string("%%"), this.blank),
      chainParser,
      seq(this.blank, this.semicolon)
    ).map(([, chain]) => chain);
    return parser;
  });

  // モジュールチェイン素をパースします。
  // パースした結果は、推移型モジュールを 1 つずつに分解したモジュール名の配列になります。
  // 例えば、「A => B => C => D」という文字列は、「A => B」と「B => C」と「C => D」の 3 つのモジュール名からなる配列にパースされます。
  private moduleChainElement: Parser<Array<ModuleName>> = lazy(() => {
    let parser = this.identifierText.sepBy1(Parsimmon.string("=>").trim(this.blank)).map((texts) => {
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

  private moduleName: Parser<ModuleName> = lazy(() => {
    let parser = alt(this.moduleChainName.thru(attempt), this.moduleSimpleName);
    return parser;
  });

  private moduleSimpleName: Parser<ModuleName> = lazy(() => {
    let parser = this.identifierText.map((text) => new ModuleName(text));
    return parser;
  });

  private moduleChainName: Parser<ModuleName> = lazy(() => {
    let parser = seq(
      this.identifierText,
      Parsimmon.string("=>").trim(this.blank),
      this.identifierText
    ).map(([text, , extraText]) => new ModuleName(text, extraText));
    return parser;
  });

  private quote: Parser<Quote> = lazy(() => {
    let parser = seq(
      Parsimmon.string("\""),
      alt(this.quoteEscape, this.quoteContent).many().tie(),
      Parsimmon.string("\"")
    ).map(([, text]) => new Quote(text));
    return parser;
  });

  private quoteEscape: Parser<string> = lazy(() => {
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

  private quoteContent: Parser<string> = lazy(() => {
    let parser = Parsimmon.noneOf("\\\"");
    return parser;
  });

  private slash: Parser<Slash> = lazy(() => {
    let parser = seq(
      Parsimmon.string("/"),
      alt(this.slashEscape, this.slashContent).many().tie(),
      Parsimmon.string("/")
    ).map(([, text]) => new Slash(text));
    return parser;
  });

  private slashEscape: Parser<string> = lazy(() => {
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

  private slashContent: Parser<string> = lazy(() => {
    let parser = Parsimmon.noneOf("\\/");
    return parser;
  });

  private circumflex: Parser<Circumflex> = lazy(() => {
    let parser = Parsimmon.string("^").result(new Circumflex());
    return parser;
  });

  private dollar: Parser<Dollar> = lazy(() => {
    let parser = Parsimmon.string("$").result(new Dollar());
    return parser;
  });

  private comment: Parser<null> = lazy(() => {
    let parser = seq(
      Parsimmon.string("#"),
      Parsimmon.noneOf("\n").many(),
      this.blankOrBreak
    ).result(null);
    return parser;
  });

  // 文末の (省略されているかもしれない) セミコロンおよびその後の改行を含むスペースをパースします。
  private semicolon: Parser<null> = lazy(() => {
    let semicolonParser = seq(Parsimmon.string(";"), this.blankOrBreak);
    let breakParser = seq(this.break, this.blankOrBreak);
    let otherParser = Parsimmon.lookahead(alt(Parsimmon.string("#"), Parsimmon.string("}"), Parsimmon.eof));
    let parser = alt(semicolonParser, breakParser, otherParser).result(null);
    return parser;
  });

  private identifier: Parser<Identifier> = lazy(() => {
    let parser = this.identifierText.map((text) => new Identifier(text));
    return parser;
  });

  private identifierText: Parser<string> = lazy(() => {
    let parser = Parsimmon.regexp(/[a-zA-Z][a-zA-Z0-9_]*/);
    return parser;
  });

  private blankOrBreak: Parser<null> = lazy(() => {
    let parser = Parsimmon.regexp(/\s*/).result(null);
    return parser;
  });

  private blank: Parser<null> = lazy(() => {
    let parser = Parsimmon.regexp(/[^\S\n]*/).result(null);
    return parser;
  });

  private break: Parser<null> = lazy(() => {
    let parser = Parsimmon.string("\n").result(null);
    return parser;
  });

  private parened<T>(parser: Parser<T>): Parser<T> {
    let leftParser = seq(Parsimmon.string("("), this.blank);
    let rightParser = seq(this.blank, Parsimmon.string(")"));
    let wrappedParser = seq(leftParser, parser, rightParser).map((result) => result[1]);
    return wrappedParser;
  }

}