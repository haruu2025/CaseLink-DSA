/**
 * demo.js - PHASE 1 DEMO
 *
 * Run with:  node demo.js
 *
 * Exercises every Phase 1 structure against small CaseLink-style sample
 * data: LinkedList (records), Stack (undo history), Queue (interview
 * order), and the Stack-based expression evaluator (case scoring).
 */

const { LinkedList } = require("./LinkedList");
const { Stack } = require("./Stack");
const { Queue } = require("./Queue");
const { ActionHistory } = require("./ActionHistory");
const { evaluateExpression } = require("./ExpressionEvaluator");

function banner(title) {
  console.log();
  console.log("=".repeat(70));
  console.log(title);
  console.log("=".repeat(70));
}

// ---------------------------------------------------------------
// LINKED LIST - Evidence records
// ---------------------------------------------------------------
banner("LINKED LIST - Evidence Records (insert, update, delete, traverse)");

const evidenceList = new LinkedList();
evidenceList.insertAtEnd({ id: "EV1", name: "Kitchen Knife", importance: 88 });
evidenceList.insertAtEnd({ id: "EV2", name: "Torn Photograph", importance: 55 });
evidenceList.insertAtStart({ id: "EV0", name: "Muddy Footprint", importance: 40 }); // discovered later, added to front
evidenceList.insertAtEnd({ id: "EV3", name: "Victim's Phone", importance: 95 });

evidenceList.print("Evidence (after inserts)");

evidenceList.update("EV2", { importance: 60, note: "Re-examined under UV light" });
console.log('\nAfter update EV2 ->', evidenceList.findById("EV2"));

evidenceList.deleteById("EV0");
evidenceList.print("\nEvidence (after deleting EV0)");

// ---------------------------------------------------------------
// LINKED LIST - Case timeline (sorted insert by timestamp)
// ---------------------------------------------------------------
banner("LINKED LIST - Case Timeline (kept sorted as events are discovered)");

const timeline = new LinkedList();
const byTimestamp = (e) => e.timestamp;

// Events are handed in out of discovery order - insertSorted places each
// one in the right chronological spot automatically.
timeline.insertSorted({ id: "E4", description: "Body discovered", timestamp: 1362 }, byTimestamp);
timeline.insertSorted({ id: "E1", description: "Victim enters study", timestamp: 1325 }, byTimestamp);
timeline.insertSorted({ id: "E3", description: "Lights go out", timestamp: 1351 }, byTimestamp);
timeline.insertSorted({ id: "E2", description: "Witness hears an argument", timestamp: 1337 }, byTimestamp);

console.log("Timeline, always in time order regardless of discovery order:");
timeline.traverse().forEach((e) => console.log("   ", e));

// ---------------------------------------------------------------
// STACK - Investigation history with UNDO and REDO
// ---------------------------------------------------------------
banner("STACK - Investigation Action History (Undo / Redo)");

const history = new ActionHistory();
history.doAction("Examined desk in Study");
history.doAction("Searched bookshelf");
history.doAction("Interviewed the butler");
history.doAction("Collected knife from kitchen");

console.log("History (most recent first):", history.currentHistory());

console.log('\nUndo ->', history.undo());
console.log('Undo ->', history.undo());
console.log("History now:", history.currentHistory());
console.log("Available to redo:", history.redoAvailable());

console.log('\nRedo ->', history.redo());
console.log("History now:", history.currentHistory());
console.log("Available to redo:", history.redoAvailable());

console.log('\nPlayer takes a brand-new action -> redo history is wiped');
history.doAction("Dusted the doorknob for prints");
console.log("History now:", history.currentHistory());
console.log("Available to redo:", history.redoAvailable());

// ---------------------------------------------------------------
// QUEUE - Witness interviews AND pending forensic analysis
// ---------------------------------------------------------------
banner("QUEUE - Witness Interview Order");

const witnessQueue = new Queue();
witnessQueue.enqueue("Security Guard");
witnessQueue.enqueue("Neighbor");
witnessQueue.enqueue("Shopkeeper");
witnessQueue.enqueue("Victim's Friend");

console.log("Interview queue:", witnessQueue.toArray());
console.log("Next up for interview ->", witnessQueue.dequeue());
console.log("Remaining interview queue:", witnessQueue.toArray());

banner("QUEUE - Pending Forensic Analysis Order");

const forensicQueue = new Queue();
forensicQueue.enqueue("Kitchen Knife - fingerprint check");
forensicQueue.enqueue("Torn Photograph - restoration");
forensicQueue.enqueue("Victim's Phone - data recovery");

console.log("Forensic queue:", forensicQueue.toArray());
console.log("Next up for the lab ->", forensicQueue.dequeue());
console.log("Remaining forensic queue:", forensicQueue.toArray());

// ---------------------------------------------------------------
// STACK-BASED EXPRESSION HANDLING - Case scoring
// ---------------------------------------------------------------
banner("STACK - Expression Handling (Case Score Calculation)");

// Suppose: evidence score = 45, witness score = 30, time bonus multiplier = 2, penalty = 10
const scoreExpression = "( 45 + 30 ) * 2 - 10";
const { postfix, value } = evaluateExpression(scoreExpression);

console.log("Infix expression :", scoreExpression);
console.log("Postfix form     :", postfix.join(" "));
console.log("Final case score :", value);

banner("PHASE 1 DEMO COMPLETE");
