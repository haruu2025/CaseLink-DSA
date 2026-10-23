/**
 * Graph.js
 *
 * PHASE 2 - GRAPH REPRESENTATION (adjacency list) + BFS
 *
 * Game use: "Relationship Network" - nodes are suspects / witnesses /
 * victim / evidence / locations; edges are labelled relationships
 * ("friend of", "called", "seen with", "found near"...).
 *
 * BFS is the required traversal per the proposal (simple traversal of the
 * network, e.g. "who is connected to the victim within N steps").
 * A DFS is included too since it's virtually free once you have the
 * adjacency list, and useful for exhaustively exploring one branch of
 * connections - but BFS is the one the write-up calls for.
 */

const { Queue } = require("../phase1-linear/Queue");

class Graph {
  constructor() {
    this.adjList = new Map(); // node -> [{ target, relationship }]
  }

  addNode(node) {
    if (!this.adjList.has(node)) this.adjList.set(node, []);
  }

  /** Undirected labelled edge between two nodes. */
  addEdge(a, b, relationship) {
    this.addNode(a);
    this.addNode(b);
    this.adjList.get(a).push({ target: b, relationship });
    this.adjList.get(b).push({ target: a, relationship });
  }

  /** Breadth-first traversal from a starting node (uses our own Queue). */
  bfs(start) {
    const visitedOrder = [];
    const seen = new Set();
    const queue = new Queue();

    if (!this.adjList.has(start)) return visitedOrder;

    queue.enqueue(start);
    seen.add(start);

    while (!queue.isEmpty()) {
      const current = queue.dequeue();
      visitedOrder.push(current);
      for (const edge of this.adjList.get(current)) {
        if (!seen.has(edge.target)) {
          seen.add(edge.target);
          queue.enqueue(edge.target);
        }
      }
    }
    return visitedOrder;
  }

  /**
   * BFS distance from `start` to every reachable node. BFS visits nodes in
   * increasing order of hop-count, so the FIRST time a node is reached is
   * guaranteed to be via the shortest path - this is exactly why BFS (not
   * DFS) is the right tool for "how many hops away is X".
   */
  bfsDistances(start) {
    const distances = new Map();
    const queue = new Queue();

    if (!this.adjList.has(start)) return distances;

    distances.set(start, 0);
    queue.enqueue(start);

    while (!queue.isEmpty()) {
      const current = queue.dequeue();
      const currentDistance = distances.get(current);
      for (const edge of this.adjList.get(current)) {
        if (!distances.has(edge.target)) {
          distances.set(edge.target, currentDistance + 1);
          queue.enqueue(edge.target);
        }
      }
    }
    return distances;
  }

  /** Fewest relationship-hops between two nodes, or -1 if not connected. */
  degreesOfSeparation(nodeA, nodeB) {
    const distances = this.bfsDistances(nodeA);
    return distances.has(nodeB) ? distances.get(nodeB) : -1;
  }

  /** Every node's hop-count from `start`, sorted nearest-first. Handy for "who's closest to the victim". */
  rankByDistanceFrom(start) {
    const distances = this.bfsDistances(start);
    return [...distances.entries()]
      .filter(([node]) => node !== start)
      .sort((a, b) => a[1] - b[1]);
  }

  /** Depth-first traversal (recursive) - included as an optional extra. */
  dfs(start, visited = new Set(), result = []) {
    if (!this.adjList.has(start) || visited.has(start)) return result;
    visited.add(start);
    result.push(start);
    for (const edge of this.adjList.get(start)) {
      this.dfs(edge.target, visited, result);
    }
    return result;
  }

  directConnections(node) {
    return (this.adjList.get(node) || []).map(
      (e) => `${node} --[${e.relationship}]--> ${e.target}`
    );
  }

  print() {
    for (const [node, edges] of this.adjList.entries()) {
      for (const e of edges) {
        console.log(`   ${node} --[${e.relationship}]--> ${e.target}`);
      }
    }
  }
}

module.exports = { Graph };
