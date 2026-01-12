import type { HelpTopic } from '@tdc/schemas';

/**
 * Static help content for the Admin User Guide
 * Categories: getting-started, student-management, course-management, tracking, settings, faq
 */
export const helpTopics: HelpTopic[] = [
  // ==================== GETTING STARTED ====================
  {
    id: 'gs-login',
    title: 'Đăng nhập hệ thống',
    category: 'getting-started',
    content: `
## Đăng nhập hệ thống

### Bước 1: Truy cập trang đăng nhập
Mở trình duyệt và truy cập địa chỉ đăng nhập Admin.

### Bước 2: Nhập thông tin
- **Email**: Nhập email admin của bạn
- **Mật khẩu**: Nhập mật khẩu

### Bước 3: Xác nhận
Click nút **Đăng nhập** để vào hệ thống.

> **Lưu ý**: Nếu quên mật khẩu, click vào "Quên mật khẩu" để reset.
    `.trim(),
    order: 1,
  },
  {
    id: 'gs-dashboard',
    title: 'Tổng quan Dashboard',
    category: 'getting-started',
    content: `
## Tổng quan Dashboard

Dashboard là trang chính hiển thị các thông tin quan trọng:

### Thống kê nhanh
- **Tổng học viên**: Số lượng học viên trong hệ thống
- **Khóa học**: Số khóa học đang hoạt động
- **Đang online**: Số học viên đang truy cập

### Quick Actions
Các nút thao tác nhanh để:
- Thêm học viên mới
- Tạo khóa học
- Xem tracking

### Hoạt động gần đây
Danh sách các hoạt động mới nhất trong hệ thống.
    `.trim(),
    order: 2,
  },
  {
    id: 'gs-navigation',
    title: 'Điều hướng trong hệ thống',
    category: 'getting-started',
    content: `
## Điều hướng trong hệ thống

### Sidebar Menu
Menu bên trái chứa các mục chính:

- **Dashboard**: Trang tổng quan
- **Học viên**: Quản lý học viên
- **Khóa học**: Quản lý khóa học
- **Học kỳ**: Quản lý học kỳ
- **Chuyên ngành**: Quản lý chuyên ngành
- **Tracking**: Theo dõi tiến độ
- **Lab Settings**: Cài đặt phòng lab
- **Cài đặt**: Cấu hình hệ thống
- **Hướng dẫn**: Trang này

### Header
- **Thông báo**: Xem các thông báo mới
- **Profile**: Thông tin tài khoản và đăng xuất
    `.trim(),
    order: 3,
  },

  // ==================== STUDENT MANAGEMENT ====================
  {
    id: 'sm-create',
    title: 'Tạo học viên mới',
    category: 'student-management',
    content: `
## Tạo học viên mới

### Bước 1: Vào trang Học viên
Click menu **Học viên** ở sidebar.

### Bước 2: Click nút Thêm
Click nút **Thêm học viên** ở góc phải trên.

### Bước 3: Điền thông tin
- **Họ tên**: Tên đầy đủ của học viên
- **Email**: Email đăng nhập (bắt buộc)
- **Số điện thoại**: Số liên lạc
- **Học kỳ**: Chọn học kỳ đăng ký

### Bước 4: Lưu
Click **Lưu** để tạo học viên. Hệ thống sẽ tự động tạo mật khẩu.

> **Tip**: Có thể gửi email thông tin đăng nhập cho học viên sau khi tạo.
    `.trim(),
    order: 1,
  },
  {
    id: 'sm-import',
    title: 'Import học viên từ Excel',
    category: 'student-management',
    content: `
## Import học viên từ Excel

### Bước 1: Chuẩn bị file Excel
File Excel cần có các cột:
- **Họ tên** (bắt buộc)
- **Email** (bắt buộc)
- **Số điện thoại** (tùy chọn)

### Bước 2: Click Import
Vào trang **Học viên** > Click nút **Import**.

### Bước 3: Chọn file
Chọn file Excel từ máy tính.

### Bước 4: Xem preview
Kiểm tra dữ liệu trước khi import:
- Dòng xanh: Hợp lệ
- Dòng đỏ: Có lỗi (email trùng, thiếu thông tin)

### Bước 5: Xác nhận
Click **Import** để thêm các học viên hợp lệ.

> **Lưu ý**: Các dòng lỗi sẽ được bỏ qua và hiển thị trong báo cáo.
    `.trim(),
    order: 2,
  },
  {
    id: 'sm-edit',
    title: 'Chỉnh sửa thông tin học viên',
    category: 'student-management',
    content: `
## Chỉnh sửa thông tin học viên

### Bước 1: Tìm học viên
Sử dụng ô tìm kiếm hoặc bộ lọc để tìm học viên.

### Bước 2: Mở chi tiết
Click vào tên học viên hoặc nút **Chi tiết**.

### Bước 3: Chỉnh sửa
Cập nhật các thông tin cần thiết:
- Họ tên
- Số điện thoại
- Học kỳ
- Trạng thái

### Bước 4: Lưu
Click **Lưu thay đổi** để cập nhật.
    `.trim(),
    order: 3,
  },
  {
    id: 'sm-email',
    title: 'Gửi email cho học viên',
    category: 'student-management',
    content: `
## Gửi email cho học viên

### Yêu cầu
Cần kết nối Gmail trong **Cài đặt** trước khi gửi email.

### Gửi email đơn lẻ
1. Vào chi tiết học viên
2. Click **Gửi email**
3. Chọn template (Thông tin đăng nhập, Thông báo...)
4. Xem preview và gửi

### Gửi email hàng loạt
1. Chọn nhiều học viên (checkbox)
2. Click **Gửi email**
3. Chọn template
4. Xác nhận gửi

> **Tip**: Kiểm tra email test trước khi gửi hàng loạt.
    `.trim(),
    order: 4,
  },

  // ==================== COURSE MANAGEMENT ====================
  {
    id: 'cm-create',
    title: 'Tạo khóa học mới',
    category: 'course-management',
    content: `
## Tạo khóa học mới

### Bước 1: Vào trang Khóa học
Click menu **Khóa học** ở sidebar.

### Bước 2: Click Tạo mới
Click nút **Tạo khóa học** ở góc phải.

### Bước 3: Điền thông tin cơ bản
- **Tên khóa học**: Tên hiển thị
- **Mô tả**: Mô tả ngắn về khóa học
- **Học kỳ**: Chọn học kỳ
- **Thứ tự**: Vị trí trong danh sách

### Bước 4: Thêm bài học
Click **Thêm bài học** để tạo các lesson:
- Tiêu đề bài học
- Link Genially
- Thời lượng

### Bước 5: Lưu
Click **Lưu** để tạo khóa học.
    `.trim(),
    order: 1,
  },
  {
    id: 'cm-genially',
    title: 'Tích hợp Genially',
    category: 'course-management',
    content: `
## Tích hợp Genially

### Genially là gì?
Genially là nền tảng tạo nội dung tương tác. TDC sử dụng Genially cho các bài học.

### Lấy link Genially
1. Mở bài Genially của bạn
2. Click **Share** > **Link**
3. Copy link có dạng: \`https://view.genially.com/...\`

### Thêm vào bài học
1. Mở khóa học cần chỉnh sửa
2. Thêm hoặc sửa bài học
3. Dán link Genially vào ô **Link bài học**
4. Lưu

### Kiểm tra
Sau khi lưu, có thể xem preview để đảm bảo Genially hiển thị đúng.

> **Lưu ý**: Chỉ hỗ trợ link Genially public.
    `.trim(),
    order: 2,
  },
  {
    id: 'cm-semester',
    title: 'Quản lý học kỳ',
    category: 'course-management',
    content: `
## Quản lý học kỳ

### Tạo học kỳ mới
1. Vào menu **Học kỳ**
2. Click **Tạo học kỳ**
3. Điền thông tin:
   - Tên học kỳ
   - Ngày bắt đầu
   - Ngày kết thúc
4. Lưu

### Gán khóa học vào học kỳ
1. Mở chi tiết học kỳ
2. Click **Thêm khóa học**
3. Chọn các khóa học cần thêm
4. Sắp xếp thứ tự nếu cần

### Xóa học kỳ
- Chỉ xóa được học kỳ không có học viên đăng ký
- Các khóa học sẽ không bị xóa theo
    `.trim(),
    order: 3,
  },

  // ==================== TRACKING ====================
  {
    id: 'tr-overview',
    title: 'Tổng quan Tracking',
    category: 'tracking',
    content: `
## Tổng quan Tracking

### Tracking là gì?
Tracking giúp theo dõi tiến độ học tập của học viên qua các khóa học.

### Các trạng thái
- **Not Started**: Chưa bắt đầu
- **In Progress**: Đang học
- **Submitted**: Đã nộp bài
- **Approved**: Đã duyệt (Pass)
- **Rejected**: Bị từ chối

### Bảng Tracking
Hiển thị ma trận học viên x khóa học với trạng thái tương ứng.

### Bộ lọc
- Lọc theo học kỳ
- Lọc theo trạng thái
- Tìm kiếm theo tên học viên
    `.trim(),
    order: 1,
  },
  {
    id: 'tr-quick-track',
    title: 'Quick Track',
    category: 'tracking',
    content: `
## Quick Track

### Quick Track là gì?
Tính năng cho phép duyệt nhanh nhiều học viên cùng lúc.

### Sử dụng Quick Track
1. Vào trang **Tracking**
2. Click tab **Quick Track**
3. Chọn khóa học cần duyệt
4. Tick các học viên đã hoàn thành
5. Click **Duyệt tất cả**

### Bulk Pass
Duyệt hàng loạt cho nhiều học viên:
1. Chọn nhiều học viên
2. Click **Bulk Pass**
3. Xác nhận

> **Tip**: Sử dụng Quick Track khi cần duyệt nhanh sau buổi học.
    `.trim(),
    order: 2,
  },
  {
    id: 'tr-approve-reject',
    title: 'Duyệt và từ chối bài nộp',
    category: 'tracking',
    content: `
## Duyệt và từ chối bài nộp

### Duyệt bài (Approve)
1. Tìm học viên có trạng thái **Submitted**
2. Click vào ô trạng thái
3. Xem link project đã nộp
4. Click **Approve** nếu đạt yêu cầu

### Từ chối bài (Reject)
1. Click **Reject** nếu chưa đạt
2. Nhập lý do từ chối
3. Xác nhận

### Sau khi từ chối
- Học viên sẽ nhận thông báo
- Trạng thái chuyển về **In Progress**
- Học viên có thể nộp lại
    `.trim(),
    order: 3,
  },
  {
    id: 'tr-logs',
    title: 'Xem lịch sử Tracking',
    category: 'tracking',
    content: `
## Xem lịch sử Tracking

### Tracking Logs
Ghi lại tất cả các thay đổi trạng thái:
- Ai thực hiện
- Thời gian
- Trạng thái cũ → mới
- Ghi chú (nếu có)

### Xem logs
1. Click vào ô tracking của học viên
2. Chọn tab **Lịch sử**
3. Xem danh sách các thay đổi

### Lọc logs
- Theo thời gian
- Theo hành động (approve, reject, submit)
- Theo người thực hiện
    `.trim(),
    order: 4,
  },

  // ==================== SETTINGS ====================
  {
    id: 'st-password',
    title: 'Đổi mật khẩu',
    category: 'settings',
    content: `
## Đổi mật khẩu

### Bước 1: Vào Cài đặt
Click menu **Cài đặt** ở sidebar.

### Bước 2: Mở phần Tài khoản
Click vào section **Tài khoản**.

### Bước 3: Điền thông tin
- **Mật khẩu hiện tại**: Nhập mật khẩu đang dùng
- **Mật khẩu mới**: Nhập mật khẩu mới
- **Xác nhận**: Nhập lại mật khẩu mới

### Yêu cầu mật khẩu
- Tối thiểu 8 ký tự
- Có ít nhất 1 chữ hoa
- Có ít nhất 1 chữ thường
- Có ít nhất 1 số

### Bước 4: Lưu
Click **Đổi mật khẩu** để cập nhật.
    `.trim(),
    order: 1,
  },
  {
    id: 'st-gmail',
    title: 'Kết nối Gmail',
    category: 'settings',
    content: `
## Kết nối Gmail

### Tại sao cần kết nối?
Để gửi email thông tin đăng nhập và thông báo cho học viên.

### Bước 1: Vào Cài đặt
Click menu **Cài đặt** > Section **Cấu hình Email**.

### Bước 2: Kết nối
Click **Kết nối với Google**.

### Bước 3: Đăng nhập Google
- Chọn tài khoản Gmail
- Cho phép quyền gửi email

### Bước 4: Xác nhận
Sau khi kết nối thành công, sẽ hiển thị email đã kết nối.

### Test gửi email
Click **Test gửi email** để kiểm tra kết nối.

### Ngắt kết nối
Click **Ngắt kết nối** nếu muốn đổi tài khoản khác.
    `.trim(),
    order: 2,
  },
  {
    id: 'st-templates',
    title: 'Cấu hình Email Templates',
    category: 'settings',
    content: `
## Cấu hình Email Templates

### Các template có sẵn
- **Thông tin đăng nhập**: Gửi khi tạo học viên mới
- **Reset mật khẩu**: Gửi khi reset password
- **Thông báo khóa học**: Thông báo chung

### Chỉnh sửa template
1. Vào **Cài đặt** > **Email Templates**
2. Chọn template cần sửa
3. Chỉnh sửa tiêu đề và nội dung
4. Click **Lưu**

### Sử dụng Placeholders
Các biến tự động thay thế:
- \`{name}\`: Tên học viên
- \`{email}\`: Email đăng nhập
- \`{password}\`: Mật khẩu (chỉ khi tạo mới)
- \`{login_url}\`: Link đăng nhập

### Preview
Click **Preview** để xem email với dữ liệu mẫu.
    `.trim(),
    order: 3,
  },

  // ==================== FAQ ====================
  {
    id: 'faq-forgot-password',
    title: 'Quên mật khẩu admin?',
    category: 'faq',
    content: `
## Quên mật khẩu admin?

### Cách 1: Reset qua email
1. Vào trang đăng nhập
2. Click **Quên mật khẩu**
3. Nhập email admin
4. Kiểm tra email và làm theo hướng dẫn

### Cách 2: Liên hệ support
Nếu không nhận được email, liên hệ bộ phận kỹ thuật.
    `.trim(),
    order: 1,
  },
  {
    id: 'faq-student-login',
    title: 'Học viên không đăng nhập được?',
    category: 'faq',
    content: `
## Học viên không đăng nhập được?

### Kiểm tra các nguyên nhân

**1. Sai email/mật khẩu**
- Kiểm tra email đúng chưa
- Reset mật khẩu nếu cần

**2. Tài khoản bị khóa**
- Vào chi tiết học viên
- Kiểm tra trạng thái
- Kích hoạt lại nếu bị khóa

**3. Chưa có tài khoản**
- Kiểm tra học viên đã được tạo chưa
- Tạo mới nếu chưa có

### Reset mật khẩu cho học viên
1. Vào chi tiết học viên
2. Click **Reset mật khẩu**
3. Gửi email mật khẩu mới
    `.trim(),
    order: 2,
  },
  {
    id: 'faq-import-error',
    title: 'Lỗi khi import Excel?',
    category: 'faq',
    content: `
## Lỗi khi import Excel?

### Các lỗi thường gặp

**1. File không đúng định dạng**
- Chỉ hỗ trợ file .xlsx hoặc .xls
- Không hỗ trợ file .csv

**2. Thiếu cột bắt buộc**
- Cần có cột "Họ tên" và "Email"
- Kiểm tra tên cột đúng chưa

**3. Email trùng**
- Email đã tồn tại trong hệ thống
- Các dòng trùng sẽ bị bỏ qua

**4. Email không hợp lệ**
- Kiểm tra định dạng email
- Không có khoảng trắng thừa

### Mẫu file Excel
Tải mẫu file Excel chuẩn từ nút **Tải mẫu** trong trang Import.
    `.trim(),
    order: 3,
  },
  {
    id: 'faq-genially-not-show',
    title: 'Genially không hiển thị?',
    category: 'faq',
    content: `
## Genially không hiển thị?

### Kiểm tra các nguyên nhân

**1. Link không đúng**
- Link phải có dạng: \`https://view.genially.com/...\`
- Không dùng link edit

**2. Genially chưa public**
- Mở Genially
- Vào Settings > Visibility
- Chọn Public

**3. Lỗi mạng**
- Kiểm tra kết nối internet
- Thử refresh trang

**4. Trình duyệt chặn**
- Tắt ad blocker
- Cho phép iframe từ genially.com
    `.trim(),
    order: 4,
  },
  {
    id: 'faq-email-not-sent',
    title: 'Email không gửi được?',
    category: 'faq',
    content: `
## Email không gửi được?

### Kiểm tra các nguyên nhân

**1. Chưa kết nối Gmail**
- Vào **Cài đặt** > **Cấu hình Email**
- Kết nối tài khoản Gmail

**2. Token hết hạn**
- Ngắt kết nối Gmail
- Kết nối lại

**3. Giới hạn gửi email**
- Gmail có giới hạn 500 email/ngày
- Chờ 24h nếu đạt giới hạn

**4. Email bị chặn**
- Kiểm tra spam folder
- Thêm email vào whitelist

### Test gửi email
Luôn test gửi email trước khi gửi hàng loạt.
    `.trim(),
    order: 5,
  },
];
