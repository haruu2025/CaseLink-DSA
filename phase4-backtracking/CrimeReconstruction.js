/**
 * CrimeReconstruction.js
 *
 * PHASE 4 - ALGORITHMIC TECHNIQUE: BACKTRACKING
 *
 * Problem:
 *   Given a list of fictional crime events (e.g., "Killer enters mansion",
 *   "Victim hears noise", "Window is broken") and a set of constraints
 *   (e.g., "Event A must come before Event B"), find every valid chronological
 *   ordering of those events — or determine that none exists.
 *
 *   This is a constrained permutation problem. A brute-force approach would
 *   generate all n! orderings and filter afterwards. Backtracking prunes the
 *   search tree early: as soon as a partial sequence violates a constraint,
 *   we immediately abandon that branch and try the next candidate.
 *
 * ─────────────────────────────────────────────────────────────
 * DATA REPRESENTATIONS
 * ─────────────────────────────────────────────────────────────
 *
 *   Event (object):
 *     { id: string, description: string }
 *     e.g. { id: "E1", description: "Killer enters mansion via side door" }
 *
 *   Constraint (object):
 *     { type: "before" | "notAdjacent" | "mustFollow", before: id, after: id }
 *
 *     • "before"      — event `before` must appear ANYWHERE before `after`.
 *     • "notAdjacent" — the two events may not be placed next to each other.
 *     • "mustFollow"  — `after` must appear IMMEDIATELY after `before`
 *                       (no other event between them).
 *
 * ─────────────────────────────────────────────────────────────
 * ALGORITHM WALKTHROUGH
 * ─────────────────────────────────────────────────────────────
 *
 *   reconstruct(events, constraints)
 *
 *   1. BASE CASE
 *      When the partial sequence `current` contains every event (i.e.
 *      current.length === events.length) the sequence is complete. Verify
 *      the whole sequence satisfies ALL constraints, then push a copy into
 *      `solutions` and return.
 *
 *   2. RECURSIVE STEP
 *      From the pool of events not yet placed (`remaining`), try adding
 *      each candidate to the end of `current`. For each choice, run the
 *      EARLY-PRUNE constraints to confirm the partial sequence is still
 *      valid before going deeper.
 *
 *   3. BACKTRACKING STEP
 *      If adding a candidate causes a constraint violation, do NOT recurse.
 *      Remove the candidate from `current` (i.e. pop it) and try the next
 *      one. When all candidates for this position have been tried, return
 *      up one level — that is the backtrack.
 *
 * ─────────────────────────────────────────────────────────────
 * CONSTRAINT CHECKING — TWO PHASES
 * ─────────────────────────────────────────────────────────────
 *
 *   Early-prune (checked after EVERY placement, on partial sequences):
 *     • "notAdjacent" — if the event just placed is adjacent to its
 *       constrained partner, prune immediately.
 *     • "mustFollow"  — if event A was placed two or more steps ago and
 *       the very next event placed after A is not B, prune.
 *     • "before"      — we CAN'T prune a "before" constraint early just
 *       because B comes before A in the partial sequence so far, because
 *       A might still be placed later. Instead we only confirm "before"
 *       constraints once the sequence is COMPLETE (see full-validate below).
 *       However, we CAN prune early if A is NOT in `remaining` (already
 *       placed) but came AFTER B in `current`.
 *
 *   Full-validate (checked only when sequence is COMPLETE):
 *     • All "before" constraints are verified on the final sequence.
 *     • All other constraints are re-checked for completeness.
 */

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Returns the 0-based position of an event id inside a sequence array.
 * Returns -1 if not found.
 *
 * @param {Array<{id:string}>} sequence
 * @param {string} id
 * @returns {number}
 */
