/**
 * LinkedList.js
 *
 * PHASE 1 - LINEAR DATA STRUCTURE: LINKED LIST
 *
 * Game use: store suspects, witnesses, evidence, and investigation events.
 * Any of these record types can be inserted, deleted, updated, or listed
 * (traversed) as the player progresses through a case.
 *
 * Built from raw nodes (no Array/Map used internally) so the pointer
 * mechanics are visible and explainable.
 *
 * Records are plain objects that must have a unique `id` field, e.g.
 * { id: "S1", name: "Arthur Black", ... }
 */

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  /** Insert at the end - O(n) since we walk to the tail. */
  insertAtEnd(data) {
    const node = new Node(data);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.size++;
    return data;
  }

  /** Insert at the front - O(1). */
  insertAtStart(data) {
    const node = new Node(data);
    node.next = this.head;
    this.head = node;
    this.size++;
    return data;
  }

  /**
   * Insert keeping the list ordered ascending by whatever number `keyFn`
   * returns for each record - e.g. keyFn = (e) => e.timestamp.
   * Used for the case timeline: events can be discovered in any order,
   * but the list always stays in chronological order.
   */
  insertSorted(data, keyFn) {
    const node = new Node(data);
    if (!this.head || keyFn(data) < keyFn(this.head.data)) {
      node.next = this.head;
      this.head = node;
    } else {
      let current = this.head;
      while (current.next && keyFn(current.next.data) <= keyFn(data)) {
        current = current.next;
      }
      node.next = current.next;
      current.next = node;
    }
    this.size++;
    return data;
  }

  /** Delete the first record whose `id` matches. Returns true if something was removed. */
  deleteById(id) {
    if (!this.head) return false;

    if (this.head.data.id === id) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next && current.next.data.id !== id) {
      current = current.next;
    }
    if (current.next) {
      current.next = current.next.next;
      this.size--;
      return true;
    }
    return false;
  }

  /** Find a record by id (linear traversal). Returns the record or null. */
  findById(id) {
    let current = this.head;
    while (current) {
      if (current.data.id === id) return current.data;
      current = current.next;
    }
    return null;
  }

  /** Merge `updates` into the record with this id. Returns the updated record or null. */
  update(id, updates) {
    const record = this.findById(id);
    if (!record) return null;
    Object.assign(record, updates);
    return record;
  }

  /** Traverse the whole list, returning a plain array of the stored records. */
  traverse() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  print(label = "LinkedList") {
    console.log(`${label} (${this.size} records):`);
    this.traverse().forEach((r) => console.log("   ", r));
  }
}

module.exports = { LinkedList, Node };
