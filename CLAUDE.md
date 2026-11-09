# CLAUDE.md

Frontend (Next.js) ของเว็บติดตามพอร์ตหุ้นสหรัฐฯ ที่เชื่อม Go API ใน `../Go-Backend-Stock`
ตอบเป็นภาษาไทย ส่วนโค้ดและชื่อตัวแปรเป็นภาษาอังกฤษ

@AGENTS.md

## Backend contract

ข้อตกลงกับ backend ทั้งหมดอยู่ในเอกสารด้านล่าง อ่านก่อนเขียนโค้ดที่เรียก API:

@../Go-Backend-Stock/docs/frontend-handoff.md

- แหล่งความจริงของ API คือ `../Go-Backend-Stock/docs/api/swagger.json` ถ้าเอกสารขัดกับ spec ให้เชื่อ spec
- ข้อกำหนดหลักของโปรเจกต์อยู่ที่ `../Go-Backend-Stock/AGENTS.md` และเหตุผลการออกแบบอยู่ที่ `../Go-Backend-Stock/docs/adr/`
  ถ้าต้องอ่านไฟล์เหล่านี้ ให้เพิ่ม `../Go-Backend-Stock` เป็น directory ของ session (อ่านอย่างเดียว ห้ามแก้จากฝั่งนี้)
- ห้ามสร้าง business logic ซ้ำใน frontend (คำนวณต้นทุน, P&L, ตรวจประวัติ) ถ้า API ขาดหรือผิดให้แจ้งฝั่ง backend
- `PRODUCT.md` เขียนก่อนรู้ contract ของ backend: ถ้าขัดกับเอกสาร handoff (เช่น dividend, cookie `token`) ให้ถามก่อน ห้ามเลือกเอง
- หัวข้อ 0 ของ handoff คือเรื่องที่ยังไม่ได้ตัดสินใจ ห้ามเดาคำตอบเอง
