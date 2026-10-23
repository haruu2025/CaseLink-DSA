/**
 * improvements-tests.js
 *
 * Run with:  node improvements-tests.js
 *
 * Targeted regression and correctness tests for the specific bugs and
 * improvements addressed in this review pass:
 *
 *   Phase 1 — ExpressionEvaluator: validation of malformed input
 *   Phase 2 — BST: size counter bug, duplicate key handling
 *   Phase 3 — Sorter: Merge Sort metric field name ("moves" not "swaps")
 *   Phase 3 — demo: same-key Linear vs Binary Search comparison
 */

const { evaluateExpression, infixToPostfix, evaluatePostfix } =
  require("./phase1-linear/ExpressionEvaluator");
const { BST } = require("./phase2-hierarchical/BST");
const { insertionSort, mergeSort, quickSort } = require("./phase3-searching-sorting/Sorter");
const { linearSearch, binarySearch } = require("./phase3-searching-sorting/Searcher");

// ─────────────────────────────────────────────────────────────
// MINIMAL TEST RUNNER
// ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✓  PASS  ${name}`);
    passed++;
  } else {
    console.log(`  ✗  FAIL  ${name}${detail ? `\n         → ${detail}` : ""}`);
    failed++;
  }
}

function assertThrows(name, fn, expectedSnippet = "") {
  try {
    fn();
    console.log(`  ✗  FAIL  ${name}\n         → Expected an error but none was thrown.`);
    failed++;
  } catch (e) {
    const msg = e.message || "";
    if (expectedSnippet && !msg.toLowerCase().includes(expectedSnippet.toLowerCase())) {
      console.log(
        `  ✗  FAIL  ${name}\n         → Threw an error but message did not contain "${expectedSnippet}".\n         → Got: ${msg}`
      );
      failed++;
    } else {
      console.log(`  ✓  PASS  ${name}`);
      passed++;
    }
  }
}

