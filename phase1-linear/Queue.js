/**
 * Queue.js
 *
 * PHASE 1 - LINEAR DATA STRUCTURE: QUEUE (using linked list)
 *
 * Game use: "Witness Interview Queue" and "Pending Forensic Analysis Queue"
 * - witnesses/evidence are ENQUEUEd as they come up and DEQUEUEd in
 * first-come-first-served order.
 *
 * Built on linked nodes (FIFO, head/tail pointers).
 */

class QueueNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  enqueue(item) {
    const node = new QueueNode(item);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.size++;
  }

  dequeue() {
    if (this.isEmpty()) throw new Error("Queue is empty - no one left to process");
    const data = this.head.data;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return data;
  }

  peek() {
    return this.isEmpty() ? null : this.head.data;
  }

  isEmpty() {
    return this.head === null;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
}

module.exports = { Queue };
