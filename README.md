<div align="center">
<h1>TypeScript Akrantiain</h1>
</div>

![](https://img.shields.io/github/package-json/v/Ziphil/TypescriptAkrantiain)
![](https://img.shields.io/github/commit-activity/y/Ziphil/TypescriptAkrantiain?label=commits)


## Overview
Akrantiain is a domain-specific language to describe phonological rules of natural or constructed languages.
Although it is designed to be used to generate a pronunciation from a spelling, it can also be used for general purpose of string transformation.

Akrantiain is originally introduced in [this repository](https://github.com/sozysozbot/akrantiain2).
See here for further information about this language.

This repository contains a TypeScript implementation of Akrantiain.
Note that it is not completely compatible to the original one; especially it may run differently when a rule contains an empty string.
It also extends the syntax and semantics of the language, whose documentation is now in preparation.

## Usage
Call `Akrantiain.load` with a source string to create an `Akrantiain` object, and then call `convert` with an input string:
```typescript
let akrantiain = Akrantiain.load(`"a" -> /X/; "b" -> /Y/; "c" -> /Z/;`);
let output = akrantiain.convert("abc");
console.log(output)  // outputs “XYZ”