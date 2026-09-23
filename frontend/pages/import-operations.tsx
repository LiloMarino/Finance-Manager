import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FileDropzone } from "@/features/operations/import/file-dropzone";
import { ImportPreview } from "@/features/operations/import/import-preview";
import { usePreviewImport } from "@/features/operations/import/use-import";
import { Button } from "@/shared/components/ui/button";

export function ImportOperationsPage() {
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Importar operações</h1>
        <p className="text-muted-foreground">
          Nada é gravado antes de você conferir o preview e confirmar. Reimportar um
          arquivo não duplica o que já está no banco.
        </p>
      </div>

      {preview.data ? (
        <ImportPreview
          // Um preview novo recomeça a seleção do zero
          key={preview.submittedAt}
          preview={preview.data}
          onDone={() => {
            clear();
            void navigate("/operations");
          }}
        />
      ) : (
        <>
          <FileDropzone onFiles={addFiles} />
          {files.length > 0 && (
            <div className="flex flex-col gap-3">
              <ul className="text-sm">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>{file.name}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button
                  onClick={() => preview.mutate(files)}
                  disabled={preview.isPending}
                >
                  Pré-visualizar {files.length} arquivos
                </Button>
                <Button variant="outline" onClick={clear}>
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
