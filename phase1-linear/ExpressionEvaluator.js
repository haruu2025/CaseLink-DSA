/**
 * ExpressionEvaluator.js
 *
 * PHASE 1 - "Stack for Simple Expression Handling"
 *
 * Game use: the final case score is computed from an arithmetic expression
 * built out of the round's numbers, e.g.
 *
 *      ( EVIDENCE_SCORE + WITNESS_SCORE ) * TIME_BONUS - PENALTY
 *
 * Rather than just calling JavaScript's eval() (which isn't the point of
 * a DSA exercise, and is unsafe besides), this module does the classic
 * two-stack-algorithm textbook way:
 *
 *   1. infixToPostfix() - the Shunting Yard algorithm, using a Stack to
 *      hold operators until they can be placed in the output.
 *   2. evaluatePostfix() - uses a second Stack to hold operands and
 *      collapses them as operators are read.
 *
 * Supports + - * / and parentheses, space-separated tokens.
 *
 * VALIDATION — errors thrown before any evaluation occurs:
 *   • Empty or blank expression
 *   • Tokens that are neither numbers, operators, nor parentheses
 *   • Mismatched parentheses (unmatched "(" or ")")
 *   • Missing operands (operator has fewer than two values on the stack)
 *   • Leftover operands (expression has extra values and no operator for them)
 *   • Division by zero
 */

const { Stack } = require("./Stack");

const PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2 };

function isOperator(token) {
  return token === "+" || token === "-" || token === "*" || token === "/";
}

// ─────────────────────────────────────────────────────────────
// STEP 1: VALIDATE — catch structural problems before conversion
// ─────────────────────────────────────────────────────────────

/**
 * Validates a tokenised infix expression for structural correctness.
 * Throws a descriptive Error on the first problem found.
 *
 * Checks (in order):
 *   1. Empty input
 *   2. Unrecognised tokens
 *   3. Mismatched parentheses (tracked with a depth counter)
 *   4. Consecutive operators  e.g. "3 + * 4"
 *   5. Operator at start or end without an operand
 *
 * @param {string[]} tokens
 */
function validateTokens(tokens) {
  if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === "")) {
    throw new Error("Expression is empty.");
  }

  let depth = 0;           // parenthesis nesting depth
  let expectOperand = true; // true when we expect a number or "("

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === "(") {
      if (!expectOperand) {
        throw new Error(
          `Unexpected "(" at position ${i}: expected an operator, not an opening parenthesis.`
        );
      }
      depth++;
      // After "(", we still expect an operand or another "("
    } else if (token === ")") {
      if (expectOperand) {
        throw new Error(
          `Unexpected ")" at position ${i}: no operand before closing parenthesis.`
        );
      }
      depth--;
      if (depth < 0) {
        throw new Error(
          `Mismatched parentheses: closing ")" at position ${i} has no matching "(").`
        );
      }
      expectOperand = false;
    } else if (!isNaN(Number(token))) {
      // numeric operand
      if (!expectOperand) {
        throw new Error(
          `Unexpected number "${token}" at position ${i}: expected an operator.`
        );
      }
      expectOperand = false;
    } else if (isOperator(token)) {
      if (expectOperand) {
        throw new Error(
          `Unexpected operator "${token}" at position ${i}: expected an operand or "(".`
        );
      }
      expectOperand = true;
    } else {
      throw new Error(
        `Unrecognised token "${token}" at position ${i}. Only numbers, +, -, *, /, (, ) are allowed.`
      );
    }
  }

  if (depth !== 0) {
    throw new Error(`Mismatched parentheses: ${depth} unclosed "(" remaining.`);
  }

  if (expectOperand) {
    throw new Error("Expression ends with an operator — a final operand is missing.");
  }
}

// ─────────────────────────────────────────────────────────────
// STEP 2: CONVERT — Shunting Yard infix → postfix
// ─────────────────────────────────────────────────────────────

/**
 * Converts a space-separated infix expression string into a postfix
 * token array using the Shunting Yard algorithm.
 *
 * Assumes validateTokens() has already been called.
 *
 * @param {string} expression
 * @returns {string[]}
 */
function infixToPostfix(expression) {
  const tokens = expression.trim().split(/\s+/);
  validateTokens(tokens);

  const output = [];
  const operatorStack = new Stack();

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      output.push(token);
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      // Pop until the matching "(" — validateTokens already confirmed balance.
      while (!operatorStack.isEmpty() && operatorStack.peek() !== "(") {
        output.push(operatorStack.pop());
      }
      operatorStack.pop(); // discard the "("
    } else if (isOperator(token)) {
      while (
        !operatorStack.isEmpty() &&
        isOperator(operatorStack.peek()) &&
        PRECEDENCE[operatorStack.peek()] >= PRECEDENCE[token]
      ) {
        output.push(operatorStack.pop());
      }
      operatorStack.push(token);
    }
    // No else-branch needed: validateTokens already rejected unknown tokens.
  }

  while (!operatorStack.isEmpty()) {
    output.push(operatorStack.pop());
  }

  return output;
}

// ─────────────────────────────────────────────────────────────
// STEP 3: EVALUATE — postfix stack evaluation
// ─────────────────────────────────────────────────────────────

/**
 * Evaluates a postfix token array using a single operand stack.
 *
 * Throws on:
 *   • Missing operands (operator with fewer than two values on the stack)
 *   • Leftover operands (more than one value left after all tokens processed)
 *   • Division by zero
 *
 * @param {string[]} postfixTokens
 * @returns {number}
 */
function evaluatePostfix(postfixTokens) {
  const operandStack = new Stack();

  for (const token of postfixTokens) {
    if (!isNaN(Number(token))) {
      operandStack.push(Number(token));
    } else if (isOperator(token)) {
      if (operandStack.size < 2) {
        throw new Error(
          `Missing operand: operator "${token}" requires two operands but only ` +
          `${operandStack.size} value(s) are on the stack.`
        );
      }
      const b = operandStack.pop();
      const a = operandStack.pop();

      if (token === "/" && b === 0) {
        throw new Error("Division by zero: the score expression attempts to divide by 0.");
      }

      let result;
      switch (token) {
        case "+": result = a + b; break;
        case "-": result = a - b; break;
        case "*": result = a * b; break;
        case "/": result = a / b; break;
      }
      operandStack.push(result);
    } else {
      throw new Error(`Unexpected token in postfix evaluation: "${token}"`);
    }
  }

  if (operandStack.size !== 1) {
    throw new Error(
      `Malformed expression: expected exactly 1 value on the stack after evaluation ` +
      `but found ${operandStack.size}. Check for missing operators.`
    );
  }

  return operandStack.pop();
}

// ─────────────────────────────────────────────────────────────
// CONVENIENCE WRAPPER
// ─────────────────────────────────────────────────────────────

/**
 * Validates, converts, and evaluates a space-separated infix expression.
 * Returns { postfix: string[], value: number }.
 * Throws a descriptive Error on any validation or evaluation failure.
 *
 * @param {string} infixExpression
 * @returns {{ postfix: string[], value: number }}
 */
function evaluateExpression(infixExpression) {
  const postfix = infixToPostfix(infixExpression); // validation happens inside
  const value = evaluatePostfix(postfix);
  return { postfix, value };
}

module.exports = { infixToPostfix, evaluatePostfix, evaluateExpression, validateTokens };