function banner(title) {
  console.log();
  console.log("═".repeat(70));
  console.log(`  ${title}`);
  console.log("═".repeat(70));
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1 — EXPRESSIONEVALUATOR VALIDATION
// ═══════════════════════════════════════════════════════════════
banner("PHASE 1 — ExpressionEvaluator: input validation");

// Valid expression still works
{
  const { value } = evaluateExpression("( 45 + 30 ) * 2 - 10");
  assert("Valid expression evaluates correctly to 140", value === 140, `got ${value}`);
}

// Empty string
assertThrows(
  "Empty expression throws",
  () => evaluateExpression(""),
  "empty"
);

// Unrecognised token
assertThrows(
  "Unrecognised token throws",
  () => evaluateExpression("10 + x"),
  "unrecognis"
);

// Mismatched parentheses — too many opens
assertThrows(
  "Unclosed '(' throws",
  () => evaluateExpression("( 10 + 5"),
  "parenthes"
);

// Mismatched parentheses — too many closes
assertThrows(
  "Unmatched ')' throws",
  () => evaluateExpression("10 + 5 )"),
  "parenthes"
);

// Empty parentheses ()
assertThrows(
  "Empty parentheses '()' throws",
  () => evaluateExpression("( )"),
  "unexpected"
);

// Consecutive operators
assertThrows(
  "Consecutive operators '3 + * 4' throws",
  () => evaluateExpression("3 + * 4"),
  "unexpected operator"
);

// Operator at the very start
assertThrows(
  "Leading operator '+ 3 4' throws",
  () => evaluateExpression("+ 3 4"),
  "unexpected operator"
);

// Expression ending with an operator
assertThrows(
  "Trailing operator '3 + 4 *' throws",
  () => evaluateExpression("3 + 4 *"),
  "missing"
);

// Division by zero
assertThrows(
  "Division by zero '10 / 0' throws",
  () => evaluateExpression("10 / 0"),
  "division by zero"
);

// Missing operand detected at evaluation stage
assertThrows(
  "Missing operand in postfix evaluation throws",
  () => evaluatePostfix(["+", "5"]),
  "missing operand"
);

// Leftover operands — more values than operators can consume
assertThrows(
  "Leftover operands in postfix evaluation throws",
  () => evaluatePostfix(["3", "4", "5"]),
  "malformed expression"
);

// ═══════════════════════════════════════════════════════════════
// PHASE 2 — BST: SIZE COUNTER & DUPLICATE KEY
// ═══════════════════════════════════════════════════════════════
banner("PHASE 2 — BST: size counter and duplicate key handling");

// ── Size counter: single-child deletion
{
  const bst = new BST();
  bst.insert(50, { id: "A", name: "Alpha" });
  bst.insert(30, { id: "B", name: "Beta"  });
  bst.insert(70, { id: "C", name: "Gamma" });

  assert("BST size is 3 after three inserts", bst.size === 3, `got ${bst.size}`);

  bst.delete(30, "B"); // B is a leaf
  assert("BST size is 2 after deleting a leaf", bst.size === 2, `got ${bst.size}`);
}

// ── Size counter: two-children deletion (the original bug)
{
  const bst = new BST();
  bst.insert(50, { id: "A", name: "Alpha" });
  bst.insert(30, { id: "B", name: "Beta"  });
  bst.insert(70, { id: "C", name: "Gamma" });
  bst.insert(60, { id: "D", name: "Delta" }); // child of 70
  bst.insert(80, { id: "E", name: "Epsilon" }); // child of 70

  assert("BST size is 5 after five inserts", bst.size === 5, `got ${bst.size}`);

  // Deleting key=70 (node C) — it has two children (D and E).
  // The original bug would decrement size TWICE (once for the node,
  // once when the recursive call removed the in-order successor).
  bst.delete(70, "C");
  assert(
    "BST size is 4 after deleting a two-children node (was double-decrement bug)",
    bst.size === 4,
    `got ${bst.size} — if 3, the double-decrement bug is still present`
  );

  // The remaining records should still be reachable: A(50), B(30), D(60), E(80)
  // (only C was deleted — B was not touched in this block)
  const remaining = bst.inorder().map((r) => r.id).sort();
  assert(
    "Remaining records are A, B, D, E after deleting only C (two-children node)",
    JSON.stringify(remaining) === JSON.stringify(["A", "B", "D", "E"]),
    `got ${JSON.stringify(remaining)}`
  );
}

// ── Duplicate key: both records stored
{
  const bst = new BST();
  bst.insert(73, { id: "S1", name: "Arthur Black", suspicion: 73 });
  bst.insert(73, { id: "S4", name: "The Butler",   suspicion: 73 }); // same key

  assert("BST size is 2 with two records at the same key", bst.size === 2, `got ${bst.size}`);

  const found = bst.search(73);
  assert("search(73) returns both records", Array.isArray(found) && found.length === 2,
    `got ${JSON.stringify(found)}`);
}

// ── Duplicate key: delete one, keep the other
{
  const bst = new BST();
  bst.insert(73, { id: "S1", name: "Arthur Black" });
  bst.insert(73, { id: "S4", name: "The Butler"   });

  bst.delete(73, "S1");
  assert("After deleting S1, size is 1", bst.size === 1, `got ${bst.size}`);

  const remaining = bst.search(73);
  assert(
    "The Butler (S4) remains at key=73 after S1 is deleted",
    Array.isArray(remaining) && remaining.length === 1 && remaining[0].id === "S4",
    `got ${JSON.stringify(remaining)}`
  );
}

// ── Inorder traversal still works with duplicates
{
  const bst = new BST();
  bst.insert(50, { id: "A" });
  bst.insert(73, { id: "B" });
  bst.insert(73, { id: "C" }); // duplicate
  bst.insert(88, { id: "D" });

  const ids = bst.inorder().map((r) => r.id);
  // inorder must visit 50 first, then both at 73 (order within key is insertion order), then 88
  assert(
    "Inorder with duplicate keys: A, B, C, D",
    JSON.stringify(ids) === JSON.stringify(["A", "B", "C", "D"]),
    `got ${JSON.stringify(ids)}`
  );
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3 — SORTER: METRIC NAMES
// ═══════════════════════════════════════════════════════════════
banner("PHASE 3 — Sorter: correct metric field names");

{
  const data = [{ v: 3 }, { v: 1 }, { v: 2 }];
  const cmp  = (a, b) => a.v - b.v;

  const insResult = insertionSort(data, cmp);
  const mrgResult = mergeSort(data, cmp);
  const qckResult = quickSort(data, cmp);

  assert(
    "insertionSort stats has 'swaps' field",
    "swaps" in insResult.stats,
    `fields: ${Object.keys(insResult.stats).join(", ")}`
  );
  assert(
    "insertionSort stats does NOT have 'moves' field",
    !("moves" in insResult.stats)
  );

  assert(
    "mergeSort stats has 'moves' field (not 'swaps')",
    "moves" in mrgResult.stats,
    `fields: ${Object.keys(mrgResult.stats).join(", ")}`
  );
  assert(
    "mergeSort stats does NOT have 'swaps' field",
    !("swaps" in mrgResult.stats),
    `found 'swaps' field in mergeSort stats — should be 'moves'`
  );

  assert(
    "quickSort stats has 'swaps' field",
    "swaps" in qckResult.stats,
    `fields: ${Object.keys(qckResult.stats).join(", ")}`
  );
  assert(
    "quickSort stats does NOT have 'moves' field",
    !("moves" in qckResult.stats)
  );
}

// ── Merge Sort still sorts correctly with the renamed field
{
  const data = [{ v: 5 }, { v: 2 }, { v: 8 }, { v: 1 }, { v: 4 }];
  const cmp  = (a, b) => a.v - b.v;
  const { sorted } = mergeSort(data, cmp);
  const values = sorted.map((x) => x.v);
  assert(
    "mergeSort still produces a correctly sorted array after rename",
    JSON.stringify(values) === JSON.stringify([1, 2, 4, 5, 8]),
    `got ${JSON.stringify(values)}`
  );
}

// ═══════════════════════════════════════════════════════════════
// PHASE 3 — SEARCH: same dataset, same key, same target
// ═══════════════════════════════════════════════════════════════
banner("PHASE 3 — Searching: fair linear vs binary comparison");

{
  // Build a fixed small dataset sorted by importance
  const raw = [
    { id: "EV1", name: "Knife",   importance: 10 },
    { id: "EV2", name: "Rope",    importance: 30 },
    { id: "EV3", name: "Phone",   importance: 50 },
    { id: "EV4", name: "Letter",  importance: 70 },
    { id: "EV5", name: "Key",     importance: 90 },
  ];
  // Already sorted by importance so binary search is valid
  const targetImportance = 70; // EV4

  const linear = linearSearch(raw, (e) => e.importance === targetImportance);
  const binary = binarySearch(raw, targetImportance, (e) => e.importance);

  assert(
    "Linear search finds the target (importance=70)",
    linear.found !== null && linear.found.id === "EV4",
    `found: ${JSON.stringify(linear.found)}`
  );
  assert(
    "Binary search finds a record with importance=70",
    binary.found !== null && binary.found.importance === 70,
    `found: ${JSON.stringify(binary.found)}`
  );
  assert(
    "Both searches use the same key (importance) and find the same value",
    linear.found !== null && binary.found !== null &&
    linear.found.importance === binary.found.importance,
    `linear found importance=${linear.found?.importance}, binary found importance=${binary.found?.importance}`
  );
  assert(
    "Binary search uses fewer or equal comparisons than linear search",
    binary.comparisons <= linear.comparisons,
    `binary=${binary.comparisons} vs linear=${linear.comparisons}`
  );
}

// ── Missing target: both return null / -1
{
  const raw = [
    { id: "EV1", importance: 10 },
    { id: "EV2", importance: 30 },
  ];
  const linear = linearSearch(raw, (e) => e.importance === 99);
  const binary = binarySearch(raw, 99, (e) => e.importance);

  assert("Linear search returns null for missing target", linear.found === null);
  assert("Binary search returns null for missing target", binary.found === null);
  assert("Linear search returns index -1 for missing target", linear.index === -1);
  assert("Binary search returns index -1 for missing target", binary.index === -1);
}

// ─────────────────────────────────────────────────────────────
// FINAL TALLY
// ─────────────────────────────────────────────────────────────
banner(`IMPROVEMENT TESTS COMPLETE — ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("\n  ✓  All targeted improvement tests passed.\n");
} else {
  console.log(`\n  ✗  ${failed} test(s) failed. Review output above.\n`);
  process.exit(1);
}
