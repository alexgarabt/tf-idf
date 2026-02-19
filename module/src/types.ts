export interface DocumentInput {
  name: string;
  content: string;
}

export interface Document {
  name: string;
  counts: Map<string, number>;
  tfidf: Map<string, number>;
}

export interface BasicInformation {
  documents: Document[];
  vocabulary: Set<string>;
}
