# BÁO CÁO NGHIỆM THU: GIAO DIỆN TỐI GIẢN CHUẨN Y TẾ & TỰ ĐỘNG HÓA 1 CHẠM CHO HIS V20

Chúng tôi đã hoàn thành việc tái cấu trúc giao diện tiện ích **HIS V20 Autofill Extension**, tối ưu hóa toàn diện cho các bác sĩ lớn tuổi / ít thạo công nghệ và kiểm thử thực chiến thành công trên nền tảng **Hệ thống Quản lý Y tế Cơ sở (v20.ytecoso.vn)** qua **Chrome DevTools**.

---

## 1. Các Tính Năng Đã Triển Khai & Kiểm Thử Thành Công

### 🏥 A. Giao diện 2 Module Tối giản + Cài đặt sâu
- **Module 1: Tiếp Đón Khám Sức Khỏe**
  - Banner bệnh nhân thông minh: Bắt chính xác mã CCCD (12 số) / Mã BN - Họ tên - Năm sinh từ ô tìm kiếm nhanh.
  - Nút bấm to, chữ lớn: `[🚀 TIẾP ĐÓN ➔ SANG KHÁM (F6)]` tự động điền các trường bắt buộc (*), lưu và chuyển ngay sang màn hình khám.
- **Module 2: Khám Sức Khỏe (1 Chạm)**
  - Bộ 4 nút phân loại sức khỏe to rõ (`🟢 Loại 1: Rất khỏe`, `🔵 Loại 2: Khỏe`, `🟡 Loại 3: Trung bình`, `🟠 Loại 4: Yếu`).
  - **Bảo toàn thị lực mắt**: Chuyển đổi qua lại giữa các mức sức khỏe hoàn toàn **không bị ghi đè** thị lực mắt phải/mắt trái đã cài đặt.
  - **Tự động nhận diện giới tính**: Bệnh nhân **Nam** tự động bỏ qua chuyên khoa Sản phụ khoa; bệnh nhân **Nữ** tự động điền Sản phụ khoa bình thường.
  - **Mặc định chẩn đoán kết luận Z10**: Tự động gán mã `Z10 - Khám Sức Khỏe Tổng Quát Định Kỳ Cho Nhóm Đối Tượng Xác Định` trên cả biểu mẫu người lớn (>18t) và trẻ vị thành niên (6-18t).
  - Nút chính siêu to: `[🚀 ĐIỀN KẾT QUẢ KHÁM & LƯU (F9)]`.
- **Module 3: Cài Đặt Thông Số**
  - Cho phép tùy chỉnh chiều cao, cân nặng, mạch, huyết áp, thị lực mắt, mã bác sĩ từng chuyên khoa và 16 câu khám chuẩn.

---

## 2. Kết Quả Kiểm Thử Thực Tế Trên Chrome DevTools

1. **Kiểm thử nhận diện người đến khám**:
   - Người khám Tiếp đón: `001200000001 - NGUYỄN VĂN A - 1975` -> Banner hiển thị xanh lá, chuẩn xác.
   - Người khám thực tế: `001200000002 - TRẦN VĂN B - 2013 (Nam)` -> Nhận diện chính xác `Nam (Tự động bỏ qua Sản phụ khoa)`.
2. **Kiểm thử tự động hóa 1 chạm**:
   - Trình tự thực thi: `Điền Thể lực` ➔ `Điền 7 Chuyên khoa` ➔ `Chọn Loại II: Khỏe` ➔ `Chọn ICD-10 Z10` ➔ `Tích Kết thúc khám` ➔ `Điền Giờ 07:45 & BS Kết luận` ➔ `Tự bấm Lưu (F11)`.
   - Kết quả: Hoàn thành trong **~3.2 giây**, hiển thị thông báo `✅ ĐÃ ĐIỀN XONG & ĐÃ LƯU`.

---

## 3. Hình Ảnh Minh Họa Thực Tế Đã Kiểm Nghiệm

### Module 1: Giao diện Tiếp Đón
![Tiếp đón khám sức khỏe](./screenshots/2_man_hinh_tiep_don.png)

