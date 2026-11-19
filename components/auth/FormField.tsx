import type { ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormFieldProps = {
  id: string
  label: string
  value: string
  /** Validation message shown under the input, if any. */
  error?: string
  type?: string
  placeholder?: string
  autoComplete?: string
  /** Extra content shown under the input (e.g. the password rules). */
  hint?: ReactNode
  onChange: (value: string) => void
}

export function FormField({
  id,
  label,
  value,
  error,
  type = "text",
  placeholder,
  autoComplete,
  hint,
  onChange,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-bold text-white">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 border-white/10 bg-[#44342d] text-white placeholder:text-neutral-400 focus-visible:border-brand focus-visible:ring-brand/30 dark:bg-[#44342d]"
      />
      {hint}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}