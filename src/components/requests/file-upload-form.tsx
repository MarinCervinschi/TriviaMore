import { useRef } from "react"
import { FileUp, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const ACCEPTED_EXTENSIONS = ".pdf,.docx"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function FileUploadForm({
  file,
  onFileChange,
  comment,
  onCommentChange,
}: {
  file: File | null
  onFileChange: (file: File | null) => void
  comment: string
  onCommentChange: (comment: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.size > MAX_FILE_SIZE) {
      toast.error("Il file supera il limite di 10 MB")
      return
    }

    onFileChange(selected)
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Carica file</p>

      <div className="rounded-xl border border-dashed p-6 text-center">
        {file ? (
          <div className="space-y-2">
            <div className="mx-auto inline-flex rounded-2xl bg-primary/10 p-3">
              <FileUp className="size-6 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = "" }}
              className="text-xs text-destructive"
            >
              Rimuovi
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto inline-flex rounded-2xl bg-muted p-3">
              <Upload className="size-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">
              Clicca o trascina un file qui
            </p>
            <p className="text-xs text-muted-foreground/70">
              PDF o DOCX, max 10 MB
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl"
            >
              Scegli file
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Carica un file contenente domande gia pronte. Limitati a file con domande strutturate per facilitare la revisione.
      </p>

      <Textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Commento (opzionale) — es. materia, argomento, note per lo staff"
        rows={2}
        className="rounded-xl"
      />
    </div>
  )
}
