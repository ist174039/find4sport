'use strict';

// Iterative traversal protects public AST entrypoints before upstream recursion.
module.exports = function assertAstDepth(root) {
  const pending = [{ node: root, depth: 0 }];
  const seen = new WeakSet();
  while (pending.length) {
    const { node, depth } = pending.pop();
    if (!node || typeof node !== 'object') continue;
    if (depth > 128) throw new SyntaxError('Brace AST nesting exceeds the local security limit (128 levels)');
    if (seen.has(node)) throw new SyntaxError('Brace AST must be an acyclic tree');
    seen.add(node);
    if (Array.isArray(node.nodes)) {
      for (const child of node.nodes) pending.push({ node: child, depth: depth + 1 });
    }
  }
};
