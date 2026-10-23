/**
 * verdictEngine.js
 *
 * CaseLink — Criminal Investigation Verdict Engine
 * Evaluates player accusations against the official canonical solution for each case.
 *
 * Key Principles:
 * - Suspicion scores are for prioritization, NOT proof.
 * - Verdict checking validates the accused suspect against the explicit canonical solution.
 * - If incorrect: provides a context-rich investigative hint directing to overlooked clues,
 *   WITHOUT revealing the true culprit.
 * - If correct: verifies user-selected evidence vs decisive clues and returns full case closure dossiers.
 * - Prevents cross-case leakage (verdicts are strictly scoped to the active case).
 */

const { cases } = require("./casesData");

/**
 * Retrieves case record by ID.
 * @param {string} caseId
 * @returns {object|null}
 */
function getCaseById(caseId) {
  if (!caseId) return null;
  return cases.find((c) => c.id === caseId) || null;
}

/**
 * Returns summary list of all cases and their canonical culprits (for administrative / test audit).
 */
function getAllCanonicalSolutions() {
  return cases.map((c) => ({
    caseId: c.id,
    caseTitle: c.title,
    culpritId: c.solution ? c.solution.canonicalCulpritId : null,
    culpritName: c.solution ? c.solution.canonicalCulpritName : null
  }));
}

/**
 * Evaluates a player's verdict submission.
 *
 * @param {object} params
 * @param {string} params.caseId - ID of the case being investigated (e.g. "CASE-1042")
 * @param {string} params.suspectId - ID of the accused suspect (e.g. "S1")
 * @param {string} [params.reasoning] - Player's written rationale
 * @param {string[]} [params.evidenceIds] - Array of evidence IDs selected by the player
 * @returns {object} Evaluation result object
 */
function evaluateVerdict({ caseId, suspectId, reasoning = "", evidenceIds = [] }) {
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    return { success: false, error: "Case ID is required." };
  }

  const foundCase = getCaseById(caseId.trim());
  if (!foundCase) {
    return { success: false, error: `Case dossier '${caseId}' not found.` };
  }

  if (!suspectId || typeof suspectId !== "string" || !suspectId.trim()) {
    return { success: false, error: "Please select a suspect before submitting your verdict." };
  }

  const cleanSuspectId = suspectId.trim();
  const selectedSuspect = foundCase.suspects.find((s) => s.id === cleanSuspectId);
  if (!selectedSuspect) {
    return {
      success: false,
      error: `Suspect '${cleanSuspectId}' does not exist in case ${foundCase.id} (${foundCase.title}). Cross-case verdict submissions are not permitted.`
    };
  }

  const solution = foundCase.solution;
  if (!solution) {
    return { success: false, error: `No official solution configured for case ${foundCase.id}.` };
  }

  const isCorrect = (cleanSuspectId === solution.canonicalCulpritId);
  const normalizedEvidenceIds = Array.isArray(evidenceIds) ? evidenceIds.map(String) : [];

  // Match player selected clues
  const playerSelectedEvidence = foundCase.evidence.filter((ev) => normalizedEvidenceIds.includes(ev.id));
  const decisiveEvidenceList = foundCase.evidence.filter((ev) => solution.decisiveEvidenceIds.includes(ev.id));
  const identifiedDecisiveClues = decisiveEvidenceList.filter((ev) => normalizedEvidenceIds.includes(ev.id));
  const missedDecisiveClues = decisiveEvidenceList.filter((ev) => !normalizedEvidenceIds.includes(ev.id));

  // Determine clue rating
  let evidenceQuality = "none";
  if (identifiedDecisiveClues.length >= Math.ceil(decisiveEvidenceList.length * 0.6)) {
    evidenceQuality = "strong";
  } else if (identifiedDecisiveClues.length > 0) {
    evidenceQuality = "moderate";
  } else if (playerSelectedEvidence.length > 0) {
    evidenceQuality = "weak";
  }

  if (isCorrect) {
    return {
      success: true,
      verdictStatus: "CASE SOLVED",
      isCorrect: true,
      caseId: foundCase.id,
      caseTitle: foundCase.title,
      culprit: {
        id: selectedSuspect.id,
        name: selectedSuspect.name,
        role: selectedSuspect.role,
        suspicion: selectedSuspect.suspicion,
        alibi: selectedSuspect.alibi
      },
      motive: solution.motive,
      methodAndOpportunity: solution.methodAndOpportunity,
      chronologicalExplanation: solution.chronologicalExplanation,
      decisiveEvidence: decisiveEvidenceList,
      decisiveEvidenceExplanation: solution.decisiveEvidenceExplanation,
      misleadingClues: solution.misleadingClues,
      remainingUncertainty: solution.remainingUncertainty,
      playerSubmission: {
        accusedSuspect: selectedSuspect,
        reasoning: String(reasoning || "").trim(),
        selectedEvidence: playerSelectedEvidence,
        identifiedDecisiveClues: identifiedDecisiveClues,
        missedDecisiveClues: missedDecisiveClues,
        evidenceQuality: evidenceQuality
      }
    };
  } else {
    // Suspect is incorrect — formulate helpful hint without giving away the culprit
    const hintText = (solution.suspectHints && solution.suspectHints[cleanSuspectId]) ||
      `Forensic analysis does not implicate ${selectedSuspect.name}. Re-examine the timeline constraints, physical access logs, and alibi statements in the case file.`;

    return {
      success: true,
      verdictStatus: "INCORRECT SUSPECT",
      isCorrect: false,
      caseId: foundCase.id,
      caseTitle: foundCase.title,
      accusedSuspect: {
        id: selectedSuspect.id,
        name: selectedSuspect.name,
        role: selectedSuspect.role,
        suspicion: selectedSuspect.suspicion,
        alibi: selectedSuspect.alibi
      },
      hint: hintText,
      playerSubmission: {
        accusedSuspect: selectedSuspect,
        reasoning: String(reasoning || "").trim(),
        selectedEvidence: playerSelectedEvidence
      },
      canRetry: true
    };
  }
}

