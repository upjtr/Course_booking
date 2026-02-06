// ===== Configuration =====
// ⚠️ สำคัญ: ให้เปลี่ยน URL นี้เป็น URL ของ Google Apps Script ที่คุณ Deploy
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxDvTMU61jpS8zN9rLJI8BsIRGqjqp91PC60iX9ZWhDIqjDGBR9KsPoHMf1sDqxwFJj/exec";

// ===== Course Data =====
const courses = [
  {
    id: 1,
    name: "Basic Programming",
    description: "เรียนรู้พื้นฐานการเขียนโปรแกรม Python เริ่มต้นจากศูนย์",
    duration: "12 ชั่วโมง",
    price: "2,500 บาท",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
    level: "เริ่มต้น",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Web Development",
    description: "สร้างเว็บไซต์ด้วย HTML, CSS, JavaScript และ Framework ต่างๆ",
    duration: "20 ชั่วโมง",
    price: "4,500 บาท",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    level: "กลาง",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    name: "Data Science",
    description:
      "วิเคราะห์ข้อมูลด้วย Python, Pandas และ Machine Learning พื้นฐาน",
    duration: "24 ชั่วโมง",
    price: "5,500 บาท",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    level: "กลาง-สูง",
    color: "from-green-500 to-teal-500",
  },
  {
    id: 4,
    name: "Mobile App Development",
    description: "พัฒนาแอพมือถือด้วย React Native สำหรับ iOS และ Android",
    duration: "18 ชั่วโมง",
    price: "5,000 บาท",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
    level: "กลาง",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    name: "Database & SQL",
    description: "เรียนรู้การจัดการฐานข้อมูล MySQL, PostgreSQL และ MongoDB",
    duration: "15 ชั่วโมง",
    price: "3,500 บาท",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    level: "เริ่มต้น-กลาง",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: 6,
    name: "UI/UX Design",
    description: "ออกแบบ User Interface และ User Experience ด้วย Figma",
    duration: "16 ชั่วโมง",
    price: "4,000 บาท",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
    level: "เริ่มต้น",
    color: "from-pink-500 to-rose-500",
  },
];

// ===== Calendar State =====
let currentDate = new Date();
let selectedDate = null;
let bookings = []; // จะดึงจาก Google Sheets

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", () => {
  renderCourses();
  renderCalendar();
  populateCourseSelect();
  setMinDate();
  loadBookings();

  // Event Listeners
  document
    .getElementById("bookingForm")
    .addEventListener("submit", handleSubmit);
  document
    .getElementById("prevMonth")
    .addEventListener("click", () => changeMonth(-1));
  document
    .getElementById("nextMonth")
    .addEventListener("click", () => changeMonth(1));
});

