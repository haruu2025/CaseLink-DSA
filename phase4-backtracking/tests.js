/**
 * tests.js — PHASE 4 TEST SUITE
 *
 * Run with:  node tests.js
 *
 * Exercises CrimeReconstruction.js against nine explicitly defined test
 * cases. Each test makes a concrete, verifiable assertion about the
 * output of reconstruct(). Results are printed to the console.
 *
 * No external test framework is used — the assertions are plain
 * JavaScript so the file requires only Node.js.
 */

const {
  reconstruct,
  checkPartial,
  checkComplete,
  before,
  notAdjacent,
  mustFollow,
} = require("./CrimeReconstruction");

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

function banner(title) {
  console.log();
  console.log("═".repeat(70));
  console.log(`  ${title}`);
  console.log("═".repeat(70));
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Returns true if the sequence array contains the ids in the given order. */
function sequenceHasOrder(seq, ...ids) {
  const positions = ids.map((id) => seq.findIndex((e) => e.id === id));
  for (let i = 0; i < positions.length - 1; i++) {
    if (positions[i] >= positions[i + 1]) return false;
  }
  return true;
}

/** Returns true if id1 and id2 are adjacent (either order) in seq. */
function areAdjacent(seq, id1, id2) {
  for (let i = 0; i < seq.length - 1; i++) {
    if (
      (seq[i].id === id1 && seq[i + 1].id === id2) ||
      (seq[i].id === id2 && seq[i + 1].id === id1)
    ) return true;
  }
  return false;
}

/** Returns true if id2 appears IMMEDIATELY after id1 in seq. */
function immediatelyFollows(seq, id1, id2) {
  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i].id === id1 && seq[i + 1].id === id2) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 1: NO CONSTRAINTS
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 1 — No constraints: all permutations valid");

