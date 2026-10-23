/**
 * app.js
 *
 * CaseLink — Criminal Investigation Dashboard & Interactive DSA Lab
 * Vanilla JavaScript interacting with Node.js DSA server API.
 */

// ── Application State ─────────────────────────────────────────────
const state = {
  currentView: "landing", // 'landing' | 'dashboard'
  cases: [],
  currentCaseId: "CASE-1042",
  currentCaseData: null,
  activeEvidenceList: []
};

// ── DOM Element Selectors ─────────────────────────────────────────
const elements = {
  // Navigation & Views
  landingView: document.getElementById("landingView"),
  dashboardView: document.getElementById("dashboardView"),
  navBrand: document.getElementById("navBrand"),
  linkNavHome: document.getElementById("linkNavHome"),
  linkNavLearn: document.getElementById("linkNavLearn"),
  linkNavHow: document.getElementById("linkNavHow"),
  linkNavDashboard: document.getElementById("linkNavDashboard"),
  btnNavInvestigate: document.getElementById("btnNavInvestigate"),
  dashboardNavControls: document.getElementById("dashboardNavControls"),
  btnBackToLanding: document.getElementById("btnBackToLanding"),

  // Hero Section
  btnHeroStart: document.getElementById("btnHeroStart"),
  btnHeroExplore: document.getElementById("btnHeroExplore"),
  btnCtaStart: document.getElementById("btnCtaStart"),

  // Case Selector & Dossier
  caseSelect: document.getElementById("caseSelect"),
  btnReloadCase: document.getElementById("btnReloadCase"),
  dossierCaseId: document.getElementById("dossierCaseId"),
  dossierTitle: document.getElementById("dossierTitle"),
  dossierStatus: document.getElementById("dossierStatus"),
  dossierSynopsis: document.getElementById("dossierSynopsis"),
  dossierInvestigator: document.getElementById("dossierInvestigator"),
  dossierDate: document.getElementById("dossierDate"),

  // Evidence
  evidenceCount: document.getElementById("evidenceCount"),
  searchInput: document.getElementById("searchInput"),
  btnSearch: document.getElementById("btnSearch"),
  searchChips: document.getElementById("searchChips"),
  searchOutput: document.getElementById("searchOutput"),
  searchAlgoName: document.getElementById("searchAlgoName"),
  searchMetricPill: document.getElementById("searchMetricPill"),
  searchResultContent: document.getElementById("searchResultContent"),
  evidenceTableBody: document.getElementById("evidenceTableBody"),
  btnSortInsertion: document.getElementById("btnSortInsertion"),
  btnSortMerge: document.getElementById("btnSortMerge"),
  btnSortQuick: document.getElementById("btnSortQuick"),
  btnResetEvidence: document.getElementById("btnResetEvidence"),
  sortStats: document.getElementById("sortStats"),

  // Suspects (BST)
  bstSearchInput: document.getElementById("bstSearchInput"),
  btnBstSearch: document.getElementById("btnBstSearch"),
  btnBstReset: document.getElementById("btnBstReset"),
  bstOutput: document.getElementById("bstOutput"),
  bstMetricPill: document.getElementById("bstMetricPill"),
  bstResultContent: document.getElementById("bstResultContent"),
  suspectsList: document.getElementById("suspectsList"),
  witnessQueueList: document.getElementById("witnessQueueList"),

  // Graph
  graphEdgeCount: document.getElementById("graphEdgeCount"),
  graphStartNode: document.getElementById("graphStartNode"),
  graphTargetNode: document.getElementById("graphTargetNode"),
  btnGraphBfs: document.getElementById("btnGraphBfs"),
  btnGraphDfs: document.getElementById("btnGraphDfs"),
  btnGraphDistance: document.getElementById("btnGraphDistance"),
  btnGraphRank: document.getElementById("btnGraphRank"),
  graphOutput: document.getElementById("graphOutput"),
  graphAlgoTag: document.getElementById("graphAlgoTag"),
  graphMetricPill: document.getElementById("graphMetricPill"),
  graphResultContent: document.getElementById("graphResultContent"),
  graphEdgesList: document.getElementById("graphEdgesList"),

  // Timeline Reconstruction
  btnReconstruct: document.getElementById("btnReconstruct"),
  eventsPool: document.getElementById("eventsPool"),
  constraintsPool: document.getElementById("constraintsPool"),
  chkContradiction: document.getElementById("chkContradiction"),
  reconstructionOutput: document.getElementById("reconstructionOutput"),
  reconMetrics: document.getElementById("reconMetrics"),
  reconResultContent: document.getElementById("reconResultContent"),

  // Final Verdict / Solve the Case
  verdictSuspectsGrid: document.getElementById("verdictSuspectsGrid"),
  verdictReasoning: document.getElementById("verdictReasoning"),
  verdictEvidenceGrid: document.getElementById("verdictEvidenceGrid"),
  btnSubmitVerdict: document.getElementById("btnSubmitVerdict"),
  btnRevealSolution: document.getElementById("btnRevealSolution"),
  btnResetVerdictForm: document.getElementById("btnResetVerdictForm"),
  verdictAlert: document.getElementById("verdictAlert"),
  verdictResultPanel: document.getElementById("verdictResultPanel")
};

// ── API Communication Helpers ─────────────────────────────────────
async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}

