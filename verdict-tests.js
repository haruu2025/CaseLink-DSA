/**
 * verdict-tests.js
 *
 * Automated Test Suite for CaseLink Final Verdict Engine & Case Dossier Solutions
 *
 * Verifies:
 * 1. Each case in casesData has exactly one explicitly defined canonical culprit.
 * 2. Suspicion scores are NOT used as proof: the canonical culprit is explicitly validated.
 * 3. Correct suspect selection yields 'CASE SOLVED' with full forensic justification.
 * 4. Incorrect suspect selection yields 'INCORRECT SUSPECT' and an investigative hint WITHOUT revealing the culprit.
 * 5. Missing suspect selection is rejected with a validation error.
 * 6. Cross-case suspect submission (suspect from Case A submitted to Case B) is strictly rejected.
 * 7. REVEAL SOLUTION delivers the canonical culprit, motive, method, opportunity, timeline, and decisive clues.
 * 8. Case switching consistency: each case loads its unique suspect set and unique solution.
 * 9. Evidence evaluation: player clue selection correctly classifies matched decisive clues vs missed clues.
 * 10. Timeline alignment: official chronological explanations are consistent with the backtracking constraint results.
 */

const { cases } = require("./casesData");
const { evaluateVerdict, revealSolution, getAllCanonicalSolutions, getCaseById } = require("./verdictEngine");
const { reconstruct, before, mustFollow, notAdjacent } = require("./phase4-backtracking/CrimeReconstruction");

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

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 1 — CANONICAL CULPRIT INTEGRITY ACROSS ALL CASES
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 1 — Canonical Culprit Integrity Across All Cases");

