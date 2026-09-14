# 🩺 HIS V20 - Khám Sức Khỏe (AutoFill Extension)

**Tiện ích Chrome hỗ trợ tự động điền nhanh hồ sơ tiếp đón và kết quả khám sức khỏe định kỳ trên hệ thống Quản lý Y tế Cơ sở (HIS V20 - `v20.ytecoso.vn`).**

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/efbhgocpaadhbkcgmoaokmlpajemjhec)
[![Version](https://img.shields.io/badge/version-v1.3.0-brightgreen.svg)](https://github.com/nguyenthanhthe/his-autofill-extension/releases/tag/v1.3.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/H%E1%BB%87%20th%E1%BB%91ng-v20.ytecoso.vn-orange.svg)](https://v20.ytecoso.vn)
[![Privacy Policy](https://img.shields.io/badge/Privacy%20Policy-Protected-success.svg)](https://gist.github.com/nguyenthanhthe/17939afd05f377cfd213cf5285b43701)

---

## 🚀 CÀI ĐẶT NHANH (CHÍNH THỨC)

👉 **Cách 1: Cài đặt trực tiếp từ Chrome Web Store (Khuyên dùng - Tự động cập nhật ngầm):**  
Cán bộ y tế chỉ cần bấm vào liên kết dưới đây và nhấn nút **"Thêm vào Chrome"** (hoặc **"Add to Brave / Cốc Cốc / Edge"**):  
🔗 **[Cài đặt HIS V20 - Khám Sức Khỏe trên Chrome Web Store](https://chromewebstore.google.com/detail/efbhgocpaadhbkcgmoaokmlpajemjhec)**

👉 **Cách 2: Dành cho lập trình viên (Cài đặt từ mã nguồn):**
1. Tải file ZIP bản phát hành mới nhất từ [Releases](https://github.com/nguyenthanhthe/his-autofill-extension/releases).
2. Mở trình duyệt Chrome / Cốc Cốc, truy cập: `chrome://extensions/`.
3. Bật **Chế độ dành cho nhà phát triển (Developer mode)** ở góc phải trên.
4. Chọn **Tải tiện ích đã giải nén (Load unpacked)** và trỏ tới thư mục mã nguồn.

---

## 🌟 CÁC TÍNH NĂNG VƯỢT TRỘI

### 1. Tiếp đón nhanh & Triệt tiêu 97.5% lỗi cổng dữ liệu
- **Tự động điền đầy đủ 5 trường bắt buộc:** Nghề nghiệp (`00000 - Khác, KXD`), Mục đích khám (`Khám sức khoẻ định kỳ`), Đối tượng (`Các đối tượng khác`), Nguồn kinh phí (`Xã hội hoá`), Lý do khám.
- **Khắc phục triệt để lỗi cổng dữ liệu:** Tự động điền mã nghề nghiệp chuẩn giúp xóa bỏ hoàn toàn lỗi `Trường bắt buộc 'MA_NGHE_NGHIEP' bị thiếu` (nguyên nhân gây thất bại của 97.5% hồ sơ khi nhập tay).
- **Phân loại lứa tuổi tự động:** Nhận diện chính xác 3 nhóm tuổi: Trẻ em dưới 6 tuổi, Học sinh 6-18 tuổi, Người lớn từ 18 tuổi trở lên.

### 2. Tự động hóa hoàn toàn tab TIỀN SỬ (25 mục câu hỏi)
- **Tự động chọn "Không":** Điền sạch toàn bộ Tiền sử gia đình, 22 bệnh lý nền và câu hỏi điều trị/thai sản.
- **Bảo toàn dữ liệu y khoa (An toàn tuyệt đối):** Nếu hồ sơ đã được tích chọn "Có" ở bất kỳ bệnh lý nào từ khâu tiếp đón, tiện ích **tuyệt đối giữ nguyên**, không bao giờ ghi đè làm mất thông tin bệnh nhân.
- Có công tắc bật/tắt linh hoạt trong Cài đặt.

### 3. Khám Lâm Sàng 7 Chuyên Khoa (Theo Thông tư 32/2023/TT-BYT)
- **Thể lực:** Chiều cao, cân nặng, mạch, huyết áp, phân loại thể lực.
- **Thị lực linh hoạt:** Hỗ trợ nhập đầy đủ thị lực Mắt Phải / Mắt Trái cho cả 2 trường hợp: **Không kính** và **Có kính**.
- **16 câu mô tả chuyên khoa chuẩn:** Nội khoa (8 cơ quan con), Ngoại khoa, Da liễu, Sản phụ khoa (tự động bỏ qua nếu là Nam giới), Mắt, Tai - Mũi - Họng, Răng - Hàm - Mặt.
- **Tự động gán mã Bác sĩ** phụ trách từng khoa theo phân công của cơ sở y tế.

### 4. Kết luận & Mã chẩn đoán Z10
- Tự động áp dụng mã bệnh kết luận `Z10` (Khám sức khỏe định kỳ tổng quát).
- Tự động tích chọn Phân loại sức khỏe (Loại I / II / III / IV) tương ứng.
- Tùy chọn tự động bấm **Lưu (F11)** sau khi điền.

---

## ⌨️ BẢNG PHÍM TẮT TIỆN LỢI

| Phím tắt | Chức năng | Ngữ cảnh |
| :---: | :--- | :--- |
| **`F6`** | Chuyển đổi nhanh Tiếp đón ➔ Khám Sức Khỏe | Bàn tiếp đón / Khám |
| **`F9`** | Điền toàn bộ kết quả khám & Tự động lưu | Tab Khám sức khỏe |
| **`F11`** | Phím Lưu gốc của hệ thống Viettel HIS | Mọi màn hình |
| **`F10`** | Phím Lưu & Thêm mới gốc của Viettel HIS | Mọi màn hình |

---

## 🔒 CAM KẾT BẢO MẬT & QUYỀN RIÊNG TƯ (PRIVACY FIRST)

- **100% Xử lý Cục bộ (Local Only):** Tiện ích chạy trực tiếp trên trình duyệt của cán bộ y tế. Tuyệt đối **KHÔNG thu thập, KHÔNG lưu trữ và KHÔNG truyền tải** bất kỳ thông tin định danh hay dữ liệu bệnh nhân nào ra máy chủ bên ngoài.
- **Không theo dõi, không quảng cáo:** Không chứa Google Analytics, không có mã theo dõi cookie và không chèn quảng cáo.
- **Bảo mật PII:** Tích hợp tùy chọn che mờ thông tin cá nhân (CCCD, Họ tên) trên bảng điều khiển tiện ích khi làm việc tại nơi đông người.
- 📄 **Chính sách quyền riêng tư chi tiết:** [Xem tại GitHub Gist](https://gist.github.com/nguyenthanhthe/17939afd05f377cfd213cf5285b43701).

---

## 🛠️ CÔNG NGHỆ & KIẾN TRÚC

- **Ngôn ngữ:** Pure Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Chuẩn tiện ích:** Google Chrome Extension **Manifest V3**.
- **Tương thích:** Chạy mượt mà trên nền tảng Single Page App (Angular / NG-ZORRO) của Viettel HIS V20 mà không làm ảnh hưởng tới hiệu năng hệ thống.

---

## ⚖️ GIẤY PHÉP (LICENSE)

Dự án được phát hành theo giấy phép mã nguồn mở [MIT License](LICENSE). Bản quyền thuộc về **Nguyễn Thành Thế** (2026).

---

*Chúc Quý Y Bác sĩ và Cán bộ Y tế hoàn thành công việc nhanh chóng, chính xác và giảm bớt áp lực thủ tục giấy tờ!*
