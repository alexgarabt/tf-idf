import type { DocumentSimilarity } from "tfidf-core";
import type { DocumentInput } from "tfidf-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DocumentListProps {
  documents: DocumentInput[];
  instance: DocumentSimilarity | null;
  onRemove: (name: string) => void;
}

export function DocumentList({
  documents,
  instance,
  onRemove,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-muted-foreground text-center text-sm py-8">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((doc, i) => {
        const internalDoc = instance?.documents[i];
        const topTerms = instance?.getTopTerms(i, 10) ?? [];
        const totalWords = internalDoc
          ? [...internalDoc.counts.values()].reduce((a, b) => a + b, 0)
          : 0;
        const uniqueWords = internalDoc?.counts.size ?? 0;

        return (
          <Card key={doc.name}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium truncate pr-2">
                  {doc.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(doc.name)}
                >
                  &times;
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                {totalWords} words &middot; {uniqueWords} unique
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {topTerms.map(({ term, weight }) => (
                  <Badge key={term} variant="secondary" className="text-xs">
                    {term}{" "}
                    <span className="text-muted-foreground ml-1">
                      {weight.toFixed(2)}
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
