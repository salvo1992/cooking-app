"use client"

import { useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PrintDietPlan } from "./print"
import type { DietPlan } from "@/lib/api"

interface PrintButtonProps {
  plan: DietPlan
}

export function PrintButton({ plan }: PrintButtonProps) {
  const [showPrintDialog, setShowPrintDialog] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setShowPrintDialog(true)}>
        <Printer className="mr-2 h-4 w-4" />
        Stampa Piano
      </Button>

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl">
          <PrintDietPlan plan={plan} />
        </DialogContent>
      </Dialog>
    </>
  )
}

