import { useState } from "react";
import type { DocumentSimilarity } from "tfidf-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompareViewProps {
  instance: DocumentSimilarity;
  labels: string[];
}

export function CompareView({ instance, labels }: CompareViewProps) {
  const [docA, setDocA] = useState<number>(0);
  const [docB, setDocB] = useState<number>(Math.min(1, labels.length - 1));

  if (labels.length < 2) {
    return (
      <p className="text-muted-foreground text-center text-sm py-8">
        Upload at least 2 documents to compare.
      </p>
    );
  }

  const similarity = instance.cosineSimilarity(
    instance.documents[docA]!,
    instance.documents[docB]!,
  );
  const topA = instance.getTopTerms(docA, 20);
  const topB = instance.getTopTerms(docB, 20);

  const termsA = new Set(topA.map((t) => t.term));
  const termsB = new Set(topB.map((t) => t.term));

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Doc A:</span>
          <Select
            value={String(docA)}
            onValueChange={(v) => setDocA(Number(v))}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {labels.map((label, i) => (
                <SelectItem key={i} value={String(i)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Doc B:</span>
          <Select
            value={String(docB)}
            onValueChange={(v) => setDocB(Number(v))}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {labels.map((label, i) => (
                <SelectItem key={i} value={String(i)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Similarity score */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold tabular-nums">
              {(similarity * 100).toFixed(1)}%
            </span>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${similarity * 100}%` }}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Cosine similarity
          </p>
        </CardContent>
      </Card>

      {/* Side by side terms */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm truncate">{labels[docA]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {topA.map(({ term, weight }) => (
                <Badge
                  key={term}
                  variant={termsB.has(term) ? "default" : "secondary"}
                  className="text-xs"
                >
                  {term}{" "}
                  <span className="opacity-60 ml-1">{weight.toFixed(2)}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm truncate">{labels[docB]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {topB.map(({ term, weight }) => (
                <Badge
                  key={term}
                  variant={termsA.has(term) ? "default" : "secondary"}
                  className="text-xs"
                >
                  {term}{" "}
                  <span className="opacity-60 ml-1">{weight.toFixed(2)}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
