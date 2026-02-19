import type { Document } from "./types.ts";

/**
 * Cosine similarity optimized for sparse TF-IDF vectors.
 * Iterates only over non-zero entries: O(|d1| + |d2|) instead of O(|vocab|).
 */
export function cosineSimilarity(doc1: Document, doc2: Document): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  const [smaller, larger] =
    doc1.tfidf.size <= doc2.tfidf.size
      ? [doc1.tfidf, doc2.tfidf]
      : [doc2.tfidf, doc1.tfidf];

  for (const [term, v1] of smaller) {
    const v2 = larger.get(term);
    if (v2 !== undefined) {
      dotProduct += v1 * v2;
    }
  }

  for (const v of doc1.tfidf.values()) norm1 += v * v;
  for (const v of doc2.tfidf.values()) norm2 += v * v;

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export function buildSimilarityMatrix(documents: Document[]): number[][] {
  const n = documents.length;
  const matrix: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );

  for (let i = 0; i < n; i++) {
    matrix[i]![i] = 1;
    for (let j = i + 1; j < n; j++) {
      const s = cosineSimilarity(documents[i]!, documents[j]!);
      matrix[i]![j] = s;
      matrix[j]![i] = s;
    }
  }

  return matrix;
}
