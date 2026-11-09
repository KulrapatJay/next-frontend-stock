---
version: 1
slug: "src-app-auth-login-page-tsx"
primary_target: "src/app/(auth)/login/page.tsx"
related_targets: ["src/app/(auth)/register/page.tsx","src/app/(auth)/forgot-password/page.tsx","src/app/(auth)/layout.tsx"]
---

# Auth surface: login, register (+ email OTP), forgot password

Mode: Operate. Thai UI. Visitor: a retail investor opening their own transaction record.
Job: sign in, create an account and verify the email with a 6-digit OTP, reset a forgotten password with an OTP.
Constraints: Go API contract in Go-Backend-Stock/docs/frontend-handoff.md (same-origin /api/v1, CSRF, uniform responses that never reveal whether an email has an account, password rules 6–32 printable ASCII with lower, upper, special).

## Direction contract

THESIS: The account is a passbook, and every auth step that succeeds is printed into it as a line. Refuses the centered rounded card floating on a gray SaaS ground.

OWN-WORLD: A deep teal passbook cover (#0F4C5C) owns a full-height column as the shell; the work area is a pale page (#F1F4F2) carrying faint 1px rules (#D3DDDA) on a 40px rhythm. Ink #262A33, secondary ink #4A5260. Noto Sans Thai for all UI; DotGothic16 only for printed entries (dates, codes, references). Standard inputs and buttons with 4px corners, 1px borders, teal primary. Dark scheme: cover #0A3440, page #111819, rules #1F2A2C.

STORY: The visitor sees their record book, signs in or opens a new one, and trusts that each step (code sent, email verified, password changed) was recorded.

FIRST VIEWPORT: Desktop: cover column at 40% (min 360px) with the product name large and one line of purpose at its foot; the ruled page holds a 440px form block at the left of the page area, heading then fields then a full-width primary button, secondary links beneath. Mobile: the cover collapses to a short top band with the name; the page follows.

FORM: Passbook (my grounded #1 of 7, chosen by the user as the pick card). seed:bfb28233b0fc5e7b

SIGNATURE: Passbook print. On each success a dot-matrix line (date · code · reference) prints character by character onto the page below the form, like a passbook updater; reduced motion shows it at once.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
