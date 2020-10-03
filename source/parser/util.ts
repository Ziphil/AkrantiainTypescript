//

import Parsimmon from "parsimmon";
import {
  Parser,
  lookahead
} from "parsimmon";


export function attempt<T>(parser: Parser<T>): Parser<T> {
  return lookahead(parser).then(parser);
}