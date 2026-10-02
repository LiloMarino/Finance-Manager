import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FileDropzone } from "@/features/imports/file-dropzone";
import { ImportPreview } from "@/features/imports/import-preview";
import { usePreviewImport } from "@/features/imports/use-import";
import { PageHeader } from "@/shared/components/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function ImportPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const preview = usePreviewImport();

  const addFiles = (added: File[]) => {
    setFiles((current) => [...current, ...added]);
    preview.reset();
  };

  const clear = () => {
    setFiles([]);
    preview.reset();
  };

  return (
    <>
      <PageHeader
        title="Importar"
        description="Nada é gravado antes de você conferir e confirmar. Reimportar um arquivo não duplica o que já está no banco."
      />

      {preview.data ? (
        <ImportPreview
          // Um preview novo recomeça a seleção do zero
          key={preview.submittedAt}
          preview={preview.data}
          onCancel={clear}
          onDone={(destination) => {
            clear();
            void navigate(destination);
          }}
        />
      ) : (
        <>
          <FileDropzone onFiles={addFiles} />
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Para conferir</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <Badge key={`${file.name}-${index}`} variant="outline">
                      {file.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => preview.mutate(files)} disabled={preview.isPending}>
                    Conferir {files.length} {files.length === 1 ? "arquivo" : "arquivos"}
                  </Button>
                  <Button variant="ghost" onClick={clear}>
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
}
