	
TRƯỜNG ĐẠI HỌC THUỶ LỢI 
KHOA CÔNG NGHỆ THÔNG TIN

BẢN TÓM TẮT ĐỀ CƯƠNG ĐỒ ÁN TỐT NGHIỆP

Tên đề tài: Xây dựng hệ thống quản lý nhà hàng thông minh ứng dụng trí tuệ nhân tạo	
Sinh viên thực hiện: Lê Văn Trường
Lớp: 64HTTT3
Mã sinh viên: 2251162195
Số điện thoại: 0386522328
Email: 2251162195@e.tlu.edu.vn
Giáo viên hướng dẫn: TS.Đỗ Oanh Cường        
Email: cuongdo@tlu.edu.vn
					  
TÓM TẮT ĐỀ TÀI
Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ, việc ứng dụng công nghệ thông tin vào quản lý nhà hàng không chỉ giúp tự động hóa quy trình vận hành mà còn nâng cao trải nghiệm khách hàng và tối ưu hóa doanh thu. Các phương pháp quản lý truyền thống (ghi chép thủ công, xử lý đơn hàng rời rạc) đang bộc lộ nhiều hạn chế như sai sót dữ liệu, chậm trễ xử lý và khó phân tích hiệu quả kinh doanh.
Đề tài “Xây dựng hệ thống quản lý nhà hàng thông minh ứng dụng trí tuệ nhân tạo” hướng đến phát triển một hệ thống phần mềm trên nền tảng web, cho phép quản lý toàn diện các nghiệp vụ như: quản lý món ăn, đơn hàng, bàn, khách hàng, nhân viên và báo cáo doanh thu theo thời gian thực.
Hệ thống được thiết kế theo kiến trúc 3 tầng (Frontend – Backend – Database), sử dụng RESTful API để giao tiếp giữa các thành phần. Điểm nổi bật của hệ thống là tích hợp chatbot hỗ trợ người dùng, hoạt động dựa trên phương pháp rule-based (dựa trên kịch bản) kết hợp với việc gọi API từ hệ thống backend để truy xuất dữ liệu thực tế.
Cụ thể, chatbot được xây dựng bằng cách phân tích nội dung câu hỏi của người dùng và ánh xạ đến các kịch bản xử lý tương ứng. Sau đó, hệ thống sẽ gọi các API phù hợp để lấy dữ liệu như danh sách món ăn, thông tin đơn hàng, hoặc dữ liệu khách hàng, và trả về phản hồi cho người dùng dưới dạng ngôn ngữ tự nhiên.
Chatbot có thể thực hiện các chức năng như:
•	Truy vấn và hiển thị danh sách món ăn 
•	Gợi ý món ăn dựa trên dữ liệu có sẵn 
•	Tra cứu trạng thái đơn hàng 
•	Trả lời các câu hỏi cơ bản như giờ mở cửa, thông tin nhà hàng 
•	Hỗ trợ nhân viên tìm kiếm nhanh thông tin trong hệ thống 
Ngoài ra, hệ thống còn tích hợp dashboard phân tích dữ liệu (Business Intelligence) giúp nhà quản lý theo dõi các chỉ số KPI quan trọng như doanh thu, số lượng đơn hàng và hành vi khách hàng, từ đó hỗ trợ đưa ra quyết định kinh doanh hiệu quả.
Đề tài hướng tới xây dựng một hệ thống quản lý nhà hàng hiện đại, dễ triển khai, có khả năng mở rộng và tích hợp các chức năng hỗ trợ thông minh ở mức cơ bản, phù hợp với nhu cầu thực tế của doanh nghiệp.



CÁC MỤC TIÊU CHÍNH