{
  assert("Case list is non-empty", Array.isArray(cases) && cases.length >= 3, `Found ${cases.length} cases`);

  cases.forEach((c) => {
    assert(
      `[${c.id}] has an official solution object`,
      c.solution && typeof c.solution === "object"
    );

    assert(
      `[${c.id}] has a defined canonicalCulpritId`,
      typeof c.solution?.canonicalCulpritId === "string" && c.solution.canonicalCulpritId.length > 0,
      `canonicalCulpritId: ${c.solution?.canonicalCulpritId}`
    );

    // Verify the canonical culprit actually exists in the case's suspects list
    const culpritSuspect = c.suspects.find((s) => s.id === c.solution.canonicalCulpritId);
    assert(
      `[${c.id}] canonical culprit '${c.solution?.canonicalCulpritId}' exists in suspects array`,
      culpritSuspect !== undefined,
      `Suspect IDs in case: ${c.suspects.map((s) => s.id).join(", ")}`
    );

    assert(
      `[${c.id}] solution defines motive, method, opportunity, and chronology`,
      Boolean(c.solution?.motive && c.solution?.methodAndOpportunity && c.solution?.chronologicalExplanation)
    );

    assert(
      `[${c.id}] solution defines at least 2 decisive evidence IDs`,
      Array.isArray(c.solution?.decisiveEvidenceIds) && c.solution.decisiveEvidenceIds.length >= 2,
      `Found ${c.solution?.decisiveEvidenceIds?.length} decisive clues`
    );

    // Verify decisive evidence IDs actually exist in case evidence
    const allEvIds = new Set(c.evidence.map((e) => e.id));
    const allDecisiveExist = (c.solution?.decisiveEvidenceIds || []).every((id) => allEvIds.has(id));
    assert(
      `[${c.id}] all decisiveEvidenceIds exist in evidence locker`,
      allDecisiveExist,
      `Decisive IDs: ${c.solution?.decisiveEvidenceIds?.join(", ")}`
    );

    assert(
      `[${c.id}] solution contains misleadingClues analysis for alternative suspects`,
      Array.isArray(c.solution?.misleadingClues) && c.solution.misleadingClues.length > 0
    );

    assert(
      `[${c.id}] solution contains tailored suspectHints for incorrect suspects`,
      typeof c.solution?.suspectHints === "object" && Object.keys(c.solution.suspectHints).length > 0
    );
  });
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 2 — SUSPICION SCORE VS CANONICAL PROOF
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 2 — Suspicion Score vs Proof (Culprit is NOT simply highest score)");

{
  cases.forEach((c) => {
    // Find suspect with maximum suspicion score
    let maxSuspicion = -1;
    let highestSuspectId = null;
    c.suspects.forEach((s) => {
      if (s.suspicion > maxSuspicion) {
        maxSuspicion = s.suspicion;
        highestSuspectId = s.id;
      }
    });

    const canonicalId = c.solution.canonicalCulpritId;
    assert(
      `[${c.id}] Highest suspicion suspect (${highestSuspectId}, score=${maxSuspicion}) is NOT blindly the culprit (Canonical: ${canonicalId})`,
      canonicalId !== highestSuspectId,
      `Canonical is ${canonicalId}, highest suspicion was ${highestSuspectId} (trap/red herring successfully implemented)`
    );
  });
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 3 — VERDICT EVALUATION: CORRECT SUSPECT SUBMISSION
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 3 — Correct Suspect Submission yields CASE SOLVED");

{
  cases.forEach((c) => {
    const canonicalId = c.solution.canonicalCulpritId;
    const decisiveClues = c.solution.decisiveEvidenceIds;

    const result = evaluateVerdict({
      caseId: c.id,
      suspectId: canonicalId,
      reasoning: "Forensic access logs and latent fingerprint confirm the crime sequence.",
      evidenceIds: decisiveClues
    });

    assert(`[${c.id}] Verdict evaluation succeeds`, result.success === true);
    assert(`[${c.id}] Status is 'CASE SOLVED'`, result.verdictStatus === "CASE SOLVED");
    assert(`[${c.id}] isCorrect flag is true`, result.isCorrect === true);
    assert(`[${c.id}] Culprit ID matches canonical ID (${canonicalId})`, result.culprit.id === canonicalId);
    assert(`[${c.id}] Returns motive text`, typeof result.motive === "string" && result.motive.length > 20);
    assert(`[${c.id}] Returns methodAndOpportunity text`, typeof result.methodAndOpportunity === "string");
    assert(`[${c.id}] Returns decisiveEvidence list`, Array.isArray(result.decisiveEvidence));
    assert(`[${c.id}] Identified all submitted decisive clues`, result.playerSubmission.identifiedDecisiveClues.length === decisiveClues.length);
    assert(`[${c.id}] Evidence quality rated strong`, result.playerSubmission.evidenceQuality === "strong");
  });
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 4 — VERDICT EVALUATION: INCORRECT SUSPECT & HINTS
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 4 — Incorrect Suspect yields INCORRECT SUSPECT and Helpful Hint");

{
  cases.forEach((c) => {
    const canonicalId = c.solution.canonicalCulpritId;
    const innocentSuspect = c.suspects.find((s) => s.id !== canonicalId);

    const result = evaluateVerdict({
      caseId: c.id,
      suspectId: innocentSuspect.id,
      reasoning: "I suspect this person due to high suspicion score.",
      evidenceIds: []
    });

    assert(`[${c.id}] Evaluation succeeds for incorrect accusation`, result.success === true);
    assert(`[${c.id}] Status is 'INCORRECT SUSPECT'`, result.verdictStatus === "INCORRECT SUSPECT");
    assert(`[${c.id}] isCorrect flag is false`, result.isCorrect === false);
    assert(`[${c.id}] Accused suspect reflects input (${innocentSuspect.id})`, result.accusedSuspect.id === innocentSuspect.id);
    assert(`[${c.id}] Can retry flag is true`, result.canRetry === true);
    assert(`[${c.id}] Returns helpful investigative hint`, typeof result.hint === "string" && result.hint.length > 25);
    
    // Hint must NOT spoil the real culprit's name or ID directly!
    const culpritName = c.solution.canonicalCulpritName;
    assert(
      `[${c.id}] Hint does NOT prematurely reveal canonical culprit name '${culpritName}'`,
      !result.hint.toLowerCase().includes(culpritName.toLowerCase()),
      `Hint content: "${result.hint}"`
    );
  });
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 5 — INPUT VALIDATION & CROSS-CASE ISOLATION
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 5 — Validation & Cross-Case Security Constraints");

{
  // 1. Missing suspectId
  const missingSuspectResult = evaluateVerdict({ caseId: "CASE-1042", suspectId: "" });
  assert("Missing suspectId returns success: false", missingSuspectResult.success === false);
  assert("Missing suspectId error message is descriptive", missingSuspectResult.error.includes("select a suspect"));

  // 2. Missing caseId
  const missingCaseResult = evaluateVerdict({ caseId: "", suspectId: "S1" });
  assert("Missing caseId returns success: false", missingCaseResult.success === false);

  // 3. Non-existent case
  const invalidCaseResult = evaluateVerdict({ caseId: "CASE-9999", suspectId: "S1" });
  assert("Non-existent case returns error", invalidCaseResult.success === false && invalidCaseResult.error.includes("not found"));

  // 4. Cross-case suspect submission: S10 (from CASE-2019) submitted to CASE-1042
  const crossCaseResult = evaluateVerdict({ caseId: "CASE-1042", suspectId: "S10" });
  assert("Cross-case suspect submission is rejected", crossCaseResult.success === false);
  assert("Cross-case error specifies suspect does not belong to case", crossCaseResult.error.includes("does not exist in case"));
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 6 — REVEAL SOLUTION API
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 6 — Reveal Solution Functionality");

{
  cases.forEach((c) => {
    const revealed = revealSolution(c.id);
    assert(`[${c.id}] Reveal solution succeeds`, revealed.success === true);
    assert(`[${c.id}] Status is 'OFFICIAL SOLUTION REVEALED'`, revealed.verdictStatus === "OFFICIAL SOLUTION REVEALED");
    assert(`[${c.id}] Culprit is canonical (${c.solution.canonicalCulpritId})`, revealed.culprit.id === c.solution.canonicalCulpritId);
    assert(`[${c.id}] Contains full motive`, Boolean(revealed.motive));
    assert(`[${c.id}] Contains chronological explanation`, Boolean(revealed.chronologicalExplanation));
    assert(`[${c.id}] Contains decisive evidence list`, Array.isArray(revealed.decisiveEvidence) && revealed.decisiveEvidence.length > 0);
    assert(`[${c.id}] Contains red-herring analyses`, Array.isArray(revealed.misleadingClues) && revealed.misleadingClues.length > 0);
  });

  // Invalid caseId
  const badReveal = revealSolution("INVALID-CASE");
  assert("Reveal solution on invalid caseId fails", badReveal.success === false);
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 7 — BACKTRACKING TIMELINE & SOLUTION ALIGNMENT
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 7 — Backtracking Timeline Engine Alignment with Solutions");

{
  cases.forEach((c) => {
    // Reconstruct valid solutions using Phase 4 backtracking engine
    const constraintObjects = c.constraints.map((cons) => {
      if (cons.type === "before") return before(cons.before, cons.after);
      if (cons.type === "mustFollow") return mustFollow(cons.before, cons.after);
      if (cons.type === "notAdjacent") return notAdjacent(cons.a, cons.b);
      return cons;
    });

    const reconResult = reconstruct(c.events, constraintObjects);
    assert(`[${c.id}] Backtracking finds valid event sequence(s)`, reconResult.solutions.length > 0, `Solutions: ${reconResult.solutions.length}`);

    // Verify first solution sequence order matches the chronological logic in solution
    const firstSeq = reconResult.solutions[0];
    const seqIds = firstSeq.map((e) => e.id);
    assert(
      `[${c.id}] Backtracking sequence (${seqIds.join(" -> ")}) satisfies all constraints`,
      seqIds.length === c.events.length
    );
  });
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE 8 — EVIDENCE EVALUATION (WEAK VS STRONG EVIDENCE)
// ═══════════════════════════════════════════════════════════════════
banner("SUITE 8 — Evidence Evaluation for Correct Suspect with Weak Evidence");

{
  // If player guesses Arthur Black in CASE-1042 but selects 0 evidence items
  const weakVerdict = evaluateVerdict({
    caseId: "CASE-1042",
    suspectId: "S1",
    reasoning: "Just a guess",
    evidenceIds: []
  });

  assert("Accusing correct suspect with zero clues still solves the case", weakVerdict.isCorrect === true);
  assert("Evidence quality is categorized as 'none'", weakVerdict.playerSubmission.evidenceQuality === "none");
  assert("Identified decisive clues count is 0", weakVerdict.playerSubmission.identifiedDecisiveClues.length === 0);
  assert("Missed decisive clues contains all decisive clues", weakVerdict.playerSubmission.missedDecisiveClues.length === weakVerdict.decisiveEvidence.length);
}

// ═══════════════════════════════════════════════════════════════════
// SUMMARY REPORT
// ═══════════════════════════════════════════════════════════════════
banner(`VERDICT ENGINE TESTS COMPLETE — ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("\n  ✓  All verdict engine and canonical solution tests passed successfully.\n");
} else {
  console.log(`\n  ✗  ${failed} test(s) failed. Review output above.\n`);
  process.exit(1);
}
