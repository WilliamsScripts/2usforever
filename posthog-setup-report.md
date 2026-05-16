<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into 2usforever. The following changes were made:

- **`instrumentation-client.ts`** (new) — Initializes PostHog client-side using Next.js 15.3+ instrumentation pattern, with reverse-proxy ingestion (`/ingest`), exception capture, and debug mode in development.
- **`src/lib/posthog-server.ts`** (new) — Singleton PostHog Node.js client for server-side event tracking in API routes.
- **`next.config.ts`** — Added reverse proxy rewrites for `/ingest/static/*`, `/ingest/array/*`, and `/ingest/*` to route PostHog traffic through the app and avoid ad blockers.
- **`src/hooks/useOtpLogin.ts`** — Added `otp_sent`, `otp_send_failed`, `otp_verified` (with `posthog.identify()`), and `otp_verification_failed` events to track the full authentication funnel.
- **`src/hooks/useCreateMomentBuilder.ts`** — Added `moment_created`, `moment_creation_failed`, `builder_step_advanced`, `ai_message_generated`, `ai_message_improved`, and `music_track_selected` events across the 6-step moment builder flow.
- **`src/components/landing/CreateMomentBuilder.tsx`** — Added `moment_link_copied` and `moment_shared_via_whatsapp` events in the post-creation success modal.
- **`src/app/for/[id]/MomentDisplay.tsx`** — Added `moment_viewed` event (fires once on mount) to track recipient engagement with moments.
- **`src/app/api/moments/route.ts`** — Added server-side `server_moment_created` event via `posthog-node`, capturing delivery status (email + WhatsApp) alongside moment metadata.

| Event | Description | File |
|-------|-------------|------|
| `otp_sent` | User successfully requests a login OTP (login/signup start) | `src/hooks/useOtpLogin.ts` |
| `otp_send_failed` | OTP send request fails (rate limit, captcha, etc.) | `src/hooks/useOtpLogin.ts` |
| `otp_verified` | User verifies OTP and is signed in (login complete) | `src/hooks/useOtpLogin.ts` |
| `otp_verification_failed` | OTP verification fails (invalid/expired code) | `src/hooks/useOtpLogin.ts` |
| `moment_created` | Moment successfully created — primary conversion event | `src/hooks/useCreateMomentBuilder.ts` |
| `moment_creation_failed` | Moment creation fails | `src/hooks/useCreateMomentBuilder.ts` |
| `builder_step_advanced` | User advances to next step in the 6-step builder | `src/hooks/useCreateMomentBuilder.ts` |
| `ai_message_generated` | AI generates a message for the moment | `src/hooks/useCreateMomentBuilder.ts` |
| `ai_message_improved` | AI improves the user's existing message | `src/hooks/useCreateMomentBuilder.ts` |
| `music_track_selected` | Spotify track selected for a moment | `src/hooks/useCreateMomentBuilder.ts` |
| `moment_link_copied` | User copies the moment link from success modal | `src/components/landing/CreateMomentBuilder.tsx` |
| `moment_shared_via_whatsapp` | User clicks WhatsApp share in success modal | `src/components/landing/CreateMomentBuilder.tsx` |
| `moment_viewed` | Recipient opens a moment page | `src/app/for/[id]/MomentDisplay.tsx` |
| `server_moment_created` | Server-side: moment persisted and notifications sent | `src/app/api/moments/route.ts` |

## Next steps

We've built a dashboard and 5 insights to keep an eye on user behavior based on the events just instrumented:

- [Analytics basics dashboard](/dashboard/1592123)
- [Moments created over time](/insights/1H8Vdwsm) — daily trend of the primary conversion event
- [Login to moment creation funnel](/insights/CB68UXpG) — OTP sent → logged in → moment created conversion funnel
- [Moment views vs moments created](/insights/PpWOo4kT) — compares creation and recipient engagement rates
- [AI message feature adoption](/insights/hiYluX8N) — tracks usage of AI generate/improve features
- [Moment sharing actions](/insights/EPPpqHod) — link copies and WhatsApp shares after creation

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