•	Xây dựng hệ thống web quản lý nhà hàng đầy đủ chức năng theo mô hình MIS (Management Information System), hỗ trợ quản lý món ăn, đơn hàng, bàn, khách hàng và nhân viên 
•	Phân tích và thiết kế hệ thống bằng các công cụ UML (Use Case Diagram, Sequence Diagram, Activity Diagram) nhằm mô hình hóa các nghiệp vụ chính của hệ thống 
•	Thiết kế cơ sở dữ liệu quan hệ (MySQL/PostgreSQL) đảm bảo tính toàn vẹn dữ liệu, tối ưu truy vấn và hỗ trợ mở rộng trong tương lai 
•	Xây dựng hệ thống backend theo kiến trúc RESTful API sử dụng NodeJS, đảm bảo khả năng mở rộng, bảo mật và dễ tích hợp với các hệ thống khác 
•	Phát triển giao diện người dùng (Frontend) bằng ReactJS với thiết kế thân thiện, responsive, hỗ trợ đa thiết bị (desktop và mobile) 
•	Xây dựng hệ thống phân quyền người dùng (Role-based Access Control) gồm các vai trò: Admin, Manager, Staff 
•	Tích hợp chatbot hỗ trợ người dùng theo phương pháp rule-based kết hợp gọi API backend để truy xuất dữ liệu thực tế, giúp: 
o	Tra cứu thông tin món ăn 
o	Gợi ý món ăn dựa trên dữ liệu có sẵn 
o	Kiểm tra trạng thái đơn hàng 
o	Hỗ trợ tìm kiếm thông tin nhanh trong hệ thống 
•	Xây dựng dashboard phân tích dữ liệu (Business Intelligence) để trực quan hóa các chỉ số quan trọng như doanh thu, số lượng đơn hàng, và hành vi khách hàng 
•	Triển khai hệ thống trên môi trường VPS (Ubuntu) và cấu hình domain, sử dụng các công cụ như: 
o	Nginx làm web server và reverse proxy 
o	PM2 để quản lý tiến trình NodeJS 
o	SSL (HTTPS) để đảm bảo bảo mật khi truy cập hệ thống 
•	Thực hiện kiểm thử hệ thống (Unit Test, Integration Test) nhằm đảm bảo tính ổn định và độ tin cậy của các chức năng 
•	Đánh giá hiệu năng hệ thống dựa trên các tiêu chí như thời gian phản hồi, khả năng xử lý đồng thời và độ ổn định khi vận hành thực tế
											 NỘI DUNG CHÍNH
1. Phân tích yêu cầu hệ thống (Requirement Analysis)
- Thu thập yêu cầu từ thực tế (quy trình nhà hàng: order, thanh toán, quản lý bàn) 
- Xác định: 
+ Use Case chi tiết cho từng actor (Admin, Staff, Manager, Customer) 
+ Functional Requirements: 
	CRUD món ăn, đơn hàng, khách hàng, bàn 
	Đặt bàn online 
	Thanh toán và cập nhật trạng thái đơn 
+ Non-functional Requirements:
	Hiệu năng (response < 2s) 
	Bảo mật (JWT, mã hóa dữ liệu) 
	Khả năng mở rộng (scalable)
2. Thiết kế hệ thống (System Design)
- Thiết kế kiến trúc: 
+ Mô hình 3-Tier Architecture 
+ Frontend (React) – Backend (API) – Database 
- Thiết kế UML: 
+ Use Case Diagram 
+ Sequence Diagram (luồng đặt món, thanh toán) 
+ Activity Diagram (workflow hệ thống) 
- Thiết kế cơ sở dữ liệu: 
+ ERD (Entity Relationship Diagram) 
+ Chuẩn hóa dữ liệu (3NF) 
+ Các bảng chính: 
	Users, Orders, OrderDetails, Menu, Tables, Customers 
