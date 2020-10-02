//

import Parsimmon from "parsimmon";
import {
  Parser,
  lookahead,
  seq
} from "parsimmon";


export function attempt<T>(parser: Parser<T>): Parser<T> {
  return lookahead(parser).then(parser);
}

export function between(left: string, right: string): <T>(parser: Parser<T>) => Parser<T> {
  let wrapper = function<T> (parser: Parser<T>): Parser<T> {
    return seq(Parsimmon.string(left), parser, Parsimmon.string(right)).map((result) => result[1]);
  };
  return wrapper;
}