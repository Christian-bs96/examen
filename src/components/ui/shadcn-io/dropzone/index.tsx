import * as React from "react"
import { useDropzone, type Accept } from "react-dropzone"
import { UploadCloud, X } from "lucide-react"
import { cn } from "@/lib/utils"

type PreviewFile = {
  file: File
  preview: string
}

interface DropzoneProps {
  onDropFiles?: (files: File[]) => void
  accept?: string | string[] | Accept
  maxFiles?: number
  className?: string
}

function normalizeAccept(input?: string | string[] | Accept): Accept | undefined {
  if (!input) return undefined
  if (typeof input === "object" && !Array.isArray(input)) return input as Accept
  if (typeof input === "string") {
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean)
    const acc: Accept = {}
    parts.forEach((p) => (acc[p] = []))
    return acc
  }
  if (Array.isArray(input)) {
    const acc: Accept = {}
    input.forEach((p) => (acc[p] = []))
    return acc
  }
  return undefined
}

export function Dropzone({
  onDropFiles,
  accept = "image/*",
  maxFiles = 5,
  className,
}: DropzoneProps) {
  const [files, setFiles] = React.useState<PreviewFile[]>([])

  React.useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview))
    }
  }, [files])

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const sliced = acceptedFiles.slice(0, maxFiles)
      const previews = sliced.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setFiles((prev) => [...previews, ...prev].slice(0, maxFiles))
      if (onDropFiles) onDropFiles(sliced)
      console.log("Dropped files:", acceptedFiles)
    },
    [maxFiles, onDropFiles]
  )

  const acceptOption = normalizeAccept(accept)

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: acceptOption,
    multiple: true,
    maxFiles,
  })

  const removeFile = (file: PreviewFile) => {
    setFiles((prev) => {
      prev.forEach((p) => {
        if (p.preview === file.preview) URL.revokeObjectURL(p.preview)
      })
      return prev.filter((p) => p.preview !== file.preview)
    })
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition",
        "bg-background/50 border-muted-foreground/25 hover:bg-muted/30",
        (isDragActive || isFocused) && "border-primary bg-muted/40",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-muted p-2">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-muted-foreground">
          Soportado: imágenes. Máx {maxFiles} archivos.
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 w-full">
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <div
                key={f.preview}
                className="relative h-24 w-24 overflow-hidden rounded-md border bg-white/5"
              >
                <img src={f.preview} alt={f.file.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(f)
                  }}
                  title="Eliminar"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-90 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5 text-xs text-white">
                  <span className="truncate block" title={f.file.name}>
                    {f.file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
