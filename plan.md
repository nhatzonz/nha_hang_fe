# KẾ HOẠCH PHÁT TRIỂN HỆ THỐNG QUẢN LÝ NHÀ HÀNG

> **Tech stack**: ReactJS (FE) + NestJS (BE) + MySQL (DB)
> **Đối tượng sử dụng**: Nội bộ nhà hàng (Admin, Manager, Staff). Khách hàng KHÔNG đăng nhập.

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Database (MySQL) — 100%
- [x] Schema đầy đủ 12 bảng: `users`, `categories`, `menu_items`, `tables`, `customers`, `orders`, `order_details`, `reservations`, `payments`, `chat_logs`, `restaurant_info`, `bank_accounts`
- [x] Thông tin nhà hàng mặc định (Hải Sản Biển Đông — Đà Nẵng)
- [x] Tài khoản Admin mặc định: `nhatzonz@gmail.com` / `admin123`

### 2. Backend — NestJS
- [x] Cấu hình TypeORM + MySQL, JWT auth, CORS, ValidationPipe
- [x] Global prefix `/api`, port `3001`
- [x] **11 Entities** đã tạo (User, Category, MenuItem, Table, Customer, Order, OrderDetail, Reservation, Payment, BankAccount, ChatLog, RestaurantInfo)
- [x] **AuthModule**:
  - `POST /auth/login` — Đăng nhập (trả JWT + user info)
  - `GET /auth/profile` — Lấy thông tin user hiện tại
  - JWT Guard, JWT Strategy
- [x] **RestaurantModule**:
  - `GET /restaurant/info` — Lấy thông tin nhà hàng (public)
- [x] Dùng `bcryptjs` (pure JS, chạy được mọi máy)

### 3. Frontend — ReactJS
- [x] Setup: Create React App, SCSS modules, axios, react-router v7
- [x] `.env` + axios instance với JWT interceptor
- [x] **AuthContext** — lưu token + user vào localStorage, auto verify khi reload
- [x] **Protected Route** — chặn truy cập khi chưa đăng nhập
- [x] **Trang Login** (`/login`) — form đẹp theo mẫu thiết kế, gọi API, hiển thị lỗi
- [x] **Dashboard page** (`/dashboard`) — KPI cards, revenue chart, trending dishes, staff leaders, AI card (dữ liệu mock)
- [x] **Components chung**: `Layout`, `Sidebar` (tiếng Việt), `Header` (search + create order + avatar)
- [x] **Coming Soon page** cho các route chưa làm

### 4. Users Module (hoàn thành Tuần 1) — 100%

#### Backend
- [x] Common infra: `@Roles()` decorator, `RolesGuard`, `@CurrentUser()` decorator
- [x] **UsersModule**:
  - `GET /api/users` — List (search, filter role, pagination) — Admin/Manager
  - `GET /api/users/:id` — Chi tiết — Admin/Manager
  - `POST /api/users` — Tạo (hash password, check email duplicate) — Admin
  - `PATCH /api/users/:id` — Sửa (chặn self-demote, last-admin-demote) — Admin
  - `DELETE /api/users/:id` — Xoá (chặn self-delete, last-admin-delete) — Admin
- [x] DTOs với `class-validator` + `class-transformer`: trim, lowercase email, MaxLength, validate `is_active` (0/1), phone 10 số bắt đầu bằng `0`
- [x] Login case-insensitive (lowercase email ở DTO)

#### Frontend
- [x] Component chung `Modal` (ESC, backdrop click, lock scroll, 3 size)
- [x] Toast notification với `sonner` (Toaster wired vào App)
- [x] Utility `utils/format.js`: `formatPhone`, `formatCurrency`, `formatDate`, `formatDateTime`
- [x] Trang `/staff`:
  - Table với avatar, badge role/status màu sắc, SĐT được format (`0912 345 678`)
  - Search realtime (debounce 300ms), filter role, pagination
  - Chỉ Admin thấy nút thêm/sửa/xoá; nút xoá disabled với chính mình
- [x] `StaffForm` modal:
  - Validate client-side + server-side
  - Password optional khi edit (trống = giữ nguyên)
  - SĐT chỉ nhận số (strip non-digits, maxLength 10)
  - Radio toggle trạng thái khi edit
- [x] Confirm delete modal

---

### 5. Menu + Tables Module (Tuần 2) — 100%

