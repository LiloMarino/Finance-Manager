import { FileUp } from "lucide-react";
import { type DragEvent, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

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
    <Card
      variant="dropzone"
      data-dragging={dragging}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
      className="flex flex-col items-center gap-4 px-6 py-14 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileUp className="size-6 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-section-title">Solte os arquivos aqui</h2>
        <p className="text-ink-2 mt-1">
          Notas de corretagem em PDF e os relatórios da B3 em xlsx: o de movimentação, que traz
          eventos e proventos, e o de proventos recebidos. Quantos quiser de uma vez.
        </p>
      </div>
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
    </Card>
  );
}
