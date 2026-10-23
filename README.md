# CaseLink — Interactive DSA Investigation Laboratory

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-d62828.svg)](https://opensource.org/licenses/ISC)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-58a6ff.svg)](#technologies-used)
[![Tests Passing](https://img.shields.io/badge/Tests-170%20Passing-2ea043.svg)](#running-automated-tests)

**CaseLink** is an educational, interactive laboratory where students and developers explore core **Data Structures & Algorithms (DSA)** through analytical criminal investigations. Instead of abstract toy problems, learners analyze forensic evidence lockers, traverse human relationship networks, reconstruct crime event sequences under logical constraints, and deduce the true perpetrator in the **Final Verdict** engine.

Built entirely with standard Node.js libraries, semantic HTML5, modern CSS3, and vanilla JavaScript — featuring **zero external runtime or npm dependencies**.

---

## 🔍 Core Features & The 4 DSA Phases

CaseLink integrates fundamental data structures and algorithmic paradigms into an investigative workflow:

```
[ OPEN DOSSIER ] ───► [ EXAMINE EVIDENCE ] ───► [ TRACE RELATIONS ] ───► [ RECONSTRUCT TIMELINE ] ───► [ FINAL VERDICT ]
  LinkedList & Dossier   Search & Sort / BST       Graph & BFS / DFS        Backtracking & Pruning        Canonical Proof
```

### Phase 1 — Linear Data Structures
* **Dynamic Linked List (`LinkedList.js`):** Chains forensic evidence records sequentially with $\mathcal{O}(1)$ insertions and dynamic deletions.
* **Action History Stack (`Stack.js`, `ActionHistory.js`):** Last-In-First-Out (LIFO) stack powering complete Undo/Redo capability for detective actions.
* **Witness & Forensic Queue (`Queue.js`):** First-In-First-Out (FIFO) queue for fair witness interrogation and lab processing pipelines.
* **Postfix Expression Evaluator (`ExpressionEvaluator.js`):** Shunting-yard infix-to-postfix conversion and stack evaluation with robust syntax validation for case score calculations.

### Phase 2 — Hierarchical & Relational Structures
* **Evidence Decision Tree (`BinaryTree.js`):** Binary classification decision tree categorizing physical vs. testimonial evidence with pre-order, in-order, and post-order traversals.
* **Suspect Priority Index (`BST.js`):** Binary Search Tree indexing suspects by suspicion score supporting duplicate keys via bucketed nodes.
* **Relational Social Network (`Graph.js`):** Undirected adjacency list network connecting persons, locations, and clues:
  * **Queue-based BFS:** Guarantees minimum degrees of separation and proximity rankings from the crime scene.
  * **Recursive DFS:** Deep exploratory traversal of connected entities.

### Phase 3 — Searching & Sorting Algorithms
* **Linear Search vs. Binary Search (`Searcher.js`):** Direct comparative benchmarking of $\mathcal{O}(n)$ name/ID searches against $\mathcal{O}(\log n)$ importance score searches on pre-sorted arrays.
* **Sorting Telemetry (`Sorter.js`):** Benchmarks **Insertion Sort** ($\mathcal{O}(n^2)$), **Merge Sort** ($\mathcal{O}(n \log n)$ with auxiliary array move counters), and **Quick Sort** ($\mathcal{O}(n \log n)$ with in-place swap tracking).

### Phase 4 — Backtracking & Constraint Satisfaction
* **Crime Event Reconstruction (`CrimeReconstruction.js`):** State-space permutation search that reconstructs the chronological crime sequence while pruning invalid partial branches early.
* **Forensic Constraint Primitives:**
  * `before(A, B)`: Event $A$ must precede Event $B$.
  * `mustFollow(A, B)`: Event $B$ must occur immediately after Event $A$.
  * `notAdjacent(A, B)`: Events $A$ and $B$ cannot occur consecutively.
* **Impossible Alibi Simulation:** Injects contradictory circular constraints to prove how early branch pruning eliminates all invalid configurations to 0 solutions.

### Phase 5 — The Final Verdict (Solve the Case)
* **Canonical Crime Solutions:** Every case features a deterministic culprit, coherent motive, opportunity window, and decisive physical clues.
* **Suspicion Score != Proof:** High suspicion scores serve as lead prioritizations and intentional red herrings (e.g. Daniel Cole at score 88 vs. actual culprit Arthur Black at 73).
* **Verdict Checking (`verdictEngine.js`):**
  * `CASE SOLVED`: Validates the accused against the canonical culprit, evaluates player-submitted evidence quality (strong, moderate, weak), and reveals full motive and timeline details.
  * `INCORRECT SUSPECT`: Provides an investigative hint directing attention to overlooked clues without spoiling the real culprit.
  * `REVEAL SOLUTION`: Allows detectives to surrender and review the official investigative report.
  * **Cross-Case Security:** Strict dossier scoping prevents cross-case suspect submissions.

---

## 🛠️ Technologies Used

* **Server:** Node.js (CommonJS) using only native standard library modules:
  * `http` (HTTP server & RESTful endpoints)
  * `fs` (Static asset streaming)
  * `path` (Secure normalized file paths)
  * `url` (Query and pathname routing)
* **Client:** Semantic HTML5, CSS3, Vanilla ES6+ JavaScript (Fetch API, DOM events).
* **Design System:** Charcoal dossier palette (`#0e0e11`, `#16161c`, `#d62828`), monospace telemetry badges, accessible high-contrast text, and `@media (prefers-reduced-motion)` support.
* **External Dependencies:** **Zero (`0`)** npm packages or third-party libraries.

---

## 📂 Project Structure

```
CaselinkJS/
├── phase1-linear/                 # Phase 1: Linear Data Structures
│   ├── ActionHistory.js          # Undo/Redo stack manager
│   ├── demo.js                   # Phase 1 standalone demo
│   ├── ExpressionEvaluator.js    # Shunting-yard infix/postfix evaluator
│   ├── LinkedList.js             # Doubly/singly linked list
│   ├── Queue.js                  # FIFO Queue implementation
│   └── Stack.js                  # LIFO Stack implementation
├── phase2-hierarchical/          # Phase 2: Hierarchical & Relational Structures
│   ├── BinaryTree.js             # Evidence classification tree
│   ├── BST.js                    # Binary Search Tree with duplicate keys
│   ├── demo.js                   # Phase 2 standalone demo
│   └── Graph.js                  # Adjacency list graph with BFS & DFS
├── phase3-searching-sorting/     # Phase 3: Searching & Sorting
│   ├── demo.js                   # Phase 3 benchmark demo
│   ├── Searcher.js               # Linear and Binary search
│   └── Sorter.js                 # Insertion, Merge, and Quick sort
├── phase4-backtracking/          # Phase 4: Backtracking Engine
│   ├── CrimeReconstruction.js    # Recursive permutation backtracking
│   ├── demo.js                   # Phase 4 scenarios demo
│   └── tests.js                  # 19 backtracking unit tests
├── public/                       # Web Application Assets
│   ├── app.js                    # Client-side router, UI controllers & verdict handler
│   ├── index.html                # Landing page, investigation console & verdict UI
│   └── styles.css                # Professional charcoal-crimson stylesheet
├── .gitignore                    # Git exclusion rules
├── casesData.js                  # Fictional investigation dossiers & canonical solutions
├── improvements-tests.js         # 37 targeted regression & algorithm unit tests
├── package.json                  # Project configuration and test scripts
├── README.md                     # Documentation
├── server.js                     # Pure Node.js HTTP server & API
├── verdict-tests.js              # 114 verdict engine & canonical solution tests
└── verdictEngine.js              # Case solving, evaluation, and hint logic
```

---

## ⚡ Prerequisites & Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) version **14.x or higher** (Node.js 18+ or 20+ recommended).
* A modern web browser (Chrome, Firefox, Safari, or Edge).
* No database (MySQL/PostgreSQL) or build tooling is required.

### Installation & Launch

1. **Clone the repository:**
   ```bash
   git clone https://github.com/haruu2025/CaseLink-DSA.git
   cd CaseLink-DSA
   ```

2. **Start the application server:**
   ```bash
   npm start
   # or directly with Node:
   node server.js
   ```

3. **Open the laboratory in your browser:**
   ```
   http://localhost:3000
   ```

---

## 🧪 Running Automated Tests

CaseLink includes an extensive automated test suite with **170 passing tests** across all algorithms and verdict mechanics.

### Run All Tests
```bash
npm test
```
*Executes `improvements-tests.js`, `phase4-backtracking/tests.js`, and `verdict-tests.js` in sequence.*

### Run Specific Test Suites
```bash
# Verdict Engine & Canonical Solutions (114 tests)
npm run test:verdict

# Phase 1 Demo (Linear structures & expression evaluator)
npm run test:phase1

# Phase 2 Demo (BST duplicate keys, decision trees, Graph BFS)
npm run test:phase2

# Phase 3 Demo (Sorting benchmarks & Linear vs Binary search)
npm run test:phase3

# Phase 4 Demo & Scenarios (Backtracking constraint pruning)
npm run test:phase4
```

---

## 🕵️ How to Investigate & Solve a Case

1. **Select an Active Dossier:**
   * **Case #1042:** *The Blackwood Manor Mystery* (Lord Pemberton incapacitated in a bolted study).
   * **Case #2019:** *The Poisoned Decanter* (Diplomat poisoned at a banquet with strict service logs).
   * **Case #3081:** *The Riverside Warehouse Break-in* (High-grade components stolen past multiple sensors).
2. **Search & Sort Clues (Evidence Locker):**
   * Filter evidence by description using Linear Search ($\mathcal{O}(n)$) or by importance score using Binary Search ($\mathcal{O}(\log n)$).
   * Benchmark live sorting algorithms (Insertion, Merge, Quick) to observe comparisons and moves.
3. **Analyze Social Network & Suspect BST:**
   * Query the Suspect Priority BST by score to observe duplicate key handling.
   * Run BFS from the victim or scene to determine shortest hop distances to critical evidence.
4. **Reconstruct the Timeline (Backtracking):**
   * Execute the Phase 4 backtracking engine to resolve the true chronological event sequence.
   * Toggle contradictory constraints to observe early state-space pruning.
5. **Submit The Final Verdict:**
   * Select your prime suspect card.
   * Document your investigative reasoning in the notes area.
   * Select supporting clues from the Evidence Locker.
   * Click **SUBMIT VERDICT**:
     * If correct: Receive the `CASE SOLVED` dossier with full motive, method, decisive clues breakdown, and red-herring exonerations.
     * If incorrect: Receive an `INCORRECT SUSPECT` investigative hint highlighting overlooked context without spoiling the true culprit.

---

## ⚠️ Known Limitations & Future Enhancements

### Current Design Scope
* **In-Memory Volatility:** Case dossiers and graph structures are initialized in-memory on server boot. Server restarts reset custom added nodes.
* **Single-Session State:** Detective actions and verdict submissions are processed per browser session without permanent database persistence.
* **No Authentication:** Designed as an open educational laboratory; user accounts and login sessions are intentionally omitted.

### Planned Enhancements
* **Interactive Graph Canvas:** Visual canvas rendering of nodes and BFS traversal animations using SVG/D3.
* **Custom Case Builder:** In-browser dossier creator allowing educators to write custom events, constraints, and clues.
* **Detective Career Mode:** Track badges and case completion statistics across multiple difficulty tiers.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE). Educational and personal use is encouraged.
