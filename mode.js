const modeToggle = document.getElementById('mode-toggle');
const body = document.body;
const icon = modeToggle.querySelector('i');

modeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  if (body.classList.contains('light-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
});
class PointerParticle {
    constructor(spread, speed, component) {
      const { ctx, pointer, hue } = component;
  
      this.ctx = ctx;
      this.x = pointer.x;
      this.y = pointer.y;
      this.mx = pointer.mx * 0.1;
      this.my = pointer.my * 0.1;
      this.size = Math.random() + 1;
      this.decay = 0.01;
      this.speed = speed * 0.08;
      this.spread = spread * this.speed;
      this.spreadX = (Math.random() - 0.5) * this.spread - this.mx;
      this.spreadY = (Math.random() - 0.5) * this.spread - this.my;
      this.color = `hsl(${hue}, 90%, 60%)`;
    }
  
    draw() {
      this.ctx.fillStyle = this.color;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  
    collapse() {
      this.size -= this.decay;
    }
  
    trail() {
      this.x += this.spreadX * this.size;
      this.y += this.spreadY * this.size;
    }
  
    update() {
      this.draw();
      this.trail();
      this.collapse();
    }
  }
  
  class PointerParticles extends HTMLElement {
    static register(tag = "pointer-particles") {
      if ("customElements" in window) {
        customElements.define(tag, this);
      }
    }
  
    static css = `
        :host {
          display: grid;
          width: 100%;
          height: 100%;
          user-select: none;
        }
      `;
  
    constructor() {
      super();
  
      this.canvas;
      this.ctx;
      this.fps = 60;
      this.msPerFrame = 1000 / this.fps;
      this.timePrevious;
      this.particles = [];
      this.pointer = {
        x: 0,
        y: 0,
        mx: 0,
        my: 0
      };
      this.hue = 0;
    }
  
    connectedCallback() {
      const canvas = document.createElement("canvas");
      const sheet = new CSSStyleSheet();
  
      this.shadowroot = this.attachShadow({ mode: "open" });
  
      sheet.replaceSync(PointerParticles.css);
      this.shadowroot.adoptedStyleSheets = [sheet];
  
      this.shadowroot.append(canvas);
  
      this.canvas = this.shadowroot.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.setCanvasDimensions();
      this.setupEvents();
      this.timePrevious = performance.now();
      this.animateParticles();
    }
  
    createParticles(event, { count, speed, spread }) {
      this.setPointerValues(event);
  
      for (let i = 0; i < count; i++) {
        this.particles.push(new PointerParticle(spread, speed, this));
      }
    }
  
    setPointerValues(event) {
      this.pointer.x = event.x - this.offsetLeft;
      this.pointer.y = event.y - this.offsetTop;
      this.pointer.mx = event.movementX;
      this.pointer.my = event.movementY;
    }
  
    setupEvents() {
      const parent = this.parentNode;
  
      parent.addEventListener("click", (event) => {
        this.createParticles(event, {
          count: 300,
          speed: Math.random() + 1,
          spread: Math.random() + 50
        });
      });
  
      parent.addEventListener("pointermove", (event) => {
        this.createParticles(event, {
          count: 20,
          speed: this.getSpeed(event),
          spread: 1
        });
      });
  
      window.addEventListener("resize", () => this.setCanvasDimensions());
    }
  
    getSpeed(event) {
      const a = event.movementX;
      const b = event.movementY;
      const c = Math.floor(Math.sqrt(a * a + b * b));
  
      return c;
    }
  
    handleParticles() {
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
  
        if (this.particles[i].size <= 0.1) {
          this.particles.splice(i, 1);
          i--;
        }
      }
    }
  
    setCanvasDimensions() {
      const rect = this.parentNode.getBoundingClientRect();
  
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  
    animateParticles() {
      requestAnimationFrame(() => this.animateParticles());
  
      const timeNow = performance.now();
      const timePassed = timeNow - this.timePrevious;
  
      if (timePassed < this.msPerFrame) return;
  
      const excessTime = timePassed % this.msPerFrame;
  
      this.timePrevious = timeNow - excessTime;
  
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.hue = this.hue > 360 ? 0 : (this.hue += 3);
  
      this.handleParticles();
    }
  }
  /////////////////////////////////////////////////////////////////////////////
// Biến theo dõi entry hiện tại và trang nội dung
let currentEntryIndex = 0;
let currentContentPage = 0;
let contentPages = [];
const CHARS_PER_PAGE = 800; // Số ký tự tối đa mỗi trang

// Hàm chia nội dung thành các trang
function splitContentIntoPages(content) {
    if (!content || content.length <= CHARS_PER_PAGE) {
        return [content];
    }
    
    const pages = [];
    const paragraphs = content.split('\n\n');
    let currentPage = '';
    
    for (let paragraph of paragraphs) {
        // Nếu thêm đoạn này vào sẽ vượt quá giới hạn
        if (currentPage.length + paragraph.length + 2 > CHARS_PER_PAGE && currentPage.length > 0) {
            pages.push(currentPage.trim());
            currentPage = paragraph;
        } else {
            if (currentPage.length > 0) {
                currentPage += '\n\n' + paragraph;
            } else {
                currentPage = paragraph;
            }
        }
    }
    
    // Thêm trang cuối
    if (currentPage.length > 0) {
        pages.push(currentPage.trim());
    }
    
    return pages.length > 0 ? pages : [content];
}

// Hàm mở diary (được gọi từ nút)
function openDiary() {
    document.getElementById('passwordOverlay').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('passwordPopup').classList.add('show');
    }, 10);
    document.getElementById('passwordInput').focus();
}