#### Backend
- [x] `ServeStaticModule` phục vụ `uploads/` tại `/uploads`
- [x] `multer` với `diskStorage` (random filename), filter image types, limit 5MB
- [x] **CategoriesModule**:
  - `GET /api/categories`, `GET /api/categories/:id`
  - `POST /api/categories` — Admin/Manager
  - `PATCH /api/categories/:id` — Admin/Manager
  - `DELETE /api/categories/:id` — Admin/Manager (chặn xoá nếu còn món)
- [x] **MenuModule**:
  - `GET /api/menu` — search, filter category, filter available, pagination
  - `GET /api/menu/:id` — kèm relation category
  - `POST /api/menu` (multipart, image upload) — Admin/Manager
  - `PATCH /api/menu/:id` (multipart) — Admin/Manager (tự xoá ảnh cũ khi thay)
  - `DELETE /api/menu/:id` — Admin/Manager (xoá file ảnh)
- [x] **TablesModule**:
  - `GET /api/tables?status=` — filter status
  - CRUD đầy đủ + `PATCH /api/tables/:id/status`
  - Chặn xoá bàn đang `occupied`

#### Frontend
- [x] Services: `menuService`, `categoryService`, `tableService`
- [x] `.env` thêm `REACT_APP_ASSET_URL`, utility `assetUrl()` cho ảnh
- [x] Trang `/menu`:
  - Grid card responsive với ảnh, tên, giá, badge danh mục
  - Search debounce 300ms, filter category, filter trạng thái
  - Form upload ảnh có preview (5MB, JPG/PNG/WEBP/GIF)
  - Badge "Tạm hết" khi `is_available = 0`
  - Modal `CategoryManager` — thêm/sửa/xoá danh mục inline
- [x] Trang `/tables`:
  - 4 KPI stats (Trống/Có khách/Đã đặt/Tổng) với màu
  - Grid card màu theo trạng thái (xanh/đỏ/vàng)
  - Dropdown đổi nhanh trạng thái bàn
  - Filter theo trạng thái
  - Chặn xoá bàn đang có khách (disabled + title)
  - Role-based UI (Staff không thấy nút edit/xoá, vẫn đổi được status)

---

### 6. Orders + Customers Module (Tuần 3) — 100%

#### Backend — Customers
- [x] `CustomersModule` với DTOs (validate phone 10 số, email format, trim/lowercase)
- [x] CRUD đầy đủ + search accent-insensitive theo tên/SĐT/email

#### Backend — Orders (module phức tạp nhất)
- [x] Utils: `generateOrderCode()` (sinh ORD-YYYYMMDD-NNN), `canTransitionOrderStatus()` (state machine)
- [x] DTOs: `CreateOrderDto` với items nested (validate min 1 món, quantity ≥ 1), `UpdateOrderDto`, `ChangeStatusDto`, `QueryOrdersDto`
- [x] `OrdersService` — mọi thao tác trong **transaction**:
  - `create()` — check bàn available, validate customer, snapshot `unit_price` từ menu, sinh order_code, tạo order_details, đổi bàn → `occupied`
  - `update()` — sửa note/discount/items (block khi terminal status), replace toàn bộ order_details nếu có `items`, tự tính lại `final_amount`
  - `changeStatus()` — validate state machine (`pending → preparing → served → completed`), side effects:
    - `completed`: đổi bàn → `available`, `customer.total_orders++`, `customer.total_spent +=`, set `completed_at`
    - `cancelled`: đổi bàn → `available`, set `cancelled_reason`
  - Strip password trong `staff` relation khi trả về response
- [x] Controller với JWT guard, dùng `@CurrentUser` để lấy `staff_id`

#### Frontend
- [x] Service `orderService` + constants (status labels, status flow)
- [x] Trang `/orders` — bảng list với badge status màu, filter theo status, search theo mã đơn, click row → detail
- [x] Trang `/orders/create` — **wizard 3 bước**:
  - **Bước 1**: Grid bàn trống (chỉ hiện bàn `available`)
  - **Bước 2**: Menu grid + Cart sidebar (search, filter category, +/- số lượng, ghi chú mỗi món, total realtime)
  - **Bước 3**: Chọn khách (tuỳ chọn, search trong 20 khách gần nhất) + ghi chú đơn + tóm tắt
- [x] Trang `/orders/:id` — xem chi tiết:
  - Bảng món với đơn giá/thành tiền
  - Info card: bàn, khách, nhân viên, thanh toán lúc
  - Total card: tạm tính → giảm giá → thành tiền
  - Action: nút **theo state hiện tại** (VD ở `pending` hiện "Bắt đầu chế biến"), nút huỷ đơn với lý do
  - Hiển thị lý do huỷ nếu đã `cancelled`