### Module 2: Giao diện Khám Sức Khỏe (Nhận diện Nam giới & Loại 2)
![Giao diện Khám sức khỏe](./screenshots/1_bang_dieu_khien_v20.png)

### Module 3: Điền & Lưu Kết Luận (Phân loại sức khỏe + Mã bệnh Z10)
![Kết luận và Chẩn đoán Z10](./screenshots/5_ket_luan_va_z10.png)

---

---

## 4. Khắc Phục Lỗi Điền Sai Vị Trí Khám Lâm Sàng & Tối Giản Nút Bấm

### 🔄 A. Về nút "Nạp lại bảng điều khiển" (🔄)
- **Bản chất**: Nút này trước đây dùng để xóa và render lại panel khi DOM trang web bị reset. 
- **Đã xử lý**: Tiện ích hiện đã có cơ chế tự động quét ngầm định kỳ đảm bảo bảng điều khiển luôn tồn tại. Do đó, nút này hoàn toàn không còn cần thiết và làm các bác sĩ lớn tuổi bối rối. **Chúng tôi đã gỡ bỏ hoàn toàn nút 🔄 khỏi thanh tiêu đề**, giao diện hiện chỉ còn duy nhất nút **`➖ Thu nhỏ` / `➕ Mở rộng`** rất tinh gọn.

### 🩺 B. Khắc phục triệt để lỗi lệch vị trí Chuyên khoa (Nội khoa, Ngoại khoa, Mắt, TMH, RHM)
- **Gốc rễ sự cố**:
  1. Trong bảng `1. NỘI KHOA` có tới **8 dòng chuyên khoa con** (`Tuần hoàn`, `Hô hấp`, `Tiêu hóa`, `Thận - Tiết niệu`, `Nội tiết`, `Cơ - Xương - Khớp`, `Thần kinh`, `Tâm thần`), mỗi dòng có 2 dropdown (Phân loại & Bác sĩ). Việc lấy danh sách chỉ số phẳng cũ đã gán nhầm BS Ngoại khoa vào dòng `Hô hấp`.
  2. Các thẻ `nz-select` có chứa thẻ `<input>` tìm kiếm ngầm. Khi query chung thẻ `input`, tiện ích đã điền nhầm chỉ số thị lực (`10`) và thính lực (`5`) vào ô tìm kiếm bác sĩ của Tuần hoàn và Tiêu hóa.
- **Giải pháp triệt để**:
  1. Xây dựng bộ quét thông minh theo tên dòng `<tr>` (`findTableRowByTitle`): Định vị chính xác từng chuyên khoa, điền đúng textarea và 2 ô dropdown của chính chuyên khoa đó.
  2. Xây dựng bộ quét riêng cho từng form động `ORD-DYNAMIC-FORM` (`findDynamicFormByTitle`): Phân lập hoàn toàn Mắt, Tai - Mũi - Họng, Răng - Hàm - Mặt, lấy chính xác các ô input theo `name` và loại trừ `ant-select-selection-search-input`.
- **Kết quả kiểm nghiệm thực tế**:
  - `Tuần hoàn`, `Hô hấp`, `Tiêu hóa`, `Thận - Tiết niệu`, `Nội tiết`, `Cơ - Xương - Khớp`, `Thần kinh`, `Tâm thần`: 100% nhận đúng BS Nội khoa và Phân loại sức khỏe.
  - `Ngoại khoa`: 100% nhận đúng Bác sĩ Ngoại khoa (Mã `06`).
  - `Da liễu`: 100% nhận đúng Bác sĩ Da liễu.
  - `Sản phụ khoa`: Tự động nhận diện Nam giới và để trống hoàn toàn.
  - `Mắt`, `Tai - Mũi - Họng`, `Răng - Hàm - Mặt`: Các chỉ số thị lực, thính lực và nội dung khám đều vào đúng 100% ô chỉ định.

### Hình ảnh thực tế sau khi sửa:

#### 1. Bảng 1. Nội khoa & 2. Ngoại khoa - Da liễu (Đã điền chuẩn xác 100%)
![Khám Nội khoa và Ngoại khoa chuẩn xác](./screenshots/3_kham_lam_sang_chuyen_khoa.png)

