 


TRƯỜNG ĐẠI HỌC THUỶ LỢI 
KHOA CÔNG NGHỆ THÔNG TIN

BẢN TÓM TẮT ĐỀ CƯƠNG ĐỒ ÁN TỐT NGHIỆP



Tên đề tài: Xây dựng hệ thống quản lý nhà hàng thông minh ứng dụng trí tuệ nhân tạo	
Sinh viên thực hiện: Lê Văn Trường
Lớp: 64HTTT3
Mã sinh viên: 2251162195
Số điện thoại: 0386522328
Email: 2251162195@e.tlu.edu.vn
Giáo viên hướng dẫn: GVHD : TS.Đỗ Oanh Cường 
Email giáo viên: cuongdo@tlu.edu.vn

			          
TÓM TẮT ĐỀ TÀI
Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ, việc ứng dụng công nghệ thông tin vào quản lý nhà hàng không chỉ giúp tự động hóa quy trình vận hành mà còn nâng cao trải nghiệm khách hàng và tối ưu hóa doanh thu. Các phương pháp quản lý truyền thống (ghi chép thủ công, xử lý đơn hàng rời rạc) đang bộc lộ nhiều hạn chế như sai sót dữ liệu, chậm trễ xử lý và khó phân tích hiệu quả kinh doanh.
Đề tài “Xây dựng hệ thống quản lý nhà hàng thông minh ứng dụng trí tuệ nhân tạo” hướng đến phát triển một hệ thống phần mềm trên nền tảng web, cho phép quản lý toàn diện các nghiệp vụ như: quản lý món ăn, đơn hàng, bàn, khách hàng, nhân viên và báo cáo doanh thu theo thời gian thực.
Hệ thống được thiết kế theo mô hình kiến trúc 3 tầng (Frontend – Backend – Database), sử dụng RESTful API để giao tiếp giữa các thành phần. Đồng thời, hệ thống tích hợp các kỹ thuật thuộc lĩnh vực Trí tuệ nhân tạo (AI/ML) nhằm nâng cao tính thông minh và hỗ trợ ra quyết định, bao gồm:
- Hệ thống gợi ý món ăn (Recommendation System) dựa trên lịch sử đặt hàng và hành vi người dùng 
- Phân tích và phân nhóm khách hàng (Customer Segmentation) bằng thuật toán học máy 
- Dự đoán doanh thu (Revenue Forecasting) theo thời gian bằng mô hình hồi quy 
- Chatbot hỗ trợ tư vấn món ăn và giải đáp thông tin cho khách hàng 
Ngoài ra, hệ thống còn tích hợp dashboard phân tích dữ liệu (Business Intelligence) giúp nhà quản lý theo dõi các chỉ số KPI quan trọng như doanh thu, số lượng đơn hàng, tỷ lệ khách quay lại,… từ đó đưa ra các quyết định kinh doanh hiệu quả.
Hệ thống hướng tới mục tiêu xây dựng một nền tảng quản lý nhà hàng hiện đại, thông minh, có khả năng mở rộng, đảm bảo hiệu năng và bảo mật, đáp ứng nhu cầu thực tế của doanh nghiệp trong thời đại số.



CÁC MỤC TIÊU CHÍNH
- Xây dựng hệ thống web quản lý nhà hàng đầy đủ chức năng theo mô hình MIS (Management Information System) 
- Phân tích và thiết kế nghiệp vụ bằng các công cụ UML (Use Case, BPMN, Sequence Diagram) 
- Thiết kế cơ sở dữ liệu quan hệ đảm bảo tính toàn vẹn, tối ưu truy vấn và hỗ trợ phân tích dữ liệu 
- Xây dựng hệ thống API backend theo chuẩn RESTful, đảm bảo khả năng mở rộng và tích hợp 
- Phát triển giao diện người dùng (UI) thân thiện, responsive, hỗ trợ đa thiết bị (PC, mobile) 
- Xây dựng hệ thống phân quyền người dùng (Role-based Access Control: Admin, Manager, Staff) 
- Tích hợp các mô hình AI/ML: 
+ Gợi ý món ăn 
+ Phân nhóm khách hàng 
+ Dự đoán doanh thu 
- Xây dựng dashboard BI trực quan hóa dữ liệu và KPI 
- Triển khai hệ thống bằng Docker và có khả năng deploy trên môi trường Cloud (AWS) 
- Kiểm thử hệ thống (Unit test, Integration test) và đánh giá hiệu năng 
- Đánh giá hiệu quả hệ thống dựa trên các KPI trước và sau khi áp dụng

