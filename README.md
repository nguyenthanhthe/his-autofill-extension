# HƯỚNG DẪN SỬ DỤNG CÔNG CỤ HỖ TRỢ NHẬP KHÁM SỨC KHỎE (HIS V2)

**Dành riêng cho Cán bộ Y tế, Y Bác sĩ tại Trạm Y tế và Cơ sở Y tế**

Công cụ này được thiết kế nhằm giúp Y Bác sĩ giảm bớt các thao tác gõ lặp đi lặp lại khi nhập hồ sơ khám sức khỏe định kỳ trên phần mềm Quản lý Y tế Cơ sở (HIS V2). Công cụ hỗ trợ điền nhanh thông tin thể lực, kết quả khám 7 chuyên khoa lâm sàng, phân loại sức khỏe và lưu bệnh án chỉ với một lần bấm.

---

## 1. HƯỚNG DẪN CÀI ĐẶT LÊN MÁY TÍNH (LÀM 1 LẦN DUY NHẤT)

Công cụ hoạt động trực tiếp trên trình duyệt web quen thuộc của cơ sở y tế như **Google Chrome**, **Cốc Cốc**, hoặc **Microsoft Edge**.

### Bước 1: Tải bộ công cụ về máy
1. Bấm vào nút màu xanh **Code** trên trang GitHub này, chọn **Download ZIP**.
2. Tìm file vừa tải về trong thư mục `Downloads` của máy tính.
3. Nhấp chuột phải vào file nén, chọn **Extract All...** (hoặc **Giải nén tại đây**) để lấy thư mục tiện ích ra ngoài màn hình hoặc vào một thư mục cố định (ví dụ: ổ `D:`).

### Bước 2: Bật công cụ trên trình duyệt
1. Mở trình duyệt (Chrome hoặc Cốc Cốc) mà Bác sĩ thường dùng để đăng nhập phần mềm HIS V2.
2. Trên thanh nhập địa chỉ web, gõ: `chrome://extensions` rồi bấm **Enter** (đối với Cốc Cốc gõ: `coccoc://extensions`).
3. Nhìn lên góc trên cùng bên phải, gạt công tắc **Chế độ dành cho nhà phát triển** (Developer mode) sang màu xanh.
4. Nhìn sang góc trên bên trái, bấm vào nút **Tải tiện ích đã giải nén** (Load unpacked).
5. Chọn đúng thư mục tiện ích vừa giải nén ở Bước 1 rồi bấm **Select Folder**.

> ✅ Khi thấy biểu tượng công cụ xuất hiện trong danh sách tiện ích là Bác sĩ đã cài đặt thành công!

---

## 2. LÀM QUEN VỚI BẢNG ĐIỀU KHIỂN HỖ TRỢ TRÊN PHẦN MỀM

Khi Bác sĩ đăng nhập vào trang quản trị `v20.ytecoso.vn`, một **Bảng điều khiển màu cam** sẽ tự động hiển thị gọn gàng ở góc dưới bên phải màn hình:

- **Thu nhỏ / Mở rộng**: Bấm nút **➖ Thu nhỏ** khi cần quan sát toàn bộ trang web và bấm **➕ Mở rộng** để mở lại bảng.
- **Nạp lại (🔄)**: Làm mới lại bảng điều khiển khi chuyển tài khoản hoặc sau khi tải lại trang.

---

## 3. THIẾT LẬP THÔNG SỐ KHÁM THEO QUY CHUẨN CƠ SỞ

Mỗi cơ sở y tế có các bác sĩ phụ trách chuyên khoa khác nhau. Bác sĩ chỉ cần thiết lập thông số một lần, công cụ sẽ tự động ghi nhớ cho toàn bộ các lần khám sau:

### 3.1. Chọn nhanh phân loại sức khỏe (1 Chạm)
Ngay đầu bảng điều khiển có 2 nút chọn nhanh:
- **🟢 LOẠI 1 (Rất khỏe / Tốt)**: Bấm nút này nếu người khám có sức khỏe Loại 1. Toàn bộ các mục Thể lực, Khám chuyên khoa và Kết luận sẽ lập tức đồng bộ về Loại 1 (Loại I).
- **🔵 LOẠI 2 (Khỏe / Khá)**: Bấm nút này nếu người khám có sức khỏe Loại 2. Hệ thống sẽ lập tức đồng bộ về Loại 2 (Loại II).

### 3.2. Cấu hình chỉ số thể lực
Bác sĩ nhập chỉ số thể lực mặc định theo đoàn khám:
- **Chiều cao (cm)**: Ví dụ `150`
- **Cân nặng (kg)**: Ví dụ `48`
- **Mạch (lần/phút)**: Ví dụ `80`
- **Huyết áp**: Ví dụ `100/60` (hoặc `110/70`, `120/80`)
- **Phân loại thể lực**: Chọn Loại 1 (Tốt), Loại 2 (Khá),...

### 3.3. Cài đặt mã Bác sĩ phụ trách 7 chuyên khoa lâm sàng
Bác sĩ nhập **Mã Bác sĩ** tương ứng tại trạm/phòng khám vào các ô:
1. **Nội khoa** (Tuần hoàn, Hô hấp, Tiêu hóa, Thận, Nội tiết, Cơ xương khớp, Thần kinh, Tâm thần).
2. **Ngoại khoa**
3. **Da liễu**
4. **Sản phụ khoa** (Nếu khám nam hoặc không khám, có thể tích chọn ô *Bỏ qua*).
5. **Mắt** (Mặc định thị lực không kính 6/10 và 7/10, có thể chỉnh lại).
6. **Tai - Mũi - Họng** (Mặc định thính lực nói thường 5m, nói thầm 0.5m).
7. **Răng - Hàm - Mặt** (Khám răng hàm trên, răng hàm dưới).

