// Modulul Dashboard cu statistici și grafice
window.DashboardModule = {
    isInitialized: false,
    charts: {},
    refreshInterval: null,

    // Inițializează modulul
    init() {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Dashboard module initialized');
    },

    // Configurează event listeners
    setupEventListeners() {
        // Navigation click
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-section="dashboard"]')) {
                e.preventDefault();
                this.show();
            }
        });
    },

    // Afișează dashboard-ul
    async show() {
        try {
            // Actualizează navigația
            this.updateNavigation();
            
            // Încarcă template-ul
            await this.loadTemplate();
            
            // Încarcă datele și statisticile
            await this.loadData();
            
            // Configurează refresh automat
            this.setupAutoRefresh();
            
        } catch (error) {
            console.error('Error showing dashboard:', error);
            NotificationModule.show('Eroare la încărcarea dashboard-ului', 'error');
        }
    },

    // Actualizează navigația
    updateNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('text-primary-600', 'bg-primary-50');
            item.classList.add('text-gray-700', 'hover:text-primary-600', 'hover:bg-primary-50');
        });
        
        const dashboardNav = document.querySelector('[data-section="dashboard"]');
        if (dashboardNav) {
            dashboardNav.classList.add('text-primary-600', 'bg-primary-50');
            dashboardNav.classList.remove('text-gray-700', 'hover:text-primary-600', 'hover:bg-primary-50');
        }
    },

    // Încarcă template-ul dashboard
    async loadTemplate() {
        const content = `
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
                    <p class="text-sm text-gray-500">Privire de ansamblu asupra activității service-ului</p>
                </div>
                <div class="flex space-x-3">
                    <button id="refresh-dashboard" class="btn btn-secondary text-sm">
                        <i class="fas fa-sync-alt mr-2"></i>
                        Actualizează
                    </button>
                    <button id="export-dashboard" class="btn btn-primary text-sm">
                        <i class="fas fa-download mr-2"></i>
                        Export
                    </button>
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="modern-card p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <i class="fas fa-wrench text-xl text-white"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Lucrări active</p>
                            <p id="active-jobs" class="text-2xl font-semibold text-gray-900">-</p>
                            <p id="active-jobs-change" class="text-xs text-gray-500"></p>
                        </div>
                    </div>
                </div>
                
                <div class="modern-card p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <i class="fas fa-users text-xl text-white"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Clienți totali</p>
                            <p id="total-clients" class="text-2xl font-semibold text-gray-900">-</p>
                            <p id="total-clients-change" class="text-xs text-gray-500"></p>
                        </div>
                    </div>
                </div>
                
                <div class="modern-card p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                            <i class="fas fa-euro-sign text-xl text-white"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Venituri luna</p>
                            <p id="monthly-revenue" class="text-2xl font-semibold text-gray-900">-</p>
                            <p id="monthly-revenue-change" class="text-xs text-gray-500"></p>
                        </div>
                    </div>
                </div>
                
                <div class="modern-card p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <i class="fas fa-cogs text-xl text-white"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-500">Piese în stoc</p>
                            <p id="parts-stock" class="text-2xl font-semibold text-gray-900">-</p>
                            <p id="parts-stock-change" class="text-xs text-gray-500"></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div class="modern-card p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Venituri ultimele 6 luni</h3>
                        <select id="revenue-period" class="text-sm border border-gray-300 rounded px-2 py-1">
                            <option value="6">6 luni</option>
                            <option value="12">12 luni</option>
                            <option value="3">3 luni</option>
                        </select>
                    </div>
                    <div class="relative h-80">
                        <canvas id="revenue-chart"></canvas>
                    </div>
                </div>
                
                <div class="modern-card p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Tipuri de reparații</h3>
                        <button id="refresh-repairs-chart" class="text-sm text-gray-500 hover:text-gray-700">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div class="relative h-80">
                        <canvas id="repairs-chart"></canvas>
                    </div>
                </div>
            </div>
            
            
            <!-- Recent Activity -->
            <div class="modern-card">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">Activitate recentă</h3>
                    <button id="view-all-activity" class="text-sm text-primary-600 hover:text-primary-800">
                        Vezi tot <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
                <div id="recent-activity" class="p-6">
                    <div class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                        <p class="text-gray-500">Se încarcă activitatea recentă...</p>
                    </div>
                </div>
            </div>
        `;

        this.showContent(content);
        this.setupSectionEventListeners();
    },

    // Afișează conținutul în secțiunea dashboard
    showContent(content) {
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.add('hidden');
        });

        const dashboardSection = document.getElementById('dashboard-section');
        dashboardSection.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                ${content}
            </div>
        `;
        dashboardSection.classList.remove('hidden');
    },

    // Configurează event listeners pentru această secțiune
    setupSectionEventListeners() {
        // Refresh dashboard
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.loadData();
        });

        // Export dashboard
        document.getElementById('export-dashboard')?.addEventListener('click', () => {
            this.exportDashboard();
        });

        // Revenue period change
        document.getElementById('revenue-period')?.addEventListener('change', () => {
            this.updateRevenueChart();
        });

        // Refresh repairs chart
        document.getElementById('refresh-repairs-chart')?.addEventListener('click', () => {
            this.updateRepairsChart();
        });

        // View all activity
        document.getElementById('view-all-activity')?.addEventListener('click', () => {
            // Navigate to activity log
            console.log('Navigate to activity log');
        });
    },

    // Încarcă toate datele pentru dashboard
    async loadData() {
        try {
            // Afișează loading
            this.showLoading();

            // Încarcă datele în paralel
            const [
                statsData,
                revenueData,
                repairsData,
                recentActivity
            ] = await Promise.all([
                this.loadStats(),
                this.loadRevenueData(),
                this.loadRepairsData(),
                this.loadRecentActivity()
            ]);

            // Actualizează UI
            this.updateStats(statsData);
            this.updateRevenueChart(revenueData);
            this.updateRepairsChart(repairsData);
            this.updateRecentActivity(recentActivity);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            NotificationModule.show('Eroare la încărcarea datelor dashboard', 'error');
        }
    },

    // Afișează loading
    showLoading() {
        document.querySelectorAll('#active-jobs, #total-clients, #monthly-revenue').forEach(el => {
            el.textContent = '-';
        });
    },

    // Încarcă statisticile generale
    async loadStats() {
        try {
            const [lucrari, clienti] = await Promise.all([
                db.lucrari.getAll(),
                db.clienti.getAll()
            ]);

            const lucrariActive = lucrari.filter(l => ['in_asteptare', 'in_lucru'].includes(l.stare)).length;
            const totalClienti = clienti.length;
            
            // Calculează veniturile lunii curente
            const currentMonth = new Date();
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            
            const venitLunar = lucrari
                .filter(l => {
                    const hasRevenue = l.total_cost && l.total_cost > 0;
                    const isInCurrentMonth = new Date(l.data_intrare) >= startOfMonth;
                    return hasRevenue && isInCurrentMonth;
                })
                .reduce((sum, l) => sum + (l.total_cost || 0), 0);

            return {
                lucrariActive,
                totalClienti,
                venitLunar
            };
        } catch (error) {
            console.error('Error loading stats:', error);
            return {
                lucrariActive: 0,
                totalClienti: 0,
                venitLunar: 0
            };
        }
    },

    // Încarcă datele pentru graficul de venituri
    async loadRevenueData() {
        try {
            const lucrari = await db.lucrari.getAll();
            const months = 6; // Default 6 luni
            const revenueData = [];
            const labels = [];

            for (let i = months - 1; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                const monthRevenue = lucrari
                    .filter(l => {
                        if (!l.data_finalizare || l.stare !== 'finalizat') return false;
                        const finishDate = new Date(l.data_finalizare);
                        return finishDate >= monthStart && finishDate <= monthEnd;
                    })
                    .reduce((sum, l) => sum + (l.total_cost || 0), 0);

                revenueData.push(monthRevenue);
                labels.push(date.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }));
            }

            return { labels, data: revenueData };
        } catch (error) {
            console.error('Error loading revenue data:', error);
            return { labels: [], data: [] };
        }
    },

    // Încarcă datele pentru graficul de reparații
    async loadRepairsData() {
        try {
            const lucrari = await db.lucrari.getAll();
            const repairTypes = {};

            lucrari.forEach(l => {
                if (l.categorie) {
                    repairTypes[l.categorie] = (repairTypes[l.categorie] || 0) + 1;
                }
            });

            const labels = Object.keys(repairTypes);
            const data = Object.values(repairTypes);

            return { labels, data };
        } catch (error) {
            console.error('Error loading repairs data:', error);
            return { labels: [], data: [] };
        }
    },



    // Încarcă activitatea recentă
    async loadRecentActivity() {
        try {
            const lucrari = await db.lucrari.getAll();
            
            // Simulează activitate recentă (în realitate ar veni din log_activitate)
            const recentActivities = lucrari
                .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
                .slice(0, 10)
                .map(l => ({
                    type: l.stare === 'finalizat' ? 'completed' : 'updated',
                    description: l.stare === 'finalizat' ? 
                        `Lucrarea ${l.numar_lucrare} a fost finalizată` :
                        `Lucrarea ${l.numar_lucrare} a fost actualizată`,
                    time: l.updated_at || l.created_at,
                    client: l.clienti?.nume || 'Client necunoscut'
                }));

            return recentActivities;
        } catch (error) {
            console.error('Error loading recent activity:', error);
            return [];
        }
    },

    // Actualizează statisticile în UI
    updateStats(stats) {
        document.getElementById('active-jobs').textContent = stats.lucrariActive;
        document.getElementById('total-clients').textContent = stats.totalClienti;
        document.getElementById('monthly-revenue').textContent = helpers.formatPrice(stats.venitLunar);
        // Nu mai actualizăm piese în stoc
    },

    // Actualizează graficul de venituri
    updateRevenueChart(data) {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        // Distruge graficul existent
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Venituri (MDL)',
                    data: data.data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ro-RO', {
                                    style: 'currency',
                                    currency: 'MDL',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    },

    // Actualizează graficul de reparații
    updateRepairsChart(data) {
        const ctx = document.getElementById('repairs-chart');
        if (!ctx) return;

        if (this.charts.repairs) {
            this.charts.repairs.destroy();
        }

        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
        ];

        this.charts.repairs = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: colors.slice(0, data.labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                }
            }
        });
    },



    // Actualizează activitatea recentă
    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">Nu există activitate recentă</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                }">
                    <i class="fas ${activity.type === 'completed' ? 'fa-check text-green-600' : 'fa-edit text-blue-600'} text-sm"></i>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                    <p class="text-sm text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500">${activity.client}</p>
                </div>
                <div class="text-xs text-gray-400">
                    ${helpers.formatDate(activity.time, true)}
                </div>
            </div>
        `).join('');
    },

    // Export dashboard
    exportDashboard() {
        NotificationModule.show('Exportul dashboard-ului va fi implementat în curând', 'info');
    },

    // Configurează refresh automat
    setupAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 5 * 60 * 1000);
    },

    // Cleanup la ieșirea din secțiune
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        // Distruge graficele
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
};

// Inițializează modulul când se încarcă DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.supabaseClient) {
            window.DashboardModule.init();
        }
    }, 100);
});