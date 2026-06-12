# 🤖 KẾ HOẠCH TRIỂN KHAI AI (Hướng B — Embedding + RAG + Gemini, lưu vector trong MySQL)

> **Quyết định**: Thay vì tự train mô hình ML, hệ thống ứng dụng AI hiện đại bằng **Embedding + Chatbot RAG (Gemini)**, lưu vector ngay trong **MySQL** (không dùng PostgreSQL).
> **Đã loại bỏ khỏi đề cương** (do thiếu dữ liệu lớn để train, đã xin phép GVHD): ~~Phân nhóm khách hàng (K-means)~~, ~~Dự đoán doanh thu (Regression)~~.

## 🎯 Phạm vi AI (3 tính năng)
1. **Chatbot RAG mới** — tư vấn món tự nhiên, bám dữ liệu thật, chống bịa (anti-hallucination). **Thay thế hoàn toàn chatbot rule-based cũ.**
2. **Gợi ý món tương tự** — xem món A → gợi ý món gần nghĩa.
3. **Gợi ý cá nhân hóa** — theo lịch sử đặt món của khách (trung bình vector embedding).

## 🏗️ Kiến trúc
```
React (FE) → NestJS (MySQL, proxy) → AI-Service (FastAPI - Python)
                                        ├─ MySQL (cùng DB, thêm bảng menu_embeddings)
                                        └─ Gemini API  (embedding + sinh câu trả lời)
```
- MySQL: giữ toàn bộ dữ liệu nghiệp vụ (đơn, khách, món...) **và** lưu thêm vector embedding.
- **Không dùng PostgreSQL / pgvector** — menu nhỏ nên tính cosine bằng numpy trong AI-service là đủ nhanh.
- NestJS chỉ làm **proxy** chuyển câu hỏi sang AI-service (không còn xử lý intent).

## ⚙️ Công nghệ
| Thành phần | Công nghệ |
|---|---|
| AI Service | FastAPI (Python) |
| LLM | Google Gemini (`gemini-2.5-flash` chat, `gemini-embedding-001` embedding 768d) |
| Lưu vector | **MySQL** — bảng `menu_embeddings`, cột embedding kiểu `JSON` |
| Tìm tương tự | **numpy cosine similarity** (brute-force, menu nhỏ) |
| Kết nối DB | `aiomysql` / `mysql-connector` (MySQL) |
| Gợi ý cá nhân | Vector averaging (trung bình embedding lịch sử) |

## 📅 Các giai đoạn

### GĐ 0 — Chuẩn bị (0.5 ngày)
- [ ] Lấy **Gemini API key** (Google AI Studio, free tier).
- [ ] ~~Cài PostgreSQL + pgvector~~ → **Bỏ**. Dùng luôn MySQL hiện có.
- [ ] Xác định cách AI-service lấy món: **kết nối trực tiếp MySQL** (cùng DB nghiệp vụ).

### GĐ 1 — Khung AI-Service (1 ngày)
- [ ] Tạo project FastAPI `nha_hang_ai` (`main.py`, `routers/`, `core/`).
- [ ] `.env`: Gemini key + chuỗi kết nối **MySQL**.
- [ ] Kết nối MySQL + tạo bảng `menu_embeddings` (`menu_item_id`, `embedding JSON`, `source_text`, `updated_at`).
- [ ] Endpoint `/health`.

### GĐ 2 — Embedding món (Ingest) (1–2 ngày)
- [ ] Hàm ghép text mô tả món (tên + danh mục + giá + mô tả).
- [ ] Gọi Gemini embedding → vector 768d → lưu JSON vào MySQL.
- [ ] `POST /ingest` (1 món) + `POST /ingest/full` (toàn bộ menu).
- [ ] Chạy ingest toàn bộ menu → kiểm tra dữ liệu trong bảng `menu_embeddings`.

### GĐ 3 — Tìm kiếm & Gợi ý (1–2 ngày)
- [ ] Hàm `retrieve_similar` — load embedding từ MySQL, tính **cosine bằng numpy**, lấy top-k.
- [ ] `GET /similar/{menu_id}` — món tương tự.
- [ ] `GET /recommend/{customer_id}` — cá nhân hóa (trung bình vector lịch sử, loại món đã ăn, fallback top bán chạy cho khách mới).

### GĐ 4 — Chatbot RAG (1–2 ngày)
- [ ] `POST /chat`: embed câu hỏi → tìm top-5 món → ghép prompt → Gemini trả lời.
- [ ] **Anti-hallucination**: chỉ nói về món có trong kết quả truy hồi.
- [ ] (Tùy chọn) Lưu lịch sử chat.

### GĐ 5 — Tích hợp FE/BE + thay chatbot mới (1–2 ngày)
- [ ] **Xóa chatbot rule-based cũ** ở BE (`chatbot.service.ts`, `intents.ts`, controller/module).
- [ ] NestJS: route **proxy** gọi sang AI-service; tự `/ingest` khi thêm/sửa/xóa món.
- [ ] FE: giữ khung **ChatWidget** nhưng đổi `chatbotService` sang gọi `/chat` mới (hiển thị món kèm ảnh/giá).
- [ ] FE: thêm khu **"Gợi ý cho bạn"** + **"Món tương tự"**.

### GĐ 6 — Hoàn thiện (1 ngày)
- [ ] Kiểm thử luồng + xử lý lỗi (mất mạng, hết quota Gemini, fallback).
- [ ] Viết tài liệu phần AI cho báo cáo (kiến trúc, thuật toán, đánh giá).

## 📋 Tổng hợp
| GĐ | Nội dung | Output | Ước lượng |
|----|----------|--------|-----------|
| 0 | Chuẩn bị (Gemini key) | Môi trường sẵn sàng | 0.5 ngày |
| 1 | Khung FastAPI + MySQL | Service chạy, bảng vector | 1 ngày |
| 2 | Embedding món | Menu đã có vector trong MySQL | 1–2 ngày |
| 3 | Similar + Recommend | 2 endpoint gợi ý | 1–2 ngày |
| 4 | Chatbot RAG | Endpoint /chat | 1–2 ngày |
| 5 | Tích hợp FE/BE + thay chatbot | Chạy thật trên web | 1–2 ngày |
| 6 | Hoàn thiện | Bản demo + tài liệu | 1 ngày |

**Tổng ước lượng: ~6–9 ngày (làm cá nhân) — bớt việc cài/đồng bộ PostgreSQL.**

## ⚠️ Rủi ro
- Gemini cần mạng + quota → demo phải có internet; cache embedding trong MySQL để khỏi gọi lại.
- Đồng bộ vector: thêm/sửa/xóa món phải cập nhật `menu_embeddings` tương ứng (gọi `/ingest` từ NestJS).
- Phụ thuộc API ngoài → có fallback khi Gemini lỗi (chatbot trả lời thông báo ngắn gọn, không bịa).

## 🗑️ Dọn dẹp (so với plan cũ)
- Bỏ: PostgreSQL 16, pgvector, asyncpg, index HNSW.
- Xóa: chatbot rule-based cũ (BE `modules/chatbot`, FE gọi intent cũ).
