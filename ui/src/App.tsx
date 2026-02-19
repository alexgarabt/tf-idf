import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTfidf } from "@/hooks/useTfidf";
import { FileUploader } from "@/components/FileUploader";
import { DocumentList } from "@/components/DocumentList";
import { SimilarityMatrix } from "@/components/SimilarityMatrix";
import { CompareView } from "@/components/CompareView";
import { TermMap } from "@/components/TermMap";

export default function App() {
  const { addDocuments, removeDocument, clearAll, instance, documents, matrix } =
    useTfidf();

  const labels = documents.map((d) => d.name);
  const hasEnough = documents.length >= 2;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              TF-IDF Document Similarity Explorer
            </h1>
            {documents.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>

          <div className="mb-6">
            <FileUploader onUpload={addDocuments} />
          </div>

          <Tabs defaultValue="documents">
            <TabsList>
              <TabsTrigger value="documents">
                Documents ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="similarity" disabled={!hasEnough}>
                Similarity
              </TabsTrigger>
              <TabsTrigger value="compare" disabled={!hasEnough}>
                Compare
              </TabsTrigger>
              <TabsTrigger value="map" disabled={!hasEnough}>
                Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-4">
              <DocumentList
                documents={documents}
                instance={instance}
                onRemove={removeDocument}
              />
            </TabsContent>

            <TabsContent value="similarity" className="mt-4">
              {matrix && (
                <SimilarityMatrix matrix={matrix} labels={labels} />
              )}
            </TabsContent>

            <TabsContent value="compare" className="mt-4">
              {instance && hasEnough && (
                <CompareView instance={instance} labels={labels} />
              )}
            </TabsContent>

            <TabsContent value="map" className="mt-4">
              {matrix && hasEnough && (
                <TermMap matrix={matrix} labels={labels} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
