/**
 * Sorter.js
 *
 * PHASE 3 - SORTING: Insertion Sort, Merge Sort, Quick Sort
 *
 * Game use: sort evidence by importance, suspects by suspicion score, cases
 * by difficulty. All three are generic (take a comparator, like
 * Array.prototype.sort does) so the same code sorts any record type.
 *
 * Each function counts operations and returns them alongside the sorted
 * array. This lets demo.js show real efficiency differences rather than
 * just asserting them.
 *
 * METRIC NAMING — accurately reflects what each algorithm does:
 *
 *   Insertion Sort — stats: { comparisons, swaps }
 *     swaps = in-place element exchanges (adjacent pair swapped each time
 *     an element moves one position towards its sorted location).
 *
 *   Merge Sort     — stats: { comparisons, moves }
 *     moves = elements written back into the array during the merge step.
 *     Merge Sort does NOT swap elements in place; it copies from temporary
 *     sub-arrays back to the main array. Calling these "swaps" would be
 *     misleading, so the field is named "moves".
 *
 *   Quick Sort     — stats: { comparisons, swaps }
 *     swaps = in-place element exchanges during partitioning.
 *
 * COMPLEXITY SUMMARY (for the report)
 *   Insertion Sort: O(n²) comparisons worst case, O(n) on nearly-sorted data.
 *   Merge Sort:     O(n log n) always. Requires O(n) auxiliary space.
 *   Quick Sort:     O(n log n) average, O(n²) worst case (sorted input + last-element pivot).
 *                   In-place: O(log n) stack space on average.
 */

// ── INSERTION SORT ───────────────────────────────────────────────────────────
// O(n²) worst case — fast on small or nearly-sorted arrays.

function insertionSort(arr, cmp) {
  const a = [...arr];
  const stats = { comparisons: 0, swaps: 0 };

  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      stats.comparisons++;
      if (cmp(a[j - 1], a[j]) > 0) {
        [a[j - 1], a[j]] = [a[j], a[j - 1]]; // in-place swap
        stats.swaps++;
        j--;
      } else {
        break;
      }
    }
  }
  return { sorted: a, stats };
}

// ── MERGE SORT ───────────────────────────────────────────────────────────────
// O(n log n) always. Uses auxiliary sub-arrays during the merge step.
// The "moves" counter tracks writes back into the main array — NOT in-place swaps.

function mergeSort(arr, cmp) {
  const a = [...arr];
  const stats = { comparisons: 0, moves: 0 }; // "moves" — not "swaps"
  mergeSortHelper(a, 0, a.length - 1, cmp, stats);
  return { sorted: a, stats };
}

function mergeSortHelper(a, lo, hi, cmp, stats) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  mergeSortHelper(a, lo, mid, cmp, stats);
  mergeSortHelper(a, mid + 1, hi, cmp, stats);
  merge(a, lo, mid, hi, cmp, stats);
}

function merge(a, lo, mid, hi, cmp, stats) {
  const left = a.slice(lo, mid + 1);
  const right = a.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;

  while (i < left.length && j < right.length) {
    stats.comparisons++;
    if (cmp(left[i], right[j]) <= 0) {
      a[k++] = left[i++];
    } else {
      a[k++] = right[j++];
    }
    stats.moves++; // one element written back into the main array
  }
  // Drain remaining elements from each sub-array
  while (i < left.length)  { a[k++] = left[i++];  stats.moves++; }
  while (j < right.length) { a[k++] = right[j++]; stats.moves++; }
}

// ── QUICK SORT ───────────────────────────────────────────────────────────────
// O(n log n) average, O(n²) worst case. In-place partitioning.

function quickSort(arr, cmp) {
  const a = [...arr];
  const stats = { comparisons: 0, swaps: 0 };
  quickSortHelper(a, 0, a.length - 1, cmp, stats);
  return { sorted: a, stats };
}

function quickSortHelper(a, lo, hi, cmp, stats) {
  if (lo < hi) {
    const pivotIndex = partition(a, lo, hi, cmp, stats);
    quickSortHelper(a, lo, pivotIndex - 1, cmp, stats);
    quickSortHelper(a, pivotIndex + 1, hi, cmp, stats);
  }
}

function partition(a, lo, hi, cmp, stats) {
  const pivot = a[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    stats.comparisons++;
    if (cmp(a[j], pivot) <= 0) {
      i++;
      [a[i], a[j]] = [a[j], a[i]]; // in-place swap
      stats.swaps++;
    }
  }
  [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; // place pivot
  stats.swaps++;
  return i + 1;
}

module.exports = { insertionSort, mergeSort, quickSort };