3. Xây dựng hệ thống Backend
- Sử dụng NodeJS / FastAPI 
- Xây dựng RESTful API: 
+ /api/menu 
+ /api/orders 
+ /api/customers 
+ /api/auth 
- Xử lý: 
+ Authentication (JWT) 
- Kết nối Database: 
+ MySQL 
- Logging & Error Handling 
4. Phát triển Frontend
- Sử dụng ReactJS: 
+ Component-based architecture 
- Xây dựng giao diện: 
+ Dashboard quản lý 
+ Trang đặt món 
+ Trang quản lý nhân viên 
- Responsive: 
+ Hỗ trợ mobile + desktop 
- Tích hợp API: 
+ Axios / Fetch 
5. Xây dựng hệ thống chatbot RAG
•	Xây dựng chatbot hỗ trợ người dùng dựa trên phương pháp rule-based kết hợp xử lý ngôn ngữ tự nhiên ở mức cơ bản (Natural Language Processing – NLP) 
•	Thiết kế cơ chế phân tích và hiểu ý định người dùng (Intent Recognition) thông qua việc xử lý từ khóa, chuẩn hóa câu nhập (text preprocessing) và ánh xạ đến các kịch bản hội thoại phù hợp 
•	Xây dựng tập các kịch bản hội thoại (conversation flows) cho các tình huống phổ biến như: 
o	Tra cứu danh sách món ăn 
o	Gợi ý món ăn 
o	Kiểm tra trạng thái đơn hàng 
o	Hỏi thông tin nhà hàng 
•	Áp dụng cơ chế mapping giữa intent và hệ thống API backend, cho phép chatbot truy xuất dữ liệu theo thời gian thực thông qua các endpoint: 
o	/api/menu 
o	/api/orders 
o	/api/customers 
•	Tích hợp cơ chế truy xuất dữ liệu động (dynamic data retrieval) từ hệ thống, đảm bảo thông tin phản hồi luôn chính xác và cập nhật 
•	Xây dựng module xử lý và sinh phản hồi (response generation), chuyển đổi dữ liệu từ API thành ngôn ngữ tự nhiên thân thiện với người dùng 
•	Thiết kế kiến trúc chatbot theo hướng mở rộng (extensible), cho phép nâng cấp trong tương lai sang các mô hình AI nâng cao như Machine Learning hoặc RAG-based chatbot 
•	Tối ưu trải nghiệm người dùng thông qua việc xây dựng giao diện chat trực quan, phản hồi nhanh và hỗ trợ đa ngữ cảnh cơ bản
6. Xây dựng Dashboard BI
- Sử dụng thư viện: 
+ Chart.js / Recharts 
- Hiển thị: 
+ Doanh thu theo ngày/tháng 
+ Top món ăn 
+ Tỷ lệ khách quay lại 
- KPI: 
+ Revenue 
+ Retention rate 
+ Conversion rate 
7. Kiểm thử hệ thống (Testing)
- Unit Test (backend API) 
- Integration Test 
- Test các luồng chính: 
+ Đặt món → thanh toán 
- Đánh giá: 
+ Hiệu năng (response time) 
+ Độ chính xác mô hình AI 
8. Triển khai hệ thống (Deployment)
•	Hệ thống được triển khai trên VPS sử dụng Ubuntu, đảm bảo môi trường vận hành ổn định và dễ quản lý 
•	Cài đặt môi trường chạy backend: 
o	NodeJS runtime 
o	Các thư viện và dependencies cần thiết 
•	Sử dụng PM2 để: 
o	Quản lý tiến trình ứng dụng NodeJS 
o	Tự động restart khi xảy ra lỗi 
o	Theo dõi log hệ thống 
•	Sử dụng Nginx làm reverse proxy: 
o	Điều hướng request từ domain đến backend 
o	Phục vụ frontend (file build production) 
o	Tối ưu hiệu năng và bảo mật 
•	Cấu hình domain: 
o	Trỏ domain về địa chỉ IP của VPS 
o	Cho phép truy cập hệ thống qua URL 
•	Cài đặt SSL (HTTPS): 
o	Sử dụng Certbot để cấp chứng chỉ 
o	Mã hóa dữ liệu giữa client và server 
•	Triển khai frontend: 
o	Build ReactJS (production) 
o	Đưa lên server và cấu hình Nginx phục vụ 
•	Thiết lập logging và monitoring: 
o	Theo dõi hoạt động hệ thống 
o	Phát hiện và xử lý lỗi 
•	Kiểm tra và tối ưu sau triển khai: 
o	Đảm bảo tốc độ phản hồi 
o	Đảm bảo hệ thống hoạt động ổn định
9. Đánh giá và hoàn thiện
- So sánh: 
+ Trước khi có hệ thống 
+ Sau khi áp dụng hệ thống 
- Đánh giá: 
+ Hiệu quả quản lý 
+ Tăng trưởng doanh thu 
- Hoàn thiện: 
+ Báo cáo 
+ Slide thuyết trình 
+ Demo thực tế


KẾT QUẢ DỰ KIẾN
Xây dựng thành công hệ thống quản lý nhà hàng hoàn chỉnh trên nền tảng web với các module: 
- Module MIS
+ Quản lý món ăn (CRUD, phân loại, giá, hình ảnh) 
+ Quản lý đơn hàng (tạo đơn, cập nhật trạng thái, thanh toán) 
+ Quản lý bàn (đặt bàn, trạng thái bàn) 
+ Quản lý khách hàng (thông tin, lịch sử mua hàng) 
+ Quản lý nhân viên và phân quyền (Admin/Staff/Manager) 
- Module chatbot Rule-based
+ Xây dựng chatbot hỗ trợ người dùng dựa trên rule-based 
+ Phân tích câu hỏi người dùng bằng từ khóa (keyword matching) 
+ Mapping câu hỏi → API tương ứng
+ Gọi API backend:
+  /api/menu
 + /api/orders
 + /api/customers 
+ Xử lý và format câu trả lời dạng text rõ ràng 
+ Hỗ trợ các chức năng:

+ Xem menu
+ Tra cứu đơn hàng
+ Tìm kiếm thông tin khách hàng 
+ Thiết kế kịch bản hội thoại cơ bản, dễ sử dụng
- Module BI (Dashboard)
+ Dashboard doanh thu theo thời gian 
+ Biểu đồ top món bán chạy 
+ Phân tích hành vi khách hàng 
+ KPI: 
	Revenue 
	Retention rate 
	Conversion rate 
