import { PASSWORD_RULES } from "@/features/auth/password";

// Password rule checklist
export function PasswordRules({ password, showFailures }: { password: string; showFailures?: boolean }) {
  return (
    <ul className="grid gap-1 text-sm" aria-label="เงื่อนไขรหัสผ่าน">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        const tone = ok ? "text-success" : showFailures ? "text-danger" : "text-ink-muted";
        return (
          <li key={rule.id} className={`flex items-center gap-2 ${tone}`}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {ok ? <path d="M3 8.5l3 3 7-7" /> : <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />}
            </svg>
            <span>
              {rule.label}
              <span className="sr-only">{ok ? " (ผ่าน)" : " (ยังไม่ผ่าน)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
