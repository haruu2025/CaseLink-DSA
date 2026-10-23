/**
 * BST.js
 *
 * PHASE 2 - BINARY SEARCH TREE
 *
 * Game use: "efficient access to selected investigation records" — here,
 * suspects keyed by their suspicionScore. Inserting keeps them ordered
 * automatically; search() is O(log n) on a balanced tree (vs O(n) for the
 * LinkedList's linear scan in Phase 1); an inorder traversal gives every
 * suspect back in ascending suspicion order for free.
 *
 * KEY DESIGN NOTES
 * ────────────────
 * The BST is keyed on a NUMERIC value (e.g. suspicionScore).  Suspicion
 * scores are investigative indicators only — a high score means "warrants
 * more attention," not "is guilty." No guilt is inferred from BST position.
 *
 * DUPLICATE KEYS
 * ──────────────
 * Two suspects may share the same suspicion score.  Rather than silently
 * overwriting or ignoring a duplicate key, each node holds a `records`
 * array.  insert() appends to that array when the key already exists.
 * search() returns the entire records array for a given key.
 * delete() removes one record by its `id` field.  When the last record
 * at a key is removed, the BST node itself is deleted.
 *
 * SIZE BUG FIX
 * ────────────
 * The original _deleteNode decremented this.size inside the recursive
 * helper.  For a two-children deletion the helper calls itself once more
 * to remove the in-order successor, which decremented the counter a second
 * time — leaving size one too low.  The fix: decrement size exactly once
 * in the public delete() method, after confirming a record was removed.
 */

class BSTNode {
  constructor(key, record) {
    this.key = key;
    this.records = [record]; // array supports duplicate keys
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
    this.size = 0; // total number of individual records (not nodes)
  }

  // ──────────────────────────────────────────────
  // INSERT
  // ──────────────────────────────────────────────

  /**
   * Insert a record under `key`.
   * If a node with this key already exists, the record is appended to its
   * records array (no duplicate key → no lost data).
   */
  insert(key, record) {
    this.root = this._insertNode(this.root, key, record);
    this.size++;
  }

  _insertNode(node, key, record) {
    if (!node) return new BSTNode(key, record);
    if (key === node.key) {
      // Duplicate key: add to the existing node's record list.
      node.records.push(record);
    } else if (key < node.key) {
      node.left = this._insertNode(node.left, key, record);
    } else {
      node.right = this._insertNode(node.right, key, record);
    }
    return node;
  }

  // ──────────────────────────────────────────────
  // SEARCH
  // ──────────────────────────────────────────────

  /**
   * O(log n) on a balanced tree, O(n) worst case on a skewed one.
   * Returns the records array for the given key, or null if not found.
   */
  search(key) {
    let current = this.root;
    while (current) {
      if (key === current.key) return current.records;
      current = key < current.key ? current.left : current.right;
    }
    return null;
  }

  // ──────────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────────

  /**
   * Delete a single record by its `id` field from the node with the given key.
   * Returns true if a record was removed, false if not found.
   *
   * Size is decremented exactly once here, never inside the recursive helper,
   * which was the source of the original double-decrement bug.
   */
  delete(key, recordId) {
    let removed = false;
    this.root = this._deleteNode(this.root, key, recordId, (flag) => { removed = flag; });
    if (removed) this.size--;
    return removed;
  }

  _deleteNode(node, key, recordId, setRemoved) {
    if (!node) { setRemoved(false); return null; }

    if (key < node.key) {
      node.left = this._deleteNode(node.left, key, recordId, setRemoved);
    } else if (key > node.key) {
      node.right = this._deleteNode(node.right, key, recordId, setRemoved);
    } else {
      // Found the node with this key — remove the specific record by id.
      const before = node.records.length;
      node.records = node.records.filter((r) => r.id !== recordId);
      const after = node.records.length;
      setRemoved(after < before);

      if (node.records.length > 0) {
        // Still records at this key — keep the BST node.
        return node;
      }

      // No records left at this key — remove the BST node itself.
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Two children: replace with the smallest node in the right subtree
      // (in-order successor).  We copy its key+records, then delete THAT
      // node from the right subtree.  The recursive call below does NOT
      // decrement size (size is managed only in the public delete()).
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.key = successor.key;
      node.records = successor.records;
      // _deleteNodeByKey removes the entire BST node for successor.key,
      // regardless of record ids (all its records have been moved up).
      node.right = this._deleteNodeByKey(node.right, successor.key);
    }
    return node;
  }

  /**
   * Internal helper used by _deleteNode when removing the in-order successor
   * node wholesale (all records already moved to the parent).
   * Deletes the node unconditionally by key, ignoring record ids.
   */
  _deleteNodeByKey(node, key) {
    if (!node) return null;
    if (key < node.key) { node.left = this._deleteNodeByKey(node.left, key); return node; }
    if (key > node.key) { node.right = this._deleteNodeByKey(node.right, key); return node; }
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    let successor = node.right;
    while (successor.left) successor = successor.left;
    node.key = successor.key;
    node.records = successor.records;
    node.right = this._deleteNodeByKey(node.right, successor.key);
    return node;
  }

  // ──────────────────────────────────────────────
  // RANGE QUERY
  // ──────────────────────────────────────────────

  /**
   * All records with min <= key <= max, in ascending order.
   * This is an inorder walk that prunes whole subtrees known to be out of
   * range — e.g. if node.key < min, its entire left subtree is also < min
   * and gets skipped without visiting it. That pruning is the actual
   * efficiency advantage over scanning a flat list record-by-record.
   */
  rangeQuery(min, max, node = this.root, result = []) {
    if (!node) return result;
    if (node.key > min) this.rangeQuery(min, max, node.left, result);
    if (node.key >= min && node.key <= max) result.push(...node.records);
    if (node.key < max) this.rangeQuery(min, max, node.right, result);
    return result;
  }

  // ──────────────────────────────────────────────
  // TRAVERSALS — return flat arrays of records
  // ──────────────────────────────────────────────

  inorder(node = this.root, result = []) {
    if (!node) return result;
    this.inorder(node.left, result);
    result.push(...node.records);
    this.inorder(node.right, result);
    return result;
  }

  preorder(node = this.root, result = []) {
    if (!node) return result;
    result.push(...node.records);
    this.preorder(node.left, result);
    this.preorder(node.right, result);
    return result;
  }

  postorder(node = this.root, result = []) {
    if (!node) return result;
    this.postorder(node.left, result);
    this.postorder(node.right, result);
    result.push(...node.records);
    return result;
  }
}

module.exports = { BST, BSTNode };
