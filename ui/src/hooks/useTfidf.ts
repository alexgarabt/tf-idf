import { useState, useCallback, useMemo } from "react";
import { DocumentSimilarity } from "tfidf-core";
import type { DocumentInput } from "tfidf-core";

export function useTfidf() {
  const [documents, setDocuments] = useState<DocumentInput[]>([]);

  const instance = useMemo(() => {
    if (documents.length === 0) return null;
    return new DocumentSimilarity(documents);
  }, [documents]);

  const matrix = useMemo(() => {
    return instance?.similarityMatrix() ?? null;
  }, [instance]);

  const addDocuments = useCallback((inputs: DocumentInput[]) => {
    setDocuments((prev) => {
      const existingNames = new Set(prev.map((d) => d.name));
      const newDocs = inputs.filter((d) => !existingNames.has(d.name));
      return [...prev, ...newDocs];
    });
  }, []);

  const removeDocument = useCallback((name: string) => {
    setDocuments((prev) => prev.filter((d) => d.name !== name));
  }, []);

  const clearAll = useCallback(() => setDocuments([]), []);

  return { addDocuments, removeDocument, clearAll, instance, documents, matrix };
}
