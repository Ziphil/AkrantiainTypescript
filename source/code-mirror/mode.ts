//

import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";


let CodeMirrorAny = CodeMirror as any;

let base = [
  {regex: /"([^"\\]|\\"|\\\\|\\u[A-Fa-f0-9]{0,4})*?"/, token: "string"},
  {regex: /\/([^"\\]|\\\/|\\\\|\\u[A-Fa-f0-9]{0,4})*?\//, token: "string"},
  {regex: /[a-zA-Z][a-zA-Z0-9_]*/, token: "variable-1"},
  {regex: /@[a-zA-Z][a-zA-Z0-9_]*/, token: "variable-3"},
  {regex: /(\^|\$)/, token: "operator"},
  {regex: /#.*/, token: "comment"}
];

CodeMirrorAny.defineSimpleMode("akrantiain", {
  start: [
    {regex: /%%/, push: "moduleChain"},
    {regex: /%(?!%)/, next: "moduleName"},
    ...base
  ],
  module: [
    {regex: /\}/, next: "start"},
    ...base
  ],
  moduleName: [
    {regex: /\{/, next: "module"},
    {regex: /[a-zA-Z][a-zA-Z0-9_]*/, token: "variable-2"},
    ...base
  ],
  moduleChain: [
    {regex: /(?=;|#|$)/, pop: true},
    {regex: /[a-zA-Z][a-zA-Z0-9_]*/, token: "variable-2"},
    ...base
  ]
});