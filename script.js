const GeoApp = {
    state: {
        score: 0,
        streak: 0,
        currentPage: 'home',
        questions: []
    },

    init() {
        this.bindEvents();
        this.loadInitialData();
        console.log("GeoPro System Initialized...");
    },

    bindEvents() {
        // التنقل بين الصفحات
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });
    },

    navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
        }

        if (pageId === 'maps') this.initMap();
    },

    async loadInitialData() {
        try {
            const response = await fetch('questions.json');
            this.state.questions = await response.json();
            this.renderContinents();
        } catch (err) {
            console.error("Data Load Error:", err);
        }
    },

    renderContinents() {
        const grid = document.getElementById('continents-grid');
        const continents = [
            { name: 'آسيا', icon: 'fa-mosque', count: 48 },
            { name: 'أفريقيا', icon: 'fa-hippo', count: 54 },
            { name: 'أوروبا', icon: 'fa-euro-sign', count: 44 }
        ];

        grid.innerHTML = continents.map(c => `
            <div class="continent-card">
                <i class="fas ${c.icon} fa-2x" style="color: var(--primary)"></i>
                <h3 style="margin: 15px 0 10px">${c.name}</h3>
                <p style="color: var(--text-muted)">تضم ${c.count} دولة مسجلة.</p>
            </div>
        `).join('');
    },

    initMap() {
        if (this.map) return;
        this.map = L.map('mainMap').setView([20, 0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);
    }
};

document.addEventListener('DOMContentLoaded', () => GeoApp.init());
