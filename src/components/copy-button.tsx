'use client'

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ClipboardCopy } from "lucide-react"

export function CopyButton({ textToCopy, label = 'Salin' }: { textToCopy: string; label?: string }) {
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Disalin!",
        description: "Informasi telah disalin ke clipboard.",
      })
    }).catch(err => {
      console.error('Failed to copy: ', err)
      toast({
        variant: "destructive",
        title: "Gagal menyalin",
        description: "Gagal menyalin ke clipboard.",
      })
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      <ClipboardCopy className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