- [x] Trang `/customers` — table với tổng đơn/tổng chi tiêu, search realtime, form CRUD

---

### 7. Dashboard BI với data thật (Tuần 4) — 100%

#### Backend — StatisticsModule
- [x] `date-range.util.ts` — resolve period (today/week/month/year/custom), compute previous range, calc change %
- [x] DTOs với validate period enum + ISO8601 dates
- [x] 6 endpoints:
  - `GET /statistics/overview?period=` — 3 KPI (revenue / orders / avg order value) + compare kỳ trước + retention
  - `GET /statistics/revenue?period=&groupBy=day|month` — timeseries với fill empty buckets
  - `GET /statistics/top-items?period=&limit=` — top món bán chạy (quantity desc)
  - `GET /statistics/orders-by-status` — count theo 5 status
  - `GET /statistics/retention` — % khách có ≥2 đơn
  - `GET /statistics/revenue-by-category?period=` — pie data
- [x] Fix timezone bug ở fill buckets (dùng local date để khớp với MySQL DATE_FORMAT)
- [x] Chỉ tính đơn `completed`, dùng `completed_at` thay vì `created_at` (đúng nghiệp vụ)

#### Frontend
- [x] Cài `recharts`
- [x] `statisticsService` + `DateRangeFilter` component (Hôm nay / 7 ngày / 30 ngày / 1 năm)
- [x] Dashboard refactor hoàn toàn:
  - 3 KPI cards với trend arrow (xanh/đỏ) + compare với kỳ trước
  - Bar chart doanh thu timeseries (gradient đỏ-cam, format compact K/M/B, tooltip VND)
  - Top món bán chạy (ảnh thật từ BE, số lượng đã bán, doanh thu)
  - Pie chart doanh thu theo danh mục (legend bên phải)
  - Card chỉ số: retention rate + orders by status (completed / cancelled / processing)
  - Skeleton loading animation
- [x] Test cross-check: overview revenue khớp với list total, category sum khớp total, orders status total khớp list

---

### 8. Reports Module (nâng cấp Tuần 4) — 100%

Nâng cấp hệ thống báo cáo chuyên sâu cho nhà quản lý, tách biệt khỏi Dashboard.

#### Backend — ReportsModule (7 endpoint mới, chỉ Admin/Manager)
- [x] `GET /reports/revenue-by-hour?date=` — Doanh thu 24 giờ trong 1 ngày → peak hours
- [x] `GET /reports/revenue-by-weekday?from=&to=` — Theo T2-CN (dùng MySQL DAYOFWEEK)
- [x] `GET /reports/revenue-by-staff?from=&to=` — Ranking nhân viên với avg/đơn
- [x] `GET /reports/menu-performance?from=&to=` — Best + Worst + Never sold + summary
- [x] `GET /reports/top-customers?from=&to=&limit=` — Top khách chi tiêu với last_visit
- [x] `GET /reports/customer-segmentation?from=&to=` — Khách mới vs quay lại (so với trước kỳ)
- [x] `GET /reports/cancellation-analysis?from=&to=` — Tỷ lệ huỷ + group theo lý do + list gần đây

#### Frontend
- [x] Sidebar thêm mục **Báo cáo**
- [x] `reportsService` + utility `exportToCsv` (BOM UTF-8 cho Excel đọc tiếng Việt)
- [x] `ReportDateRange` component: preset 7/30/90/365 ngày + date picker từ-đến
- [x] Trang `/reports` với **4 tab**:
  - **Doanh thu**: Line chart 24h + Bar chart theo thứ + Bảng ranking nhân viên
  - **Món ăn**: Top 10 best + worst + grid món chưa bán
  - **Khách hàng**: Pie chart mới/quay lại + Top 20 khách chi tiêu
  - **Vận hành**: Bar chart lý do huỷ + bảng đơn huỷ gần đây
- [x] **Export CSV** ở mỗi bảng (file tên chuẩn theo range, UTF-8 BOM)
- [x] Summary cards đầu mỗi tab (3 KPI nổi bật)

#### Security
- [x] `@Roles('admin', 'manager')` cấp controller → Staff bị chặn 403 — đã test

### 9. Chatbot rule-based + Reservations (Tuần 5) — 100%

#### Backend — ChatbotModule
- [x] `intents.ts` — 10 intents với priority + keywords (normalized: không dấu, không space)
- [x] `chatbot.service.ts`:
  - Normalize input (reuse `normalizeSearchTerm`)
  - Pattern match trước (regex `ORD-\d{8}-\d{3}`)
  - Keyword match (score = tổng độ dài match × 1000 + priority)
  - Fallback search menu nếu ≥3 ký tự
