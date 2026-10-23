/**
 * Searcher.js
 *
 * PHASE 3 - SEARCHING: Linear Search, Binary Search
 *
 * Game use: "Search Evidence" by name (linear - the list isn't ordered by
 * name) and "Search Evidence" by exact importance score once the list has
 * been sorted (binary - much faster once ordered).
 *
 * Both count comparisons so demo.js can show binary search winning by a
 * wide margin as the dataset grows.
 */

/** O(n). `predicate(record)` returns true for a match. Works on any list, sorted or not. */
function linearSearch(arr, predicate) {
  let comparisons = 0;
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    if (predicate(arr[i])) {
      return { found: arr[i], index: i, comparisons };
    }
  }
  return { found: null, index: -1, comparisons };
}

/**
 * O(log n). REQUIRES `sortedArr` to already be sorted ascending by
 * whatever number `keyFn` returns. `target` is the number being searched for.
 */
function binarySearch(sortedArr, target, keyFn) {
  let comparisons = 0;
  let low = 0, high = sortedArr.length - 1;

  while (low <= high) {
    comparisons++;
    const mid = Math.floor((low + high) / 2);
    const midVal = keyFn(sortedArr[mid]);

    if (midVal === target) {
      return { found: sortedArr[mid], index: mid, comparisons };
    } else if (midVal < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return { found: null, index: -1, comparisons };
}

module.exports = { linearSearch, binarySearch };
