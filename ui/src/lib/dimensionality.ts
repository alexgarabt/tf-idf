export interface Point2D {
  label: string;
  x: number;
  y: number;
}

/**
 * Classical MDS: project N documents to 2D using the precomputed
 * cosine similarity matrix.
 *
 * Converts similarities to squared distances, double-centers the matrix,
 * and extracts the top 2 eigenvectors via power iteration.
 */
export function mds2D(
  similarityMatrix: number[][],
  labels: string[],
): Point2D[] {
  const n = similarityMatrix.length;
  if (n === 0) return [];
  if (n === 1) return [{ label: labels[0]!, x: 0, y: 0 }];
  if (n === 2) {
    const dist = Math.sqrt(Math.max(0, 2 * (1 - similarityMatrix[0]![1]!)));
    return [
      { label: labels[0]!, x: 0, y: 0 },
      { label: labels[1]!, x: dist, y: 0 },
    ];
  }

  // Step 1: Convert similarity to squared distance: d²(i,j) = 2(1 - sim(i,j))
  const D2: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      Math.max(0, 2 * (1 - similarityMatrix[i]![j]!)),
    ),
  );

  // Step 2: Double centering → B = -0.5 * H * D² * H where H = I - (1/n)*11'
  const rowMeans = D2.map((row) => row.reduce((a, b) => a + b, 0) / n);
  const grandMean =
    rowMeans.reduce((a, b) => a + b, 0) / n;
  const B: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from(
      { length: n },
      (_, j) => -0.5 * (D2[i]![j]! - rowMeans[i]! - rowMeans[j]! + grandMean),
    ),
  );

  // Step 3: Extract top 2 eigenvectors via power iteration
  const points: [number, number][] = [];
  const eigenvectors: number[][] = [];

  for (let dim = 0; dim < 2; dim++) {
    let v = Array.from({ length: n }, () => Math.random() - 0.5);
    let eigenvalue = 0;

    for (let iter = 0; iter < 100; iter++) {
      // Multiply B * v (deflated)
      const Bv = new Array<number>(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          Bv[i]! += B[i]![j]! * v[j]!;
        }
      }

      // Deflate: remove projection onto previous eigenvectors
      for (const prev of eigenvectors) {
        const dot = Bv.reduce((acc, val, i) => acc + val * prev[i]!, 0);
        for (let i = 0; i < n; i++) {
          Bv[i]! -= dot * prev[i]!;
        }
      }

      // Compute norm
      const norm = Math.sqrt(Bv.reduce((acc, val) => acc + val * val, 0));
      if (norm < 1e-10) break;

      eigenvalue = norm;
      v = Bv.map((val) => val / norm);
    }

    eigenvectors.push(v);

    // Scale by sqrt(eigenvalue) to get coordinates
    const scale = Math.sqrt(Math.max(0, eigenvalue));
    if (dim === 0) {
      for (let i = 0; i < n; i++) points.push([v[i]! * scale, 0]);
    } else {
      for (let i = 0; i < n; i++) points[i]![1] = v[i]! * scale;
    }
  }

  return points.map(([x, y], i) => ({
    label: labels[i]!,
    x,
    y,
  }));
}