KẾT QUẢ DỰ KIẾN
Xây dựng thành công hệ thống quản lý nhà hàng hoàn chỉnh trên nền tảng web với các module: 
- Module MIS
+ Quản lý món ăn (CRUD, phân loại, giá, hình ảnh) 
+ Quản lý đơn hàng (tạo đơn, cập nhật trạng thái, thanh toán) 
+ Quản lý bàn (đặt bàn, trạng thái bàn) 
+ Quản lý khách hàng (thông tin, lịch sử mua hàng) 
+ Quản lý nhân viên và phân quyền (Admin/Staff/Manager) 
- Module AI/ML
+ Gợi ý món ăn thông minh dựa trên lịch sử người dùng 
+ Phân nhóm khách hàng (Clustering) để hỗ trợ marketing 
+ Dự đoán doanh thu theo ngày/tháng (Regression model) 
+ Chatbot hỗ trợ khách hàng (tư vấn món, trả lời câu hỏi) 
- Module BI (Dashboard)
+ Dashboard doanh thu theo thời gian 
+ Biểu đồ top món bán chạy 
+ Phân tích hành vi khách hàng 
+ KPI: 
Revenue 
Retention rate 
Conversion rate 
- Hệ thống dữ liệu
+ Xây dựng pipeline dữ liệu: 
Ingest → Clean → Transform → Store 
+ Lưu trữ dữ liệu trong MySQL/PostgreSQL 
+ Có khả năng mở rộng sang Data Warehouse 
- Công nghệ & triển khai
+ Backend: NodeJS / FastAPI 
+ Frontend: ReactJS 
+ Database: MySQL/PostgreSQL 
+ Docker container hóa hệ thống 
+ Có thể deploy trên Cloud (AWS) 
- Chất lượng hệ thống
+ Giao diện hiện đại, responsive 
+ Tốc độ xử lý nhanh, ổn định 
+ Có logging và monitoring 
+ Bảo mật: 
JWT Authentication 
Role-based access 
- Demo & đánh giá
+ Demo đầy đủ luồng: 
Đặt món → xử lý → thanh toán → báo cáo 
+ So sánh: 
Trước (quản lý thủ công) 
Sau (hệ thống tự động) 


KẾ HOẠCH THỰC HIỆN

TT
Thời gian
Nội dung công việc
Kết quả đạt được
1
Tuần 1-2
Khảo sát thực tế, thu thập yêu cầu, xác định user (Admin, Staff, Manager), phân tích KPI hệ thống
Tài liệu SRS, danh sách yêu cầu chức năng & phi chức năng
2
Tuần 3-4
Thiết kế hệ thống: Use Case, BPMN, Sequence Diagram, ERD, kiến trúc hệ thống(3-tier)
Bộ sơ đồ UML + Architecture diagram
3
Tuần 5-6
Xây dựng backend(API REST), thiết kế database, xử lý dữ liệu(clean, transform)
API hoạt động, DB hoàn chỉnh
4
Tuần 7-8
Phát triển Frontend(React), tích hợp API, xây dựng các module MIS(CRUD, workflow)
Giao diện hoàn chỉnh, chức năng MIS hoạt động
5
Tuần 9-10
Xây dựng AI/ML: recommendation, clustering, prediction
Module AI hoạt động, có kết quả demo
6
Tuần 11
Xây dựng dashboard BI, trực quan hoá dữ liệu, KPI
Dashboard hoàn chỉnh
7
Tuần 12
Kiểm thử hệ thống(unit integration), tối ưu hiệu năng, bảo mật(JWT)
Hệ thống ổn định
8
Tuần 13
Docker hoá, triển khai thử nghiệm(local, cloud), logging & monitoring
Hệ thống deloy được
9
Tuần 14
Hoàn thiện báo cáo, slide, demo, chuẩn bị
Báo cáo hoàn chỉnh


TÀI LIỆU THAM KHẢO 
https://oanhcuongdo.com/ 
Han et al., Data Mining: Concepts and Techniques 
Ian Sommerville, Software Engineering 
Tài liệu chính thức NodeJS: https://nodejs.org 
Tài liệu ReactJS: https://react.dev 
Tài liệu FastAPI: https://fastapi.tiangolo.com 
Tài liệu MySQL: https://dev.mysql.com/doc 
Tài liệu PostgreSQL: https://www.postgresql.org/docs
Scikit-learn Documentation: https://scikit-learn.org 
Hands-On Machine Learning – Aurélien Géron 
Kaggle (dataset & tutorial): https://www.kaggle.com


