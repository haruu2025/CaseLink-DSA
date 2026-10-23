/**
 * BinaryTree.js
 *
 * PHASE 2 - BINARY TREE + TREE TRAVERSALS (inorder / preorder / postorder)
 *
 * Game use: an EVIDENCE CLASSIFICATION DECISION TREE. Every internal node
 * asks a yes/no question about a piece of evidence ("Is it physical or
 * testimonial?"); the player's answer sends them left (yes) or right (no).
 * Reaching a node with no children means you've landed on a category.
 *
 * This is a genuine *binary* tree - every question has exactly two
 * branches - as opposed to the BST below, which is ordered by a sortable
 * number rather than by decision logic.
 */

class TreeNode {
  constructor(label) {
    this.label = label; // a question ("Physical or testimonial?") or, on a leaf, a category ("Document")
    this.left = null;   // "yes" branch
    this.right = null;  // "no" branch
  }

  insertLeft(label) {
    this.left = new TreeNode(label);
    return this.left;
  }

  insertRight(label) {
    this.right = new TreeNode(label);
    return this.right;
  }

  isLeaf() {
    return !this.left && !this.right;
  }
}

class BinaryTree {
  constructor(rootLabel) {
    this.root = new TreeNode(rootLabel);
  }

  /** Left -> Node -> Right */
  inorder(node = this.root, result = []) {
    if (!node) return result;
    this.inorder(node.left, result);
    result.push(node.label);
    this.inorder(node.right, result);
    return result;
  }

  /** Node -> Left -> Right */
  preorder(node = this.root, result = []) {
    if (!node) return result;
    result.push(node.label);
    this.preorder(node.left, result);
    this.preorder(node.right, result);
    return result;
  }

  /** Left -> Right -> Node */
  postorder(node = this.root, result = []) {
    if (!node) return result;
    this.postorder(node.left, result);
    this.postorder(node.right, result);
    result.push(node.label);
    return result;
  }

  /**
   * Walk the decision tree given a sequence of "yes"/"no" answers, e.g.
   * ["yes", "no"]. Stops early if a leaf is reached before answers run
   * out. Returns the final label plus the path taken.
   */
  classify(answers) {
    let node = this.root;
    const path = [node.label];

    for (const answer of answers) {
      if (node.isLeaf()) break;
      node = answer === "yes" ? node.left : node.right;
      if (!node) throw new Error(`No "${answer}" branch defined at this point in the tree`);
      path.push(node.label);
    }

    return { result: node.label, reachedLeaf: node.isLeaf(), path };
  }

  print(node = this.root, depth = 0) {
    if (!node) return;
    console.log("  ".repeat(depth) + (depth === 0 ? "" : "- ") + node.label);
    this.print(node.left, depth + 1);
    this.print(node.right, depth + 1);
  }
}

module.exports = { BinaryTree, TreeNode };