function posOf(sequence, id) {
  for (let i = 0; i < sequence.length; i++) {
    if (sequence[i].id === id) return i;
  }
  return -1;
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT VALIDATORS
// ─────────────────────────────────────────────────────────────

/**
 * Checks a PARTIAL sequence after a new event has just been appended.
 * Returns { valid: true } or { valid: false, reason: string }.
 *
 * Only the constraints we can definitively detect a violation for are
 * checked here; "before" constraints are only fully verifiable at
 * sequence completion.
 *
 * @param {Array<{id:string}>} current   — partial sequence built so far
 * @param {Array<object>}      constraints
 * @returns {{ valid: boolean, reason?: string }}
 */
function checkPartial(current, constraints) {
  const last = current[current.length - 1]; // the event we just placed

  for (const c of constraints) {
    if (c.type === "notAdjacent") {
      // Violation: the two constrained events are now sitting next to each other.
      if (current.length >= 2) {
        const prev = current[current.length - 2];
        if (
          (last.id === c.a && prev.id === c.b) ||
          (last.id === c.b && prev.id === c.a)
        ) {
          return {
            valid: false,
            reason: `"${c.a}" and "${c.b}" must NOT be adjacent — but they ended up next to each other at positions ${current.length - 2} and ${current.length - 1}.`,
          };
        }
      }
    }

    if (c.type === "mustFollow") {
      // If the PREDECESSOR was placed, the next thing placed MUST be the successor.
      // Check: was c.before placed exactly one step before `last`?
      if (current.length >= 2) {
        const prev = current[current.length - 2];
        if (prev.id === c.before && last.id !== c.after) {
          return {
            valid: false,
            reason: `"${c.after}" must immediately follow "${c.before}", but "${last.id}" was placed instead.`,
          };
        }
      }
      // Also check: if `last` IS c.after, but its immediate predecessor isn't c.before.
      if (last.id === c.after && current.length >= 2) {
        const prev = current[current.length - 2];
        if (prev.id !== c.before) {
          return {
            valid: false,
            reason: `"${c.after}" must immediately follow "${c.before}", but "${prev.id}" came before it instead.`,
          };
        }
      }
      // Edge case: c.after placed first (position 0) — predecessor can't be c.before.
      if (last.id === c.after && current.length === 1) {
        return {
          valid: false,
          reason: `"${c.after}" must immediately follow "${c.before}", but it was placed first with no predecessor.`,
        };
      }
    }

    if (c.type === "before") {
      // Early prune only: if BOTH events are already in `current` and
      // the required order is already broken, prune now.
      const posA = posOf(current, c.before);
      const posB = posOf(current, c.after);
      if (posA !== -1 && posB !== -1 && posA > posB) {
        return {
          valid: false,
          reason: `"${c.before}" must come before "${c.after}", but "${c.after}" was placed at position ${posB} while "${c.before}" was placed at position ${posA}.`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates a COMPLETE sequence against all constraints.
 *
 * @param {Array<{id:string}>} sequence
 * @param {Array<object>}      constraints
 * @returns {{ valid: boolean, reason?: string }}
 */
function checkComplete(sequence, constraints) {
  for (const c of constraints) {
    if (c.type === "before") {
      const posA = posOf(sequence, c.before);
      const posB = posOf(sequence, c.after);
      if (posA === -1 || posB === -1) continue; // one of them wasn't in the set (optional events)
      if (posA >= posB) {
        return {
          valid: false,
          reason: `"${c.before}" must come before "${c.after}" — violated in the final sequence.`,
        };
      }
    }
    // notAdjacent and mustFollow are fully caught by checkPartial, but
    // we re-verify here for safety.
    if (c.type === "notAdjacent") {
      for (let i = 0; i < sequence.length - 1; i++) {
        if (
          (sequence[i].id === c.a && sequence[i + 1].id === c.b) ||
          (sequence[i].id === c.b && sequence[i + 1].id === c.a)
        ) {
          return {
            valid: false,
            reason: `"${c.a}" and "${c.b}" must NOT be adjacent — they are at positions ${i} and ${i + 1}.`,
          };
        }
      }
    }
    if (c.type === "mustFollow") {
      const posA = posOf(sequence, c.before);
      const posB = posOf(sequence, c.after);
      if (posA !== -1 && posB !== posA + 1) {
        return {
          valid: false,
          reason: `"${c.after}" must immediately follow "${c.before}" — it doesn't in the final sequence.`,
        };
      }
    }
  }
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────
// MAIN BACKTRACKING ENGINE
// ─────────────────────────────────────────────────────────────

/**
 * Finds all valid chronological orderings of `events` that satisfy
 * every constraint in `constraints`.
 *
 * The search is done by pure recursive backtracking on the full
 * permutation space, pruned aggressively by constraint checks so
 * that most invalid branches are abandoned before reaching their
 * leaf nodes.
 *
 * @param {Array<{id:string, description:string}>} events
 * @param {Array<object>} constraints
 * @param {{ maxSolutions?: number, verbose?: boolean }} [options]
 * @returns {{
 *   solutions:  Array<Array<{id:string, description:string}>>,
 *   stats: { nodesVisited: number, pruned: number, found: number }
 * }}
 */
function reconstruct(events, constraints, options = {}) {
  const { maxSolutions = Infinity, verbose = false } = options;

  const solutions = [];
  const stats = { nodesVisited: 0, pruned: 0, found: 0 };

  /**
   * RECURSIVE BACKTRACKING FUNCTION
   *
   * @param {Array<object>} current   — events placed so far (partial sequence)
   * @param {Array<object>} remaining — events not yet placed
   */
  function backtrack(current, remaining) {
    stats.nodesVisited++;

    // ── BASE CASE ────────────────────────────────────────────
    // Every event has been placed. Validate the complete sequence.
    if (remaining.length === 0) {
      const check = checkComplete(current, constraints);
      if (check.valid) {
        solutions.push([...current]); // store a snapshot, not a reference
        stats.found++;
        if (verbose) {
          console.log(`  ✓ Valid sequence found (#${stats.found}):`, current.map((e) => e.id).join(" → "));
        }
      } else {
        stats.pruned++;
        if (verbose) {
          console.log(`  ✗ Complete sequence rejected: ${check.reason}`);
        }
      }
      return;
    }

    // ── RECURSIVE STEP ───────────────────────────────────────
    // Try placing each remaining event at the next position.
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];

      // Place the candidate
      current.push(candidate);
      const newRemaining = remaining.filter((_, idx) => idx !== i);

      // ── EARLY-PRUNE ──────────────────────────────────────
      // Check whether this partial placement already violates a constraint.
      const check = checkPartial(current, constraints);

      if (!check.valid) {
        // BACKTRACKING STEP: constraint violated — undo placement and try next.
        stats.pruned++;
        if (verbose) {
          console.log(
            `  ✗ Pruned at depth ${current.length}: placed [${current.map((e) => e.id).join(",")}] — ${check.reason}`
          );
        }
        current.pop(); // ← this is the actual backtrack (undo)
        continue;      // try the next candidate instead
      }

      // Placement is valid so far — go deeper.
      backtrack(current, newRemaining);

      // ── BACKTRACKING STEP ────────────────────────────────
      // Whether the subtree succeeded or not, remove the candidate before
      // the loop tries the next one. This is the "undo" that lets us
      // reuse the same `current` array across all branches.
      current.pop();

      // Optional: stop early once enough solutions have been found.
      if (solutions.length >= maxSolutions) return;
    }
  }

  backtrack([], events);

  return { solutions, stats };
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT BUILDERS — convenience helpers for readable tests
// ─────────────────────────────────────────────────────────────

/**
 * "Event `beforeId` must appear somewhere before `afterId`."
 */
function before(beforeId, afterId) {
  return { type: "before", before: beforeId, after: afterId };
}

/**
 * "Events `a` and `b` must not be placed next to each other."
 */
function notAdjacent(a, b) {
  return { type: "notAdjacent", a, b };
}

/**
 * "`afterId` must be placed IMMEDIATELY after `beforeId` (no gap)."
 */
function mustFollow(beforeId, afterId) {
  return { type: "mustFollow", before: beforeId, after: afterId };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  reconstruct,
  checkPartial,
  checkComplete,
  before,
  notAdjacent,
  mustFollow,
};
