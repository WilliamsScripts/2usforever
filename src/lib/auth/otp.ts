/** Must match Supabase Auth email OTP length (Dashboard → Auth → Email). */
export const OTP_LENGTH = 8;

export const OTP_PATTERN = new RegExp(`^\\d{${OTP_LENGTH}}$`);