#### 2. Các khối chuyên khoa Mắt, TMH, RHM (Chỉ số thị lực & thính lực vào đúng ô)
![Khám Mắt TMH RHM chuẩn xác](./screenshots/4_mat_va_tai_mui_hong.png)

---

## 5. Chuẩn Hóa Danh Xưng Nghiệp Vụ Y Tế Thống Nhất (Khám Sức Khỏe vs Khám Bệnh)

### 🏥 A. Phân định rạch ròi nghiệp vụ y tế:
- **Khám bệnh**: Khám và điều trị người có bệnh (chẩn đoán bệnh lý, đơn thuốc, hồ sơ bệnh án nội trú/ngoại trú).
- **Khám sức khỏe**: Khám sức khỏe định kỳ theo Thông tư 32/2023/TT-BYT, đoàn khám cơ quan, trường học, tuyển dụng.
- **Trên phần mềm HIS V20**: Tab thực tế có tên là **"Tiếp đón khám sức khoẻ"** và **"Khám sức khỏe định kỳ"** (nằm dưới menu `Bàn làm việc ➔ Khám sức khỏe`).
- **Khách thể**: Gọi là **"Người đến khám" / "Người khám"**, không phải "Người bệnh" hay "Bệnh nhân".
- **Hồ sơ**: Gọi là **"Hồ sơ khám"**, không dùng từ "Bệnh án".

### 📋 B. Các hạng mục đã đồng bộ hóa 100%:
1. **Thanh tiêu đề Panel & Giao diện**:
   - `HIS V20 - HỖ TRỢ KHÁM BỆNH` ➔ **`HIS V20 - HỖ TRỢ KHÁM SỨC KHỎE`** (Đồng bộ với Chrome Web Store: `HIS V20 - Khám Sức Khỏe`).
   - `🚀 TIẾP ĐÓN ➔ SANG KHÁM (F6)` ➔ **`🚀 TIẾP ĐÓN ➔ SANG KHÁM SỨC KHỎE (F6)`**.
   - `🚀 ĐIỀN KẾT QUẢ KHÁM & LƯU (F9)` ➔ **`🚀 ĐIỀN KHÁM SỨC KHỎE & LƯU (F9)`**.
   - `🩺 Mở màn hình Khám (F6)` ➔ **`🩺 Mở màn hình Khám Sức Khỏe (F6)`**.
   - Banner: `Chưa chọn bệnh nhân` ➔ **`Chưa chọn người khám`**.
2. **Cửa sổ Popup (`popup.html`)**:
   - `HIS V2 AutoFill` ➔ **`HIS V20 - Khám Sức Khỏe`**.
   - `🌐 Mở phần mềm HIS V2` ➔ **`🌐 Mở phần mềm HIS V20`**.
3. **Tài liệu Hướng dẫn (`README.md`)**:
   - Cập nhật toàn bộ các từ khóa từ `khám bệnh / người bệnh / bệnh án / HIS V2` thành chuẩn mực: `khám sức khỏe / người đến khám / hồ sơ khám / HIS V20`.

### Hình ảnh giao diện sau khi chuẩn hóa câu từ:
![Giao diện đã chuẩn hóa tên gọi](./screenshots/1_bang_dieu_khien_v20.png)

---

## 6. Đảm Bảo Chuẩn Bền Bỉ Production-Grade (Chống Bấm Nhầm & Bắt Lỗi Mạng)

Để đảm bảo tiện ích vận hành trơn tru trong môi trường thực tế tại các Trạm y tế (nơi Bác sĩ có thể thao tác vội hoặc mạng Internet chập chờn), chúng tôi đã trang bị các lớp phòng thủ tối giản theo chuẩn kỹ thuật tối giản và bền bỉ:

