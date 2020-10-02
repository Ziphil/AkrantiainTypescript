//

import {
  Parsers
} from "./parser/parsers";


function execute(): void {
  let result = Parsers.explicitModule.tryParse("%% a => B { }");
  console.log(result.toString());
}

execute();