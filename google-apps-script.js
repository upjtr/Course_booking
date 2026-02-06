/**
 * Google Apps Script สำหรับบันทึกข้อมูลการจองลง Google Sheets
 *
 * วิธีใช้งาน:
 * 1. ไปที่ Google Drive -> New -> Google Sheets -> สร้าง Sheet ใหม่
 * 2. ตั้งชื่อ Sheet เช่น "Course Bookings"
 * 3. ไปที่ Extensions -> Apps Script
 * 4. คัดลอกโค้ดด้านล่างทั้งหมดไปวาง
 * 5. กด Save
 * 6. กด Deploy -> New deployment
 * 7. เลือก Type: Web app
 * 8. Execute as: Me
 * 9. Who has access: Anyone
 * 10. กด Deploy
 * 11. คัดลอก URL ที่ได้ไปใส่ในไฟล์ app.js ที่ตัวแปร GOOGLE_SCRIPT_URL
 */

// ===== Configuration =====
const SHEET_NAME = "Bookings"; // ชื่อ Sheet ที่จะเก็บข้อมูล

// ===== Main Functions =====

/**
 * ฟังก์ชันรับ POST request จากหน้าเว็บ
 */
function doPost(e) {
  try {
    // Parse JSON data
    const data = JSON.parse(e.postData.contents);

    // Get or create sheet
    const sheet = getOrCreateSheet();

    // Append data to sheet
    sheet.appendRow([
      new Date(), // Timestamp
      data.name,
      data.email,
      data.phone,
      data.course,
      data.date,
      data.time,
      data.notes || "",
    ]);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "บันทึกข้อมูลสำเร็จ" }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันรับ GET request สำหรับดึงข้อมูลการจอง
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "getBookings") {
      const bookings = getBookings();
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, bookings: bookings }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Default response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Course Booking API" }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * สร้างหรือดึง Sheet สำหรับเก็บข้อมูล
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet if not exists
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    // Add headers
    const headers = [
      "Timestamp",
      "ชื่อ-นามสกุล",
      "อีเมล",
      "เบอร์โทร",
      "คอร์สที่เรียน",
      "วันที่เรียน",
      "เวลาเรียน",
      "หมายเหตุ",
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format headers
    sheet
      .getRange(1, 1, 1, headers.length)
      .setBackground("#4F46E5")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");

    // Set column widths
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 150); // Name
    sheet.setColumnWidth(3, 200); // Email
    sheet.setColumnWidth(4, 120); // Phone
    sheet.setColumnWidth(5, 180); // Course
    sheet.setColumnWidth(6, 120); // Date
    sheet.setColumnWidth(7, 120); // Time
    sheet.setColumnWidth(8, 250); // Notes

    // Freeze header row
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * ดึงข้อมูลการจองทั้งหมด
 */
function getBookings() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  // Skip header row
  const bookings = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    bookings.push({
      timestamp: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      course: row[4],
      date: formatDate(row[5]),
      time: row[6],
      notes: row[7],
    });
  }

  return bookings;
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return date;
}

/**
 * Test function - สามารถรันเพื่อทดสอบการสร้าง Sheet
 */
function testCreateSheet() {
  const sheet = getOrCreateSheet();
  Logger.log("Sheet created: " + sheet.getName());
}

/**
 * Test function - สามารถรันเพื่อทดสอบการเพิ่มข้อมูล
 */
function testAddBooking() {
  const testData = {
    name: "ทดสอบ ระบบ",
    email: "test@example.com",
    phone: "0812345678",
    course: "Basic Programming",
    date: "2026-02-10",
    time: "09:00 - 10:30",
    notes: "ทดสอบระบบ",
  };

  const sheet = getOrCreateSheet();
  sheet.appendRow([
    new Date(),
    testData.name,
    testData.email,
    testData.phone,
    testData.course,
    testData.date,
    testData.time,
    testData.notes,
  ]);

  Logger.log("Test booking added successfully");
}
