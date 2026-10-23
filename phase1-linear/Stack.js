/**
 * Stack.js
 *
 * PHASE 1 - LINEAR DATA STRUCTURE: STACK (using linked list)
 *
 * Game use: "Investigation History" - every action the investigator takes
 * (examine desk, interview witness, collect evidence...) is PUSHed onto
 * this stack. Pressing UNDO POPs the most recent action off.
 *
 * Built on linked nodes (LIFO) - no built-in JS array methods used for the
 * core push/pop mechanics.
 */

class StackNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class Stack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(item) {
    const node = new StackNode(item);
    node.next = this.top;
    this.top = node;
    this.size++;
  }

  pop() {
    if (this.isEmpty()) throw new Error("Cannot undo - no actions in history");
    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  peek() {
    return this.isEmpty() ? null : this.top.data;
  }

  isEmpty() {
    return this.top === null;
  }

  /** Most-recent-first list of everything currently on the stack. */
  toArray() {
    const result = [];
    let current = this.top;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
}

module.exports = { Stack };