- [x] Handlers gọi: MenuService, TablesService, OrdersService, CustomersService, StatisticsService, RestaurantService
- [x] Response chuẩn `{ reply, intent, data?, suggestions? }`
- [x] Lưu `chat_logs` (fire & forget)
- [x] Endpoints: `POST /chatbot/message`, `GET /chatbot/history`

**Intents hỗ trợ**: greeting, help, view_menu, top_items, check_table, revenue_today, order_stats, check_order_by_code (pattern), restaurant_info, search_customer, search_menu (fallback)

#### Backend — ReservationsModule
- [x] DTOs validate: phone 10 số, ngày không quá khứ, capacity check
- [x] CRUD + `PATCH /:id/status` với side effects:
  - `confirmed` → bàn sang `reserved`
  - `cancelled`/`completed` → bàn về `available`
- [x] Block đổi status khi đã terminal
- [x] `POST /reservations` **public** (không cần login) — khách đặt online
- [x] `DELETE` chỉ cho phép khi đã cancelled
- [x] Fix bug transaction: dùng `manager.save` trong transaction, đọc lại ở outside

#### Frontend — Chatbot
- [x] `ChatWidget` floating góc phải dưới — chỉ hiện khi đã đăng nhập
- [x] Session ID lưu localStorage (theo user), history persist
- [x] UI: bubble user/bot, quick replies, typing animation 3 chấm
- [x] Rich data rendering: list món có ảnh + giá ngay trong bubble
- [x] Nút xoá trò chuyện

#### Frontend — Reservations
- [x] Sidebar thêm mục **Đặt bàn**
- [x] Trang `/reservations`: bảng với filter search/status/date range
- [x] Badge status 4 màu + actions theo state (Xác nhận / Đã đến / Huỷ / Sửa / Xoá)
- [x] Form tạo/sửa với date picker min=today, check capacity realtime

#### Test đã pass
- ✅ 13 chatbot scenarios (greeting → search → order code pattern)
- ✅ Reservations: validate phone/ngày/capacity, state transitions với side effects
- ✅ Public POST không token, các endpoint khác cần JWT

---

## 🚧 CẦN LÀM TIẾP

### TUẦN 6: Payment QR + Testing + Deploy

#### Backend — Payment QR
- [ ] `PaymentsModule` + `BankAccountsModule`:
  - CRUD bank accounts (Admin set active)
  - `POST /payments` — Tạo payment, sinh `transaction_code`, QR VietQR
  - `GET /payments/:id/check` — Polling kiểm tra giao dịch
  - Tích hợp API bank (Casso / SePay) để đối soát tự động
  - Khi payment completed → update order.status = completed, table.status = available
- [ ] Cron job kiểm tra expired payments

#### Frontend — Settings
- [ ] Trang `/settings` (Admin):
  - Tab Thông tin nhà hàng (sửa name, address, hours)
  - Tab Tài khoản ngân hàng (thêm/chọn TK active)

#### Testing
- [ ] Unit test: AuthService, OrdersService, ChatbotService
- [ ] Integration test: luồng tạo đơn → thanh toán → bàn available
- [ ] Seed data: 20 món, 10 bàn, 30 khách, 50 đơn hàng mẫu

#### Deploy (tuỳ có VPS hay không)
- [ ] Build production (FE + BE)
- [ ] Cài Node.js, MySQL, Nginx, PM2 trên VPS Ubuntu
- [ ] Nginx reverse proxy + serve static FE
- [ ] SSL với Certbot
- [ ] PM2 chạy BE

---

## 📊 TỔNG TIẾN ĐỘ

| Tuần | Module | Tiến độ |
|------|--------|---------|
| 1 | DB + Auth + Layout + Users CRUD | ✅ 100% |
| 2 | Menu + Tables | ✅ 100% |
| 3 | Orders + Customers | ✅ 100% |
| 4 | Dashboard BI (data thật) + Reports | ✅ 100% |
| 5 | Chatbot + Reservations | ✅ 100% |
| 6 | Payment QR + Testing + Deploy | ⬜ 0% |

---

## 🎯 VIỆC CẦN LÀM NGAY

**Tuần 6**: Payment QR + Testing + Deploy (phần user tự làm)
- Payment tự động qua QR VietQR (sinh mã, poll bank, auto confirm)
- Seed data mẫu để demo dashboard đẹp hơn
- Testing unit + integration
- Deploy VPS: Nginx + PM2 + SSL