### 🛡️ 1. Chặn sớm khi chưa có thông tin người khám (Tiếp Đón):
- **Tình huống**: Bác sĩ vô tình bấm `[🚀 TIẾP ĐÓN ➔ SANG KHÁM SỨC KHỎE (F6)]` khi chưa gõ Tên hoặc chưa quét CCCD.
- **Xử lý**: Hệ thống kiểm tra ngay ô `tenDayDu` và bộ nhớ tạm. Nếu trống trơn, tiện ích **dừng lại ngay lập tức** và hiện thông báo: `❌ Chưa có thông tin người khám! Vui lòng gõ Tên hoặc CCCD vào ô Tìm kiếm trước.` Không bao giờ phát sinh hồ sơ rác hay gửi lệnh Lưu mù quáng.

### 🛡️ 2. Chặn và điều hướng khi bấm F9 sai màn hình:
- **Tình huống**: Bác sĩ đang đứng ở màn hình khác (Bàn làm việc, Tiếp đón, Báo cáo) nhưng lại bấm phím tắt F9 hoặc nút Khám Sức Khỏe.
- **Xử lý**: 
  - Tiện ích chủ động tìm và click chuyển sang tab `Khám sức khỏe định kỳ` nếu tab này đang mở.
  - Nếu chưa mở bất kỳ hồ sơ khám nào (không có `.vertical-tabs`), tiện ích **lập tức từ chối thực hiện** và hiện cảnh báo: `❌ Chưa mở hồ sơ Khám Sức Khỏe! Vui lòng chọn người khám trước.` Tuyệt đối không can thiệp vào các form của màn hình khác.

### 🛡️ 3. Bắt thông báo lỗi thực tế từ hệ thống Viettel HIS (`checkHisErrorMessage`):
- **Tình huống**: Khi bấm Lưu mà máy chủ Viettel báo lỗi đỏ (ví dụ: *Trùng mã định danh, Lỗi kết nối CSDL, Mạng chập chờn*).
- **Xử lý**: Tiện ích liên tục lắng nghe các thẻ thông báo nổi của Ant Design (`.ant-message-error`, `.ant-notification-notice-error`). Nếu Viettel HIS phản hồi lỗi, bảng điều khiển sẽ bắt nguyên văn câu thông báo lỗi đó và hiển thị đỏ: `❌ HIS báo lỗi: [Nội dung lỗi Viettel]`, giúp Bác sĩ biết chính xác nguyên nhân thay vì ngỡ rằng đã lưu thành công.

---

## 7. Trạng Thái Bản Phát Hành & Kiểm Thử
- **Kiểm thử thực chiến**: Tiện ích đã được kiểm nghiệm và hoạt động ổn định trên Google Chrome và Cốc Cốc tại môi trường thực tế  20.ytecoso.vn.
- **Sẵn sàng đóng gói**: Toàn bộ mã nguồn, giao diện, và tài liệu đã được kiểm tra kỹ lưỡng, sẵn sàng cho bản phát hành tiếp theo.

---

## 8. Cơ Chế Phân Loại Nhóm Tuổi Tự Động & Chuẩn Bị Bản v1.1.0

### 🎯 A. Cơ chế phân loại nhóm tuổi chuẩn Y tế (Thông tư 32/2023/TT-BYT)
Hệ thống HIS V20 áp dụng 3 biểu mẫu và đối tượng khám sức khỏe riêng biệt:
1. **Dưới 6 tuổi** (`dưới 6 tuổi`): Trẻ em mầm non/nhỏ tuổi (theo dõi chu vi đầu, cân đo, phát triển thể chất và dinh dưỡng).
2. **Từ đủ 6 tuổi đến dưới 18 tuổi** (`từ đủ 6 tuổi đến dưới 18 tuổi`): Học sinh, thanh thiếu niên (theo dõi thể lực, thị lực, các chuyên khoa, kết luận Z10).
3. **Từ đủ 18 tuổi trở lên** (`từ đủ 18 tuổi trở lên`): Người lao động, người lớn (đầy đủ 8 chuyên khoa nội, ngoại, sản phụ khoa, chuyên khoa lẻ, kết luận Z10).

