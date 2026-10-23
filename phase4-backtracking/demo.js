/**
 * demo.js — PHASE 4 DEMO
 *
 * Run with:  node demo.js
 *
 * Demonstrates the backtracking crime-event reconstruction algorithm
 * from CrimeReconstruction.js across three independently defined
 * fictional cases — ranging from simple to fully constrained.
 *
 * Each demo shows:
 *   • The events (what happened during the fictional crime)
 *   • The constraints (rules that must hold in any valid timeline)
 *   • How many valid orderings the backtracker finds and which ones
 *   • The pruning statistics (how many dead-end branches were cut early)
 */

const {
  reconstruct,
  before,
  notAdjacent,
  mustFollow,
} = require("./CrimeReconstruction");

// ─────────────────────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────

function banner(title) {
  console.log();
  console.log("═".repeat(70));
  console.log(`  ${title}`);
  console.log("═".repeat(70));
}

function subBanner(title) {
  console.log();
  console.log(`── ${title}`);
  console.log("─".repeat(70));
}

function printEvents(events) {
  console.log("  Events in this case:");
  events.forEach((e) => console.log(`    [${e.id}]  ${e.description}`));
}

function printConstraints(constraints) {
  console.log("\n  Constraints:");
  for (const c of constraints) {
    if (c.type === "before")      console.log(`    • "${c.before}" must occur somewhere before "${c.after}"`);
    if (c.type === "notAdjacent") console.log(`    • "${c.a}" and "${c.b}" must NOT be adjacent`);
    if (c.type === "mustFollow")  console.log(`    • "${c.after}" must occur IMMEDIATELY after "${c.before}"`);
  }
}

