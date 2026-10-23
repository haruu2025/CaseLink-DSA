/**
 * server.js
 *
 * CaseLink Web Application Server (CommonJS, Pure Node.js Standard Library)
 * Integrates all project DSA algorithms with zero external dependencies.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

// ── Import Existing DSA Modules ──────────────────────────────────
const { LinkedList } = require("./phase1-linear/LinkedList");
const { Queue } = require("./phase1-linear/Queue");
const { Stack } = require("./phase1-linear/Stack");
const { BST } = require("./phase2-hierarchical/BST");
const { Graph } = require("./phase2-hierarchical/Graph");
const { linearSearch, binarySearch } = require("./phase3-searching-sorting/Searcher");
const { insertionSort, mergeSort, quickSort } = require("./phase3-searching-sorting/Sorter");
const {
  reconstruct,
  before,
  notAdjacent,
  mustFollow
} = require("./phase4-backtracking/CrimeReconstruction");

// ── Fictional Investigation Cases ────────────────────────────────
const { cases } = require("./casesData");
const { evaluateVerdict, revealSolution } = require("./verdictEngine");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

// ── Helper: Helper to build Case Graph ────────────────────────────
function buildCaseGraph(caseItem) {
  const graph = new Graph();
  for (const edge of caseItem.graphEdges) {
    graph.addEdge(edge.a, edge.b, edge.relationship);
  }
  return graph;
}

// ── Helper: Build Suspects BST ───────────────────────────────────
function buildSuspectBST(caseItem) {
  const bst = new BST();
  for (const s of caseItem.suspects) {
    bst.insert(s.suspicion, s);
  }
  return bst;
}

// ── Helper: Build Constraints from Case Spec ─────────────────────
function buildConstraints(caseItem) {
  return caseItem.constraints.map((c) => {
    if (c.type === "before") return before(c.before, c.after);
    if (c.type === "mustFollow") return mustFollow(c.before, c.after);
    if (c.type === "notAdjacent") return notAdjacent(c.a, c.b);
    return c;
  });
}

// ── MIME types dictionary ─────────────────────────────────────────
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml"
};

// ── Parse JSON body helper ────────────────────────────────────────
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

// ── Send JSON response helper ────────────────────────────────────
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(data));
}

// ── Static file handler ──────────────────────────────────────────
function serveStaticFile(reqPath, res) {
  let safePath = reqPath === "/" ? "/index.html" : reqPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  // Directory traversal prevention
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// ── HTTP Server Request Dispatcher ────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });
    res.end();
    return;
  }

  try {
    // 1. API: List all cases
    if (pathname === "/api/cases" && method === "GET") {
      const summaryList = cases.map((c) => ({
        id: c.id,
        title: c.title,
        leadInvestigator: c.leadInvestigator,
        incidentDate: c.incidentDate,
        status: c.status,
        synopsis: c.synopsis
      }));
      return sendJson(res, 200, { success: true, cases: summaryList });
    }

    // 2. API: Get full case details by ID
    if (pathname.startsWith("/api/cases/") && method === "GET") {
      const caseId = pathname.replace("/api/cases/", "").trim();
      const foundCase = cases.find((c) => c.id === caseId);
      if (!foundCase) {
        return sendJson(res, 404, { success: false, error: "Case not found" });
      }

      // Populate into LinkedList to verify and demonstrate Phase 1
      const evidenceLinkedList = new LinkedList();
      foundCase.evidence.forEach((ev) => evidenceLinkedList.insertAtEnd(ev));

      // Populate into BST to verify and demonstrate Phase 2
      const suspectBST = buildSuspectBST(foundCase);
      const suspectsInorder = suspectBST.inorder();

      // Populate into Queue to verify Phase 1 Queue
      const witnessQueue = new Queue();
      foundCase.witnesses.forEach((w) => witnessQueue.enqueue(w));

      // Collect all unique graph nodes for UI dropdowns
      const graphNodesSet = new Set();
      foundCase.graphEdges.forEach((e) => {
        graphNodesSet.add(e.a);
        graphNodesSet.add(e.b);
      });

      return sendJson(res, 200, {
        success: true,
        case: {
          id: foundCase.id,
          title: foundCase.title,
          leadInvestigator: foundCase.leadInvestigator,
          incidentDate: foundCase.incidentDate,
          status: foundCase.status,
          synopsis: foundCase.synopsis,
          evidence: foundCase.evidence,
          evidenceLinkedListSize: evidenceLinkedList.size,
          suspects: foundCase.suspects,
          suspectsInorder: suspectsInorder,
          suspectBSTSize: suspectBST.size,
          witnesses: witnessQueue.toArray(),
          graphEdges: foundCase.graphEdges,
          graphNodes: Array.from(graphNodesSet),
          events: foundCase.events,
          constraints: foundCase.constraints
        }
      });
    }

    // 3. API: Search evidence using Phase 3 algorithms
    if (pathname === "/api/search-evidence" && method === "POST") {
      const payload = await parseJsonBody(req);
      const { caseId, searchType, target } = payload;
      const foundCase = cases.find((c) => c.id === caseId);

      if (!foundCase) {
        return sendJson(res, 404, { success: false, error: "Case not found" });
      }

      if (searchType === "linear") {
        const query = String(target || "").trim().toLowerCase();
        // Linear search using project's linearSearch() function
        const searchResult = linearSearch(foundCase.evidence, (item) => {
          return (
            item.name.toLowerCase().includes(query) ||
            item.id.toLowerCase() === query ||
            item.category.toLowerCase().includes(query)
          );
        });

        return sendJson(res, 200, {
          success: true,
          algorithm: "Linear Search — O(n)",
          searchType: "linear",
          query: target,
          comparisons: searchResult.comparisons,
          index: searchResult.index,
          found: searchResult.found,
          totalItems: foundCase.evidence.length
        });
      } else if (searchType === "binary") {
        // Binary search requires pre-sorted array by numeric key
        const targetNumber = Number(target);
        if (isNaN(targetNumber)) {
          return sendJson(res, 400, {
            success: false,
            error: "Binary Search requires a valid numeric importance score (e.g. 88)."
          });
        }

        // Sort ascending by importance first using project's mergeSort
        const { sorted: sortedList, stats: sortStats } = mergeSort(
          foundCase.evidence,
          (a, b) => a.importance - b.importance
        );

        // Run project's binarySearch()
        const searchResult = binarySearch(
          sortedList,
          targetNumber,
          (item) => item.importance
        );

        return sendJson(res, 200, {
          success: true,
          algorithm: "Binary Search — O(log n)",
          searchType: "binary",
          targetScore: targetNumber,
          comparisons: searchResult.comparisons,
          index: searchResult.index,
          found: searchResult.found,
          sortedList: sortedList,
          sortStats: sortStats,
          totalItems: sortedList.length
        });
      } else {
        return sendJson(res, 400, { success: false, error: "Invalid searchType" });
      }
    }

    // 4. API: Sort evidence records using Phase 3 sorting algorithms
    if (pathname === "/api/sort-evidence" && method === "POST") {
      const payload = await parseJsonBody(req);
      const { caseId, algorithm, order = "asc" } = payload;
      const foundCase = cases.find((c) => c.id === caseId);

      if (!foundCase) {
        return sendJson(res, 404, { success: false, error: "Case not found" });
      }

      const cmp = (a, b) => {
        return order === "desc"
          ? b.importance - a.importance
          : a.importance - b.importance;
      };

      let sortResult;
      let algoName;

      if (algorithm === "insertion") {
        sortResult = insertionSort(foundCase.evidence, cmp);
        algoName = "Insertion Sort — O(n²) worst, O(n) best";
      } else if (algorithm === "merge") {
        sortResult = mergeSort(foundCase.evidence, cmp);
        algoName = "Merge Sort — O(n log n) guaranteed, O(n) space";
      } else if (algorithm === "quick") {
        sortResult = quickSort(foundCase.evidence, cmp);
        algoName = "Quick Sort — O(n log n) average, in-place partitioning";
      } else {
        return sendJson(res, 400, { success: false, error: "Invalid sorting algorithm" });
      }

      return sendJson(res, 200, {
        success: true,
        algorithm: algoName,
        sorted: sortResult.sorted,
        stats: sortResult.stats
      });
    }

    // 5. API: Suspect search via BST (Phase 2)
    if (pathname === "/api/suspects-bst" && method === "POST") {
      const payload = await parseJsonBody(req);
      const { caseId, score } = payload;
      const foundCase = cases.find((c) => c.id === caseId);

      if (!foundCase) {
        return sendJson(res, 404, { success: false, error: "Case not found" });
      }

      const bst = buildSuspectBST(foundCase);
      const numericScore = Number(score);

      if (isNaN(numericScore)) {
        return sendJson(res, 400, { success: false, error: "Score must be a number" });
      }

      const matchedRecords = bst.search(numericScore);

      return sendJson(res, 200, {
        success: true,
        score: numericScore,
        foundCount: matchedRecords ? matchedRecords.length : 0,
        records: matchedRecords || [],
        treeSize: bst.size,
        inorderAll: bst.inorder()
      });
    }

    // 6. API: Graph traversal and analysis (Phase 2)
    if (pathname === "/api/graph-analysis" && method === "POST") {
      const payload = await parseJsonBody(req);
      const { caseId, mode, startNode, targetNode } = payload;
      const foundCase = cases.find((c) => c.id === caseId);

      if (!foundCase) {
        return sendJson(res, 404, { success: false, error: "Case not found" });
      }

      const graph = buildCaseGraph(foundCase);

      if (!graph.adjList.has(startNode)) {
        return sendJson(res, 400, { success: false, error: `Node '${startNode}' not found in relationship network` });
      }

      if (mode === "bfs") {
        const order = graph.bfs(startNode);
        const distances = graph.bfsDistances(startNode);
        const distanceEntries = Array.from(distances.entries()).map(([node, dist]) => ({ node, dist }));
        return sendJson(res, 200, {
          success: true,
          mode: "bfs",
          startNode,
          traversalOrder: order,
          distances: distanceEntries,
          directConnections: graph.directConnections(startNode)
        });
      } else if (mode === "dfs") {
        const order = graph.dfs(startNode);
        return sendJson(res, 200, {
          success: true,
          mode: "dfs",
          startNode,
          traversalOrder: order,
          directConnections: graph.directConnections(startNode)
        });
      } else if (mode === "separation") {
        if (!targetNode) {
          return sendJson(res, 400, { success: false, error: "Target node required for degrees of separation" });
        }
        const hops = graph.degreesOfSeparation(startNode, targetNode);
        return sendJson(res, 200, {
          success: true,
          mode: "separation",
          startNode,
          targetNode,
          degreesOfSeparation: hops,
          directConnections: graph.directConnections(startNode)
        });
      } else if (mode === "ranking") {
        const ranked = graph.rankByDistanceFrom(startNode);
        return sendJson(res, 200, {
          success: true,
          mode: "ranking",
          startNode,
          ranked: ranked.map(([node, dist]) => ({ node, dist })),
          directConnections: graph.directConnections(startNode)
        });
      } else {
        return sendJson(res, 400, { success: false, error: "Invalid graph analysis mode" });
      }
    }

    // 7. API: Reconstruct Timeline using Backtracking (Phase 4)
    if (pathname === "/api/reconstruct-timeline" && method === "POST") {
      const payload = await parseJsonBody(req);
      const { caseId, extraConstraints = [] } = payload;
      const foundCase = cases.find((c) => c.id === caseId);

      if (!foundCase) {
        return sendJson(res, 404, { success: false, error: "Case not found" });
      }

      // Convert case constraints
      let constraintObjects = buildConstraints(foundCase);

      // Add any extra constraints requested by the user
      for (const extra of extraConstraints) {
        if (extra.type === "before") constraintObjects.push(before(extra.before, extra.after));
        if (extra.type === "mustFollow") constraintObjects.push(mustFollow(extra.before, extra.after));
        if (extra.type === "notAdjacent") constraintObjects.push(notAdjacent(extra.a, extra.b));
      }

      // Execute backtracking algorithm
      const result = reconstruct(foundCase.events, constraintObjects, { maxSolutions: 10 });

      // Verify each solution against each constraint to build human-readable validation report
      const constraintReport = foundCase.constraints.map((c) => {
        let satisfiedInAll = result.solutions.length > 0;
        let explanation = "";

        if (result.solutions.length === 0) {
          satisfiedInAll = false;
          explanation = "No sequence exists that satisfies this and all other active constraints.";
        } else {
          // Check position in first solution for demonstrative clarity
          const firstSol = result.solutions[0];
          const posMap = {};
          firstSol.forEach((ev, idx) => { posMap[ev.id] = idx + 1; });

          if (c.type === "before") {
            const pA = posMap[c.before];
            const pB = posMap[c.after];
            explanation = `Event [${c.before}] at step ${pA} precedes [${c.after}] at step ${pB}.`;
          } else if (c.type === "mustFollow") {
            const pA = posMap[c.before];
            const pB = posMap[c.after];
            explanation = `Event [${c.after}] at step ${pB} immediately follows [${c.before}] at step ${pA}.`;
          } else if (c.type === "notAdjacent") {
            const pA = posMap[c.a];
            const pB = posMap[c.b];
            explanation = `Event [${c.a}] (step ${pA}) and [${c.b}] (step ${pB}) are safely non-adjacent.`;
          }
        }

        return {
          ...c,
          satisfied: satisfiedInAll,
          detail: explanation
        };
      });

      return sendJson(res, 200, {
        success: true,
        solutions: result.solutions,
        stats: result.stats,
        constraintReport: constraintReport,
        totalEvents: foundCase.events.length,
        events: foundCase.events
      });
    }

    // 8. API: Submit Final Verdict
    if (pathname === "/api/submit-verdict" && method === "POST") {
      const payload = await parseJsonBody(req);
      const result = evaluateVerdict(payload);
      const statusCode = result.success ? 200 : 400;
      return sendJson(res, statusCode, result);
    }

    // 9. API: Reveal Official Case Solution
    if (pathname === "/api/reveal-solution" && method === "POST") {
      const payload = await parseJsonBody(req);
      const result = revealSolution(payload.caseId);
      const statusCode = result.success ? 200 : 400;
      return sendJson(res, statusCode, result);
    }

    // 10. Serve static assets
    serveStaticFile(pathname, res);
  } catch (err) {
    console.error("Server error:", err);
    sendJson(res, 500, { success: false, error: "Internal Server Error: " + err.message });
  }
});

// Start listening if executed directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`  CaseLink DSA Investigation Server active on port ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`========================================================\n`);
  });
}

module.exports = server;