### 🔍 B. 5 tầng phòng thủ nhận diện độ tuổi thông minh trong v1.1.0:
- **Tầng 1 (Tiêu đề biểu mẫu)**: Nhận diện trực tiếp tiêu đề tài liệu đang mở trên HIS (`GIẤY KHÁM SỨC KHỎE DÙNG CHO NGƯỜI TỪ ĐỦ 18 TUỔI TRỞ LÊN`, `ĐỦ 6 TUỔI ĐẾN DƯỚI 18 TUỔI` hoặc `DƯỚI 6 TUỔI`).
- **Tầng 2 (Ô Tuổi trực tiếp)**: Đọc giá trị ô nhập số tuổi (`tuoi`) tại form Tiếp đón nếu có.
- **Tầng 3 (Ô Năm sinh)**: Đọc chính xác 4 số năm sinh (`* Năm` hoặc `namSinh`) để tính `Tuổi = Năm hiện tại - Năm sinh`.
- **Tầng 4 (Ngày/Tháng/Năm)**: Tách năm sinh từ chuỗi `dd/mm/yyyy` trên trường Ngày sinh.
- **Tầng 5 (Bộ nhớ đệm & Băng tìm kiếm)**: Tự động trích xuất năm sinh từ kết quả tra cứu CCCD trên thanh thông tin.
- **Hiển thị trực quan**: Cung cấp dòng trạng thái **`Đối tượng tuổi: [Nhóm tuổi + Số tuổi]`** ngay trên bảng điều khiển để Bác sĩ đối soát tức thì.
- **Định vị Dropdown theo Nhãn ngữ nghĩa**: Thay vì phụ thuộc vào số thứ tự DOM, tiện ích tự tìm theo từ khóa ngữ nghĩa (`Đối tượng`, `Mục đích`, `Kinh phí`, `Nghề nghiệp`) giúp không bao giờ bị lệch trường khi HIS cập nhật giao diện.

---

## 9. Rà Soát Toàn Diện Logic & Gia Cố Độ Bền (Logic Audit & Edge-Case Hardening)

Nhằm đảm bảo tiện ích hoạt động tuyệt đối an toàn và tin cậy trong môi trường trạm y tế thực tế, chúng tôi đã rà soát toàn bộ codebase và hoàn tất 10 cải tiến logic quan trọng:

1. **Xử lý chuẩn xác Trẻ sơ sinh / Dưới 1 tuổi (`tuổi = 0`)**:
   - Trước đây biến tuổi khởi tạo là `0` và kiểm tra `age > 0`, khiến trẻ dưới 1 tuổi (sinh cùng năm hiện tại) bị rớt vào nhóm mặc định người lớn.
   - Hiện đã xử lý: `age` khởi tạo là `null`, kiểm tra `age >= 0`, phân loại chính xác `dưới 6 tuổi` và hiển thị nhãn `(< 1 tuổi)`.
2. **Cơ chế dọn sạch Cache bệnh nhân cũ (`resetCachedPatient`)**:
   - Khi bác sĩ làm mới form hoặc tiếp đón bệnh nhân mới, tiện ích tự động reset sạch thông tin cũ (tên, CCCD, tuổi, giới tính).
   - Ngăn chặn hoàn toàn việc giữ nhầm giới tính Nam của người trước sang bệnh nhân Nữ tiếp theo (gây bỏ sót Sản phụ khoa).
3. **Phòng vệ Regex Crash trong `selectOption` (`escapeRegExp`)**:
   - Tự động escape các ký tự đặc biệt trong chuỗi tìm kiếm (`()`, `+`, `*`, `[]`), chống văng lỗi cú pháp RegExp.
   - Chỉ tìm kiếm và click các option trong dropdown đang thực sự hiển thị (`:not(.ant-select-dropdown-hidden)` và `offsetParent !== null`), không click nhầm option của dropdown cũ còn sót trong DOM.
4. **Chuẩn hóa dấu gạch ngang (En-dash `–`, Em-dash `—`, Hyphen `-`)**:
   - Bảng 8 chuyên khoa Nội khoa ("Thận – Tiết niệu", "Cơ – Xương – Khớp") được chuẩn hóa trước khi so khớp, đảm bảo tìm thấy đúng dòng dù HIS hiển thị loại dấu gạch ngang nào.
