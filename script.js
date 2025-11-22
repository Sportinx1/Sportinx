// script.js - ScoreLive الموقع الرياضي

class ScoreLive {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.loadLiveData();
    }

    init() {
        // إعدادات أولية
        this.currentTheme = 'light';
        this.followedMatches = new Set();
        this.liveMatches = [];
        this.news = [];
        
        console.log('ScoreLive initialized 🚀');
    }

    setupEventListeners() {
        // القائمة الجانبية
        this.setupSidebar();
        
        // أزرار المتابعة
        this.setupFollowButtons();
        
        // سكرول سموث
        this.setupSmoothScroll();
        
        // تغيير الثيم
        this.setupThemeToggle();
        
        // تحديث البيانات تلقائياً
        this.setupAutoRefresh();
        
        // بحث الأخبار
        this.setupSearch();
        
        // تحميل البيانات المحفوظة
        this.loadFromLocalStorage();
    }

    setupSidebar() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (sidebarToggle && sidebar && overlay) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });
            
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
            
            // إغلاق القائمة عند الضغط على رابط
            document.querySelectorAll('.sidebar-links a').forEach(link => {
                link.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                });
            });
        }
    }

    setupFollowButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
                if (button.textContent.includes('متابع')) {
                    this.handleFollowAction(button);
                }
            }
            
            if (e.target.classList.contains('card')) {
                this.showNewsDetails(e.target);
            }
        });
    }

    handleFollowAction(button) {
        const card = button.closest('.card');
        const title = card.querySelector('.card-title').textContent;
        
        if (button.textContent.includes('متابعة')) {
            button.textContent = 'متابَع ✓';
            button.style.background = 'var(--secondary)';
            this.showNotification(`جاري متابعة: ${title}`);
        } else {
            button.textContent = 'متابعة';
            button.style.background = 'var(--primary)';
            this.showNotification(`تم إلغاء متابعة: ${title}`);
        }
    }

    showNewsDetails(card) {
        const title = card.querySelector('.card-title').textContent;
        const category = card.querySelector('.card-category').textContent;
        
        // إنشاء مودال لعرض تفاصيل الخبر
        this.createNewsModal(title, category);
    }

    createNewsModal(title, category) {
        // إزالة المودال الحالي إذا كان موجوداً
        const existingModal = document.querySelector('.news-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // إنشاء المودال الجديد
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-header">
                    <span class="modal-category">${category}</span>
                    <h2>${title}</h2>
                </div>
                <div class="modal-body">
                    <p>هذا محتوى تفصيلي للخبر. يمكنك هنا إضافة النص الكامل للخبر مع الصور والفيديوهات ذات الصلة.</p>
                    <p>في التطبيق الحقيقي، سيتم جلب محتوى الخبر من قاعدة البيانات أو من خلال API.</p>
                    <div class="news-image">
                        <img src="https://via.placeholder.com/600x300" alt="صورة الخبر">
                    </div>
                    <p>يمكن إضافة المزيد من التفاصيل والمعلومات حول الخبر في هذا القسم.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn share-btn">مشاركة الخبر</button>
                    <button class="btn close-btn">إغلاق</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة الستايل للمودال
        this.addModalStyles();
        
        // إضافة إيفينت للإغلاق
        const closeBtn = modal.querySelector('.close-modal');
        const closeButton = modal.querySelector('.close-btn');
        const shareBtn = modal.querySelector('.share-btn');
        
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        closeButton.addEventListener('click', closeModal);
        
        shareBtn.addEventListener('click', () => {
            this.shareNews(title);
        });
        
        // إغلاق بالنقر خارج المحتوى
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // إظهار المودال مع أنيميشن
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    addModalStyles() {
        const modalStyles = `
            .news-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .modal-content {
                background: white;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 25px rgba(0,0,0,0.3);
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }
            
            .news-modal.show .modal-content {
                transform: translateY(0);
            }
            
            .close-modal {
                position: absolute;
                top: 15px;
                left: 15px;
                font-size: 24px;
                cursor: pointer;
                color: var(--gray);
                z-index: 1;
            }
            
            .modal-header {
                padding: 20px;
                background: var(--light);
                border-bottom: 1px solid #eee;
            }
            
            .modal-category {
                background: var(--primary);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                display: inline-block;
                margin-bottom: 10px;
            }
            
            .modal-header h2 {
                margin: 0;
                color: var(--dark);
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: 50vh;
            }
            
            .news-image {
                margin: 15px 0;
            }
            
            .news-image img {
                width: 100%;
                border-radius: 8px;
            }
            
            .modal-footer {
                padding: 15px 20px;
                background: var(--light);
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .share-btn {
                background: var(--secondary);
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    max-height: 90vh;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
            }
        `;
        
        // التأكد من عدم إضافة الستايل مكرر
        if (!document.querySelector('#modal-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'modal-styles';
            styleEl.textContent = modalStyles;
            document.head.appendChild(styleEl);
        }
    }

    shareNews(title) {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: 'شاهد هذا الخبر على ScoreLive',
                url: window.location.href,
            })
            .then(() => this.showNotification('تم مشاركة الخبر بنجاح'))
            .catch(error => console.log('خطأ في المشاركة:', error));
        } else {
            // نسخ الرابط للمتصفحات التي لا تدعم Web Share API
            navigator.clipboard.writeText(window.location.href)
                .then(() => this.showNotification('تم نسخ رابط الخبر'))
                .catch(err => this.showNotification('تعذر نسخ الرابط'));
        }
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupThemeToggle() {
        // إضافة زر تغيير الثيم ديناميكياً
        const themeToggle = document.createElement('button');
        themeToggle.innerHTML = '🌙';
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'تبديل الوضع الليلي');
        themeToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--primary);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
            font-size: 1.2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(themeToggle);
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        // تطبيق ستايل الثيم
        this.applyThemeStyles();
        
        this.showNotification(`تم التبديل إلى الوضع ${this.currentTheme === 'light' ? 'الفاتح' : 'الداكن'}`);
        
        // حفظ الإعداد
        this.saveToLocalStorage();
    }

    applyThemeStyles() {
        if (this.currentTheme === 'dark') {
            document.documentElement.style.setProperty('--light', '#1a1a1a');
            document.documentElement.style.setProperty('--dark', '#f8f9fa');
            document.documentElement.style.setProperty('--gray', '#a0a0a0');
            document.body.style.backgroundColor = '#121212';
            document.body.style.color = '#ffffff';
        } else {
            document.documentElement.style.setProperty('--light', '#f8f9fa');
            document.documentElement.style.setProperty('--dark', '#1e1e1e');
            document.documentElement.style.setProperty('--gray', '#6c757d');
            document.body.style.backgroundColor = '#f5f5f5';
            document.body.style.color = '#333';
        }
    }

    setupAutoRefresh() {
        // تحديث البيانات كل 30 ثانية
        setInterval(() => {
            this.updateLiveScores();
            this.updateNews();
        }, 30000);
    }

    setupSearch() {
        // إضافة شريط بحث ديناميكي في الهيدر
        const searchHTML = `
            <div class="search-container">
                <div class="search-box">
                    <input type="text" placeholder="ابحث في الأخبار والمباريات..." class="search-input">
                    <button class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        `;
        
        const headerTop = document.querySelector('.header-top');
        if (headerTop) {
            headerTop.insertAdjacentHTML('beforeend', searchHTML);
            
            // إضافة ستايل البحث
            this.addSearchStyles();
            
            // إيفينت البحث
            const searchInput = document.querySelector('.search-input');
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    }

    addSearchStyles() {
        const searchStyles = `
            .search-container {
                display: flex;
                align-items: center;
            }
            
            .search-box {
                display: flex;
                background: rgba(255,255,255,0.1);
                border-radius: 25px;
                padding: 5px 15px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .search-input {
                background: transparent;
                border: none;
                color: white;
                padding: 5px;
                width: 200px;
                outline: none;
            }
            
            .search-input::placeholder {
                color: rgba(255,255,255,0.7);
            }
            
            .search-btn {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0 5px;
            }
            
            @media (max-width: 768px) {
                .search-container {
                    margin-top: 15px;
                    width: 100%;
                }
                
                .search-box {
                    width: 100%;
                }
                
                .search-input {
                    width: 100%;
                }
            }
        `;
        
        if (!document.querySelector('#search-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'search-styles';
            styleEl.textContent = searchStyles;
            document.head.appendChild(styleEl);
        }
    }

    performSearch(query) {
        if (query.length < 2) {
            this.clearSearch();
            return;
        }
        
        const cards = document.querySelectorAll('.card');
        let results = 0;
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                card.style.display = 'block';
                card.style.animation = 'pulse 0.5s ease';
                results++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (results === 0) {
            this.showNotification('لا توجد نتائج للبحث');
        } else {
            this.showNotification(`تم العثور على ${results} نتيجة`);
        }
    }

    clearSearch() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.display = 'block';
        });
    }

    async loadLiveData() {
        try {
            // محاكاة جلب بيانات حية من API
            this.simulateLiveData();
            
            // هنا يمكنك استخدام API حقيقي
            // const response = await fetch('your-api-endpoint');
            // this.liveMatches = await response.json();
            
        } catch (error) {
            console.error('Error loading live data:', error);
            this.showNotification('حدث خطأ في تحميل البيانات');
        }
    }

    simulateLiveData() {
        // محاكاة تحديث النتائج الحية
        setInterval(() => {
            this.updateLiveScores();
        }, 15000);
    }

    updateLiveScores() {
        // محاكاة تحديث النتائج
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (Math.random() > 0.7) { // 30% فرصة تحديث
                card.style.borderLeft = `4px solid var(--primary)`;
                
                setTimeout(() => {
                    card.style.borderLeft = 'none';
                }, 2000);
            }
        });
        
        this.showNotification('📰 تم تحديث النتائج والأخبار', 2000);
    }

    updateNews() {
        // محاكاة إضافة أخبار جديدة
        if (Math.random() > 0.8) { // 20% فرصة إضافة خبر جديد
            this.showNotification('📰 هناك أخبار جديدة متاحة!');
        }
    }

    showNotification(message, duration = 3000) {
        // إزالة الإشعار الحالي إذا كان موجوداً
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: var(--primary);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // إخفاء الإشعار بعد المدة المحددة
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    saveToLocalStorage() {
        const data = {
            theme: this.currentTheme
        };
        localStorage.setItem('scorelive-data', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('scorelive-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentTheme = data.theme || 'light';
                
                // تطبيق الثيم المحفوظ
                if (this.currentTheme === 'dark') {
                    this.applyThemeStyles();
                    const themeToggle = document.querySelector('.theme-toggle');
                    if (themeToggle) {
                        themeToggle.innerHTML = '☀️';
                    }
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }
}

// إضافة الأنيميشن الإضافية
const additionalStyles = `
    @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .card {
        animation: fadeIn 0.5s ease forwards;
    }
    
    @media (max-width: 768px) {
        .theme-toggle {
            bottom: 80px;
            left: 15px;
            width: 45px;
            height: 45px;
        }
    }
`;

// إضافة الستايل الإضافي للأنيميشنات
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// تهيئة العناصر قبل الأنيميشن
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
    
    // تأثيرات عند السكرول
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'var(--dark)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.2)';
        } else {
            header.style.background = 'linear-gradient(135deg, var(--dark) 0%, #333 100%)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });
});

// تشغيل التطبيق عندما تكون الصفحة جاهزة
document.addEventListener('DOMContentLoaded', () => {
    const app = new ScoreLive();
    console.log('ScoreLive JS loaded successfully! ⚽🏆');
});