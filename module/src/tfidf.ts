import type { BasicInformation, Document, DocumentInput } from "./types.ts";
import { tokenize, countWords } from "./tokenizer.ts";
import {
  cosineSimilarity as cosine,
  buildSimilarityMatrix,
} from "./similarity.ts";

export class DocumentSimilarity implements BasicInformation {
  readonly documents: Document[];
  readonly vocabulary: Set<string>;

  constructor(inputs: DocumentInput[]) {
    this.documents = inputs.map((input) => ({
      name: input.name,
      counts: countWords(tokenize(input.content)),
      tfidf: new Map<string, number>(),
    }));

    this.vocabulary = new Set(
      this.documents.flatMap((d) => [...d.counts.keys()]),
    );

    this.computeTfidf();
  }

  // tf(t,d) = 1 + log10(count(t,d)) if count > 0, else 0  (Eq. 6.12)
  private tf(term: string, doc: Document): number {
    const count = doc.counts.get(term) ?? 0;
    return count > 0 ? 1 + Math.log10(count) : 0;
  }

  // df(t) = number of documents containing term t
  private df(term: string): number {
    let count = 0;
    for (const doc of this.documents) {
      if (doc.counts.has(term)) count++;
    }
    return count;
  }

  // idf(t) = log10(N / df(t))  (Eq. 6.13)
  private idf(term: string): number {
    const docFreq = this.df(term);
    if (docFreq === 0) return 0;
    return Math.log10(this.documents.length / docFreq);
  }

  private computeTfidf(): void {
    for (const doc of this.documents) {
      for (const word of this.vocabulary) {
        const weight = this.tf(word, doc) * this.idf(word);
        if (weight > 0) doc.tfidf.set(word, weight);
      }
    }
  }

  public cosineSimilarity(doc1: Document, doc2: Document): number {
    return cosine(doc1, doc2);
  }

  public similarityMatrix(): number[][] {
    return buildSimilarityMatrix(this.documents);
  }

  public getTopTerms(
    docIndex: number,
    n: number = 10,
  ): Array<{ term: string; weight: number }> {
    const doc = this.documents[docIndex];
    if (!doc) return [];
    return [...doc.tfidf.entries()]
      .map(([term, weight]) => ({ term, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, n);
  }

  public getTermVectors(): Map<string, number[]> {
    const result = new Map<string, number[]>();
    for (const term of this.vocabulary) {
      const vector = this.documents.map((doc) => doc.tfidf.get(term) ?? 0);
      if (vector.some((v) => v > 0)) {
        result.set(term, vector);
      }
    }
    return result;
  }
}