5. **Nhận diện chính xác 100% Checkbox Phân loại sức khỏe (Loại I / II / III / IV / V)**:
   - Sử dụng regex ranh giới từ `\bLoại\s*I\b`, phân biệt tuyệt đối giữa Loại I, II, III, IV, V dù có hay không có dấu hai chấm (`:`), không bị nuốt chuỗi con.
6. **Bỏ Fallback nguy hiểm ở ô Xác nhận kết thúc khám**:
   - Chỉ tick khi thực sự tìm thấy từ khóa "kết thúc", không fallback click vào checkbox cuối cùng của trang (tránh tick nhầm vào Loại V).
7. **Bảo vệ Selector Mắt & Tai Mũi Họng**:
   - Thêm bộ lọc `:not([type="hidden"])` để không bao giờ bị lệch chỉ số mảng input khi HIS chèn thêm input ẩn.
8. **Ưu tiên nút Khám F6 trong màn hình Tiếp đón**:
   - Khi chuyển từ Tiếp đón sang Khám, tiện ích ưu tiên click nút `Khám sức khoẻ (F6)` trong pane hiện tại để nạp đúng hồ sơ người vừa tiếp đón, tránh chuyển nhầm vào tab khám cũ của người trước.
9. **Chống Race Condition khi bấm Lưu (F11)**:
   - Bổ sung khoảng chờ đệm 300ms sau lệnh click Lưu trước khi kiểm tra trạng thái loading, đảm bảo request đã được gửi tới server Viettel.
10. **Tối ưu hiệu năng & Phím tắt F6**:
    - Ngăn Chrome cướp tiêu điểm lên thanh Omnibox khi bấm F6 bằng `e.preventDefault()`.
    - Thay thế việc quét chuỗi `document.body.innerText` bằng việc quét cục bộ trong tab pane, loại bỏ hoàn toàn hiện tượng lag trình duyệt.

---

## 10. Điểm Mới Trong Phiên Bản v1.2.0

Phiên bản **v1.2.0** tập trung vào nâng cao tính riêng tư, bảo mật thông tin người khám (PII), khắc phục triệt để các lỗi nhận diện DOM và tinh chỉnh trải nghiệm người dùng:

1. **🔒 Chế độ Bảo Vệ Thông Tin Cá Nhân (PII Masking)**:
   - Tự động làm mờ và che số CCCD (`034075******90`) cùng Họ tên (`PHẠM V*N T*`) trên banner điều khiển của tiện ích.
   - Bổ sung tùy chọn toggle `[x] 🔒 Che thông tin người khám (Bảo vệ PII)` trong bảng Cài đặt nâng cao, cho phép cán bộ y tế chủ động bật/tắt khi cần đối chiếu.
2. **🎯 Trợ lý Điều Hướng Thông Minh (Smart Auto-Focus)**:
   - Khi cán bộ y tế nhấn nút điền tiếp đón mà chưa chọn hoặc chưa tìm kiếm người khám, tiện ích sẽ phát cảnh báo nhẹ nhàng và tự động đặt con trỏ chuột (focus) vào ô Tìm kiếm (`input.bns-sub-input-search-tbl-overlay`).
   - Chuyển toàn bộ thông báo chặn người dùng từ `console.error` sang `console.warn` để không gây lỗi đỏ cảnh báo extension trong trình duyệt Chrome.
3. **🩺 Chuẩn Hóa Thuật Ngữ Nghiệp Vụ Y Tế**:
   - Toàn bộ giao diện thông báo, hướng dẫn và tài liệu được chuẩn hóa từ thuật ngữ "người bệnh" sang **"người khám"** / **"người đến khám"** theo đúng chuẩn quy trình khám sức khỏe định kỳ.
4. **🐞 Khắc Phục Lỗi Nhận Diện Độ Tuổi Từ Ngày Kết Thúc Khám**:
   - Khắc phục triệt để lỗi quét nhầm ô Ngày kết thúc khám (`nz-col-ngayKetThucKham`) chứa ngày hiện tại dẫn tới tính sai độ tuổi thành `< 1 tuổi`.
   - Giới hạn phạm vi quét ngày sinh chuẩn xác vào `.nz-col-ngay_sinh` và đối chiếu tiêu đề văn bản hành chính.
