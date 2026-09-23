import { FileUp } from "lucide-react";
import { type DragEvent, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";

const ACCEPTED = [".pdf", ".xlsx"];

function accepted(files: Iterable<File>): File[] {
  return [...files].filter((file) =>
    ACCEPTED.some((extension) => file.name.toLowerCase().endsWith(extension)),
  );
}

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
}

export function FileDropzone({ onFiles }: FileDropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    onFiles(accepted(event.dataTransfer.files));
  };

  return (
    <div
      data-dragging={dragging}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
      className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center data-[dragging=true]:border-primary data-[dragging=true]:bg-muted"
    >
      <FileUp className="size-8 text-muted-foreground" />
      <p>
        Solte aqui as notas de corretagem (PDF) e o relatório de movimentação da B3
        (xlsx), quantos quiser de uma vez.
      </p>
      <Button variant="outline" onClick={() => input.current?.click()}>
        Escolher arquivos
      </Button>
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
        hidden
        onChange={(event) => {
          onFiles(accepted(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </div>
  );
}