### 3.4. Tùy chỉnh câu từ nhận xét lâm sàng
Bác sĩ bấm vào mục **`📝 Tùy chỉnh 16 Nội dung khám lâm sàng (Xem / Sửa)`**:
- Tại đây hiển thị sẵn các câu nhận xét chuẩn mực y khoa (ví dụ: *T1T2 đều rõ không có tiếng bệnh lý*, *Lồng ngực cân đối di động đều*, *Bụng mềm không chướng*...).
- Bác sĩ có thể chỉnh sửa theo đúng thói quen chuyên môn của phòng khám.
- Có nút **🔄 Khôi phục chuẩn** để quay về câu từ mặc định ban đầu bất kỳ lúc nào.

### 3.5. Bác sĩ kết luận & Giờ hoàn thành
- Điền **Mã Bác sĩ kết luận** chung.
- Giờ kết thúc khám (ví dụ: `07:45`).
- Ô tích **Tự động bấm Lưu (F11)**: Giúp tự lưu ngay sau khi điền xong.

---

## 4. HƯỚNG DẪN THAO TÁC KHÁM BỆNH HÀNG NGÀY

Tùy vào quy trình đón tiếp và phân công tại cơ sở, Bác sĩ có thể chọn 1 trong 3 cách sau:

### CÁCH 1: Quy trình liên hoàn tự động (Tiếp đón ➔ Sang Khám ➔ Lưu bệnh án)
*Áp dụng khi Bác sĩ làm trọn gói từ khâu tiếp nhận người bệnh:*
1. Tại tab **Tiếp đón khám sức khoẻ**, nhập Họ tên, Ngày sinh, Giới tính của người bệnh.
2. Bấm nút màu tím **`🔄 2. Tiếp Đón ➔ Khám ➔ Lưu`** trên bảng điều khiển (hoặc nhấn phím **F10** trên bàn phím).
3. **Công cụ sẽ tự động thực hiện liên hoàn:**
   - Tự điền các trường bắt buộc tại bàn tiếp đón: Giờ tiếp đón, Mẫu khám 18 tuổi trở lên, Đối tượng khác, Kinh phí xã hội hoá, Lý do khám định kỳ.
   - Tự bấm **Lưu** tiếp đón.
   - Tự chuyển sang **Danh sách khám sức khoẻ** và mở ngay hồ sơ bệnh án của người vừa tiếp đón.
   - Tự điền đầy đủ Thể lực, 16 nhận xét Lâm sàng, Bác sĩ các khoa, Phân loại sức khỏe, Giờ hoàn tất.
   - Tự bấm **Lưu bệnh án (F11)** hoàn tất!

---

### CÁCH 2: Điền nhanh bệnh án đang mở (Khám & Lưu ngay)
*Áp dụng khi Bác sĩ đang mở sẵn màn hình hồ sơ của người bệnh tại tab Khám sức khỏe định kỳ:*
1. Chọn nhanh **Loại 1** hoặc **Loại 2** trên bảng điều khiển nếu cần đổi loại sức khỏe.
2. Bấm nút màu xanh lá **`🚀 ĐIỀN KHÁM THEO BẢNG & LƯU (F9)`** (hoặc nhấn phím **F9** trên bàn phím).
3. Công cụ sẽ tự động điền toàn bộ kết quả khám và lưu hồ sơ trong chưa đầy 3 giây.

---

### CÁCH 3: Chỉ điền các mục bắt buộc tại bàn Tiếp đón
*Áp dụng khi cơ sở có nhân viên tiếp đón riêng, chỉ cần nhập nhanh thông tin đăng ký:*
1. Nhập thông tin hành chính của người bệnh.
2. Bấm nút màu cam **`⚡ 1. Điền Tiếp Đón (*)`**.
3. Công cụ sẽ điền tức thì toàn bộ các thông tin bắt buộc (mẫu KSK, kinh phí, lý do, giờ tiếp đón) để chuyển tiếp.

---

## 5. NHỮNG LƯU Ý DÀNH CHO Y BÁC SĨ

1. **Kiểm tra thông tin định danh:** Công cụ chỉ hỗ trợ điền các thông tin kỹ thuật khám lâm sàng lặp lại. Bác sĩ luôn kiểm tra đối chiếu chính xác Họ tên, Năm sinh, Số CCCD/Định danh của người đến khám.
2. **Cá nhân hóa theo từng trường hợp:** Nếu người bệnh có bệnh lý đặc thù (ví dụ: huyết áp cao, bệnh lý tim mạch, mắt cận thị), Bác sĩ chỉ cần vào mục tương ứng để sửa lại kết quả thực tế trước khi bấm Lưu.
3. **Bảo mật thông tin bệnh nhân:** Toàn bộ thông số cấu hình chỉ lưu trữ cục bộ trên máy tính của Bác sĩ, hoàn toàn không gửi dữ liệu người bệnh đi bất kỳ đâu bên ngoài, đảm bảo tuyệt đối an toàn thông tin y tế.

---

## 6. HỖ TRỢ VÀ CẬP NHẬT

Khi có bản cập nhật mới:
1. Bác sĩ chỉ cần tải lại bản mới về máy và giải nén đè lên thư mục cũ.
2. Vào `chrome://extensions`, bấm nút **Tải lại (biểu tượng xoay tròn)** tại tiện ích là hoàn tất.

*Chúc Quý Y Bác sĩ và Cán bộ Y tế hoàn thành công việc nhanh chóng, chính xác và giảm bớt áp lực thủ tục giấy tờ!*
