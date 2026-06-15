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

> **Tiến độ:** GĐ 0 ✅ · GĐ 1 ✅ · GĐ 2 ✅ · GĐ 3 ✅ · GĐ 4 ✅ · GĐ 5 ✅ · GĐ 6 ✅ code xong, còn kiểm thử UI (cập nhật 2026-06-15) — **không viết báo cáo**

### GĐ 0 — Chuẩn bị (0.5 ngày) ✅
- [x] Lấy **Gemini API key** (Google AI Studio, free tier).
- [x] ~~Cài PostgreSQL + pgvector~~ → **Bỏ**. Dùng luôn MySQL hiện có.
- [x] Xác định cách AI-service lấy món: **kết nối trực tiếp MySQL** (cùng DB nghiệp vụ).

### GĐ 1 — Khung AI-Service (1 ngày) ✅
- [x] Tạo project FastAPI `nha_hang_ai` (`main.py`, `routers/`, `core/`).
- [x] `.env`: Gemini key + chuỗi kết nối **MySQL**.
- [x] Kết nối MySQL + tạo bảng `menu_embeddings` (`menu_item_id`, `embedding JSON`, `source_text`, `updated_at`).
- [x] Endpoint `/health`.

### GĐ 2 — Embedding món (Ingest) (1–2 ngày) ✅
- [x] Hàm ghép text mô tả món (tên + danh mục + giá + mô tả).
- [x] Gọi Gemini embedding → vector 768d → lưu JSON vào MySQL.
- [x] `POST /ingest/{id}` (1 món) + `POST /ingest/full` (toàn bộ menu) + `DELETE /ingest/{id}`.
- [x] Chạy ingest toàn bộ menu (22 món) → đã kiểm tra dữ liệu trong bảng `menu_embeddings`.

### GĐ 3 — Tìm kiếm & Gợi ý (1–2 ngày) ✅
- [x] Hàm `retrieve_similar` — load embedding từ MySQL, tính **cosine bằng numpy**, lấy top-k.
- [x] `GET /similar/{menu_id}` — món tương tự (đã test, loại chính nó).
- [x] `GET /recommend/{customer_id}` — cá nhân hóa (trung bình vector lịch sử, loại món đã ăn, fallback top bán chạy cho khách mới — đã test cả 2 luồng).

### GĐ 4 — Chatbot RAG (1–2 ngày) ✅
- [x] `POST /chat`: embed câu hỏi → tìm top-k món → ghép prompt → Gemini trả lời.
- [x] **Anti-hallucination**: chỉ nói về món có trong kết quả truy hồi (đã test: lạc đề + món không có menu đều không bịa).
- [x] Fallback khi Gemini lỗi (liệt kê món truy hồi được, không gián đoạn).
- [ ] (Tùy chọn) Lưu lịch sử chat — để sau, chưa cần cho demo.

### GĐ 5 — Tích hợp FE/BE + thay chatbot mới (1–2 ngày) ✅
- [x] ~~Xóa chatbot cũ~~ → đổi sang **HYBRID**: giữ truy vấn nghiệp vụ (doanh thu/bàn/đơn), định tuyến câu hỏi tư vấn/tìm món sang RAG (`AiService` + `handleAiChat`, có fallback DB khi AI lỗi).
- [x] NestJS: `AiModule` (`AiService` gọi FastAPI bằng fetch) + `AiController` (`/ai/similar`, `/ai/recommend`); tự `/ingest` khi thêm/sửa, `DELETE /ingest` khi xóa món (MenuService).
- [x] FE: **ChatWidget không cần sửa** — đã render sẵn `data.items` (ảnh/giá), khớp shape RAG trả về.
- [x] FE: **"Món tương tự"** trong MenuForm (khi sửa món) + **"Gợi ý cho khách"** trong CreateOrder (chọn khách → bấm thẻ thêm vào đơn). Component dùng chung `DishSuggestions` + `aiService`.

### GĐ 6 — Hoàn thiện (chỉ code, KHÔNG viết báo cáo)
- [x] Xử lý lỗi/fallback đã code sẵn: `AiService` nuốt lỗi mạng/timeout → trả null; RAG `_fallback` khi Gemini lỗi; `handleAiChat` rơi về tìm-DB cũ → chatbot không bao giờ "câm".
- [x] Cải thiện sau review: (#1) task type embedding, (#2) re-ingest khi đổi tên danh mục, (#4) intent `thanks` + chặn tin <3 ký tự → khỏi gọi Gemini vô ích, (#5) FastAPI bind `127.0.0.1` thay vì `0.0.0.0`, (#6) retry + backoff khi Gemini lỗi tạm thời 429/500/503 (giảm fallback oan ở free tier).
- [ ] Kiểm thử luồng thực tế trên UI (chatbot, món tương tự, gợi ý khách) sau khi restart BE.
- [x] ~~Viết tài liệu phần AI cho báo cáo~~ → **bỏ** (theo yêu cầu, chỉ làm code).

## 📋 Tổng hợp
| GĐ | Nội dung | Output | Ước lượng |
|----|----------|--------|-----------|
| 0 | Chuẩn bị (Gemini key) | Môi trường sẵn sàng | 0.5 ngày |
| 1 | Khung FastAPI + MySQL | Service chạy, bảng vector | 1 ngày |
| 2 | Embedding món | Menu đã có vector trong MySQL | 1–2 ngày |
| 3 | Similar + Recommend | 2 endpoint gợi ý | 1–2 ngày |
| 4 | Chatbot RAG | Endpoint /chat | 1–2 ngày |
| 5 | Tích hợp FE/BE + thay chatbot | Chạy thật trên web | 1–2 ngày |
| 6 | Hoàn thiện (chỉ code) | Fallback + kiểm thử UI | 0.5 ngày |

**Tổng ước lượng: ~6–9 ngày (làm cá nhân) — bớt việc cài/đồng bộ PostgreSQL.**

## ⚠️ Rủi ro
- Gemini cần mạng + quota → demo phải có internet; cache embedding trong MySQL để khỏi gọi lại.
- Đồng bộ vector: thêm/sửa/xóa món tự gọi `/ingest` từ NestJS; **đổi tên danh mục cũng re-ingest** các món thuộc nó (vì source_text chứa tên danh mục).
- Embedding dùng task type: `RETRIEVAL_DOCUMENT` khi ingest món, `RETRIEVAL_QUERY` cho câu hỏi chatbot (tăng độ chính xác truy hồi).
- Phụ thuộc API ngoài → có fallback khi Gemini lỗi (chatbot trả lời thông báo ngắn gọn, không bịa).

## 🗑️ Dọn dẹp (so với plan cũ)
- Bỏ: PostgreSQL 16, pgvector, asyncpg, index HNSW.
- Xóa: chatbot rule-based cũ (BE `modules/chatbot`, FE gọi intent cũ).
