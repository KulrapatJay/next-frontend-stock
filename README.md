# next-frontend-stock

Frontend (Next.js 16, React 19, TypeScript, Tailwind CSS v4) ของเว็บติดตามพอร์ตหุ้นสหรัฐฯ
ข้อมูลและ business logic ทั้งหมดอยู่ที่ Go API ใน [`../Go-Backend-Stock`](../Go-Backend-Stock)

## เริ่มพัฒนา

ต้องเปิด backend ก่อน เพราะทุกหน้าที่ต้อง login เรียก `/api/v1/auth/me`

```bash
# 1. backend (ดูรายละเอียดใน README ของ Go-Backend-Stock)
cd ../Go-Backend-Stock
cp .env.example .env      # แล้วแก้ PUBLIC_ORIGIN=http://localhost:3000
docker compose up --build
make demo-data            # บัญชีเดโม (อีเมล/รหัสผ่านอยู่ใน README ของ backend)

# 2. frontend
cd ../next-frontend-stock
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

`PUBLIC_ORIGIN` ของ backend ต้องตรงกับ origin ของเว็บทุกตัวอักษร ไม่เช่นนั้นทุก POST/PUT/DELETE จะได้ `403 csrf_failed`

| URL                         | คืออะไร                            |
| --------------------------- | ---------------------------------- |
| http://localhost:3000       | เว็บ                               |
| http://localhost:3000/docs/ | Swagger UI ของ Go API (ผ่าน proxy) |
| http://localhost:8025       | Mailpit สำหรับอ่านรหัส OTP ใน dev  |

## Environment

| ตัวแปร        | ค่าเริ่มต้น             | ใช้ทำอะไร                                                                    |
| ------------- | ----------------------- | ---------------------------------------------------------------------------- |
| `BACKEND_URL` | `http://localhost:8080` | ที่อยู่ของ Go API ใช้ฝั่ง server ใน `rewrites` ของ `next.config.ts` เท่านั้น |

browser เรียก API ผ่าน origin เดียวกับหน้าเว็บเสมอ (`/api/v1/*`, `/docs/*`, `/swagger.json`, `/swagger.yaml`)
backend ไม่เปิด CORS จึงห้ามให้ browser ยิงไปที่ `BACKEND_URL` โดยตรง

## คำสั่ง

```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # รัน build
npm run lint         # eslint
npm run typecheck    # generate route types แล้วรัน tsc
npm run test         # vitest (ไฟล์ *.test.ts วางคู่กับ source)
npm run format       # prettier --write
npm run gen:api      # generate src/types/api.gen.ts จาก swagger.json ของ backend
npm run check        # typecheck + lint + format:check + test + build
```

## โครงสร้าง

```text
src/
  app/            routes: (auth) = login, register, forgot-password; (protected) = หน้าที่ต้อง login
  components/ui/      UI พื้นฐานที่ใช้ได้ทุก feature (Button, Alert, Field)
  components/layout/  โครงหน้าหลัง login (AppShell, Navbar, Sidebar)
  features/<domain>/  โค้ดของแต่ละโดเมน: api.ts, components/, กติกาเฉพาะโดเมน
  hooks/              React hooks ที่ใช้ร่วมกัน
  lib/                API client (CSRF, error), ข้อความ error, validation, ค่าคงที่
  types/          type ของ API
  proxy.ts        route guard (ดูแค่ว่ามี session cookie หรือไม่)
```

## เอกสาร

- ข้อตกลงกับ backend: [`../Go-Backend-Stock/docs/frontend-handoff.md`](../Go-Backend-Stock/docs/frontend-handoff.md)
- แหล่งความจริงของ API: [`../Go-Backend-Stock/docs/api/swagger.json`](../Go-Backend-Stock/docs/api/swagger.json)
- ข้อกำหนดสำหรับ agent: [`CLAUDE.md`](CLAUDE.md), [`AGENTS.md`](AGENTS.md)