/**
 * Reveals the official canonical solution for a case.
 *
 * @param {string} caseId
 * @returns {object} Solution details object
 */
function revealSolution(caseId) {
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    return { success: false, error: "Case ID is required." };
  }

  const foundCase = getCaseById(caseId.trim());
  if (!foundCase) {
    return { success: false, error: `Case dossier '${caseId}' not found.` };
  }

  const solution = foundCase.solution;
  if (!solution) {
    return { success: false, error: `No official solution configured for case ${foundCase.id}.` };
  }

  const culprit = foundCase.suspects.find((s) => s.id === solution.canonicalCulpritId) || {
    id: solution.canonicalCulpritId,
    name: solution.canonicalCulpritName,
    role: "Perpetrator",
    suspicion: 0,
    alibi: "Alibi disproved by forensic analysis."
  };

  const decisiveEvidenceList = foundCase.evidence.filter((ev) => solution.decisiveEvidenceIds.includes(ev.id));

  return {
    success: true,
    verdictStatus: "OFFICIAL SOLUTION REVEALED",
    isCorrect: false,
    revealed: true,
    caseId: foundCase.id,
    caseTitle: foundCase.title,
    culprit: {
      id: culprit.id,
      name: culprit.name,
      role: culprit.role,
      suspicion: culprit.suspicion,
      alibi: culprit.alibi
    },
    motive: solution.motive,
    methodAndOpportunity: solution.methodAndOpportunity,
    chronologicalExplanation: solution.chronologicalExplanation,
    decisiveEvidence: decisiveEvidenceList,
    decisiveEvidenceExplanation: solution.decisiveEvidenceExplanation,
    misleadingClues: solution.misleadingClues,
    remainingUncertainty: solution.remainingUncertainty
  };
}

module.exports = {
  getCaseById,
  getAllCanonicalSolutions,
  evaluateVerdict,
  revealSolution
};
