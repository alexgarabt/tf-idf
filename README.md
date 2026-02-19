# TF-IDF Document Similarity Explorer

Monorepo with two packages: a pure TF-IDF core module (zero Node.js dependencies) and an interactive UI to visualize document similarity.

Based on the formulas from Chapter 6 of [*Speech and Language Processing*](https://web.stanford.edu/~jurafsky/slp3/) by Jurafsky & Martin.

## Module (`module/`)

Pure TypeScript package, browser-compatible. Zero runtime dependencies.

### Tokenization

Text goes through 4 steps before processing:

1. **Lowercase** — `"Hello, World!"` → `"hello, world!"`
2. **Strip non-alphabetic characters** — replaces punctuation, digits, and special characters with spaces (`/[^a-z\s]/g`)
3. **Split on whitespace** — splits into tokens
4. **Filter short tokens** — discards single-character tokens

### Term Frequency (TF) — Eq. 6.12

Sublinear log-normalized variant that avoids bias toward longer documents:

```
tf(t, d) = 1 + log₁₀(count(t, d))    if count(t, d) > 0
tf(t, d) = 0                          if count(t, d) = 0
```

Where `count(t, d)` is the number of occurrences of term `t` in document `d`.

### Inverse Document Frequency (IDF) — Eq. 6.13

Penalizes terms that appear across many documents (low discriminative power):

```
idf(t) = log₁₀(N / df(t))
```

Where:
- `N` = total number of documents
- `df(t)` = number of documents containing term `t`

### TF-IDF Weight

The final weight of a term in a document is the product:

```
w(t, d) = tf(t, d) × idf(t)
```

Only weights > 0 are stored (sparse representation).

### Cosine Similarity — Eq. 6.10

Measures the angle between two TF-IDF vectors:

```
cos(d₁, d₂) = (d₁ · d₂) / (‖d₁‖ × ‖d₂‖)
```

The implementation is optimized for sparse vectors: it iterates only over terms present in at least one of the two documents, with `O(|d₁| + |d₂|)` complexity instead of `O(|vocabulary|)`.

### Similarity Matrix

Symmetric N×N matrix where each cell `M[i][j]` contains the cosine similarity between documents `i` and `j`. The diagonal is always 1 (a document is identical to itself). Only the upper triangle is computed, then mirrored.

### Public API

```typescript
import { DocumentSimilarity } from "tfidf-core";

const ds = new DocumentSimilarity([
  { name: "doc1.txt", content: "..." },
  { name: "doc2.txt", content: "..." },
]);

ds.documents;                          // Document[] with counts and tfidf
ds.vocabulary;                         // Set<string> with all terms
ds.similarityMatrix();                 // number[][] — N×N matrix
ds.cosineSimilarity(doc1, doc2);       // number — similarity between two docs
ds.getTopTerms(docIndex, 10);          // top N terms by TF-IDF weight
ds.getTermVectors();                   // Map<term, vector across docs>
```

## UI (`ui/`)

Web application built with Vite + React + Tailwind CSS + shadcn/ui.

### Features

- **File Uploader** — drag & drop or browse for `.txt`, `.md`, `.html` files
- **Document List** — documents with word count, unique terms, and top 10 TF-IDF terms
- **Similarity Matrix** — interactive heatmap of similarity across all documents
- **Compare View** — select two documents, view their cosine similarity, side-by-side top terms, and highlighted shared terms
- **Term Map** — 2D scatter plot using MDS (Multidimensional Scaling) from the similarity matrix, with d3 zoom/pan

### Getting Started

Requirements: [Node.js](https://nodejs.org/) >= 18 and [pnpm](https://pnpm.io/) >= 10.

```bash
# Install dependencies
pnpm install

# Development
pnpm dev
# → http://localhost:5173

# Production build
pnpm build

# Preview production build
pnpm --filter ui preview
```
