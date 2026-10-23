/**
 * ActionHistory.js
 *
 * PHASE 1 - STACK, extended to the classic two-stack Undo/Redo pattern.
 *
 * SCOPE CLARIFICATION
 * ───────────────────
 * ActionHistory is an INVESTIGATION LOG, not a general-purpose state
 * reversal engine. It records action descriptors (strings or plain objects
 * such as { type, payload }) and allows the investigator to move backwards
 * and forwards through that log.
 *
 * What it DOES:
 *   • doAction(action)  — push a new action descriptor onto undoStack,
 *                         clear redoStack (new branch of investigation history).
 *   • undo()            — pop the most recent action off undoStack, push it
 *                         onto redoStack, return it so the caller can reverse
 *                         whatever that action did to application state.
 *   • redo()            — pop the most recently undone action off redoStack,
 *                         push it back onto undoStack, return it so the caller
 *                         can re-apply it to application state.
 *
 * What it does NOT do:
 *   • ActionHistory does NOT automatically reverse data changes. The caller
 *     receives the returned action descriptor from undo()/redo() and is
 *     responsible for updating any external data structures accordingly.
 *     Example: if doAction recorded { type: "ADD_EVIDENCE", payload: ev },
 *     the caller's undo handler must call evidenceList.deleteById(ev.id).
 *
 * Two stacks are used (both built from the custom Stack):
 *
 *   undoStack - actions taken, most recent on top
 *   redoStack - actions just undone, most recent on top
 */

const { Stack } = require("./Stack");

class ActionHistory {
  constructor() {
    this.undoStack = new Stack();
    this.redoStack = new Stack();
  }

  /**
   * Record a brand-new action descriptor. Any redo history is discarded.
   * @param {string|object} action  — e.g. "Examined desk" or { type, payload }
   */
  doAction(action) {
    this.undoStack.push(action);
    this.redoStack = new Stack();
  }

  /**
   * Move the most recent action to the redo stack.
   * Returns the action descriptor so the caller can reverse its effect,
   * or null if there is nothing to undo.
   */
  undo() {
    if (this.undoStack.isEmpty()) return null;
    const action = this.undoStack.pop();
    this.redoStack.push(action);
    return action;
  }

  /**
   * Move the most recently undone action back to the undo stack.
   * Returns the action descriptor so the caller can re-apply its effect,
   * or null if there is nothing to redo.
   */
  redo() {
    if (this.redoStack.isEmpty()) return null;
    const action = this.redoStack.pop();
    this.undoStack.push(action);
    return action;
  }

  /** Current investigation log, most-recent-first. */
  currentHistory() {
    return this.undoStack.toArray();
  }

  /** Actions available to redo, most-recently-undone-first. */
  redoAvailable() {
    return this.redoStack.toArray();
  }
}

module.exports = { ActionHistory };