function printResults({ solutions, stats }) {
  console.log(`\n  Results:`);
  console.log(`    Nodes visited : ${stats.nodesVisited}`);
  console.log(`    Branches pruned early : ${stats.pruned}`);
  console.log(`    Valid sequences found : ${stats.found}`);

  if (solutions.length === 0) {
    console.log("\n  ✗  No valid timeline exists — all orderings violate at least one constraint.");
  } else {
    console.log(`\n  ✓  Valid timeline(s):`);
    solutions.forEach((seq, i) => {
      const line = seq.map((e, pos) => `  ${pos + 1}. [${e.id}] ${e.description}`).join("\n");
      console.log(`\n  — Sequence ${i + 1} —\n${line}`);
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// DEMO 1 — SIMPLE: only "before" constraints, multiple valid orderings
// ═══════════════════════════════════════════════════════════════
banner("DEMO 1 — The Locked Study: simple precedence constraints");

console.log(`
  SCENARIO
  ────────
  Lord Pemberton is found dead in his study. The detective has identified
  four fictional events that must have occurred that evening. The forensic
  report and witness statements impose ordering rules, but leave several
  valid timelines open. The backtracker finds them all.
`);

const demo1Events = [
  { id: "E1", description: "Lord Pemberton enters the study and locks the door" },
  { id: "E2", description: "The study window is forced open from outside" },
  { id: "E3", description: "A struggle is heard by the household staff" },
  { id: "E4", description: "Lord Pemberton is found unconscious on the floor" },
];

const demo1Constraints = [
  before("E1", "E3"),   // Pemberton must be in the study before the struggle
  before("E2", "E3"),   // Window must be forced before the struggle (entry route)
  before("E3", "E4"),   // Struggle must precede discovery
];

printEvents(demo1Events);
printConstraints(demo1Constraints);

const demo1Result = reconstruct(demo1Events, demo1Constraints);
printResults(demo1Result);

// ═══════════════════════════════════════════════════════════════
// DEMO 2 — FULLY CONSTRAINED: exactly one valid ordering
// ═══════════════════════════════════════════════════════════════
banner("DEMO 2 — The Poisoned Decanter: constraints narrow to one timeline");

console.log(`
  SCENARIO
  ────────
  A guest is poisoned at a dinner party. Security footage, a door log,
  and witness accounts together impose enough ordering constraints that
  only a SINGLE valid sequence of events is consistent with the evidence.
  The backtracker must explore and discard all other orderings.
`);

const demo2Events = [
  { id: "A", description: "Suspect slips into the butler's pantry unnoticed" },
  { id: "B", description: "Poison is added to the decanter in the pantry" },
  { id: "C", description: "Decanter is brought to the dining table" },
  { id: "D", description: "Guest pours and drinks from the decanter" },
  { id: "E", description: "Guest collapses — staff call for the doctor" },
];

const demo2Constraints = [
  before("A", "B"),    // Suspect must be in pantry before adding poison
  mustFollow("A", "B"), // Poison added IMMEDIATELY after suspect enters pantry
  before("B", "C"),    // Poison must be in decanter before it goes to table
  before("C", "D"),    // Decanter must be on table before guest pours
  before("D", "E"),    // Guest must drink before collapsing
];

printEvents(demo2Events);
printConstraints(demo2Constraints);

const demo2Result = reconstruct(demo2Events, demo2Constraints);
printResults(demo2Result);

// ═══════════════════════════════════════════════════════════════
// DEMO 3 — IMPOSSIBLE: constraints are contradictory
//         Demonstrates that the algorithm correctly finds no solution
// ═══════════════════════════════════════════════════════════════
banner("DEMO 3 — The Impossible Alibi: contradictory constraints, no valid solution");

console.log(`
  SCENARIO
  ────────
  The lead detective has compiled three witness statements about the
  night of the Whitmore Gallery theft. On close reading, the statements
  are mutually contradictory: together they demand a circular ordering
  that cannot exist on a real timeline (X before Y before Z before X).
  The backtracker exhausts every ordering and finds none that satisfies
  all three constraints — correctly concluding the alibi is impossible.
`);

const demo3Events = [
  { id: "X", description: "Suspect disables the gallery alarm system" },
  { id: "Y", description: "Suspect is seen entering through the skylight" },
  { id: "Z", description: "Guard checks the alarm panel and finds it intact" },
];

// Circular dependency: X must be before Y, Y before Z, AND Z before X.
// No permutation of three events can satisfy all three simultaneously.
const demo3Constraints = [
  before("X", "Y"),
  before("Y", "Z"),
  before("Z", "X"),  // ← This creates the impossible cycle
];

printEvents(demo3Events);
printConstraints(demo3Constraints);

const demo3Result = reconstruct(demo3Events, demo3Constraints);
printResults(demo3Result);

// ═══════════════════════════════════════════════════════════════
// DEMO 4 — MIXED CONSTRAINT TYPES: before + notAdjacent + mustFollow
// ═══════════════════════════════════════════════════════════════
banner("DEMO 4 — The Riverside Warehouse: all three constraint types");

console.log(`
  SCENARIO
  ────────
  A break-in at a riverside warehouse. Five events are known to have
  occurred. Constraints come from three different sources:
    - CCTV timestamps (before)
    - A witness who says two events couldn't have been back-to-back (notAdjacent)
    - A door sensor showing one event triggered another immediately (mustFollow)
  The backtracker finds only the sequences consistent with ALL sources.
`);

const demo4Events = [
  { id: "W1", description: "Perimeter fence is cut at the north-east corner" },
  { id: "W2", description: "Guard dog at warehouse rear is sedated" },
  { id: "W3", description: "Side door padlock is broken open" },
  { id: "W4", description: "Warehouse interior lights flicker off (fuse tripped)" },
  { id: "W5", description: "Loading bay roller door is raised and goods removed" },
];

const demo4Constraints = [
  before("W1", "W3"),        // Fence cut before side door forced
  before("W2", "W5"),        // Dog must be sedated before goods are removed
  mustFollow("W3", "W4"),    // Fuse trips IMMEDIATELY after door is forced (sensor)
  notAdjacent("W1", "W2"),   // Witness: fence cutting and sedation were not back-to-back
];

printEvents(demo4Events);
printConstraints(demo4Constraints);

// We cap at 5 valid solutions just to keep output readable; verbose=false
const demo4Result = reconstruct(demo4Events, demo4Constraints, { maxSolutions: 5 });
printResults(demo4Result);

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
banner("DEMO COMPLETE — Phase 4 Summary");
console.log(`
  The backtracking algorithm in CrimeReconstruction.js:

  1. Represents each crime event as a plain JavaScript object {id, description}.
  2. Accepts three constraint types: before, notAdjacent, mustFollow.
  3. Explores the permutation tree recursively, placing one event at a time.
  4. At each placement, runs checkPartial() to detect constraint violations
     early and prune the entire subtree — no wasted computation on doomed paths.
  5. When all events are placed, runs checkComplete() to confirm the full
     sequence is valid, then records it as a solution.
  6. Returns every valid sequence found and pruning statistics.

  This is genuine backtracking: the algorithm DOES NOT know the answer in
  advance. It discovers valid timelines by systematic exploration and elimination.

  Note: this system narrates logical consistency of fictional events only.
  It does not determine real-world guilt or prove who committed any act.
`);