- Hệ thống dữ liệu
+ Xây dựng pipeline dữ liệu: 
	Ingest → Clean → Transform → Store 
+ Lưu trữ dữ liệu trong MySQL 
+ Có khả năng mở rộng sang Data Warehouse 
- Công nghệ & triển khai
+ Backend: NodeJS / FastAPI 
+ Frontend: ReactJS 
+ Database: MySQL  
+ Nginx, pm2, vps
- Chất lượng hệ thống
+ Giao diện hiện đại, responsive 
+ Tốc độ xử lý nhanh, ổn định 
+ Có logging và monitoring 
+ Bảo mật: 
	JWT Authentication 
	Role-based access 
- Demo & đánh giá
+ Demo đầy đủ luồng: 
	Đặt món → xử lý → thanh toán → báo cáo 
+ So sánh: 
	Trước (quản lý thủ công) 
	Sau (hệ thống tự động) 


KẾ HOẠCH THỰC HIỆN

TT	Thời gian	Nội dung công việc	Kết quả đạt được
1	Tuần 1-2	Khảo sát thực tế, thu thập yêu cầu, xác định user (Admin, Staff, Manager), phân tích KPI hệ thống	Xây dựng tài liệu SRS đầy đủ, xác định rõ yêu cầu chức năng & phi chức năng, định nghĩa KPI làm cơ sở phát triển hệ thống
2	Tuần 3-4	Thiết kế hệ thống: Use Case, BPMN, Sequence Diagram, ERD, kiến trúc hệ thống (3-tier)	Hoàn thiện bộ sơ đồ UML và kiến trúc hệ thống, đảm bảo mô hình hóa đầy đủ luồng nghiệp vụ và cấu trúc dữ liệu
3	Tuần 5-6	Xây dựng backend (API REST), thiết kế database, xử lý dữ liệu (clean, transform)	Phát triển hệ thống API REST ổn định, database chuẩn hóa, dữ liệu được xử lý sạch và sẵn sàng phục vụ hệ thống
4	Tuần 7-8	Phát triển Frontend (React), tích hợp API, xây dựng các module MIS (CRUD, workflow)	Hoàn thiện giao diện người dùng, tích hợp API thành công, các chức năng quản lý MIS hoạt động mượt và đúng nghiệp vụ
5	Tuần 9-10	Xây dựng chatbot theo hướng rule-based: phân tích câu hỏi bằng keyword, mapping → API	Xây dựng chatbot có khả năng hiểu truy vấn cơ bản, kết nối API và phản hồi chính xác các thông tin như menu, đơn hàng, khách hàng
6	Tuần 11	Xây dựng dashboard BI, trực quan hoá dữ liệu, KPI	Xây dựng dashboard trực quan, hiển thị KPI rõ ràng, hỗ trợ phân tích và ra quyết định
7	Tuần 12	Kiểm thử hệ thống (unit, integration), tối ưu hiệu năng, bảo mật (JWT, phân quyền)	Hệ thống được kiểm thử toàn diện, cải thiện hiệu năng, đảm bảo bảo mật với cơ chế xác thực và phân quyền
8	Tuần 13	Triển khai hệ thống trên VPS: cấu hình PM2, Nginx, domain, SSL, logging & monitoring	Triển khai hệ thống thành công trên môi trường thực tế, đảm bảo truy cập ổn định, bảo mật HTTPS và có cơ chế giám sát
9	Tuần 14	Hoàn thiện báo cáo, slide, demo, chuẩn bị bảo vệ	Hoàn thiện tài liệu báo cáo, slide trình bày và hệ thống demo ổn định, sẵn sàng bảo vệ

TÀI LIỆU THAM KHẢO 
1. https://oanhcuongdo.com/ 
2. Han et al., Data Mining: Concepts and Techniques 
3. Ian Sommerville, Software Engineering 
4. Tài liệu chính thức NodeJS: https://nodejs.org 
5. Tài liệu ReactJS: https://react.dev 
6. Tài liệu FastAPI: https://fastapi.tiangolo.com 
7. Tài liệu MySQL: https://dev.mysql.com/doc 
8. Tài liệu PostgreSQL: https://www.postgresql.org/docs
9. OpenAI API Documentation (Chatbot / RAG): https://platform.openai.com/docs
10. LangChain Documentation (RAG Framework): https://docs.langchain.com 
11. PM2 Documentation (Process Manager): https://pm2.keymetrics.io/docs 
12. Nginx Documentation: https://nginx.org/en/docs 
13.  DigitalOcean Tutorials (VPS, Deploy, Nginx): https://www.digitalocean.com/community/tutorials

