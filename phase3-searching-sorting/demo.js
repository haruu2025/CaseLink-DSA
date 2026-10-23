/**
 * demo.js - PHASE 3 DEMO
 *
 * Run with:  node demo.js
 *
 * Demonstrates Insertion Sort, Merge Sort, and Quick Sort on the SAME
 * fixed dataset at increasing sizes so comparisons/operations grow at
 * visibly different rates — that is the efficiency comparison the project
 * requires. Then demonstrates Linear Search vs Binary Search on the same
 * dataset, using the same key (importance) for both, so the comparison is
 * directly meaningful.
 *
 * REPRODUCIBILITY
 * ───────────────
 * Data is generated with a deterministic pseudo-random sequence (seeded
 * LCG) so every run produces the same numbers. Sorting benchmark results
 * are therefore consistent across runs and comparable between people.
 *
 * METRIC NAMES
 * ────────────
 * Insertion Sort and Quick Sort report "swaps"  — genuine in-place exchanges.
 * Merge Sort reports "moves" — elements written back from auxiliary arrays;
 * calling these "swaps" would be inaccurate for Merge Sort.
 */

const { insertionSort, mergeSort, quickSort } = require("./Sorter");
const { linearSearch, binarySearch } = require("./Searcher");

function banner(title) {
  console.log();
  console.log("=".repeat(70));
  console.log(title);
  console.log("=".repeat(70));
}

// ─────────────────────────────────────────────────────────────
// DETERMINISTIC DATA GENERATOR
// Linear Congruential Generator — same seed → same sequence every run.
// ─────────────────────────────────────────────────────────────

function makeLCG(seed) {
  // Parameters from Numerical Recipes
  let s = seed >>> 0;
  return function nextInt(max) {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return (s % max) + 1; // returns 1..max
  };
}

const NAMES = [
  "Kitchen Knife", "Torn Photograph", "Victim's Phone", "Muddy Footprint",
  "Threatening Letter", "Broken Vase", "Missing Key", "Bloodstain",
  "Diary Page", "Receipt", "Glove", "Cigarette Butt", "Rope", "Ticket Stub",
];

/**
 * Generates `n` evidence records with deterministic importance values.
 * Importance values are in the range 1–100 with no forced uniqueness;
 * duplicates can exist, which is realistic and tests sort stability.
 */
function generateEvidence(n, seed = 42) {
  const rand = makeLCG(seed);
  const ev = [];
  for (let i = 0; i < n; i++) {
    ev.push({
      id: `EV${i + 1}`,
      name: `${NAMES[i % NAMES.length]} #${i + 1}`,
      importance: rand(100),
    });
  }
  return ev;
}

function isSorted(arr, cmp) {
  for (let i = 1; i < arr.length; i++) {
    if (cmp(arr[i - 1], arr[i]) > 0) return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
// SORT BENCHMARK
// ─────────────────────────────────────────────────────────────

function runSortComparison(size) {
  const data = generateEvidence(size); // same seed → same data for all three
  const byImportance = (a, b) => a.importance - b.importance;

  const insertionResult = insertionSort(data, byImportance);
  const mergeResult     = mergeSort(data,     byImportance);
  const quickResult     = quickSort(data,     byImportance);

  console.log(`\n-- n = ${size} evidence records (seed=42) --`);
  console.log(
    "  Insertion Sort:  comparisons =",
    insertionResult.stats.comparisons.toString().padStart(6),
    "  swaps =",
    insertionResult.stats.swaps.toString().padStart(6),
    "  correct:", isSorted(insertionResult.sorted, byImportance)
  );
  console.log(
    "  Merge Sort:      comparisons =",
    mergeResult.stats.comparisons.toString().padStart(6),
    "  moves =",  // accurate: Merge Sort writes, not swaps
    mergeResult.stats.moves.toString().padStart(6),
    "  correct:", isSorted(mergeResult.sorted, byImportance)
  );
  console.log(
    "  Quick Sort:      comparisons =",
    quickResult.stats.comparisons.toString().padStart(6),
    "  swaps =",
    quickResult.stats.swaps.toString().padStart(6),
    "  correct:", isSorted(quickResult.sorted, byImportance)
  );

  return mergeResult.sorted; // return sorted copy for search demo
}

// ─────────────────────────────────────────────────────────────
// SORTING - growing sizes to show O(n²) vs O(n log n)
// ─────────────────────────────────────────────────────────────

banner("SORTING - Insertion vs Merge vs Quick, at growing sizes");
console.log("Watch Insertion Sort's comparisons grow much faster than");
console.log("Merge/Quick as n increases. That is O(n²) vs O(n log n).");
console.log("Note: Merge Sort reports 'moves' (array writes), not 'swaps'.");

runSortComparison(10);
runSortComparison(50);
runSortComparison(200);
const sortedEvidence = runSortComparison(1000);

// ─────────────────────────────────────────────────────────────
// SEARCHING - Linear Search vs Binary Search
//
// FAIR COMPARISON RULES
// ─────────────────────
// Both searches operate on the SAME sorted list (sortedEvidence) and
// look for the SAME key (importance). The list is already sorted by
// importance, which Binary Search requires. Linear Search scans the
// sorted list looking for the same value — this is its normal O(n)
// behaviour regardless of order.
//
// We pick a target that exists in the list (the element at position 700)
// so both searches can find it and report comparable comparison counts.
// ─────────────────────────────────────────────────────────────

banner("SEARCHING - Linear Search vs Binary Search");
console.log("Both searches look for the SAME target importance on the SAME");
console.log("1000-record list sorted by importance. This makes the");
console.log("comparison of O(n) vs O(log n) directly meaningful.");

// Pick the element at position 700 as the target — it definitely exists.
const target = sortedEvidence[700];
const targetImportance = target.importance;

console.log(`\nTarget: importance = ${targetImportance} (element at sorted position 700)`);

// Linear Search — scans the sorted array with a predicate
const linearResult = linearSearch(sortedEvidence, (e) => e.importance === targetImportance);
console.log(`\nLinear Search for importance = ${targetImportance}:`);
console.log(`  Found: ${linearResult.found ? linearResult.found.name : "null"}`);
console.log(`  Comparisons: ${linearResult.comparisons}`);

// Binary Search — same list, same key function, same target value
const binaryResult = binarySearch(sortedEvidence, targetImportance, (e) => e.importance);
console.log(`\nBinary Search for importance = ${targetImportance} (list is sorted by importance):`);
console.log(`  Found: ${binaryResult.found ? binaryResult.found.name : "null"}`);
console.log(`  Comparisons: ${binaryResult.comparisons}`);

console.log(
  `\nOn ${sortedEvidence.length} records: Binary Search used ${binaryResult.comparisons}` +
  ` comparison(s) vs Linear Search's ${linearResult.comparisons}. ` +
  `That ratio illustrates O(log n) vs O(n).`
);

console.log(
  "\nNote: if multiple records share the same importance value, Linear Search returns" +
  "\nthe first match found by scanning; Binary Search returns one match from the sorted" +
  "\nmidpoint. Both correctly locate a record with the target importance."
);

banner("PHASE 3 DEMO COMPLETE");