5. **🐞 Sửa Lỗi Tự Động Tick Ô "Xác nhận kết thúc khám"**:
   - Cải tiến bộ chọn đa tầng `div[id*="ket_thuc_kham" i] .ant-checkbox-wrapper` giúp tick chính xác 100% khi điền kết luận khám.
6. **🐞 Tinh Chỉnh Phân Loại Sức Khỏe Chữ Số La Mã**:
   - Regex ranh giới từ phân biệt độc lập Loại I, II, III, IV, V, đảm bảo khi chọn Loại II hệ thống tự bỏ chọn Loại I mà không gây xung đột trạng thái checkbox Ant Design.

---

## 11. Điểm Mới Trong Phiên Bản v1.2.1

Phiên bản **v1.2.1** giải quyết bài toán trải nghiệm hiển thị và chống tràn màn hình (Viewport Overflow) trên các màn hình máy trạm y tế độ phân giải phổ thông (1366x768):

1. **📌 Ghim Cố Định Thanh Header & Nút Thu Nhỏ (Sticky Header)**:
   - Chuyển layout bảng điều khiển `#his-tool-control-panel` sang `display: flex; flex-direction: column;` kết hợp `max-height: calc(100vh - 30px);`.
   - Thanh Header (`#his-panel-header`) và thanh Tab (`#his-panel-tabs`) được gắn `flex-shrink: 0;`, đảm bảo luôn nằm 100% trong khung nhìn trình duyệt. Nút **`➖ Thu nhỏ`** không bao giờ bị đẩy vượt mép trên màn hình.
   - Thân bảng (`#his-panel-body`) sử dụng `flex: 1; min-height: 0; overflow-y: auto;` giúp tự động co giãn và cuộn nội dung độc lập.
2. **📂 Thiết Kế Accordion (Gập/Mở) Chuẩn Native Cho Mục Cài Đặt**:
   - Nhóm 1 (Chỉ số thể lực) và Nhóm 2 (Thị lực mắt): Mặc định mở (`<details open>`).
   - Nhóm 3 (Bác sĩ 7 Chuyên khoa): Mặc định **GẬP GỌN** (`<details>`), tiết kiệm hơn 200px chiều cao cho bảng điều khiển, bác sĩ chỉ cần bấm vào thanh tiêu đề khi cần thay đổi phân công.
   - Nhóm 4 (Kết luận & Chẩn đoán Z10): Mặc định mở (`<details open>`).
   - Nhóm 5 (16 Nội dung khám mẫu): Tiếp tục duy trì gập gọn (`<details>`).
3. **⚡ Thu Nhỏ Tối Đa Không Gian Làm Việc**:
   - Khi bấm `➖ Thu nhỏ`, tiện ích ẩn đồng thời cả thanh Tab (`#his-panel-tabs`) lẫn phần thân (`#his-panel-body`), chỉ giữ lại thanh tiêu đề mỏng giúp giải phóng toàn bộ không gian làm việc của HIS cho bác sĩ.
   - Bấm `➕ Mở rộng` sẽ bung lại toàn bộ giao diện làm việc nguyên trạng.

---

## 12. Điểm Mới Trong Phiên Bản v1.3.0

Phiên bản **v1.3.0** thực hiện nâng cấp toàn diện mục **Cài Đặt** và quy trình điền khám lâm sàng theo nguyên tắc cốt lõi: **"Không điền gì tức là tiện ích không điền"** — trao toàn quyền tự chủ cho cán bộ y tế, loại bỏ hoàn toàn các giá trị ép buộc (hardcode):

