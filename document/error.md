## About error messages
Since the internal structure of this implementation is completely different from the original one, errors reported by it is also different.

Syntactic errors are reported by [parsimmon](https://www.npmjs.com/package/parsimmon) library, so see there for information of those errors.
This documentation only gives an explanation of semantic and run-time errors.

Each semantic or run-time error has a unique error code, which appears at the beginning of the error message.
Again, note that these error codes are different from those of the original implementation.

## Semantic errors
### 1000: `No such module: 'xxx'`
An undefined module is used in a module chain.

### 1001: `Circular reference involving module: 'xxx'`
There is a circular reference of modules.
Since this may cause an infinite loop at run-time, the processor reports it as an error beforehand.
```
% foo { %% bar; }
% bar { %% baz; }  # bar -> baz -> qux -> bar
% baz { %% qux; }
% qux { %% bar; }
%% foo;  # error occurs
```
Note that, if a circular reference is inside unused modules (namely those unreachable from the implicit module), no errors will occur.
```
% foo { "a" -> /A/; }
% bar { %% baz; }  # bar -> baz -> qux -> bar
% baz { %% qux; }  # but the module 'bar' is not reachable
% qux { %% bar; }  # so it reports no errors
%% foo;
```

### 1002: `No implicit module`
There is no implicit module (or the implicit module is empty).

### 1003: `There are more than one implicit modules`
There are more than one implicit modules defined.
This most likely occurs when module definitions are placed between setting specifiers and a module chain:
```
@FALL_THROUGH;
% module { "a" -> /A/; }
%% module;  # error occurs
```

### 1004: `Duplicate definition of module: 'xxx'`
Modules with the same name are defined multiple times.

### 1005: `Module has both sentences and a module chain: 'xxx'`
There is a module which has both sentences and a module chain.
Every module must consist of either sentences or a module chain.

### 1006: `Module has multiple module chains: 'xxx'`
There is a module which has multiple module chains.
Every module can have at most one module chain.

### 1100: `Unresolved identifier: 'xxx' in 'xxx'`
An undefined identifier is used in a definition of an identifier.

### 1101: `Unresolved identifier: 'xxx' in 'xxx'`
An undefined identifier is used in a definition of a rule.

### 1102: `Circular reference involving identifier: 'xxx' in 'xxx'`
There is a circular reference of modules.
Since this may cause an infinite loop at run-time, the processor reports it as an error beforehand.
This implementation allows to use identifiers in a right-hand side of an identifier definition (which is not allowed in the original), this error may occur.
```
foo = bar | circular;  # error occurs
circular = bar | baz;  # foo -> circular -> baz -> foo
baz = foo;
bar = "a" | "b";
```

### 1103: `Duplicate definition of identifier: 'xxx'`
Identifiers with the same name are defined multiple times.

### 1104: `Mismatched number of concrete terms in left- and right-hand side: 'xxx'`
The number of concrete terms in both hands of a rule is mismatched.
Here “concrete terms” means those other than `^` which are not prefixed with `!`.

In the following example, the conrete terms of the left-hand side are `"b"` and `"c"`, but those of the right-hand side are `/b/`, `/c/` and `/?/`.
```
!"a" "b" ^ "c" !"d" -> /b/ /c/ /?/;  # error occurs
```

### 1105: `Right-hand side of a sentence consists solely of dollars: 'xxx'`
The right-hand side of a rule definition has only `$`.
This is no-op and thus not allowed.

## Run-time errors
### 2000: `No rules that can handle some characters`
There are not enough rules to convert some characters.
This error can be suppressed by specifying `@FALL_THROUGH`.

## Other errors
### 90xx: `Cannot happen (at xxx)`
This error cannot occur if the processor runs as intended.
If this occurs, it is a bug of the processor, so please inform the developer.