// ── View Management ───────────────────────────────────────────────
function showView(viewName, targetAnchor = null) {
  state.currentView = viewName;

  if (viewName === "dashboard") {
    // Show Dashboard, Hide Landing
    elements.landingView.classList.add("hidden");
    elements.dashboardView.classList.remove("hidden");

    // Nav bar adjustments
    elements.btnNavInvestigate.classList.add("hidden");
    elements.dashboardNavControls.classList.remove("hidden");

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    elements.linkNavDashboard.classList.add("active");

    if (window.location.hash !== "#investigate") {
      history.pushState(null, "", "#investigate");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Ensure data is loaded
    if (!state.currentCaseData) {
      loadCase(state.currentCaseId);
    }
  } else {
    // Show Landing, Hide Dashboard
    elements.landingView.classList.remove("hidden");
    elements.dashboardView.classList.add("hidden");

    // Nav bar adjustments
    elements.btnNavInvestigate.classList.remove("hidden");
    elements.dashboardNavControls.classList.add("hidden");

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    elements.linkNavHome.classList.add("active");

    if (targetAnchor) {
      if (window.location.hash !== `#${targetAnchor}`) {
        history.pushState(null, "", `#${targetAnchor}`);
      }
      setTimeout(() => {
        const anchorEl = document.getElementById(targetAnchor);
        if (anchorEl) {
          anchorEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    } else {
      if (window.location.hash !== "" && window.location.hash !== "#home") {
        history.pushState(null, "", "#home");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

function handleHashChange() {
  const hash = window.location.hash;
  if (hash === "#investigate" || hash === "#dashboard") {
    showView("dashboard");
  } else if (hash === "#learn") {
    showView("landing", "learn");
  } else if (hash === "#how-it-works") {
    showView("landing", "how-it-works");
  } else {
    showView("landing");
  }
}

// ── Initialize App ────────────────────────────────────────────────
async function init() {
  setupEventListeners();

  // Load cases list and pre-load initial case data in background
  await loadCasesList();
  await loadCase(state.currentCaseId);

  // Check initial hash route
  handleHashChange();
}

// ── Load Cases Dropdown ───────────────────────────────────────────
async function loadCasesList() {
  try {
    const res = await fetchApi("/api/cases");
    if (res.success && res.cases) {
      state.cases = res.cases;
      elements.caseSelect.innerHTML = res.cases
        .map((c) => `<option value="${c.id}">${c.id}: ${c.title}</option>`)
        .join("");
      elements.caseSelect.value = state.currentCaseId;
    }
  } catch (err) {
    console.error("Failed to load cases list:", err);
  }
}

// ── Load Single Case Dossier ──────────────────────────────────────
async function loadCase(caseId) {
  try {
    const res = await fetchApi(`/api/cases/${caseId}`);
    if (!res.success || !res.case) {
      alert("Failed to load case data");
      return;
    }

    const c = res.case;
    state.currentCaseId = caseId;
    state.currentCaseData = c;
    state.activeEvidenceList = [...c.evidence];

    // 1. Render Dossier Meta
    elements.dossierCaseId.textContent = c.id;
    elements.dossierTitle.textContent = c.title;
    elements.dossierStatus.textContent = c.status;
    elements.dossierSynopsis.textContent = c.synopsis;
    elements.dossierInvestigator.textContent = c.leadInvestigator;
    elements.dossierDate.textContent = c.incidentDate;

    // 2. Render Evidence
    elements.evidenceCount.textContent = `${c.evidence.length} items`;
    elements.sortStats.textContent = "";
    elements.searchOutput.classList.add("hidden");
    renderEvidenceTable(state.activeEvidenceList);

    // 3. Render Suspects & Witnesses
    elements.bstOutput.classList.add("hidden");
    renderSuspects(c.suspectsInorder || c.suspects);
    renderWitnesses(c.witnesses);

    // 4. Render Graph
    elements.graphEdgeCount.textContent = `${c.graphEdges.length} connections`;
    populateGraphDropdowns(c.graphNodes);
    renderGraphEdges(c.graphEdges);
    resetGraphConsole();

    // 5. Render Reconstruction Events & Constraints
    renderTimelineInputs(c.events, c.constraints);
    elements.reconstructionOutput.classList.add("hidden");
    elements.chkContradiction.checked = false;

    // 6. Render Verdict / Solve the Case Section
    renderVerdictSection(c);

  } catch (err) {
    console.error("Failed to load case:", err);
  }
}

// ── Render Evidence Table ─────────────────────────────────────────
function renderEvidenceTable(evidenceItems, highlightedId = null) {
  if (!evidenceItems || evidenceItems.length === 0) {
    elements.evidenceTableBody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center; padding: 18px;">No evidence records found.</td></tr>`;
    return;
  }

  elements.evidenceTableBody.innerHTML = evidenceItems.map((ev) => {
    const isHighlighted = highlightedId && ev.id === highlightedId;
    const highlightStyle = isHighlighted ? 'style="background-color: rgba(214, 40, 40, 0.25); border-left: 3px solid #ff6b6b;"' : '';
    return `
      <tr ${highlightStyle}>
        <td><span class="badge-id">${escapeHtml(ev.id)}</span></td>
        <td><strong>${escapeHtml(ev.name)}</strong></td>
        <td>${escapeHtml(ev.category || 'General')}</td>
        <td class="text-right"><span class="badge-score">${ev.importance}</span></td>
        <td><span class="text-muted" style="font-size: 11px;">${escapeHtml(ev.description)}</span></td>
      </tr>
    `;
  }).join("");
}

// ── Search Evidence Handler ───────────────────────────────────────
async function handleSearch() {
  const query = elements.searchInput.value.trim();
  if (!query) return;

  const searchAlgo = document.querySelector('input[name="searchAlgo"]:checked').value;

  try {
    const res = await fetchApi("/api/search-evidence", {
      method: "POST",
      body: JSON.stringify({
        caseId: state.currentCaseId,
        searchType: searchAlgo,
        target: query
      })
    });

    if (!res.success) {
      showSearchError(res.error || "Search failed");
      return;
    }

    elements.searchOutput.classList.remove("hidden");
    elements.searchAlgoName.textContent = res.algorithm;
    elements.searchMetricPill.textContent = `${res.comparisons} Comparison(s)`;

    if (res.found) {
      elements.searchMetricPill.className = "metric-pill success";
      elements.searchResultContent.innerHTML = `
        <div style="color: #3fb950; font-weight: bold; margin-bottom: 6px;">
          ✓ Record Located at Index [${res.index}]
        </div>
        <div><strong>Evidence ID:</strong> ${escapeHtml(res.found.id)}</div>
        <div><strong>Name:</strong> ${escapeHtml(res.found.name)}</div>
        <div><strong>Importance Score:</strong> ${res.found.importance}</div>
        <div><strong>Details:</strong> ${escapeHtml(res.found.description)}</div>
        <div style="margin-top: 8px; color: #a3a3b2; font-size: 11px;">
          Algorithm scanned ${res.comparisons} record(s) out of ${res.totalItems} total before locating target.
        </div>
      `;
      // If binary search returned a sorted list, update the displayed table to reflect it
      if (res.sortedList) {
        state.activeEvidenceList = res.sortedList;
        renderEvidenceTable(state.activeEvidenceList, res.found.id);
      } else {
        renderEvidenceTable(state.activeEvidenceList, res.found.id);
      }
    } else {
      elements.searchMetricPill.className = "metric-pill";
      elements.searchResultContent.innerHTML = `
        <div style="color: #f85149; font-weight: bold; margin-bottom: 6px;">
          ✗ Target Not Found
        </div>
        <div>Queried target: "${escapeHtml(query)}"</div>
        <div style="margin-top: 8px; color: #a3a3b2; font-size: 11px;">
          Exhausted ${res.comparisons} comparison(s). No record matched in the active dataset.
        </div>
      `;
      renderEvidenceTable(state.activeEvidenceList, null);
    }
  } catch (err) {
    showSearchError(err.message);
  }
}

function showSearchError(msg) {
  elements.searchOutput.classList.remove("hidden");
  elements.searchAlgoName.textContent = "Search Error";
  elements.searchMetricPill.textContent = "Failed";
  elements.searchMetricPill.className = "metric-pill";
  elements.searchResultContent.innerHTML = `<span style="color: #f85149;">${escapeHtml(msg)}</span>`;
}

// ── Evidence Sorting Handlers ─────────────────────────────────────
async function handleSort(algorithm) {
  try {
    const res = await fetchApi("/api/sort-evidence", {
      method: "POST",
      body: JSON.stringify({
        caseId: state.currentCaseId,
        algorithm: algorithm,
        order: "asc"
      })
    });

    if (res.success && res.sorted) {
      state.activeEvidenceList = res.sorted;
      renderEvidenceTable(res.sorted);
      
      const stats = res.stats;
      const opCount = stats.swaps !== undefined ? `${stats.swaps} swaps` : `${stats.moves} moves`;
      elements.sortStats.textContent = `[${res.algorithm}] Comparisons: ${stats.comparisons} | Operations: ${opCount}`;
    }
  } catch (err) {
    console.error("Sorting error:", err);
  }
}

// ── Suspects & Witnesses Renderers ────────────────────────────────
function renderSuspects(suspects) {
  if (!suspects || suspects.length === 0) {
    elements.suspectsList.innerHTML = `<p class="text-muted">No suspects indexed.</p>`;
    return;
  }

  elements.suspectsList.innerHTML = suspects.map((s) => `
    <div class="suspect-card">
      <div class="suspect-info">
        <div class="suspect-name-row">
          <span class="badge-id">${escapeHtml(s.id)}</span>
          <span class="suspect-name">${escapeHtml(s.name)}</span>
          <span class="suspect-role">(${escapeHtml(s.role)})</span>
        </div>
        <div class="suspect-alibi">${escapeHtml(s.alibi)}</div>
      </div>
      <div>
        <span class="badge-score" title="BST Key: Suspicion Score">Suspicion: ${s.suspicion}</span>
      </div>
    </div>
  `).join("");
}

function renderWitnesses(witnesses) {
  if (!witnesses || witnesses.length === 0) {
    elements.witnessQueueList.innerHTML = `<p class="text-muted">No queued witnesses.</p>`;
    return;
  }

  elements.witnessQueueList.innerHTML = witnesses.map((w, idx) => `
    <div class="witness-queue-item">
      <div>
        <span class="witness-step">Q#${idx + 1}</span>
        <strong>${escapeHtml(w.name)}</strong>
        <span style="color: var(--text-muted); margin-left: 8px;">— "${escapeHtml(w.statement)}"</span>
      </div>
      <span class="tag tag-crimson" style="font-size: 10px;">Pending</span>
    </div>
  `).join("");
}

// ── Suspect BST Search Handler ────────────────────────────────────
async function handleBstSearch() {
  const scoreVal = elements.bstSearchInput.value.trim();
  if (!scoreVal) return;

  try {
    const res = await fetchApi("/api/suspects-bst", {
      method: "POST",
      body: JSON.stringify({
        caseId: state.currentCaseId,
        score: scoreVal
      })
    });

    if (!res.success) {
      alert(res.error || "BST search failed");
      return;
    }

    elements.bstOutput.classList.remove("hidden");
    elements.bstMetricPill.textContent = `${res.foundCount} record(s) at key ${res.score}`;

    if (res.foundCount > 0) {
      elements.bstMetricPill.className = "metric-pill success";
      elements.bstResultContent.innerHTML = `
        <div style="margin-bottom: 8px; color: #3fb950; font-weight: bold;">
          BST.search(${res.score}) successfully matched ${res.foundCount} node record(s):
        </div>
        ${res.records.map((r) => `
          <div style="padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.1);">
            <strong>[${escapeHtml(r.id)}] ${escapeHtml(r.name)}</strong> &mdash; ${escapeHtml(r.role)}
            <div style="color: #a3a3b2; font-size: 11px;">Alibi: "${escapeHtml(r.alibi)}"</div>
          </div>
        `).join("")}
        <div style="margin-top: 8px; font-size: 11px; color: var(--accent-info);">
          * Note: Duplicate key support ensures all records with score ${res.score} are preserved without collision.
        </div>
      `;
    } else {
      elements.bstMetricPill.className = "metric-pill";
      elements.bstResultContent.innerHTML = `
        <div style="color: #f85149;">
          No suspect registered with suspicion score ${res.score} in the BST.
        </div>
      `;
    }
  } catch (err) {
    console.error("BST Search error:", err);
  }
}

// ── Graph Renderers & Analysis Handlers ───────────────────────────
function populateGraphDropdowns(nodes) {
  if (!nodes || nodes.length === 0) return;
  const optionsHtml = nodes.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
  elements.graphStartNode.innerHTML = optionsHtml;
  elements.graphTargetNode.innerHTML = optionsHtml;

  // Set default selection if exists
  if (nodes.length > 1) {
    elements.graphTargetNode.selectedIndex = 1;
  }
}

function renderGraphEdges(edges) {
  if (!edges || edges.length === 0) {
    elements.graphEdgesList.innerHTML = `<span class="text-muted">No connections registered.</span>`;
    return;
  }

  elements.graphEdgesList.innerHTML = edges.map((e) => `
    <div class="edge-item">
      <span>${escapeHtml(e.a)}</span>
      <span class="edge-rel">&mdash;[ ${escapeHtml(e.relationship)} ]&rarr;</span>
      <span>${escapeHtml(e.b)}</span>
    </div>
  `).join("");
}

function resetGraphConsole() {
  elements.graphAlgoTag.textContent = "Graph Traversal Console";
  elements.graphMetricPill.textContent = "Ready";
  elements.graphMetricPill.className = "metric-pill";
  elements.graphResultContent.innerHTML = `<p class="text-muted">Select a source node and execute an algorithm below to analyze relational paths.</p>`;
}

async function handleGraphAction(mode) {
  const startNode = elements.graphStartNode.value;
  const targetNode = elements.graphTargetNode.value;

  try {
    const res = await fetchApi("/api/graph-analysis", {
      method: "POST",
      body: JSON.stringify({
        caseId: state.currentCaseId,
        mode: mode,
        startNode: startNode,
        targetNode: targetNode
      })
    });

    if (!res.success) {
      alert(res.error || "Graph operation failed");
      return;
    }

    if (mode === "bfs") {
      elements.graphAlgoTag.textContent = "Breadth-First Search (Queue BFS)";
      elements.graphMetricPill.textContent = `${res.traversalOrder.length} Nodes Visited`;
      elements.graphMetricPill.className = "metric-pill success";

      const traversalList = res.traversalOrder.map((node, idx) => {
        const dist = (res.distances.find((d) => d.node === node) || {}).dist ?? 0;
        return `
          <div style="padding: 3px 0;">
            <span style="color: #ff6b6b; font-weight: bold;">Step ${idx + 1}:</span>
            <strong>${escapeHtml(node)}</strong>
            <span style="color: #a3a3b2; font-size: 11px;">(${dist} hop${dist === 1 ? '' : 's'} from source)</span>
          </div>
        `;
      }).join("");

      elements.graphResultContent.innerHTML = `
        <div style="margin-bottom: 8px; color: #58a6ff;">
          BFS Traversal Order starting from <em>${escapeHtml(res.startNode)}</em>:
        </div>
        ${traversalList}
        <div style="margin-top: 10px; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
          <strong style="color: #ffffff;">Direct Connections of ${escapeHtml(res.startNode)}:</strong>
          ${res.directConnections.map((c) => `<div style="color:#a3a3b2; font-size: 11px;">&bull; ${escapeHtml(c)}</div>`).join("")}
        </div>
      `;
    } else if (mode === "dfs") {
      elements.graphAlgoTag.textContent = "Depth-First Search (Recursive DFS)";
      elements.graphMetricPill.textContent = `${res.traversalOrder.length} Nodes Explored`;
      elements.graphMetricPill.className = "metric-pill";

      const traversalList = res.traversalOrder.map((node, idx) => `
        <div style="padding: 3px 0;">
          <span style="color: #ff6b6b; font-weight: bold;">Step ${idx + 1}:</span>
          <strong>${escapeHtml(node)}</strong>
        </div>
      `).join("");

      elements.graphResultContent.innerHTML = `
        <div style="margin-bottom: 8px; color: #58a6ff;">
          DFS Traversal Order starting from <em>${escapeHtml(res.startNode)}</em>:
        </div>
        ${traversalList}
      `;
    } else if (mode === "separation") {
      elements.graphAlgoTag.textContent = "Degrees of Separation (BFS Shortest Path)";
      const hops = res.degreesOfSeparation;
      elements.graphMetricPill.textContent = hops >= 0 ? `${hops} Hop(s)` : "Unconnected";
      elements.graphMetricPill.className = hops >= 0 ? "metric-pill success" : "metric-pill";

      elements.graphResultContent.innerHTML = `
        <div style="font-size: 13px; margin-bottom: 8px;">
          Distance from <strong>${escapeHtml(res.startNode)}</strong> to <strong>${escapeHtml(res.targetNode)}</strong>:
        </div>
        <div style="font-size: 16px; font-weight: bold; color: ${hops >= 0 ? '#3fb950' : '#f85149'};">
          ${hops >= 0 ? `${hops} degree(s) of separation` : 'No connected path exists between these entities.'}
        </div>
        <div style="margin-top: 10px; color: var(--text-muted); font-size: 11px;">
          Guaranteed minimal hop-count computed using FIFO Queue Breadth-First traversal.
        </div>
      `;
    } else if (mode === "ranking") {
      elements.graphAlgoTag.textContent = "Rank Entities by Proximity (BFS Distance)";
      elements.graphMetricPill.textContent = `${res.ranked.length} Entities Ranked`;
      elements.graphMetricPill.className = "metric-pill success";

      elements.graphResultContent.innerHTML = `
        <div style="margin-bottom: 8px; color: #58a6ff;">
          Entities ordered closest to furthest from <em>${escapeHtml(res.startNode)}</em>:
        </div>
        ${res.ranked.map((item, idx) => `
          <div style="padding: 3px 0; display: flex; justify-content: space-between;">
            <span>${idx + 1}. <strong>${escapeHtml(item.node)}</strong></span>
            <span class="badge-score">${item.dist} hop(s)</span>
          </div>
        `).join("")}
      `;
    }
  } catch (err) {
    console.error("Graph action error:", err);
  }
}

// ── Timeline Reconstruction Inputs & Logic ───────────────────────
function renderTimelineInputs(events, constraints) {
  if (!events || !constraints) return;

  elements.eventsPool.innerHTML = events.map((ev) => `
    <div class="event-bubble">
      <span class="event-id-tag">[${escapeHtml(ev.id)}]</span>
      <span>${escapeHtml(ev.description)}</span>
    </div>
  `).join("");

  elements.constraintsPool.innerHTML = constraints.map((c) => {
    let ruleText = "";
    if (c.type === "before") ruleText = `before("${c.before}", "${c.after}")`;
    else if (c.type === "mustFollow") ruleText = `mustFollow("${c.before}", "${c.after}")`;
    else if (c.type === "notAdjacent") ruleText = `notAdjacent("${c.a}", "${c.b}")`;

    return `
      <div class="constraint-bubble">
        <span class="constraint-rule">&bull; ${escapeHtml(ruleText)}</span>
        <span class="constraint-desc">${escapeHtml(c.label || '')}</span>
      </div>
    `;
  }).join("");
}

// ── Reconstruct Timeline Handler (Backtracking Engine) ───────────
async function handleReconstruct() {
  const isContradictionChecked = elements.chkContradiction.checked;
  const extraConstraints = [];

  // If user opted to simulate contradictory constraints:
  if (isContradictionChecked) {
    if (state.currentCaseId === "CASE-1042") {
      // Inject circular contradiction: Pemberton collapse (E5) must happen BEFORE he enters study (E1)
      extraConstraints.push({ type: "before", before: "E5", after: "E1" });
    } else if (state.currentCaseId === "CASE-2019") {
      // Guest collapse (E) must happen BEFORE suspect enters pantry (A)
      extraConstraints.push({ type: "before", before: "E", after: "A" });
    } else {
      // W5 before W1
      extraConstraints.push({ type: "before", before: "W5", after: "W1" });
    }
  }

  try {
    const res = await fetchApi("/api/reconstruct-timeline", {
      method: "POST",
      body: JSON.stringify({
        caseId: state.currentCaseId,
        extraConstraints: extraConstraints
      })
    });

    if (!res.success) {
      alert(res.error || "Reconstruction failed");
      return;
    }

    elements.reconstructionOutput.classList.remove("hidden");

    // Diagnostics / Metrics
    const stats = res.stats;
    elements.reconMetrics.innerHTML = `
      <span class="metric-pill">Nodes Visited: ${stats.nodesVisited}</span>
      <span class="metric-pill">Pruned Early: ${stats.pruned}</span>
      <span class="metric-pill ${stats.found > 0 ? 'success' : ''}">Valid Timelines: ${stats.found}</span>
    `;

    if (res.solutions.length === 0) {
      elements.reconResultContent.innerHTML = `
        <div style="background-color: var(--accent-fail-bg); border: 1px solid rgba(248,81,73,0.3); padding: 14px; border-radius: 4px;">
          <h4 style="color: #f85149; margin-bottom: 6px;">✗ No Valid Chronological Sequence Exists</h4>
          <p style="color: #ffffff; font-size: 12px; margin-bottom: 8px;">
            The active constraints are mutually contradictory. The backtracking search tree was pruned early across all candidate branches without finding any valid leaf configuration.
          </p>
          <div style="font-size: 11px; color: #a3a3b2;">
            Backtracker checked all permutations of ${res.totalEvents} events and pruned ${stats.pruned} invalid partial subtrees.
          </div>
        </div>
      `;
      return;
    }

    // Render Solutions
    const solutionsHtml = res.solutions.map((seq, seqIdx) => {
      const stepItems = seq.map((ev, stepIdx) => `
        <div class="step-card">
          <span class="step-num">${stepIdx + 1}.</span>
          <span class="step-content">
            <strong style="color: #ff6b6b; font-family: var(--font-mono); margin-right: 6px;">[${escapeHtml(ev.id)}]</strong>
            ${escapeHtml(ev.description)}
          </span>
        </div>
      `).join("");

      return `
        <div class="solution-box">
          <div class="solution-title">
            <span class="tag tag-crimson">TIMELINE SEQUENCE #${seqIdx + 1}</span>
            <span>&mdash; Chronologically Consistent Order</span>
          </div>
          <div class="sequence-steps">
            ${stepItems}
          </div>
        </div>
      `;
    }).join("");

    // Render Constraints Checklist
    const constraintsChecklistHtml = `
      <div class="constraint-validation-box">
        <h4 class="subhead" style="color: #3fb950; margin-bottom: 10px;">Forensic Constraints Verified &amp; Satisfied</h4>
        ${res.constraintReport.map((c) => `
          <div class="constraint-check-item">
            <span class="status-badge ${c.satisfied ? 'pass' : 'fail'}">${c.satisfied ? 'SATISFIED' : 'VIOLATED'}</span>
            <div>
              <strong>${escapeHtml(c.label || c.type)}</strong>
              <div style="color: #a3a3b2; font-size: 11px;">${escapeHtml(c.detail)}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    elements.reconResultContent.innerHTML = solutionsHtml + constraintsChecklistHtml;

  } catch (err) {
    console.error("Reconstruction error:", err);
  }
}

// ── Verdict / Solve the Case Logic ────────────────────────────────

/**
 * Initializes and populates the Verdict form with the current case's suspects & evidence.
 * Resets any previous verdict results or error states.
 */
function renderVerdictSection(caseData) {
  if (!caseData) return;

  // 1. Reset results panel and validation warning
  elements.verdictAlert.classList.add("hidden");
  elements.verdictAlert.textContent = "";
  elements.verdictResultPanel.classList.add("hidden");
  elements.verdictResultPanel.innerHTML = "";
  elements.verdictReasoning.value = "";

  // 2. Render Suspect Selection Cards
  if (!caseData.suspects || caseData.suspects.length === 0) {
    elements.verdictSuspectsGrid.innerHTML = `<p class="text-muted">No suspects registered for this dossier.</p>`;
  } else {
    elements.verdictSuspectsGrid.innerHTML = caseData.suspects.map((s) => `
      <div class="verdict-suspect-card" data-suspect-id="${escapeHtml(s.id)}" id="verdictCard_${escapeHtml(s.id)}">
        <input 
          type="radio" 
          name="verdictSuspect" 
          id="radio_${escapeHtml(s.id)}" 
          value="${escapeHtml(s.id)}" 
          class="verdict-suspect-radio"
          aria-label="Accuse ${escapeHtml(s.name)}"
        >
        <div class="verdict-suspect-info">
          <div class="verdict-suspect-header">
            <span class="badge-id">${escapeHtml(s.id)}</span>
            <span class="badge-score" title="BST Key: Suspicion Priority">Score: ${s.suspicion}</span>
          </div>
          <div class="verdict-suspect-name">${escapeHtml(s.name)}</div>
          <div class="verdict-suspect-role">${escapeHtml(s.role)}</div>
          <div class="verdict-suspect-alibi">&ldquo;${escapeHtml(s.alibi)}&rdquo;</div>
        </div>
      </div>
    `).join("");

    // Add click listeners to cards
    elements.verdictSuspectsGrid.querySelectorAll(".verdict-suspect-card").forEach((card) => {
      card.addEventListener("click", () => {
        const suspectId = card.getAttribute("data-suspect-id");
        selectVerdictSuspect(suspectId);
      });
    });
  }

  // 3. Render Evidence Selection Checkbox Cards
  if (!caseData.evidence || caseData.evidence.length === 0) {
    elements.verdictEvidenceGrid.innerHTML = `<p class="text-muted">No evidence records available.</p>`;
  } else {
    elements.verdictEvidenceGrid.innerHTML = caseData.evidence.map((ev) => `
      <div class="verdict-evidence-item" data-evidence-id="${escapeHtml(ev.id)}" id="verdictEvidence_${escapeHtml(ev.id)}">
        <input 
          type="checkbox" 
          id="chk_${escapeHtml(ev.id)}" 
          value="${escapeHtml(ev.id)}" 
          class="verdict-evidence-checkbox"
          aria-label="Include ${escapeHtml(ev.name)} as supporting evidence"
        >
        <div class="verdict-evidence-content">
          <div class="verdict-evidence-top">
            <span class="badge-id">${escapeHtml(ev.id)}</span>
            <span class="badge-score">Imp: ${ev.importance}</span>
          </div>
          <div class="verdict-evidence-name">${escapeHtml(ev.name)}</div>
          <div class="verdict-evidence-desc">${escapeHtml(ev.description)}</div>
        </div>
      </div>
    `).join("");

    // Add click listeners to evidence items
    elements.verdictEvidenceGrid.querySelectorAll(".verdict-evidence-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT") {
          const chk = item.querySelector(".verdict-evidence-checkbox");
          chk.checked = !chk.checked;
        }
        item.classList.toggle("selected", item.querySelector(".verdict-evidence-checkbox").checked);
      });
    });
  }
}

/**
 * Handles selecting a suspect in the Verdict grid.
 */
function selectVerdictSuspect(suspectId) {
  elements.verdictSuspectsGrid.querySelectorAll(".verdict-suspect-card").forEach((card) => {
    const isTarget = card.getAttribute("data-suspect-id") === suspectId;
    card.classList.toggle("selected", isTarget);
    const radio = card.querySelector(".verdict-suspect-radio");
    if (radio) radio.checked = isTarget;
  });

  // Clear any active validation alert
  elements.verdictAlert.classList.add("hidden");
  elements.verdictAlert.textContent = "";
}

/**
 * Submits the player's verdict to the server for evaluation.
 */
async function handleSubmitVerdict() {
  // Validate that a suspect has been selected
  const checkedRadio = elements.verdictSuspectsGrid.querySelector('input[name="verdictSuspect"]:checked');
  if (!checkedRadio) {
    elements.verdictAlert.textContent = "⚠ Suspect Selection Required: Please choose who you believe is the perpetrator before submitting your verdict.";
    elements.verdictAlert.classList.remove("hidden");
    elements.verdictAlert.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  elements.verdictAlert.classList.add("hidden");

  const suspectId = checkedRadio.value;
  const reasoning = elements.verdictReasoning.value.trim();
  const selectedEvidenceIds = Array.from(
    elements.verdictEvidenceGrid.querySelectorAll('.verdict-evidence-checkbox:checked')
  ).map((cb) => cb.value);

  try {
    const res = await fetchApi("/api/submit-verdict", {
      method: "POST",
      body: JSON.stringify({
        caseId: state.currentCaseId,
        suspectId: suspectId,
        reasoning: reasoning,
        evidenceIds: selectedEvidenceIds
      })
    });

    if (!res.success) {
      elements.verdictAlert.textContent = res.error || "Failed to evaluate verdict.";
      elements.verdictAlert.classList.remove("hidden");
      return;
    }

    renderVerdictResult(res);

  } catch (err) {
    console.error("Verdict submission error:", err);
    elements.verdictAlert.textContent = "Server error while evaluating verdict: " + err.message;
    elements.verdictAlert.classList.remove("hidden");
  }
}

/**
 * Reveals the official canonical solution when the player gives up or wishes to inspect the dossier.
 */
async function handleRevealSolution() {
  try {
    const res = await fetchApi("/api/reveal-solution", {
      method: "POST",
      body: JSON.stringify({ caseId: state.currentCaseId })
    });

    if (!res.success) {
      alert(res.error || "Failed to reveal solution.");
      return;
    }

    renderVerdictResult(res);

  } catch (err) {
    console.error("Reveal solution error:", err);
  }
}

/**
 * Resets the verdict form back to its initial unselected state.
 */
function resetVerdictForm() {
  elements.verdictSuspectsGrid.querySelectorAll(".verdict-suspect-card").forEach((c) => {
    c.classList.remove("selected");
    const r = c.querySelector(".verdict-suspect-radio");
    if (r) r.checked = false;
  });

  elements.verdictEvidenceGrid.querySelectorAll(".verdict-evidence-item").forEach((it) => {
    it.classList.remove("selected");
    const chk = it.querySelector(".verdict-evidence-checkbox");
    if (chk) chk.checked = false;
  });

  elements.verdictReasoning.value = "";
  elements.verdictAlert.classList.add("hidden");
  elements.verdictResultPanel.classList.add("hidden");
  elements.verdictResultPanel.innerHTML = "";
}

/**
 * Renders the verdict result panel for Solved, Incorrect, or Revealed states.
 */
function renderVerdictResult(res) {
  elements.verdictResultPanel.classList.remove("hidden");

  if (res.isCorrect) {
    // ── CASE SOLVED ───────────────────────────────────────────────
    const sub = res.playerSubmission || {};
    const identifiedClues = sub.identifiedDecisiveClues || [];
    const missedClues = sub.missedDecisiveClues || [];

    // Clues checklist HTML
    const cluesChecklistHtml = (res.decisiveEvidence || []).map((ev) => {
      const isIdentified = identifiedClues.some((c) => c.id === ev.id);
      return `
        <div class="evidence-validation-card ${isIdentified ? 'matched' : 'missed'}">
          <div class="evidence-card-head">
            <span class="badge-id">${escapeHtml(ev.id)}</span>
            <span class="tag ${isIdentified ? 'tag-crimson' : ''}" style="${isIdentified ? 'background:#2ea043; color:#fff;' : 'background:#3b3b4a; color:#a3a3b2;'}">
              ${isIdentified ? '✓ RECOGNIZED BY YOU' : 'DECISIVE CLUE'}
            </span>
          </div>
          <strong style="color: #fff; font-size: 12px; margin-top: 4px;">${escapeHtml(ev.name)}</strong>
          <span style="font-size: 11px; color: #a3a3b2;">${escapeHtml(ev.description)}</span>
        </div>
      `;
    }).join("");

    // Red herrings HTML
    const redHerringsHtml = (res.misleadingClues || []).map((rh) => `
      <div class="red-herring-card">
        <span class="red-herring-name">${escapeHtml(rh.suspectName)}:</span>
        ${escapeHtml(rh.explanation)}
      </div>
    `).join("");

    // Chronological steps
    const chronologicalStepsHtml = (res.chronologicalExplanation || "").split("\n").filter(Boolean).map((step) => `
      <div class="verdict-step-entry">${escapeHtml(step)}</div>
    `).join("");

    elements.verdictResultPanel.innerHTML = `
      <div class="verdict-status-banner solved">
        <div style="display:flex; align-items:center; gap: 12px;">
          <span class="verdict-badge-lg pass">CASE SOLVED</span>
          <span class="verdict-banner-title">MYSTERY RESOLVED &mdash; CULPRIT APPREHENDED</span>
        </div>
        <span class="tag tag-crimson" style="background: rgba(46,160,67,0.3); border-color: #2ea043; color: #fff;">Case Dossier Closed</span>
      </div>

      <div class="verdict-result-body">
        
        <!-- Culprit Dossier Box -->
        <div class="culprit-dossier-box solved-accent">
          <div class="culprit-meta-row">
            <div class="culprit-name-group">
              <span class="badge-id" style="font-size: 13px; padding: 4px 8px;">${escapeHtml(res.culprit.id)}</span>
              <span class="culprit-fullname">${escapeHtml(res.culprit.name)}</span>
              <span class="culprit-role-tag">(${escapeHtml(res.culprit.role)})</span>
            </div>
            <span class="badge-score" style="border-color:#2ea043; color:#3fb950;">BST Priority: ${res.culprit.suspicion}</span>
          </div>
          <p style="color: #a3a3b2; font-size: 12px; margin: 0;">
            <strong>Disproved Alibi:</strong> &ldquo;${escapeHtml(res.culprit.alibi)}&rdquo; &mdash; 
            <em style="color: #ff8b8b;">Disproven by forensic evidence and service logs.</em>
          </p>
        </div>

        ${sub.reasoning ? `
          <div class="verdict-block">
            <div class="verdict-block-title">YOUR INVESTIGATIVE DEDUCTION</div>
            <div class="player-reasoning-quote">
              &ldquo;${escapeHtml(sub.reasoning)}&rdquo;
            </div>
          </div>
        ` : ""}

        <!-- Motive Block -->
        <div class="verdict-block">
          <div class="verdict-block-title">OFFICIAL MOTIVE</div>
          <div class="verdict-block-content">${escapeHtml(res.motive)}</div>
        </div>

        <!-- Method & Opportunity Block -->
        <div class="verdict-block">
          <div class="verdict-block-title">METHOD &amp; OPPORTUNITY</div>
          <div class="verdict-block-content">${escapeHtml(res.methodAndOpportunity)}</div>
        </div>

        <!-- Chronological Reconstruction (Phase 4 Alignment) -->
        <div class="verdict-block">
          <div class="verdict-block-title">CHRONOLOGICAL EVENT SEQUENCE (BACKTRACKING TIMELINE)</div>
          <div class="verdict-steps-list">
            ${chronologicalStepsHtml}
          </div>
        </div>

        <!-- Decisive Evidence Evaluation -->
        <div class="verdict-block">
          <div class="verdict-block-title">DECISIVE EVIDENCE &amp; CLUE EVALUATION</div>
          ${sub.evidenceQuality === "weak" || (identifiedClues.length === 0 && (res.decisiveEvidence || []).length > 0) ? `
            <div style="background: rgba(247, 127, 0, 0.1); border: 1px solid rgba(247, 127, 0, 0.3); border-radius: 4px; padding: 10px 14px; margin-bottom: 10px; font-size: 12px; color: #ffbe76;">
              <strong>Investigative Note:</strong> You correctly identified the culprit! However, you did not highlight the primary physical clues connecting them to the crime. Review the decisive evidence breakdown below:
            </div>
          ` : ""}
          <div class="verdict-block-content" style="white-space: pre-line; margin-bottom: 12px;">
            ${escapeHtml(res.decisiveEvidenceExplanation)}
          </div>
          <div class="evidence-validation-grid">
            ${cluesChecklistHtml}
          </div>
        </div>

        <!-- Red Herrings & Alternative Suspects -->
        <div class="verdict-block">
          <div class="verdict-block-title">WHY RED HERRINGS WERE MISLEADING</div>
          <div class="verdict-block-content">
            Suspicion scores are designed to prioritize initial detective leads, but do not establish proof. Here is why alternative persons of interest were exonerated:
          </div>
          ${redHerringsHtml}
        </div>

        <!-- Remaining Uncertainty -->
        ${res.remainingUncertainty ? `
          <div class="verdict-block">
            <div class="verdict-block-title">REMAINING INVESTIGATIVE UNCERTAINTIES</div>
            <div class="verdict-block-content" style="color: var(--text-muted); font-size: 12px;">
              ${escapeHtml(res.remainingUncertainty)}
            </div>
          </div>
        ` : ""}

        <!-- Action Cluster: Try Another Case / Replay -->
        <div class="verdict-replay-cluster">
          <button type="button" class="btn btn-crimson btn-md" id="btnTryAnotherCase">
            <span>TRY ANOTHER CASE</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btnReExamineCase">
            Re-Examine Dossier
          </button>
        </div>

      </div>
    `;

  } else if (!res.revealed) {
    // ── INCORRECT SUSPECT ─────────────────────────────────────────
    const sub = res.playerSubmission || {};

    elements.verdictResultPanel.innerHTML = `
      <div class="verdict-status-banner incorrect">
        <div style="display:flex; align-items:center; gap: 12px;">
          <span class="verdict-badge-lg fail">INCORRECT SUSPECT</span>
          <span class="verdict-banner-title">ACCUSATION NOT SUBSTANTIATED BY EVIDENCE</span>
        </div>
        <span class="tag tag-crimson" style="background: rgba(248,81,73,0.3); border-color: #f85149; color: #fff;">Investigation Continues</span>
      </div>

      <div class="verdict-result-body">

        <!-- Accused Suspect Dossier Box -->
        <div class="culprit-dossier-box incorrect-accent">
          <div class="culprit-meta-row">
            <div class="culprit-name-group">
              <span class="badge-id" style="font-size: 13px; padding: 4px 8px;">${escapeHtml(res.accusedSuspect.id)}</span>
              <span class="culprit-fullname">${escapeHtml(res.accusedSuspect.name)}</span>
              <span class="culprit-role-tag">(${escapeHtml(res.accusedSuspect.role)})</span>
            </div>
            <span class="badge-score">BST Priority: ${res.accusedSuspect.suspicion}</span>
          </div>
          <p style="color: #a3a3b2; font-size: 12px; margin: 0;">
            <strong>Recorded Alibi:</strong> &ldquo;${escapeHtml(res.accusedSuspect.alibi)}&rdquo;
          </p>
        </div>

        <!-- Helpful Investigative Hint (Does NOT reveal culprit) -->
        <div class="verdict-hint-box">
          <div class="verdict-hint-title">
            <span>🔍 INVESTIGATIVE LEAD // OVERLOOKED CONTEXT</span>
          </div>
          <div class="verdict-hint-text">
            ${escapeHtml(res.hint)}
          </div>
        </div>

        ${sub.reasoning ? `
          <div class="verdict-block">
            <div class="verdict-block-title">YOUR RECORDED REASONING</div>
            <div class="player-reasoning-quote">
              &ldquo;${escapeHtml(sub.reasoning)}&rdquo;
            </div>
          </div>
        ` : ""}

        <div class="verdict-block">
          <div class="verdict-block-title">RECOMMENDED NEXT STEPS</div>
          <div class="verdict-block-content">
            &bull; <strong>Evidence Locker:</strong> Re-sort items by Importance or search for physical access logs.<br>
            &bull; <strong>Relationship Graph:</strong> Run BFS from the victim or location to observe degrees of separation.<br>
            &bull; <strong>Backtracking Engine:</strong> Run the chronological timeline reconstruction to see when events strictly occurred.
          </div>
        </div>

        <!-- Action Cluster: Retry or Reveal -->
        <div class="verdict-replay-cluster">
          <button type="button" class="btn btn-crimson btn-md" id="btnRetryVerdict">
            <span>INVESTIGATE FURTHER &amp; RETRY</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btnResultReveal">
            Reveal Official Solution
          </button>
        </div>

      </div>
    `;

  } else {
    // ── OFFICIAL SOLUTION REVEALED ────────────────────────────────
    const redHerringsHtml = (res.misleadingClues || []).map((rh) => `
      <div class="red-herring-card">
        <span class="red-herring-name">${escapeHtml(rh.suspectName)}:</span>
        ${escapeHtml(rh.explanation)}
      </div>
    `).join("");

    const chronologicalStepsHtml = (res.chronologicalExplanation || "").split("\n").filter(Boolean).map((step) => `
      <div class="verdict-step-entry">${escapeHtml(step)}</div>
    `).join("");

    const cluesChecklistHtml = (res.decisiveEvidence || []).map((ev) => `
      <div class="evidence-validation-card missed">
        <div class="evidence-card-head">
          <span class="badge-id">${escapeHtml(ev.id)}</span>
          <span class="tag" style="background:#3b3b4a; color:#a3a3b2;">DECISIVE CLUE</span>
        </div>
        <strong style="color: #fff; font-size: 12px; margin-top: 4px;">${escapeHtml(ev.name)}</strong>
        <span style="font-size: 11px; color: #a3a3b2;">${escapeHtml(ev.description)}</span>
      </div>
    `).join("");

    elements.verdictResultPanel.innerHTML = `
      <div class="verdict-status-banner revealed">
        <div style="display:flex; align-items:center; gap: 12px;">
          <span class="verdict-badge-lg reveal">OFFICIAL SOLUTION</span>
          <span class="verdict-banner-title">OFFICIAL CASE DOSSIER &amp; PERPETRATOR PROFILE</span>
        </div>
        <span class="tag tag-crimson" style="background: rgba(247,127,0,0.3); border-color: #f77f00; color: #fff;">Classified Dossier</span>
      </div>

      <div class="verdict-result-body">

        <!-- Culprit Dossier Box -->
        <div class="culprit-dossier-box">
          <div class="culprit-meta-row">
            <div class="culprit-name-group">
              <span class="badge-id" style="font-size: 13px; padding: 4px 8px;">${escapeHtml(res.culprit.id)}</span>
              <span class="culprit-fullname">${escapeHtml(res.culprit.name)}</span>
              <span class="culprit-role-tag">(${escapeHtml(res.culprit.role)})</span>
            </div>
            <span class="badge-score">BST Priority: ${res.culprit.suspicion}</span>
          </div>
          <p style="color: #a3a3b2; font-size: 12px; margin: 0;">
            <strong>Disproven Alibi:</strong> &ldquo;${escapeHtml(res.culprit.alibi)}&rdquo;
          </p>
        </div>

        <div class="verdict-block">
          <div class="verdict-block-title">CANONICAL MOTIVE</div>
          <div class="verdict-block-content">${escapeHtml(res.motive)}</div>
        </div>

        <div class="verdict-block">
          <div class="verdict-block-title">METHOD &amp; OPPORTUNITY</div>
          <div class="verdict-block-content">${escapeHtml(res.methodAndOpportunity)}</div>
        </div>

        <div class="verdict-block">
          <div class="verdict-block-title">CHRONOLOGICAL EVENT SEQUENCE</div>
          <div class="verdict-steps-list">
            ${chronologicalStepsHtml}
          </div>
        </div>

        <div class="verdict-block">
          <div class="verdict-block-title">DECISIVE EVIDENCE</div>
          <div class="verdict-block-content" style="white-space: pre-line; margin-bottom: 12px;">
            ${escapeHtml(res.decisiveEvidenceExplanation)}
          </div>
          <div class="evidence-validation-grid">
            ${cluesChecklistHtml}
          </div>
        </div>

        <div class="verdict-block">
          <div class="verdict-block-title">WHY ALTERNATIVE SUSPECTS WERE INNOCENT</div>
          ${redHerringsHtml}
        </div>

        ${res.remainingUncertainty ? `
          <div class="verdict-block">
            <div class="verdict-block-title">REMAINING UNCERTAINTIES</div>
            <div class="verdict-block-content" style="color: var(--text-muted); font-size: 12px;">
              ${escapeHtml(res.remainingUncertainty)}
            </div>
          </div>
        ` : ""}

        <div class="verdict-replay-cluster">
          <button type="button" class="btn btn-crimson btn-md" id="btnTryAnotherCase">
            <span>TRY ANOTHER CASE</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>

      </div>
    `;
  }

  // Bind dynamic buttons within the result panel
  const btnTryAnother = document.getElementById("btnTryAnotherCase");
  if (btnTryAnother) {
    btnTryAnother.addEventListener("click", () => {
      elements.caseSelect.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const btnReExamine = document.getElementById("btnReExamineCase");
  if (btnReExamine) {
    btnReExamine.addEventListener("click", () => {
      elements.dossierSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  const btnRetry = document.getElementById("btnRetryVerdict");
  if (btnRetry) {
    btnRetry.addEventListener("click", () => {
      elements.verdictSuspectsGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const btnResultReveal = document.getElementById("btnResultReveal");
  if (btnResultReveal) {
    btnResultReveal.addEventListener("click", handleRevealSolution);
  }

  // Smooth scroll to the verdict result panel
  elements.verdictResultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Event Listeners Setup ─────────────────────────────────────────
function setupEventListeners() {
  // Navigation & View switching
  window.addEventListener("hashchange", handleHashChange);

  elements.navBrand.addEventListener("click", () => showView("landing"));
  elements.linkNavHome.addEventListener("click", (e) => {
    e.preventDefault();
    showView("landing");
  });
  elements.linkNavLearn.addEventListener("click", (e) => {
    e.preventDefault();
    showView("landing", "learn");
  });
  elements.linkNavHow.addEventListener("click", (e) => {
    e.preventDefault();
    showView("landing", "how-it-works");
  });
  elements.linkNavDashboard.addEventListener("click", (e) => {
    e.preventDefault();
    showView("dashboard");
  });

  elements.btnNavInvestigate.addEventListener("click", () => showView("dashboard"));
  elements.btnBackToLanding.addEventListener("click", () => showView("landing"));
  elements.btnHeroStart.addEventListener("click", () => showView("dashboard"));
  elements.btnCtaStart.addEventListener("click", () => showView("dashboard"));

  elements.btnHeroExplore.addEventListener("click", (e) => {
    e.preventDefault();
    showView("landing", "learn");
  });

  // Case selection in Dashboard
  elements.caseSelect.addEventListener("change", (e) => loadCase(e.target.value));
  elements.btnReloadCase.addEventListener("click", () => loadCase(state.currentCaseId));

  // Evidence Search
  elements.btnSearch.addEventListener("click", handleSearch);
  elements.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Radio button switch updates placeholder
  document.querySelectorAll('input[name="searchAlgo"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "linear") {
        elements.searchInput.placeholder = "Search by evidence name (e.g. Kitchen Knife)...";
      } else {
        elements.searchInput.placeholder = "Search by numeric importance score (e.g. 88)...";
      }
    });
  });

  // Quick query chips
  elements.searchChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const query = chip.getAttribute("data-query");
    const algo = chip.getAttribute("data-algo");
    
    const targetRadio = document.querySelector(`input[name="searchAlgo"][value="${algo}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
      targetRadio.dispatchEvent(new Event("change"));
    }
    elements.searchInput.value = query;
    handleSearch();
  });

  // Sorting
  elements.btnSortInsertion.addEventListener("click", () => handleSort("insertion"));
  elements.btnSortMerge.addEventListener("click", () => handleSort("merge"));
  elements.btnSortQuick.addEventListener("click", () => handleSort("quick"));
  elements.btnResetEvidence.addEventListener("click", () => {
    if (state.currentCaseData) {
      state.activeEvidenceList = [...state.currentCaseData.evidence];
      renderEvidenceTable(state.activeEvidenceList);
      elements.sortStats.textContent = "Evidence list reset to original discovery order.";
    }
  });

  // Suspect BST Search
  elements.btnBstSearch.addEventListener("click", handleBstSearch);
  elements.bstSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleBstSearch();
  });
  elements.btnBstReset.addEventListener("click", () => {
    elements.bstOutput.classList.add("hidden");
    elements.bstSearchInput.value = "";
    if (state.currentCaseData) {
      renderSuspects(state.currentCaseData.suspectsInorder || state.currentCaseData.suspects);
    }
  });

  // Graph actions
  elements.btnGraphBfs.addEventListener("click", () => handleGraphAction("bfs"));
  elements.btnGraphDfs.addEventListener("click", () => handleGraphAction("dfs"));
  elements.btnGraphDistance.addEventListener("click", () => handleGraphAction("separation"));
  elements.btnGraphRank.addEventListener("click", () => handleGraphAction("ranking"));

  // Timeline Reconstruction
  elements.btnReconstruct.addEventListener("click", handleReconstruct);

  // Verdict / Solve the Case
  if (elements.btnSubmitVerdict) {
    elements.btnSubmitVerdict.addEventListener("click", handleSubmitVerdict);
  }
  if (elements.btnRevealSolution) {
    elements.btnRevealSolution.addEventListener("click", handleRevealSolution);
  }
  if (elements.btnResetVerdictForm) {
    elements.btnResetVerdictForm.addEventListener("click", resetVerdictForm);
  }
}

// ── Utility Helpers ───────────────────────────────────────────────
function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Kick off app ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