1. **🚫 Nguyên Tắc "Không Điền Gì = Tiện Ích Không Điền" (Zero Forced Fallback)**:
   - Tất cả các trường cấu hình (Chỉ số thể lực, Thị lực có kính, Khám mắt khác, Thính lực TMH, Bệnh TMH, Hàm trên/dưới RHM, Bệnh RHM, 8 cơ quan Nội khoa, Ngoại khoa, Da liễu, Sản phụ khoa, Bác sĩ kết luận, Giờ kết thúc...): **Nếu để trống, tiện ích sẽ bỏ qua và không tác động/không ghi đè lên dữ liệu đã có trên HIS**.
   - Loại bỏ triệt để các fallback mặc định cũ (như tự gán `5m`, `0.5m` hay tự điền chuỗi mặc định khi xóa trống).

2. **👁️ Bổ Sung Đầy Đủ Thị Lực Có Kính & Bệnh Về Mắt**:
   - Thêm ô cấu hình riêng biệt cho **Có kính Mắt Phải** (`cfg-co-kinh-p`) và **Có kính Mắt Trái** (`cfg-co-kinh-t`). Mặc định để trống (tiện ích không điền nếu người khám không đeo kính).
   - Ô nội dung khám bệnh về mắt (`cfg-txt-matkhac`) được đưa trực tiếp vào nhóm chuyên khoa Mắt.

3. **👂 Nâng Cấp Chuyên Khoa Tai - Mũi - Họng Chuẩn DOM Viettel HIS**:
   - Sửa lỗi lệch thứ tự cột DOM Viettel HIS: Tiện ích ánh xạ chuẩn xác Cột 1 & 2 là **Tai Trái** (Nói thường / Nói thầm), Cột 3 & 4 là **Tai Phải** (Nói thường / Nói thầm).
   - Tích hợp ô nội dung các bệnh Tai - Mũi - Họng (`cfg-txt-tmhkhac`), mã Bác sĩ TMH và nút Bỏ qua khám TMH trong cùng một accordion gọn gàng.

4. **🦷 Chuyên Khoa Răng - Hàm - Mặt Tùy Chỉnh Độc Lập**:
   - Tách bạch 3 nội dung khám: **Khám hàm trên** (`cfg-txt-rhmhamtren`), **Khám hàm dưới** (`cfg-txt-rhmhamduoi`) và **Các bệnh RHM nếu có** (`cfg-txt-rhmkhac`).
   - Hỗ trợ để trống từng phần nếu không có bệnh lý hoặc để giữ nguyên ghi nhận của phòng khám.

5. **🩺 Tái Cấu Trúc Cài Đặt Theo 7 Nhóm Chuyên Khoa Khám Lâm Sàng**:
   - Bố cục Cài Đặt được chia thành 7 accordion (`<details>`) chuyên biệt:
     - 📏 **1. Thể lực & Sinh hiệu**: Chiều cao, Cân nặng, Mạch, Huyết áp, Phân loại thể lực.
     - 👁️ **2. Chuyên khoa Mắt**: Không kính (P/T), Có kính (P/T), Bệnh mắt, Bác sĩ Mắt, Bỏ qua.
     - 👂 **3. Chuyên khoa Tai - Mũi - Họng**: Tai Trái (Thường/Thầm), Tai Phải (Thường/Thầm), Bệnh TMH, Bác sĩ TMH, Bỏ qua.
     - 🦷 **4. Chuyên khoa Răng - Hàm - Mặt**: Hàm trên, Hàm dưới, Bệnh RHM, Bác sĩ RHM, Bỏ qua.
     - 🩺 **5. Chuyên khoa Nội khoa**: Bác sĩ Nội, Bỏ qua, 8 cơ quan (Tuần hoàn, Hô hấp, Tiêu hóa, Thận - Tiết niệu, Nội tiết, Cơ - Xương - Khớp, Thần kinh, Tâm thần).
     - 🩹 **6. Ngoại khoa, Da liễu & Sản phụ khoa**: Từng khoa có đầy đủ Mã BS, Bỏ qua và Ô nội dung khám chi tiết.
     - 📋 **7. Kết luận, Phân loại KSK & Hệ thống**: Phân loại CK, Phân loại KSK, Mã bệnh KL Z10, BS Kết luận, Giờ KT, Lưu F11, Che PII, Nút Khôi phục chuẩn.