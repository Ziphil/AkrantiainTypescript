//

import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";


let CodeMirrorAny = CodeMirror as any;

CodeMirrorAny.defineSimpleMode("akrantiain", {
  start: [
    {regex: /"([^"\\]|\\"|\\\\|\\u[A-Fa-f0-9]{0,4})+?"/, token: "string"},
    {regex: /\/([^"\\]|\\\/|\\\\|\\u[A-Fa-f0-9]{0,4})+?\//, token: "string"},
    {regex: /[A-Za-z0-9_]+/, token: "variable-1"},
    {regex: /@[A-Za-z0-9_]+/, token: "variable-2"},
    {regex: /(\^|\$)/, token: "operator"},
    {regex: /#.*/, token: "comment"}
  ]
});