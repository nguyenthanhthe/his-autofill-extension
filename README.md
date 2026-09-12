# HƯỚNG DẪN SỬ DỤNG TIỆN ÍCH HỖ TRỢ KHÁM SỨC KHỎE (HIS V20)

**Dành riêng cho Cán bộ Y tế, Y Bác sĩ tại Trạm Y tế và Cơ sở Y tế**

Công cụ này được thiết kế nhằm giúp Y Bác sĩ giảm bớt các thao tác gõ lặp đi lặp lại khi nhập hồ sơ khám sức khỏe định kỳ trên phần mềm Quản lý Y tế Cơ sở (HIS V20 tại `v20.ytecoso.vn`). Công cụ hỗ trợ điền nhanh thông tin thể lực, kết quả khám 7 chuyên khoa lâm sàng, phân loại sức khỏe và lưu hồ sơ khám chỉ với một lần bấm.

[![Giấy phép MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Hệ thống](https://img.shields.io/badge/Hệ%20thống-v20.ytecoso.vn-blue.svg)](https://v20.ytecoso.vn)
[![Nghiệm thu](https://img.shields.io/badge/Nghiệm%20thu-Production--Grade-orange.svg)](./WALKTHROUGH.md)

---

## 1. HƯỚNG DẪN CÀI ĐẶT LÊN MÁY TÍNH (LÀM 1 LẦN DUY NHẤT)

Công cụ hoạt động trực tiếp trên trình duyệt web quen thuộc của cơ sở y tế như **Google Chrome**, **Cốc Cốc**, hoặc **Microsoft Edge**.

### Bước 1: Tải bộ công cụ về máy
1. Bấm vào nút màu xanh **Code** trên trang GitHub này, chọn **Download ZIP**.
2. Tìm file vừa tải về trong thư mục `Downloads` của máy tính.
3. Nhấp chuột phải vào file nén, chọn **Extract All...** (hoặc **Giải nén tại đây**) để lấy thư mục tiện ích ra ngoài màn hình hoặc vào một thư mục cố định (ví dụ: ổ `D:\`).

### Bước 2: Bật công cụ trên trình duyệt
1. Mở trình duyệt (Chrome hoặc Cốc Cốc) mà Bác sĩ thường dùng để đăng nhập phần mềm HIS V20.
2. Trên thanh nhập địa chỉ web, gõ: `chrome://extensions` rồi bấm **Enter** (đối với Cốc Cốc gõ: `coccoc://extensions`).
3. Nhìn lên góc trên cùng bên phải, gạt công tắc **Chế độ dành cho nhà phát triển** (Developer mode) sang màu xanh.
4. Nhìn sang góc trên bên trái, bấm vào nút **Tải tiện ích đã giải nén** (Load unpacked).
5. Chọn đúng thư mục tiện ích vừa giải nén ở Bước 1 rồi bấm **Select Folder**.

> ✅ Khi thấy biểu tượng công cụ xuất hiện trong danh sách tiện ích là Bác sĩ đã cài đặt thành công!

---

## 2. LÀM QUEN VỚI BẢNG ĐIỀU KHIỂN HỖ TRỢ TRÊN PHẦN MỀM

Khi Bác sĩ đăng nhập vào trang quản trị `v20.ytecoso.vn`, một **Bảng điều khiển thông minh** sẽ tự động hiển thị gọn gàng ở góc dưới bên phải màn hình với phong cách thiết kế tối giản, chữ to rõ ràng, độ tương phản cao phù hợp với môi trường làm việc của cán bộ y tế:

![Bảng điều khiển HIS V20](./screenshots/1_bang_dieu_khien_v20.png)

- **Thu nhỏ / Mở rộng**: Bấm nút **➖ Thu nhỏ** khi cần quan sát toàn bộ trang web và bấm **➕ Mở rộng** để mở lại bảng.
- **Thanh điều hướng 3 Module**:
  - `📋 1. Tiếp Đón`: Hỗ trợ khâu đón tiếp ban đầu.
  - `🩺 2. Khám Sức Khỏe`: Hỗ trợ điền toàn bộ kết quả khám chuyên khoa và kết luận.
  - `⚙️ 3. Cài Đặt`: Cấu hình thông số linh hoạt theo từng phòng khám/trạm y tế.
- **Banner nhận diện người khám thông minh**: Hiển thị trực quan Họ tên, Năm sinh, Mã định danh/CCCD của người đang chọn.

---

## 3. THIẾT LẬP THÔNG SỐ KHÁM (TÙY BIẾN ĐỘNG, KHÔNG HARDCODE)

Mỗi cơ sở y tế có sự phân công nhân sự và bác sĩ phụ trách chuyên khoa khác nhau. Toàn bộ thông số đều có thể điều chỉnh trực tiếp trên giao diện tab **`⚙️ Cài Đặt`** mà **tuyệt đối không bị hardcode trong mã nguồn**.

Hệ thống sử dụng cơ chế lưu trữ 2 tầng bền vững (`localStorage` + `chrome.storage.local`), tự động ghi nhớ vĩnh viễn cấu hình kể cả khi tắt máy tính hoặc nâng cấp phiên bản tiện ích mới.

![Cấu hình Mắt và Tai Mũi Họng](./screenshots/4_mat_va_tai_mui_hong.png)

### 3.1. Chọn nhanh phân loại sức khỏe (1 Chạm)
Ngay đầu bảng điều khiển có 4 nút chọn nhanh:
- **🟢 LOẠI 1 (Rất khỏe / Tốt)**: Bấm nút này nếu người khám có sức khỏe Loại 1. Toàn bộ các mục Thể lực, Khám chuyên khoa và Kết luận sẽ lập tức đồng bộ về Loại 1 (Loại I).
- **🔵 LOẠI 2 (Khỏe / Khá)**: Bấm nút này nếu người khám có sức khỏe Loại 2. Hệ thống sẽ lập tức đồng bộ về Loại 2 (Loại II).
- **🟡 LOẠI 3 (Trung bình)** & **🟠 LOẠI 4 (Yếu)**: Dành cho các phân loại đặc thù.

### 3.2. Cấu hình chỉ số thể lực & thị lực độc lập
- **Chỉ số thể lực**: Chiều cao (ví dụ: `150`), Cân nặng (`48`), Mạch (`80`), Huyết áp (`100/60`).
- **Bảo toàn thị lực mắt**: Chỉ số Mắt Phải và Mắt Trái được lưu độc lập, hoàn toàn không bị ghi đè khi bác sĩ bấm đổi phân loại Loại 1 sang Loại 2.

### 3.3. Cài đặt mã Bác sĩ phụ trách chuyên khoa linh hoạt
Bác sĩ nhập **Mã Bác sĩ** tương ứng tại cơ sở vào các ô:
1. **Nội khoa**: Mặc định `04` (BS. Phụ trách Nội khoa - phụ trách chung cả 8 chuyên khoa nội: Tuần hoàn, Hô hấp, Tiêu hóa, Thận, Nội tiết, Cơ xương khớp, Thần kinh, Tâm thần).
2. **Ngoại khoa**: Mặc định `06` (BS. Phụ trách Ngoại khoa).
3. **Da liễu**: Mặc định `06` (hoặc đổi sang `04` nếu BS Nội khoa kiêm nhiệm).
4. **Sản phụ khoa**: Người khám Nam sẽ **tự động bỏ qua**; người khám Nữ sẽ điền nhận xét bình thường nếu có mã Bác sĩ.
5. **Mắt / Tai - Mũi - Họng / Răng - Hàm - Mặt**: Mặc định `24` (BS. Chuyên khoa lẻ).
6. **Bác sĩ kết luận**: Mặc định `02` (BS. Trưởng đoàn / Kết luận).

### 3.4. Tùy chỉnh câu từ nhận xét lâm sàng
Bác sĩ bấm vào mục **`📝 16 Nội dung khám lâm sàng (Xem / Sửa)`**:
- Sửa đổi câu từ chuẩn mực y khoa theo thói quen ghi chép chuyên môn của cơ sở.
- Có nút **`🔄 Khôi phục nội dung chuẩn`** để quay về mặc định xuất xưởng bất kỳ lúc nào.

---

## 4. HƯỚNG DẪN THAO TÁC KHÁM SỨC KHỎE HÀNG NGÀY

Tùy vào quy trình đón tiếp và phân công tại cơ sở, Bác sĩ có thể chọn 1 trong 3 cách sau:

### CÁCH 1: Quy trình liên hoàn an toàn (Tiếp đón ➔ Chuyển Khám Sức Khỏe (F6) ➔ Lưu)
*Áp dụng khi Bác sĩ vừa tiếp nhận vừa thực hiện khám trực tiếp:*
1. Tại tab **Tiếp đón khám sức khoẻ**, gõ Tên hoặc quét CCCD của người đến khám vào ô Tìm kiếm.
2. Bấm nút màu xanh dương **`[🚀 TIẾP ĐÓN ➔ SANG KHÁM SỨC KHỎE (F6)]`** trên bảng điều khiển.

![Màn hình Tiếp đón](./screenshots/2_man_hinh_tiep_don.png)

3. **Tiện ích tự động thực hiện an toàn:**
   - Tự điền các trường bắt buộc tại bàn tiếp đón: Giờ tiếp đón, Mẫu khám 18 tuổi trở lên, Đối tượng khác, Kinh phí xã hội hoá, Lý do khám định kỳ.
   - Tự bấm **Lưu** tiếp đón (F11).
   - Tự chuyển thẳng sang màn hình **Khám sức khỏe định kỳ (F6)**, tuyệt đối không nhảy qua Danh sách để tránh nguy cơ mở nhầm hồ sơ của người khám khác.
   - Tự điền đầy đủ Thể lực, 16 nhận xét Lâm sàng, Bác sĩ các khoa, Phân loại sức khỏe, Giờ hoàn tất.
   - Tự bấm **Lưu hồ sơ khám (F11)** hoàn tất!

---

### CÁCH 2: Điền nhanh hồ sơ khám đang mở (Nhấn phím F9)
*Áp dụng khi Bác sĩ đang mở sẵn hồ sơ của người khám tại tab Khám sức khỏe định kỳ:*
1. Chọn nhanh **Loại 1** hoặc **Loại 2** trên bảng điều khiển nếu cần đổi phân loại.
2. Bấm nút màu xanh lá **`[🚀 ĐIỀN KHÁM SỨC KHỎE & LƯU (F9)]`** (hoặc chỉ cần nhấn phím tắt **F9** trên bàn phím).
3. Bác sĩ cũng có thể bấm nút **`🩺 Mở màn hình Khám Sức Khỏe (F6)`** bất kỳ lúc nào để chuyển ngay tới tab Khám sức khỏe.
4. Tiện ích sẽ tự động điền toàn bộ kết quả khám và lưu hồ sơ trong chưa đầy **3.2 giây**.

![Khám lâm sàng chuyên khoa](./screenshots/3_kham_lam_sang_chuyen_khoa.png)
![Kết luận và Chẩn đoán Z10](./screenshots/5_ket_luan_va_z10.png)

---

### CÁCH 3: Chỉ điền các mục bắt buộc tại bàn Tiếp đón
*Áp dụng khi cơ sở có nhân viên tiếp đón riêng, chỉ cần nhập nhanh thông tin đăng ký:*
1. Nhập thông tin hành chính của người đến khám.
2. Bấm nút **`⚡ Chỉ Điền Tiếp Đón (*) (Chưa sang Khám Sức Khỏe)`**.
3. Tiện ích sẽ điền tức thì toàn bộ các thông tin bắt buộc (mẫu KSK, kinh phí, lý do, giờ tiếp đón) để chuyển tiếp.

---

## 5. CÁC LỚP PHÒNG THỦ CHUẨN PRODUCTION-GRADE

Để đảm bảo tiện ích hoạt động ổn định và tin cậy trong môi trường thực tế tại các Trạm y tế (ngay cả khi thao tác vội hoặc mạng Internet cơ sở chập chờn), hệ thống trang bị 3 lớp phòng vệ:

1. **Chặn sớm thiếu thông tin tại Tiếp đón**:
   - Nếu chưa gõ Tên hoặc chưa quét CCCD, tiện ích dừng ngay lập tức và báo: `❌ Chưa có thông tin người khám! Vui lòng gõ Tên hoặc CCCD vào ô Tìm kiếm trước.` Tuyệt đối không sinh hồ sơ rác.
2. **Chặn bấm phím tắt F9 sai màn hình**:
   - Nếu đang ở màn hình khác mà chưa mở hồ sơ Khám Sức Khỏe, tiện ích từ chối thực hiện và hiện: `❌ Chưa mở hồ sơ Khám Sức Khỏe! Vui lòng chọn người khám trước.` Không can thiệp vào form màn hình khác.
3. **Bắt thông báo lỗi thực tế từ máy chủ Viettel HIS**:
   - Khi bấm Lưu mà máy chủ Viettel báo lỗi đỏ (như trùng định danh, lỗi kết nối CSDL), tiện ích bắt nguyên văn câu thông báo lỗi của hệ thống (`.ant-message-error`, `.ant-notification-notice-error`) và hiển thị trực tiếp lên bảng điều khiển.

---

## 6. BÁO CÁO KỸ THUẬT VÀ NGHIỆM THU

Để tìm hiểu chi tiết về kiến trúc định vị DOM ngữ nghĩa, cách khắc phục triệt để lỗi nhảy dữ liệu chuyên khoa và nhật ký kiểm nghiệm trên Chrome DevTools:

👉 **Xem tài liệu:** [Báo cáo nghiệm thu kỹ thuật chi tiết (WALKTHROUGH.md)](./WALKTHROUGH.md)

---

## 7. NHỮNG LƯU Ý DÀNH CHO Y BÁC SĨ

1. **Kiểm tra thông tin định danh:** Công cụ chỉ hỗ trợ điền các thông tin kỹ thuật khám lặp lại. Bác sĩ luôn kiểm tra đối chiếu chính xác Họ tên, Năm sinh, Số CCCD/Định danh của người đến khám.
2. **Cá nhân hóa theo từng trường hợp:** Nếu người đến khám có thể trạng hoặc bệnh lý đặc thù (ví dụ: huyết áp cao, bệnh lý tim mạch, mắt cận thị), Bác sĩ chỉ cần vào mục tương ứng để sửa lại kết quả thực tế trước khi bấm Lưu.
3. **Bảo mật thông tin người khám:** Toàn bộ thông số cấu hình chỉ lưu trữ cục bộ trên máy tính của Bác sĩ, hoàn toàn không gửi bất kỳ dữ liệu y tế hay thông tin cá nhân nào ra ngoài môi trường máy tính của cơ sở.

---

## 8. TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM & GIẤY PHÉP

- **Miễn trừ trách nhiệm chuyên môn y khoa:** Tiện ích này thuần túy là công cụ hỗ trợ nhập liệu tự động (data-entry assistant), không phải thiết bị y tế và không có chức năng chẩn đoán hay chỉ định y khoa. Y Bác sĩ chịu hoàn toàn trách nhiệm chuyên môn đối với kết quả khám, phân loại sức khỏe và kết luận hồ sơ khám trước khi bấm Lưu hoặc Ký số. Tác giả không chịu trách nhiệm đối với bất kỳ sai sót y khoa hay gián đoạn hệ thống nào.
- **Giấy phép (License):** Phát hành tự do và miễn phí theo giấy phép mã nguồn mở [MIT License](LICENSE).

*Chúc Quý Y Bác sĩ và Cán bộ Y tế hoàn thành công việc nhanh chóng, chính xác và giảm bớt áp lực thủ tục giấy tờ!*