{
  // With 3 events and zero constraints all 3! = 6 orderings are valid.
  const events = [
    { id: "A", description: "Event A" },
    { id: "B", description: "Event B" },
    { id: "C", description: "Event C" },
  ];
  const { solutions } = reconstruct(events, []);

  assert(
    "3 events, no constraints → exactly 6 solutions",
    solutions.length === 6,
    `got ${solutions.length}`
  );

  assert(
    "All 6 solutions contain all 3 events",
    solutions.every((s) => s.length === 3),
    `some solution had wrong length`
  );
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 2: SINGLE "before" CONSTRAINT
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 2 — Single 'before' constraint");

{
  const events = [
    { id: "X", description: "Break window" },
    { id: "Y", description: "Enter room" },
    { id: "Z", description: "Steal item" },
  ];
  // X must come before Z. X–Y and Y–Z order still free.
  const constraints = [before("X", "Z")];
  const { solutions } = reconstruct(events, constraints);

  assert(
    "'before' X→Z: every solution has X before Z",
    solutions.every((s) => sequenceHasOrder(s, "X", "Z")),
    "at least one solution had Z before X"
  );

  // With before(X,Z): valid orderings are XYZ, XZY, YXZ — exactly 3.
  // (YZX, ZXY, ZYX all have Z before X → invalid.)
  assert(
    "'before' X→Z: exactly 3 solutions",
    solutions.length === 3,
    `got ${solutions.length}`
  );
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 3: CIRCULAR DEPENDENCY — must find zero solutions
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 3 — Circular 'before' constraints → impossible");

{
  const events = [
    { id: "P", description: "Event P" },
    { id: "Q", description: "Event Q" },
    { id: "R", description: "Event R" },
  ];
  const constraints = [before("P", "Q"), before("Q", "R"), before("R", "P")];
  const { solutions, stats } = reconstruct(events, constraints);

  assert(
    "Circular dependency → 0 valid solutions",
    solutions.length === 0,
    `got ${solutions.length}`
  );

  assert(
    "Circular dependency → algorithm still visited nodes (not short-circuited trivially)",
    stats.nodesVisited > 0
  );
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 4: "notAdjacent" CONSTRAINT
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 4 — 'notAdjacent' constraint");

{
  const events = [
    { id: "M", description: "Motive revealed" },
    { id: "N", description: "No-alibi window" },
    { id: "O", description: "Opportunity arises" },
  ];
  const constraints = [notAdjacent("M", "O")];
  const { solutions } = reconstruct(events, constraints);

  assert(
    "notAdjacent M–O: no solution has M and O next to each other",
    solutions.every((s) => !areAdjacent(s, "M", "O")),
    "found a solution with M and O adjacent"
  );

  assert(
    "notAdjacent M–O: at least one valid solution exists",
    solutions.length > 0,
    "no solutions found at all"
  );
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 5: "mustFollow" CONSTRAINT
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 5 — 'mustFollow' (immediate succession) constraint");

{
  const events = [
    { id: "D1", description: "Door sensor triggers" },
    { id: "D2", description: "Alarm sounds immediately after" },
    { id: "D3", description: "Guard responds" },
  ];
  const constraints = [mustFollow("D1", "D2")]; // D2 must be immediately after D1
  const { solutions } = reconstruct(events, constraints);

  assert(
    "mustFollow D1→D2: every solution has D2 immediately after D1",
    solutions.every((s) => immediatelyFollows(s, "D1", "D2")),
    "found a solution where D2 is not immediately after D1"
  );

  // Exactly two orderings place D3 before the D1–D2 block (D3,D1,D2) and
  // none places D3 between D1 and D2. D1,D2,D3 is also valid. That's 2.
  assert(
    "mustFollow D1→D2: exactly 2 valid solutions",
    solutions.length === 2,
    `got ${solutions.length}`
  );
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 6: FULLY DETERMINED — exactly one valid solution
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 6 — Fully determined: exactly one valid solution");

{
  const events = [
    { id: "F1", description: "Fuse box is tampered with" },
    { id: "F2", description: "Gallery goes dark" },
    { id: "F3", description: "Painting is removed from wall" },
    { id: "F4", description: "Thief exits through rear fire door" },
  ];
  const constraints = [
    before("F1", "F2"),
    mustFollow("F1", "F2"),  // F2 immediately follows F1
    before("F2", "F3"),
    before("F3", "F4"),
  ];
  const { solutions } = reconstruct(events, constraints);

  assert(
    "Fully determined case → exactly 1 valid solution",
    solutions.length === 1,
    `got ${solutions.length}`
  );

  if (solutions.length === 1) {
    assert(
      "The single solution is F1 → F2 → F3 → F4",
      sequenceHasOrder(solutions[0], "F1", "F2", "F3", "F4"),
      `got: ${solutions[0].map((e) => e.id).join(" → ")}`
    );
  }
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 7: CONFLICT — valid order required, then broken by mustFollow
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 7 — Conflicting constraints → impossible");

{
  // "before G1 G2" + "mustFollow G2 G1" is contradictory:
  //   G1 must come before G2, but G1 must also immediately follow G2.
  const events = [
    { id: "G1", description: "Gate is locked" },
    { id: "G2", description: "Guard is called" },
  ];
  const constraints = [before("G1", "G2"), mustFollow("G2", "G1")];
  const { solutions } = reconstruct(events, constraints);

  assert(
    "Conflicting before + mustFollow → 0 valid solutions",
    solutions.length === 0,
    `got ${solutions.length}`
  );
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 8: maxSolutions CAP respected
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 8 — maxSolutions option");

{
  const events = [
    { id: "T1", description: "Event T1" },
    { id: "T2", description: "Event T2" },
    { id: "T3", description: "Event T3" },
    { id: "T4", description: "Event T4" },
  ];
  // No constraints → 4! = 24 valid orderings
  const { solutions } = reconstruct(events, [], { maxSolutions: 3 });

  assert(
    "maxSolutions: returns at most 3 solutions when cap is 3",
    solutions.length <= 3,
    `got ${solutions.length}`
  );

  assert(
    "maxSolutions: returns at least 1 solution (solutions exist)",
    solutions.length >= 1
  );
}

// ─────────────────────────────────────────────────────────────
// ── TEST GROUP 9: UNIT TESTS FOR HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

banner("TEST GROUP 9 — Unit tests for checkPartial and checkComplete");

{
  const ev = (id) => ({ id, description: `Event ${id}` });

  // checkPartial: "before" already broken mid-sequence
  const partialCheck1 = checkPartial([ev("B"), ev("A")], [before("A", "B")]);
  assert(
    "checkPartial detects 'before' violation when both events are placed",
    !partialCheck1.valid,
    `expected invalid, got valid=${partialCheck1.valid}`
  );

  // checkPartial: "before" NOT yet broken (A not placed yet)
  const partialCheck2 = checkPartial([ev("B")], [before("A", "B")]);
  assert(
    "checkPartial does not prune 'before' when A hasn't been placed yet",
    partialCheck2.valid === true,
    `expected valid, got valid=${partialCheck2.valid}`
  );

  // checkComplete: "before" violation in a full sequence
  const completeCheck = checkComplete([ev("Z"), ev("Y")], [before("Y", "Z")]);
  assert(
    "checkComplete detects 'before' violation in final sequence",
    !completeCheck.valid,
    `expected invalid, got valid=${completeCheck.valid}`
  );

  // checkPartial: "notAdjacent" detected immediately
  const adjCheck = checkPartial([ev("C"), ev("D")], [notAdjacent("C", "D")]);
  assert(
    "checkPartial detects notAdjacent immediately",
    !adjCheck.valid,
    `expected invalid, got valid=${adjCheck.valid}`
  );
}

// ─────────────────────────────────────────────────────────────
// FINAL TALLY
// ─────────────────────────────────────────────────────────────

banner(`TESTS COMPLETE — ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("\n  ✓  All tests passed. Phase 4 backtracking engine is verified.\n");
} else {
  console.log(`\n  ✗  ${failed} test(s) failed. Review output above for details.\n`);
  process.exit(1); // non-zero exit so a CI system can detect failure
}
