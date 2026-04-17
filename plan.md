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

## 🚧 CẦN LÀM TIẾP

### TUẦN 4: Dashboard BI (data thật)

#### Backend — Orders (quan trọng nhất)
- [ ] `OrdersModule`:
  - `POST /orders` — Tạo đơn mới
    - Tự sinh `order_code` (ORD-YYYYMMDD-XXX)
    - Tạo order_details, tính `total_amount`, `final_amount`
    - Tự đổi status bàn → `occupied`
  - `GET /orders` — List (filter status, ngày, bàn, pagination)
  - `GET /orders/:id` — Chi tiết + order_details + món
  - `PATCH /orders/:id` — Thêm/bớt món, đổi ghi chú
  - `PATCH /orders/:id/status` — Đổi trạng thái (pending → preparing → served → completed)
  - `DELETE /orders/:id` — Huỷ đơn (trả bàn về available)
- [ ] Khi `completed`: cập nhật `customers.total_orders`, `total_spent`

#### Backend — Customers
- [ ] `CustomersModule`:
  - CRUD đầy đủ
  - `GET /customers/:id/orders` — Lịch sử đơn hàng

#### Frontend — Luồng đặt món hoàn chỉnh
- [ ] Trang `/orders`:
  - List đơn với badge status, filter ngày/status
  - Nút "Tạo đơn" → mở trang `/orders/create`
- [ ] Trang `/orders/create` (wizard 3 bước):
  1. Chọn bàn (grid bàn trống)
  2. Chọn món (search, tăng/giảm số lượng, ghi chú)
  3. Chọn khách (tuỳ chọn, có thể tạo mới)
  - Preview tổng tiền, xác nhận
- [ ] Trang `/orders/:id`:
  - Xem chi tiết, thêm/bớt món
  - Đổi trạng thái (button theo workflow)
  - **Nút "Thanh toán"** → chọn phương thức (tiền mặt / QR) → nếu QR: hiện mã VietQR
  - Nút "In hoá đơn" (window.print)
- [ ] Trang `/customers`:
  - List khách, search tên/SĐT
  - Xem chi tiết + lịch sử mua hàng

---

### TUẦN 4: Dashboard BI (data thật)

#### Backend
- [ ] `StatisticsModule`:
  - `GET /statistics/overview` — Doanh thu hôm nay, số đơn, tổng khách
  - `GET /statistics/revenue?from=&to=&groupBy=day|month` — Doanh thu theo khoảng
  - `GET /statistics/top-items?limit=10` — Top món bán chạy
  - `GET /statistics/orders-by-status` — Đơn theo trạng thái
  - `GET /statistics/customers/retention` — Tỷ lệ khách quay lại
  - `GET /statistics/revenue-by-category` — Doanh thu theo danh mục

#### Frontend
- [ ] Cài `recharts`
- [ ] Thay dữ liệu mock trong Dashboard bằng API thật
- [ ] Thêm `DateRangeFilter` (hôm nay / 7 ngày / 30 ngày / tuỳ chọn)
- [ ] Thêm chart: Pie chart doanh thu theo danh mục
- [ ] KPI: Revenue, Retention rate, Conversion rate (tính toán thật)

---

### TUẦN 5: Chatbot (hỗ trợ nhân viên) + Đặt bàn online

#### Backend — Chatbot
- [ ] `ChatbotModule`:
  - `POST /chatbot/message` — Nhận message, trả response
  - File `chatbot.intents.ts` — Định nghĩa keyword → intent
  - File `chatbot.responses.ts` — Template phản hồi
  - Các intent:
    - `view_menu` — "xem menu", "có món gì" → gọi MenuService
    - `check_table` — "còn bàn không", "bàn trống" → gọi TablesService
    - `check_order` — "đơn ORD-XXX" → gọi OrdersService
    - `search_customer` — "khách XYZ" → gọi CustomersService
    - `restaurant_info` — "giờ mở cửa" → từ restaurant_info
    - `suggest_food` — "gợi ý món" → top món bán chạy
    - `greeting`, `fallback`
  - Lưu log vào bảng `chat_logs`

#### Backend — Reservations
- [ ] `ReservationsModule`:
  - `GET /reservations` — List đặt bàn (Staff quản lý)
  - `POST /reservations` — Tạo đặt bàn (public, từ form online)
  - `PATCH /reservations/:id` — Xác nhận / huỷ
  - `DELETE /reservations/:id`

#### Frontend
- [ ] Chatbot widget **trong Layout** (chỉ hiện khi đã đăng nhập):
  - Nổi góc phải dưới màn hình
  - Component chat (message user/bot, input, quick replies)
  - Hiển thị kết quả dạng list món (có ảnh), trạng thái đơn
- [ ] Trang `/reservations`:
  - List đặt bàn (cho Staff xem)
  - Form duyệt / huỷ
  - Có thể tạo đặt bàn nội bộ (khi khách gọi điện)

---

### TUẦN 6: Thanh toán QR tự động + Testing + Deploy

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
| 4 | Dashboard BI (data thật) | ⬜ 0% |
| 5 | Chatbot + Reservations | ⬜ 0% |
| 6 | Payment QR + Testing + Deploy | ⬜ 0% |

---

## 🎯 VIỆC CẦN LÀM NGAY

**Ưu tiên 1**: **Tuần 4 - Dashboard BI với data thật**
- BE: `StatisticsModule` với các endpoint overview / revenue / top items / retention
- FE: Cài `recharts`, thay dữ liệu mock ở Dashboard bằng API thật, thêm date range filter

**Ưu tiên 2**: **Tuần 5 - Chatbot rule-based + Reservations**
- BE: `ChatbotModule` với intent matching + keyword mapping
- FE: Chatbot widget floating trong Layout
