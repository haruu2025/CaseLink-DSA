/**
 * demo.js - PHASE 2 DEMO
 *
 * Run with:  node demo.js
 *
 * Exercises: Binary Tree + 3 traversals, Binary Search Tree (insert,
 * search, delete, traversals, duplicate keys), and Graph + BFS (with
 * DFS shown as extra).
 */

const { BinaryTree } = require("./BinaryTree");
const { BST } = require("./BST");
const { Graph } = require("./Graph");

function banner(title) {
  console.log();
  console.log("=".repeat(70));
  console.log(title);
  console.log("=".repeat(70));
}

// ---------------------------------------------------------------
// BINARY TREE - Evidence classification decision tree + traversals
// ---------------------------------------------------------------
banner("BINARY TREE - Evidence Classification Decision Tree");

// Every node is a yes/no question; left = "yes", right = "no".
// Leaves (no children) are the final categories.
const classifyTree = new BinaryTree("Physical or testimonial?");

const physical = classifyTree.root.insertLeft("Object or document?");
const testimonial = classifyTree.root.insertRight("Direct or secondhand account?");

physical.insertLeft("Physical Object");     // e.g. knife, footprint
physical.insertRight("Document");           // e.g. letter, photograph

testimonial.insertLeft("Eyewitness Statement");
testimonial.insertRight("Hearsay");

console.log("Tree shape (questions branch, leaves are categories):");
classifyTree.print();

console.log("\nInorder   (Left, Node, Right):", classifyTree.inorder());
console.log("Preorder  (Node, Left, Right):", classifyTree.preorder());
console.log("Postorder (Left, Right, Node):", classifyTree.postorder());

console.log("\nClassifying the 'Kitchen Knife' - answers: [yes, yes] (physical -> object)");
console.log("  ->", classifyTree.classify(["yes", "yes"]));

console.log("\nClassifying 'What the neighbor heard secondhand' - answers: [no, no]");
console.log("  ->", classifyTree.classify(["no", "no"]));

// ---------------------------------------------------------------
// BINARY SEARCH TREE - Suspects ordered by suspicion score
//
// Suspicion scores are investigative indicators only.
// A high score means "warrants more attention" — not guilt.
//
// Duplicate key demonstration: Arthur Black and The Butler both
// have suspicion score 73. The BST stores both under the same key.
// ---------------------------------------------------------------
banner("BINARY SEARCH TREE - Suspects keyed by suspicion score");

const suspectBST = new BST();
suspectBST.insert(73, { id: "S1", name: "Arthur Black",  suspicion: 73 });
suspectBST.insert(41, { id: "S2", name: "Maria Lane",    suspicion: 41 });
suspectBST.insert(88, { id: "S3", name: "Daniel Cole",   suspicion: 88 });
suspectBST.insert(73, { id: "S4", name: "The Butler",    suspicion: 73 }); // duplicate key

console.log("Inorder traversal (ascending suspicion — investigative priority, not guilt):");
suspectBST.inorder().forEach((r) => console.log("   ", r));

console.log("\nSearch suspicion=88 ->");
suspectBST.search(88).forEach((r) => console.log("   ", r));

console.log("\nSearch suspicion=73 (two suspects share this score) ->");
suspectBST.search(73).forEach((r) => console.log("   ", r));

console.log("\nSearch suspicion=50 (no match) ->", suspectBST.search(50));

console.log("\nBST size before delete:", suspectBST.size); // 4

// Delete Maria Lane (key=41, id="S2")
suspectBST.delete(41, "S2");
console.log("After deleting Maria Lane (suspicion=41), size:", suspectBST.size); // 3
console.log("Inorder after deletion:");
suspectBST.inorder().forEach((r) => console.log("   ", r));

// Delete Arthur Black from the shared key=73 node (The Butler should remain)
suspectBST.delete(73, "S1");
console.log("\nAfter removing Arthur Black from suspicion=73 (The Butler stays), size:", suspectBST.size); // 2
console.log("Inorder after deletion:");
suspectBST.inorder().forEach((r) => console.log("   ", r));

// ---------------------------------------------------------------
// GRAPH - Relationship network + BFS
//
// Node types: [PERSON], [EVIDENCE], [LOCATION]
// Relationship labels distinguish connection type.
// Graph edges describe observed relationships — they do not
// establish motive, opportunity, or guilt.
// ---------------------------------------------------------------
banner("GRAPH - Relationship Network");

const graph = new Graph();
graph.addEdge("[PERSON] Victim",          "[PERSON] Arthur Black",       "employer of");
graph.addEdge("[PERSON] Victim",          "[PERSON] Maria Lane",          "friend of");
graph.addEdge("[PERSON] Arthur Black",    "[EVIDENCE] Kitchen Knife",     "owns");
graph.addEdge("[PERSON] Maria Lane",      "[PERSON] Daniel Cole",         "seen with");
graph.addEdge("[PERSON] Daniel Cole",     "[EVIDENCE] Torn Photograph",   "found near");
graph.addEdge("[PERSON] Arthur Black",    "[EVIDENCE] Victim's Phone",    "called");
graph.addEdge("[PERSON] Victim",          "[LOCATION] Study",             "found in");

console.log("All relationships:");
graph.print();

console.log("\nBFS from '[PERSON] Victim' (required traversal):", graph.bfs("[PERSON] Victim"));
console.log("DFS from '[PERSON] Victim' (extra, for comparison):", graph.dfs("[PERSON] Victim"));

console.log("\nDegrees of separation from Victim to Torn Photograph:",
  graph.degreesOfSeparation("[PERSON] Victim", "[EVIDENCE] Torn Photograph"));

banner("PHASE 2 DEMO COMPLETE");
