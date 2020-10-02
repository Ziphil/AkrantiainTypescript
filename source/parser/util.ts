//

import {
  Parser,
  lookahead
} from "parsimmon";


export function toTry<T>(parser: Parser<T>): Parser<T> {
  return lookahead(parser).then(parser);
}