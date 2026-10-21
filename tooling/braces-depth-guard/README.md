# Locally maintained braces depth guard

This is a private Find4Sport security patch derived from **braces 3.0.3**, not an upstream release or an audit exception. The original MIT license and attribution are preserved in `LICENSE`. `UPSTREAM-SHA256.json` records SHA256 of every copied original source file and license; those hashes were independently compared with the official npm tarball before this patch was accepted.

Upstream source: https://github.com/micromatch/braces/tree/3.0.3

Official tarball: https://registry.npmjs.org/braces/-/braces-3.0.3.tgz

Tarball integrity: `sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==`

Advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

## Why a local patch

As reviewed on 2026-10-21, the latest upstream braces is 3.0.3 and Next's ESLint plugin still depends on fast-glob/micromatch/braces. The proposed automatic npm fix downgrades the Next ESLint configuration incompatibly. Replacing fast-glob with tinyglobby was rejected because contract tests showed different directory matching and path behavior.

The package is named `@find4sport/braces-depth-guard`, version `3.0.3-f4s.1`, with `private: true`. A root devDependency named `braces` points at this directory, and npm's `$braces` override routes the transitive consumer to that same local implementation. This preserves fast-glob itself and its complete matching behavior. The local package must stay in Git for reproducible `npm ci`.

## Patch scope

- `lib/parse.js`: reject before the parser pushes a brace or parenthesis AST frame when the stack has 128 levels (root included). Escaped, quoted and bracket-class literals follow upstream parsing and do not create frames. The limit cannot be increased through caller options.
- `lib/assert-ast-depth.js`: validate caller-supplied ASTs iteratively before recursive processing; reject depth over 128 and repeated nodes/cycles. Parent and previous-node metadata are intentionally not traversed.
- `index.js`: invoke the AST guard for `stringify`, `compile`, and `expand`, covering both parsed strings and caller-supplied trees. Main/create entrypoints delegate to these routines.
- Other upstream JavaScript files and normal matching semantics are unchanged.

Unsupported pathological nesting now throws a controlled `SyntaxError`. This intentionally tightens acceptance for deeply nested patterns. It addresses the nesting/stack-exhaustion advisory; it does not claim all conceivable resource-exhaustion patterns are harmless or replace the upstream range/length limits.

## Verification and maintenance

`tests/braces-depth-guard.test.mjs` checks normal patterns/ranges, escaped/quoted/bracket literals, the nesting boundary, malicious closed/unclosed/mixed groups, every public string entrypoint, supplied deep/cyclic ASTs, and actual fast-glob directory contracts including absolute/relative paths, roots, arrays, braces, globstar and ignore.

The normal test suite and full dependency audit remain enabled. A clean audit is dependency metadata evidence; the security behavior is established by the attack regression tests, not by the audit count.

When upstream releases a fix, compare its implementation and migration notes, run these tests and lint, remove the local dependency/override and vendor directory, then regenerate the lockfile. Do not remove the local patch solely because an advisory entry changes.
