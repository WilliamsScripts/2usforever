"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
};

export function OtpInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
  autoFocus = false,
  className,
  id,
}: OtpInputProps) {
  return (
    <InputOTP
      id={id}
      maxLength={OTP_LENGTH}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoFocus={autoFocus}
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-invalid={invalid}
      containerClassName={cn("justify-center gap-2", className)}
    >
      <InputOTPGroup className="gap-2 border-0 shadow-none">
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className="size-11 rounded-xl border border-[color:var(--rose-light)] bg-white text-lg font-medium text-[color:var(--text-dark)] shadow-sm first:rounded-xl last:rounded-xl data-[active=true]:border-[color:var(--rose)] data-[active=true]:ring-[color:var(--rose)]/20"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export { OTP_LENGTH };