// ===== Render Courses =====
function renderCourses() {
  const courseList = document.getElementById("courseList");
  courseList.innerHTML = courses
    .map(
      (course) => `
        <div class="course-card bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer" 
             onclick="selectCourse('${course.name}')">
            <div class="relative h-48 bg-gradient-to-br ${course.color}">
                <img src="${course.image}" alt="${course.name}" 
                     class="w-full h-full object-cover opacity-80 mix-blend-overlay">
                <div class="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    ${course.level}
                </div>
            </div>
            <div class="p-6">
                <h4 class="text-xl font-bold text-gray-800 mb-2">${course.name}</h4>
                <p class="text-gray-600 text-sm mb-4">${course.description}</p>
                <div class="flex items-center justify-between text-sm">
                    <span class="flex items-center text-gray-500">
                        <i class="fas fa-clock mr-2"></i>${course.duration}
                    </span>
                    <span class="font-bold text-indigo-600">${course.price}</span>
                </div>
                <button class="mt-4 w-full bg-gradient-to-r ${course.color} text-white py-2 rounded-lg font-medium hover:opacity-90 transition">
                    <i class="fas fa-bookmark mr-2"></i>จองคอร์สนี้
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

// ===== Select Course =====
function selectCourse(courseName) {
  document.getElementById("selectedCourse").value = courseName;
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

// ===== Populate Course Select =====
function populateCourseSelect() {
  const select = document.getElementById("selectedCourse");
  courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course.name;
    option.textContent = `${course.name} - ${course.price}`;
    select.appendChild(option);
  });
}

// ===== Set Minimum Date =====
function setMinDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("bookingDate").setAttribute("min", today);
}

// ===== Calendar Functions =====
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update month title
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  document.getElementById("currentMonth").textContent =
    `${monthNames[month]} ${year + 543}`;

  // Get first day and total days
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build calendar grid
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    grid.innerHTML += '<div class="p-3"></div>';
  }

  // Day cells
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDateForComparison(date);
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const hasBooking = bookings.some((b) => b.date === dateString);
    const isSelected = selectedDate === dateString;

    let classes =
      "calendar-day p-3 text-center rounded-lg cursor-pointer transition-all ";

    if (isPast) {
      classes += "text-gray-300 cursor-not-allowed ";
    } else if (hasBooking) {
      classes += "has-booking ";
    } else if (isSelected) {
      classes += "selected ";
    } else if (isToday) {
      classes += "bg-yellow-100 text-yellow-800 font-bold ";
    } else {
      classes += "hover:bg-blue-100 ";
    }

    grid.innerHTML += `
            <div class="${classes}" 
                 onclick="${isPast ? "" : `selectCalendarDate('${dateString}')`}"
                 data-date="${dateString}">
                ${day}
            </div>
        `;
  }
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function selectCalendarDate(dateString) {
  selectedDate = dateString;

  // Update booking form date
  document.getElementById("bookingDate").value = dateString;

  // Re-render calendar
  renderCalendar();

  // Show bookings for this date
  showBookingsForDate(dateString);
}

function formatDateForComparison(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateThai(dateString) {
  const [year, month, day] = dateString.split("-");
  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${parseInt(year) + 543}`;
}

function showBookingsForDate(dateString) {
  const container = document.getElementById("bookingDetails");
  const list = document.getElementById("bookingList");
  const dateText = document.getElementById("selectedDateText");

  const dateBookings = bookings.filter((b) => b.date === dateString);

  if (dateBookings.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  dateText.textContent = formatDateThai(dateString);

  list.innerHTML = dateBookings
    .map(
      (booking) => `
        <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold text-gray-800">${booking.name}</p>
                    <p class="text-sm text-gray-600">${booking.course}</p>
                </div>
                <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    ${booking.time}
                </span>
            </div>
        </div>
    `,
    )
    .join("");
}

// ===== Form Submission =====
async function handleSubmit(e) {
  e.preventDefault();

  // Get form data
  const formData = {
    name: document.getElementById("studentName").value,
    email: document.getElementById("studentEmail").value,
    phone: document.getElementById("studentPhone").value,
    course: document.getElementById("selectedCourse").value,
    date: document.getElementById("bookingDate").value,
    time: document.getElementById("bookingTime").value,
    notes: document.getElementById("notes").value,
    timestamp: new Date().toLocaleString("th-TH"),
  };

  // Validate
  if (
    !formData.name ||
    !formData.email ||
    !formData.course ||
    !formData.date ||
    !formData.time
  ) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  // Show loading
  showLoading(true);

  try {
    // Send to Google Sheets
    await sendToGoogleSheets(formData);

    // Add to local bookings
    bookings.push(formData);

    // Update calendar
    renderCalendar();

    // Show success
    showLoading(false);
    showSuccessModal();

    // Reset form
    document.getElementById("bookingForm").reset();
  } catch (error) {
    showLoading(false);
    console.error("Error:", error);

    // ถ้า Google Script URL ยังไม่ได้ตั้งค่า ให้ save ใน local
    if (
      !GOOGLE_SCRIPT_URL ||
      GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"
    ) {
      // Demo mode - save locally
      bookings.push(formData);
      localStorage.setItem("bookings", JSON.stringify(bookings));
      renderCalendar();
      showSuccessModal();
      document.getElementById("bookingForm").reset();
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  }
}

// ===== Google Sheets Integration =====
async function sendToGoogleSheets(data) {
  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"
  ) {
    throw new Error("Google Script URL not configured");
  }

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
}

async function loadBookings() {
  // Try to load from local storage first (for demo)
  const localBookings = localStorage.getItem("bookings");
  if (localBookings) {
    bookings = JSON.parse(localBookings);
    renderCalendar();
  }

  // Try to load from Google Sheets if configured
  if (
    GOOGLE_SCRIPT_URL &&
    GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"
  ) {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getBookings`);
      const data = await response.json();
      if (data && data.bookings) {
        bookings = data.bookings;
        renderCalendar();
      }
    } catch (error) {
      console.log("Using local bookings");
    }
  }
}

// ===== UI Helpers =====
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (show) {
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

function showSuccessModal() {
  document.getElementById("successModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("successModal").classList.add("hidden");
}

// ===== Sync calendar date picker with calendar =====
document.getElementById("bookingDate")?.addEventListener("change", (e) => {
  const dateValue = e.target.value;
  if (dateValue) {
    selectedDate = dateValue;

    // Navigate calendar to selected month
    const [year, month] = dateValue.split("-");
    currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);

    renderCalendar();
  }
});
