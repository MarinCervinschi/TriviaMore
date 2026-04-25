import { Link } from "@tanstack/react-router"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AcceptanceCheckboxesProps {
  termsAccepted: boolean
  privacyAccepted: boolean
  onTermsChange: (value: boolean) => void
  onPrivacyChange: (value: boolean) => void
  termsError?: string
  privacyError?: string
  disabled?: boolean
}

/**
 * Controlled two-checkbox block used both in the registration form
 * and on the /legal/accept re-acceptance page. The parent component
 * owns state and validation; this component is purely presentational.
 */
export function AcceptanceCheckboxes({
  termsAccepted,
  privacyAccepted,
  onTermsChange,
  onPrivacyChange,
  termsError,
  privacyError,
  disabled,
}: AcceptanceCheckboxesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id="accept-terms"
          checked={termsAccepted}
          onCheckedChange={(value) => onTermsChange(value === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label
            htmlFor="accept-terms"
            className="text-sm font-normal leading-relaxed"
          >
            Accetto i{" "}
            <Link
              to="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Termini e Condizioni
            </Link>
          </Label>
          {termsError && (
            <p className="text-xs text-destructive">{termsError}</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="accept-privacy"
          checked={privacyAccepted}
          onCheckedChange={(value) => onPrivacyChange(value === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label
            htmlFor="accept-privacy"
            className="text-sm font-normal leading-relaxed"
          >
            Accetto l'
            <Link
              to="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Informativa sulla Privacy
            </Link>
          </Label>
          {privacyError && (
            <p className="text-xs text-destructive">{privacyError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