// Hàm đóng password popup
function closePasswordPopup() {
    document.getElementById('passwordPopup').classList.remove('show');
    setTimeout(() => {
        document.getElementById('passwordOverlay').style.display = 'none';
        document.getElementById('passwordInput').value = '';
        document.getElementById('errorMessage').style.display = 'none';
    }, 300);
}

// Hàm kiểm tra mật khẩu
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    if (password === '23') {
        closePasswordPopup();
        showDiary();
    } else {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

// Hàm hiển thị diary
function showDiary() {
    document.getElementById('diaryOverlay').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('diaryPopup').classList.add('show');
    }, 10);
    
    // Reset về entry đầu tiên và hiển thị
    currentEntryIndex = 0;
    displayCurrentEntry();
}

// Hàm đóng diary
function closeDiary() {
    document.getElementById('diaryPopup').classList.remove('show');
    setTimeout(() => {
        document.getElementById('diaryOverlay').style.display = 'none';
    }, 300);
}

// Hàm hiển thị entry hiện tại
function displayCurrentEntry() {
    const currentEntry = diaryEntries[currentEntryIndex];
    
    // Cập nhật tiêu đề
    document.getElementById('currentEntryTitle').textContent = `Nhật ký ${currentEntryIndex + 1}`;
    
    // Hiển thị nội dung
    const diaryEntryEl = document.getElementById('diaryEntry');
    if (currentEntry) {
        diaryEntryEl.textContent = currentEntry;
        diaryEntryEl.className = 'diary-entry';
    } else {
        diaryEntryEl.textContent = 'Không có nội dung...';
        diaryEntryEl.className = 'diary-entry no-entry';
    }
    
    // Cập nhật trạng thái nút navigation
    updateNavigationButtons();
    updatePageIndicator();
}

// Hàm chuyển entry trước
function previousEntry() {
    if (currentEntryIndex > 0) {
        currentEntryIndex--;
        displayCurrentEntry();
    }
}

// Hàm chuyển entry sau
function nextEntry() {
    if (currentEntryIndex < diaryEntries.length - 1) {
        currentEntryIndex++;
        displayCurrentEntry();
    }
}

// Hàm cập nhật trạng thái nút navigation
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentEntryIndex === 0;
    nextBtn.disabled = currentEntryIndex === diaryEntries.length - 1;
}

// Hàm cập nhật chỉ số trang
function updatePageIndicator() {
    const totalEntries = diaryEntries.length;
    document.getElementById('pageIndicator').textContent = 
        `📖 Trang ${currentEntryIndex + 1}/${totalEntries}`;
}

// Xử lý sự kiện
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // Đóng popup khi click bên ngoài
    document.getElementById('passwordOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closePasswordPopup();
        }
    });
    
    document.getElementById('diaryOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDiary();
        }
    });
    
    // Xử lý phím mũi tên
    document.addEventListener('keydown', function(e) {
        if (document.getElementById('diaryOverlay').style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                previousEntry();
            } else if (e.key === 'ArrowRight') {
                nextEntry();
            }
        }
    });
});
// CẦN THÊM: Function để chuyển [IMG] thành <img>
function processImageTags(text) {
    return text.replace(/\[IMG\](.*?)\[\/IMG\]/g, '<img src="$1" alt="Diary image">');
}

// CẦN SỬA: Function displayCurrentEntry()
function displayCurrentEntry() {
    const currentEntry = diaryEntries[currentEntryIndex];
    
    document.getElementById('currentEntryTitle').textContent = `Nhật ký ${currentEntryIndex + 1}`;
    
    const diaryEntryEl = document.getElementById('diaryEntry');
    if (currentEntry) {
        // SỬA: Xử lý ảnh và dùng innerHTML thay vì textContent  
        diaryEntryEl.innerHTML = processImageTags(currentEntry);
        diaryEntryEl.className = 'diary-entry';
    } else {
        diaryEntryEl.textContent = 'Không có nội dung...';
        diaryEntryEl.className = 'diary-entry no-entry';
    }
    
    updateNavigationButtons();
    updatePageIndicator();
}


