// Modulul pentru gestionarea lucrărilor
window.LucrariModule = {
    lucrari: [],
    currentPage: 1,
    itemsPerPage: CONSTANTS.ITEMS_PER_PAGE,
    filters: {},
    sortField: 'dataIntrare',
    sortDirection: 'desc',
    isInitialized: false,

    // Inițializează modulul
    init() {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Lucrari module initialized');
    },

    // Configurează event listeners
    setupEventListeners() {
        // Navigation click
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-section="lucrari"]')) {
                e.preventDefault();
                this.show();
            }
        });
    },

    // Afișează secțiunea lucrări
    async show() {
        console.log('LucrariModule.show() called');
        try {
            // Actualizează navigația
            this.updateNavigation();
            
            // Încarcă template-ul
            await this.loadTemplate();
            
            // Încarcă datele
            await this.loadData();
            
            // Configurează event listeners pentru această secțiune
            setTimeout(() => {
                console.log('About to setup section event listeners...');
                this.setupSectionEventListeners();
            }, 500);
            
        } catch (error) {
            console.error('Error showing lucrari section:', error);
            NotificationModule.show('Eroare la încărcarea secțiunii lucrări', 'error');
        }
    },

    // Actualizează navigația
    updateNavigation() {
        // Actualizează starea activă în meniu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('text-primary-600', 'bg-primary-50');
            item.classList.add('text-gray-700');
        });
        
        const lucrariNav = document.querySelector('[data-section="lucrari"]');
        if (lucrariNav) {
            lucrariNav.classList.add('text-primary-600', 'bg-primary-50');
            lucrariNav.classList.remove('text-gray-700');
        }
    },

    // Încarcă template-ul pentru secțiunea lucrări
    async loadTemplate() {
        const content = `
            <!-- Modern header with clean design -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Lucrări</h1>
                    <p class="text-gray-600 mt-1">Gestionează toate lucrările din service</p>
                </div>
                <button id="add-lucrare-btn" class="btn btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Lucrare nouă
                </button>
            </div>

            <!-- Clean filters bar -->
            <div class="flex flex-col lg:flex-row gap-4 mb-6">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="search-lucrari" 
                               class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                               placeholder="Caută după număr, client sau mașină...">
                    </div>
                </div>
                
                <!-- Filter buttons -->
                <div class="flex gap-2 flex-wrap">
                    <div class="relative">
                        <select id="filter-stare" class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32">
                            <option value="">Toate stările</option>
                            <option value="in_asteptare">În așteptare</option>
                            <option value="in_lucru">În lucru</option>
                            <option value="finalizat">Finalizat</option>
                            <option value="livrat">Livrat</option>
                            <option value="anulat">Anulat</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                        </div>
                    </div>
                    
                    <div class="relative">
                        <select id="filter-categorie" class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-36">
                            <option value="">Toate categoriile</option>
                            ${CONSTANTS.CATEGORII_LUCRARI.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
                        </div>
                    </div>
                    
                    <button id="clear-filters-btn" class="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors">
                        <i class="fas fa-times mr-1"></i>
                        Resetează
                    </button>
                    
                    <button id="export-lucrari-btn" class="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors">
                        <i class="fas fa-download mr-1"></i>
                        Export
                    </button>
                </div>
            </div>

            <!-- Results summary -->
            <div class="flex items-center justify-between mb-4">
                <div class="text-sm text-gray-600">
                    <span id="lucrari-count">0</span> lucrări găsite
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">Sortează după:</span>
                    <select id="sort-lucrari" class="text-sm border-0 bg-transparent text-gray-700 focus:ring-0 cursor-pointer">
                        <option value="data_intrare_desc">Data intrării ↓</option>
                        <option value="data_intrare_asc">Data intrării ↑</option>
                        <option value="numar_lucrare">Număr lucrare</option>
                        <option value="client_nume">Client</option>
                        <option value="stare">Stare</option>
                    </select>
                </div>
            </div>

            <!-- Modern table with clean design -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client & Mașină
                                </th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categorie
                                </th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stare
                                </th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cost
                                </th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acțiuni
                                </th>
                            </tr>
                        </thead>
                        <tbody id="lucrari-table-body" class="bg-white divide-y divide-gray-200">
                            <!-- Datele vor fi încărcate dinamic -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Paginare -->
                <div id="pagination-container" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <!-- Paginarea va fi generată dinamic -->
                </div>
            </div>

            <!-- Empty state -->
            <div id="empty-state" class="hidden">
                <div class="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-wrench text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Nicio lucrare găsită</h3>
                    <p class="text-gray-600 mb-6 max-w-sm mx-auto">
                        Nu există lucrări care să corespundă criteriilor de căutare.
                    </p>
                    <button id="add-first-lucrare-btn" class="btn btn-primary">
                        <i class="fas fa-plus mr-2"></i>
                        Adaugă prima lucrare
                    </button>
                </div>
            </div>
        `;

        // Afișează conținutul
        this.showContent(content);
        
        console.log('Template loaded, content shown');
    },

    // Afișează conținutul în secțiunea lucrări
    showContent(content) {
        console.log('showContent called');
        // Ascunde toate secțiunile
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.add('hidden');
        });

        // Afișează secțiunea lucrări cu container pentru padding
        const lucrariSection = document.getElementById('lucrari-section');
        console.log('Lucrari section found:', !!lucrariSection);
        
        lucrariSection.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                ${content}
            </div>
        `;
        lucrariSection.classList.remove('hidden');
        
        console.log('Content injected, section shown');
    },

    // Configurează event listeners pentru această secțiune
    setupSectionEventListeners() {
        console.log('Setting up section event listeners...');
        
        // Wait for DOM to be ready and add debugging
        setTimeout(() => {
            // Buton adăugare lucrare
            const addBtn = document.getElementById('add-lucrare-btn');
            console.log('Add button found:', !!addBtn);
            console.log('Add button element:', addBtn);
            
            if (addBtn) {
                // Remove any existing listeners first
                addBtn.replaceWith(addBtn.cloneNode(true));
                const freshBtn = document.getElementById('add-lucrare-btn');
                
                freshBtn.addEventListener('click', (e) => {
                    console.log('Add button clicked!', e);
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Afișează modalul pentru adăugare lucrare nouă
                    this.showAddEditModal();
                });
                console.log('Event listener attached to add button');
                
                // Add global click listener as fallback
                document.addEventListener('click', (e) => {
                    if (e.target.id === 'add-lucrare-btn' || e.target.closest('#add-lucrare-btn')) {
                        console.log('Global click detected on add button!');
                        e.preventDefault();
                        e.stopPropagation();
                        this.showAddEditModal();
                    }
                });
                
            } else {
                console.error('Add button not found in DOM');
                console.log('Available elements with id:', document.querySelectorAll('[id]'));
            }
        }, 200);

        document.getElementById('add-first-lucrare-btn')?.addEventListener('click', () => {
            this.showAddEditModal();
        });

        // Căutare
        const searchInput = document.getElementById('search-lucrari');
        if (searchInput) {
            searchInput.addEventListener('input', helpers.debounce(() => {
                this.handleSearch();
            }, 300));
        }

        // Filtre
        document.getElementById('filter-stare')?.addEventListener('change', () => {
            this.handleFilter();
        });

        document.getElementById('filter-categorie')?.addEventListener('change', () => {
            this.handleFilter();
        });

        document.getElementById('filter-mecanic')?.addEventListener('change', () => {
            this.handleFilter();
        });

        // Șterge filtre
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Export
        document.getElementById('export-lucrari-btn')?.addEventListener('click', () => {
            this.showExportModal();
        });

        // Sortare
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                this.handleSort(header.dataset.field);
            });
        });
    },

    // Încarcă datele lucrărilor
    async loadData() {
        try {
            // Încearcă să încarce din cache
            const cacheKey = 'lucrari_list';
            let cachedData = StorageModule.getCache(cacheKey);

            if (cachedData && StorageModule.isOnlineStatus()) {
                this.lucrari = cachedData;
                this.renderTable();
            }

            // Încarcă mecanicii pentru filtru
            await this.loadMecanici();

            // Încarcă din Supabase
            const data = await db.lucrari.getAll();
            
            this.lucrari = data || [];

            // Salvează în cache
            StorageModule.setCache(cacheKey, this.lucrari);

            // Renderizează tabelul
            this.renderTable();

        } catch (error) {
            console.error('Error loading lucrari:', error);
            
            // Încearcă să încarce din cache dacă nu sunt online
            if (!StorageModule.isOnlineStatus()) {
                const cacheKey = 'lucrari_list';
                const cachedData = StorageModule.getCache(cacheKey);
                
                if (cachedData) {
                    this.lucrari = cachedData;
                    this.renderTable();
                    NotificationModule.show('Date încărcate din cache (offline)', 'warning');
                } else {
                    NotificationModule.show('Nu sunt date disponibile offline', 'error');
                }
            } else {
                const errorMessage = handleSupabaseError(error);
                NotificationModule.show(errorMessage, 'error');
            }
        }
    },

    // Încarcă mecanicii pentru filtru
    async loadMecanici() {
        try {
            const mecanici = await db.mecanici.getActive();

            // Populează dropdown-ul
            const filterMecanic = document.getElementById('filter-mecanic');
            if (filterMecanic) {
                // Păstrează opțiunea implicită
                const defaultOption = filterMecanic.querySelector('option[value=""]');
                filterMecanic.innerHTML = '';
                filterMecanic.appendChild(defaultOption);

                mecanici.forEach(mecanic => {
                    const option = document.createElement('option');
                    option.value = mecanic.id;
                    option.textContent = mecanic.nume;
                    filterMecanic.appendChild(option);
                });
            }

        } catch (error) {
            console.error('Error loading mecanici:', error);
        }
    },

    // Renderizează tabelul cu lucrări
    renderTable() {
        const tableBody = document.getElementById('lucrari-table-body');
        const emptyState = document.getElementById('empty-state');
        const countElement = document.getElementById('lucrari-count');

        if (!tableBody) return;

        // Aplică filtrele
        const filteredLucrari = this.applyFilters();

        // Actualizează contorul
        if (countElement) {
            countElement.textContent = filteredLucrari.length;
        }

        // Verifică dacă sunt date
        if (filteredLucrari.length === 0) {
            tableBody.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        // Paginare
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedLucrari = filteredLucrari.slice(startIndex, endIndex);

        // Generează rândurile tabelului cu design modern
        tableBody.innerHTML = paginatedLucrari.map(lucrare => {
            console.log('Rendering lucrare:', lucrare); // Debug
            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div>
                            <div class="text-sm font-medium text-gray-900">${lucrare.clienti?.nume || 'Client necunoscut'}</div>
                            <div class="text-sm text-gray-500">${lucrare.numar_inmatriculare || '-'} • ${lucrare.marca || ''} ${lucrare.model || ''}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${lucrare.categorie || '-'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${this.getStareBadge(lucrare.stare)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${helpers.formatDate(lucrare.data_intrare)}</div>
                        ${lucrare.data_finalizare ? `<div class="text-xs text-gray-500">Finalizat: ${helpers.formatDate(lucrare.data_finalizare)}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${helpers.formatPrice(lucrare.total_cost || 0)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center space-x-3">
                            <button onclick="LucrariModule.viewLucrare('${lucrare.id}')" 
                                    class="text-gray-400 hover:text-blue-600 transition-colors" title="Vizualizează">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="LucrariModule.editLucrare('${lucrare.id}')" 
                                    class="text-gray-400 hover:text-green-600 transition-colors" title="Editează">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="LucrariModule.deleteLucrare('${lucrare.id}')" 
                                    class="text-gray-400 hover:text-red-600 transition-colors" title="Șterge">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Generează paginarea
        this.renderPagination(filteredLucrari.length);
    },

    // Obține badge-ul pentru stare
    getStareBadge(stare) {
        const badges = {
            'in_asteptare': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">În așteptare</span>',
            'in_lucru': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">În lucru</span>',
            'finalizat': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Finalizat</span>',
            'livrat': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Livrat</span>',
            'anulat': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Anulat</span>'
        };
        
        return badges[stare] || '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">-</span>';
    },

    // Aplică filtrele
    applyFilters() {
        let filtered = [...this.lucrari];

        // Filtru căutare
        const searchTerm = document.getElementById('search-lucrari')?.value?.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(lucrare => {
                console.log('Searching in lucrare:', lucrare); // Debug
                const searchableText = [
                    lucrare.numar_lucrare,
                    lucrare.clienti?.nume,
                    lucrare.clienti?.telefon,
                    lucrare.numar_inmatriculare,
                    lucrare.marca,
                    lucrare.model,
                    lucrare.descriere
                ].filter(Boolean).join(' ').toLowerCase();
                
                console.log('Searchable text:', searchableText); // Debug
                console.log('Search term:', searchTerm); // Debug
                const matches = searchableText.includes(searchTerm);
                console.log('Matches:', matches); // Debug
                
                return matches;
            });
        }

        // Filtru stare
        const stareFilter = document.getElementById('filter-stare')?.value;
        if (stareFilter) {
            filtered = filtered.filter(lucrare => lucrare.stare === stareFilter);
        }

        // Filtru categorie
        const categorieFilter = document.getElementById('filter-categorie')?.value;
        if (categorieFilter) {
            filtered = filtered.filter(lucrare => lucrare.categorie === categorieFilter);
        }

        // Filtru mecanic
        const mecanicFilter = document.getElementById('filter-mecanic')?.value;
        if (mecanicFilter) {
            filtered = filtered.filter(lucrare => lucrare.mecanicResponsabil === mecanicFilter);
        }

        // Sortare
        return helpers.sortBy(filtered, this.sortField, this.sortDirection === 'asc');
    },

    // Gestionează căutarea
    handleSearch() {
        this.currentPage = 1;
        this.renderTable();
    },

    // Gestionează filtrarea
    handleFilter() {
        this.currentPage = 1;
        this.renderTable();
    },

    // Șterge toate filtrele
    clearFilters() {
        document.getElementById('search-lucrari').value = '';
        document.getElementById('filter-stare').value = '';
        document.getElementById('filter-categorie').value = '';
        document.getElementById('filter-mecanic').value = '';
        
        this.currentPage = 1;
        this.renderTable();
    },

    // Gestionează sortarea
    handleSort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }

        this.renderTable();
        this.updateSortIcons();
    },

    // Actualizează iconițele de sortare
    updateSortIcons() {
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort ml-1';
        });

        const activeHeader = document.querySelector(`[data-field="${this.sortField}"] i`);
        if (activeHeader) {
            activeHeader.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'} ml-1`;
        }
    },

    // Renderizează paginarea
    renderPagination(totalItems) {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    Afișez ${(this.currentPage - 1) * this.itemsPerPage + 1}-${Math.min(this.currentPage * this.itemsPerPage, totalItems)} din ${totalItems} rezultate
                </div>
                <div class="flex space-x-1">
        `;

        // Buton Previous
        paginationHTML += `
            <button ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="LucrariModule.goToPage(${this.currentPage - 1})"
                    class="px-3 py-1 text-sm border rounded ${this.currentPage === 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'}">
                Anterior
            </button>
        `;

        // Numerele paginilor
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button onclick="LucrariModule.goToPage(${i})"
                            class="px-3 py-1 text-sm border rounded ${i === this.currentPage ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-50'}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="px-2 text-gray-500">...</span>';
            }
        }

        // Buton Next
        paginationHTML += `
            <button ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="LucrariModule.goToPage(${this.currentPage + 1})"
                    class="px-3 py-1 text-sm border rounded ${this.currentPage === totalPages ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'}">
                Următor
            </button>
        `;

        paginationHTML += '</div></div>';
        container.innerHTML = paginationHTML;
    },

    // Navighează la o pagină
    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    },

    // Afișează modal pentru adăugare/editare lucrare
    async showAddEditModal(lucrareId = null) {
        console.log('showAddEditModal called with:', lucrareId);
        const isEdit = lucrareId !== null;
        
        // Încarcă date necesare pentru modal
        const clienti = await this.loadClienti();
        
        // Pentru editare, încarcă datele complete din baza de date
        let lucrare = null;
        let servicii = [];
        
        if (isEdit) {
            try {
                lucrare = await db.lucrari.getById(lucrareId);
                servicii = await db.servicii.getAllByLucrareId(lucrareId);
                console.log('Loaded lucrare for edit:', lucrare);
                console.log('Loaded servicii:', servicii);
            } catch (error) {
                console.error('Error loading lucrare data:', error);
                NotificationModule.show('Eroare la încărcarea datelor lucrării', 'error');
                return;
            }
        }
        
        console.log('Data loaded - clienti:', clienti.length, 'servicii:', servicii.length);

        const modalHTML = `
            <div class="modal bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">
                            ${isEdit ? 'Editează lucrare' : 'Lucrare nouă'}
                        </h2>
                        <p class="text-sm text-gray-500 mt-1">Completează informațiile pentru lucrare</p>
                    </div>
                    <button id="close-lucrare-modal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <i class="fas fa-times text-gray-400"></i>
                    </button>
                </div>
                
                <!-- Content with scroll -->
                <div class="flex-1 overflow-y-auto px-6 py-4">
                    <form id="lucrare-form" class="space-y-3">
                        <!-- Client și Mașină - Row layout -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Client info -->
                            <div class="space-y-3">
                                <h3 class="text-base font-medium text-gray-900 border-b border-gray-200 pb-1">Client</h3>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Client <span class="text-red-500">*</span>
                                    </label>
                                    <select id="lucrare-client" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm">
                                        <option value="">Selectează client</option>
                                        ${clienti.map(client => 
                                            `<option value="${client.id}" ${lucrare?.client_id === client.id ? 'selected' : ''}>${client.nume}</option>`
                                        ).join('')}
                                    </select>
                                    <button type="button" id="add-client-btn" class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                        <i class="fas fa-plus mr-1"></i> Adaugă client nou
                                    </button>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Telefon client</label>
                                    <input type="tel" id="lucrare-telefon" readonly
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm" 
                                           placeholder="Se completează automat">
                                </div>
                            </div>
                            
                            <!-- Mașină info -->
                            <div class="space-y-3">
                                <h3 class="text-base font-medium text-gray-900 border-b border-gray-200 pb-1">Mașină</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Nr. înmatriculare <span class="text-red-500">*</span>
                                        </label>
                                        <input type="text" id="lucrare-nr-inmatriculare" required
                                               value="${lucrare?.nr_inmatriculare || ''}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">An fabricație</label>
                                        <input type="number" id="lucrare-an" min="1980" max="2025"
                                               value="${lucrare?.an_fabricatie || ''}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                        <input type="text" id="lucrare-marca"
                                               value="${lucrare?.marca || ''}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <input type="text" id="lucrare-model"
                                               value="${lucrare?.model || ''}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraj</label>
                                        <input type="number" id="lucrare-km" min="0"
                                               value="${lucrare?.kilometraj || ''}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Puterea motorului (CP)</label>
                                        <input type="number" id="lucrare-putere-motor" min="0"
                                               value="${lucrare?.putere_motor || ''}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">VIN Code</label>
                                        <input type="text" id="lucrare-vin"
                                               value="${lucrare?.vin || ''}"
                                               maxlength="17"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tip combustibil</label>
                                        <select id="lucrare-combustibil" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm">
                                            <option value="">Selectează...</option>
                                            <option value="benzina" ${lucrare?.combustibil === 'benzina' ? 'selected' : ''}>Benzină</option>
                                            <option value="motorina" ${lucrare?.combustibil === 'motorina' ? 'selected' : ''}>Motorină</option>
                                            <option value="hibrid" ${lucrare?.combustibil === 'hibrid' ? 'selected' : ''}>Hibrid</option>
                                            <option value="electric" ${lucrare?.combustibil === 'electric' ? 'selected' : ''}>Electric</option>
                                            <option value="gpl" ${lucrare?.combustibil === 'gpl' ? 'selected' : ''}>GPL</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Detalii Lucrare -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-3">
                                <h3 class="text-base font-medium text-gray-900 border-b border-gray-200 pb-1">Detalii Lucrare</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Număr lucrare (auto-generat)
                                        </label>
                                        <input type="text" id="lucrare-numar" readonly
                                               value="${lucrare?.numar_lucrare || 'Se va genera automat'}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Data intrare <span class="text-red-500">*</span>
                                        </label>
                                        <input type="date" id="lucrare-data-intrare" required
                                               value="${lucrare?.data_intrare || new Date().toISOString().split('T')[0]}"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Descriere lucrare</label>
                                    <textarea id="lucrare-descriere" rows="3" 
                                              placeholder="Descrieți lucrarea care trebuie efectuată..."
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none">${lucrare?.descriere || ''}</textarea>
                                </div>
                            </div>
                            
                            <!-- Servicii efectuate -->
                            <div class="space-y-3">
                                <div class="flex justify-between items-center border-b border-gray-200 pb-1">
                                    <h3 class="text-base font-medium text-gray-900">Servicii efectuate</h3>
                                    <button type="button" id="add-service-btn" class="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                                        <i class="fas fa-plus mr-1"></i> Adaugă serviciu
                                    </button>
                                </div>
                                
                                <!-- Lista servicii -->
                                <div id="servicii-container" class="space-y-2 min-h-[100px]">
                                    <!-- Serviciile vor fi adăugate dinamic aici -->
                                    <div id="no-services-message" class="text-gray-500 text-sm text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                        <i class="fas fa-wrench text-gray-300 text-lg mb-2"></i>
                                        <p>Nu sunt servicii adăugate încă.</p>
                                        <p class="text-xs">Adaugă primul serviciu pentru această lucrare.</p>
                                    </div>
                                </div>
                                
                                <!-- Total general -->
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div class="grid grid-cols-3 gap-4 text-sm">
                                        <div class="text-center">
                                            <p class="text-gray-600">Piese</p>
                                            <p id="total-piese" class="font-semibold text-blue-700">0 MDL</p>
                                        </div>
                                        <div class="text-center">
                                            <p class="text-gray-600">Manoperă</p>
                                            <p id="total-manopera" class="font-semibold text-blue-700">0 MDL</p>
                                        </div>
                                        <div class="text-center">
                                            <p class="text-gray-600">Total general</p>
                                            <p id="total-general" class="font-bold text-lg text-blue-800">0 MDL</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Footer buttons INSIDE form -->
                        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div class="flex justify-end space-x-3">
                                <button type="button" id="cancel-lucrare" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Anulează
                                </button>
                                <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors">
                                    <i class="fas fa-save mr-2"></i>
                                    ${isEdit ? 'Actualizează' : 'Salvează'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        console.log('About to show modal...');
        console.log('ModalModule exists:', !!window.ModalModule);
        console.log('ModalModule.show function:', typeof window.ModalModule?.show);
        
        try {
            ModalModule.show(modalHTML, { size: '4xl' });
            console.log('ModalModule.show completed');
        } catch (error) {
            console.error('Error in ModalModule.show:', error);
        }
        
        console.log('Modal shown, setting up event listeners...');
        // Configurează event listeners pentru modal
        this.setupModalEventListeners(lucrareId, clienti, servicii);
        
        // Pentru editare, setează telefonul clientului
        if (isEdit && lucrare) {
            setTimeout(() => {
                const client = clienti.find(c => c.id === lucrare.client_id);
                if (client) {
                    const telefonInput = document.getElementById('lucrare-telefon');
                    if (telefonInput) {
                        telefonInput.value = client.telefon || '';
                    }
                }
            }, 100);
        }
    },

    // Încarcă lista de clienți pentru modal
    async loadClienti() {
        try {
            return await db.clienti.getAll() || [];
        } catch (error) {
            console.error('Error loading clienti:', error);
            return [];
        }
    },


    // Generează număr lucrare automat
    generateNumarLucrare() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
        
        return `L${year}${month}${day}-${time}`;
    },

    // Configurează event listeners pentru modal
    setupModalEventListeners(lucrareId, clienti, servicii = []) {
        // Închidere modal
        document.getElementById('close-lucrare-modal').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('cancel-lucrare').addEventListener('click', () => {
            ModalModule.hide();
        });

        // Selectare client - actualizează telefonul și datele mașinii
        document.getElementById('lucrare-client').addEventListener('change', async (e) => {
            const clientId = e.target.value;
            const client = clienti.find(c => c.id === clientId);
            
            // Actualizează telefonul
            const telefonInput = document.getElementById('lucrare-telefon');
            if (client && telefonInput) {
                telefonInput.value = client.telefon || '';
            } else if (telefonInput) {
                telefonInput.value = '';
            }
            
            // Auto-completează datele mașinii din ultima lucrare a clientului
            if (clientId) {
                try {
                    const ultimaLucrare = this.lucrari
                        .filter(l => l.client_id === clientId)
                        .sort((a, b) => new Date(b.data_intrare) - new Date(a.data_intrare))[0];
                    
                    if (ultimaLucrare) {
                        // Completează datele dar le lasă editabile
                        const campos = [
                            { id: 'lucrare-nr-inmatriculare', value: ultimaLucrare.numar_inmatriculare },
                            { id: 'lucrare-marca', value: ultimaLucrare.marca },
                            { id: 'lucrare-model', value: ultimaLucrare.model },
                            { id: 'lucrare-an', value: ultimaLucrare.an_fabricatie },
                            { id: 'lucrare-km', value: ultimaLucrare.km },
                            { id: 'lucrare-vin', value: ultimaLucrare.vin },
                            { id: 'lucrare-combustibil', value: ultimaLucrare.combustibil },
                            { id: 'lucrare-putere-motor', value: ultimaLucrare.putere_motor }
                        ];
                        
                        campos.forEach(campo => {
                            const input = document.getElementById(campo.id);
                            if (input && campo.value) {
                                input.value = campo.value;
                                // Adaugă o clasă pentru a arăta că e auto-completat
                                input.classList.add('auto-filled');
                                setTimeout(() => input.classList.remove('auto-filled'), 2000);
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error loading client car data:', error);
                }
            }
        });

        // Adăugare client nou
        const addClientBtn = document.getElementById('add-client-btn');
        if (addClientBtn) {
            addClientBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add client button clicked!');
                this.showAddClientModal();
            });
            console.log('Add client button event listener attached');
        } else {
            console.error('Add client button not found!');
        }

        // Adăugare serviciu nou
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addNewService();
            });
            console.log('Add service button event listener attached');
        } else {
            console.error('Add service button not found!');
        }

        // Submit form
        const form = document.getElementById('lucrare-form');
        console.log('Form found:', !!form);
        
        if (form) {
            form.addEventListener('submit', (e) => {
                console.log('Form submit event triggered!', e);
                e.preventDefault();
                this.handleSaveLucrare(lucrareId);
            });
            console.log('Form submit event listener attached');
        } else {
            console.error('Form not found!');
        }
        
        // Target the specific submit button in the modal form
        setTimeout(() => {
            const submitBtn = document.querySelector('#lucrare-form button[type="submit"]');
            console.log('Modal submit button found:', !!submitBtn);
            console.log('Modal submit button element:', submitBtn);
            
            if (submitBtn) {
                submitBtn.addEventListener('click', (e) => {
                    console.log('MODAL SUBMIT BUTTON CLICKED!', e);
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleSaveLucrare(lucrareId);
                });
                console.log('Modal submit button listener attached');
            } else {
                console.error('Modal submit button NOT FOUND!');
                console.log('All buttons in modal:', document.querySelectorAll('#lucrare-form button'));
            }
        }, 100);

        // Încarcă serviciile existente pentru editare
        if (servicii.length > 0) {
            console.log('Loading existing services for edit:', servicii);
            this.currentServices = [];
            this.nextServiceId = 1;
            
            servicii.forEach((serviciu, index) => {
                const service = {
                    id: this.nextServiceId++,
                    categorie: serviciu.categorie || '',
                    descriere: serviciu.descriere || '',
                    cost_piese: parseFloat(serviciu.cost_piese) || 0,
                    cost_manopera: parseFloat(serviciu.cost_manopera) || 0,
                    observatii: serviciu.observatii || '',
                    ordine: serviciu.ordine || (index + 1),
                    database_id: serviciu.id // Păstrează ID-ul din baza de date pentru update
                };
                this.currentServices.push(service);
            });
            
            // Renderizează serviciile și calculează totalul
            this.renderServices();
            this.calculateTotal();
        } else {
            // Resetează serviciile pentru lucrare nouă
            this.currentServices = [];
            this.nextServiceId = 1;
        }
    },

    // === MULTI-SERVICE SYSTEM ===
    
    // Global services array for the current work order
    currentServices: [],
    nextServiceId: 1,

    // Adaugă un serviciu nou
    addNewService() {
        const serviceId = this.nextServiceId++;
        const service = {
            id: serviceId,
            categorie: '',
            descriere: '',
            cost_piese: 0,
            cost_manopera: 0,
            observatii: '',
            ordine: this.currentServices.length + 1
        };
        
        this.currentServices.push(service);
        this.renderServices();
        this.calculateTotal();
        
        // Focus pe primul câmp al serviciului nou adăugat
        setTimeout(() => {
            const categorieSelect = document.querySelector(`#service-${serviceId}-categorie`);
            if (categorieSelect) categorieSelect.focus();
        }, 100);
    },

    // Renderizează lista de servicii
    renderServices() {
        const container = document.getElementById('servicii-container');
        const noServicesMessage = document.getElementById('no-services-message');
        
        if (this.currentServices.length === 0) {
            noServicesMessage.style.display = 'block';
            return;
        }
        
        noServicesMessage.style.display = 'none';
        
        // Clear existing services except the no-services message
        const existingServices = container.querySelectorAll('.service-item');
        existingServices.forEach(item => item.remove());
        
        this.currentServices.forEach((service, index) => {
            const serviceHTML = this.createServiceHTML(service, index);
            noServicesMessage.insertAdjacentHTML('beforebegin', serviceHTML);
        });
        
        // Attach event listeners to new services
        this.attachServiceEventListeners();
    },

    // Creează HTML-ul pentru un serviciu
    createServiceHTML(service, index) {
        return `
            <div class="service-item bg-white border border-gray-200 rounded-lg p-4" data-service-id="${service.id}">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-medium text-gray-900">Serviciu ${index + 1}</h4>
                    <div class="flex space-x-2">
                        <button type="button" class="move-service-up text-gray-400 hover:text-blue-600" title="Mută în sus" ${index === 0 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button type="button" class="move-service-down text-gray-400 hover:text-blue-600" title="Mută în jos" ${index === this.currentServices.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <button type="button" class="remove-service text-gray-400 hover:text-red-600" title="Șterge serviciu">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
                        <select id="service-${service.id}-categorie" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm" required>
                            <option value="">Selectează categoria</option>
                            ${CONSTANTS.CATEGORII_LUCRARI.map(cat => 
                                `<option value="${cat}" ${service.categorie === cat ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Descriere *</label>
                        <input type="text" id="service-${service.id}-descriere" 
                               value="${service.descriere}" 
                               placeholder="Ex: Schimb ulei motor și filtru"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" required>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Piese (MDL)</label>
                        <input type="number" id="service-${service.id}-piese" 
                               value="${service.cost_piese}" 
                               step="0.01" min="0"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Manoperă (MDL)</label>
                        <input type="number" id="service-${service.id}-manopera" 
                               value="${service.cost_manopera}" 
                               step="0.01" min="0"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Total serviciu</label>
                        <input type="number" id="service-${service.id}-total" 
                               value="${(service.cost_piese + service.cost_manopera).toFixed(2)}" 
                               readonly
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium">
                    </div>
                </div>
                
                <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Observații serviciu</label>
                    <textarea id="service-${service.id}-observatii" 
                              rows="2" 
                              placeholder="Observații pentru acest serviciu..."
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none">${service.observatii}</textarea>
                </div>
            </div>
        `;
    },

    // Atașează event listeners pentru servicii
    attachServiceEventListeners() {
        // Remove service buttons
        document.querySelectorAll('.remove-service').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceItem = e.target.closest('.service-item');
                const serviceId = parseInt(serviceItem.dataset.serviceId);
                this.removeService(serviceId);
            });
        });

        // Move service up/down buttons
        document.querySelectorAll('.move-service-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceItem = e.target.closest('.service-item');
                const serviceId = parseInt(serviceItem.dataset.serviceId);
                this.moveService(serviceId, 'up');
            });
        });

        document.querySelectorAll('.move-service-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceItem = e.target.closest('.service-item');
                const serviceId = parseInt(serviceItem.dataset.serviceId);
                this.moveService(serviceId, 'down');
            });
        });

        // Input change listeners for real-time calculation
        document.querySelectorAll('[id*="service-"][id*="-piese"], [id*="service-"][id*="-manopera"]').forEach(input => {
            input.addEventListener('input', () => {
                this.updateServiceFromInput(input);
                this.calculateTotal();
            });
        });

        // Other field change listeners
        document.querySelectorAll('[id*="service-"][id*="-categorie"], [id*="service-"][id*="-descriere"], [id*="service-"][id*="-observatii"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateServiceFromInput(input);
            });
        });
    },

    // Actualizează serviciul din input
    updateServiceFromInput(input) {
        const serviceId = this.extractServiceIdFromInput(input);
        const service = this.currentServices.find(s => s.id === serviceId);
        if (!service) return;

        const fieldName = input.id.split('-').pop();
        const value = input.value;

        switch(fieldName) {
            case 'categorie':
                service.categorie = value;
                break;
            case 'descriere':
                service.descriere = value;
                break;
            case 'piese':
                service.cost_piese = parseFloat(value) || 0;
                break;
            case 'manopera':
                service.cost_manopera = parseFloat(value) || 0;
                break;
            case 'observatii':
                service.observatii = value;
                break;
        }

        // Update service total
        if (fieldName === 'piese' || fieldName === 'manopera') {
            const totalInput = document.getElementById(`service-${serviceId}-total`);
            if (totalInput) {
                totalInput.value = (service.cost_piese + service.cost_manopera).toFixed(2);
            }
        }
    },

    // Extrage ID-ul serviciului din input
    extractServiceIdFromInput(input) {
        const matches = input.id.match(/service-(\d+)-/);
        return matches ? parseInt(matches[1]) : null;
    },

    // Șterge un serviciu
    removeService(serviceId) {
        this.currentServices = this.currentServices.filter(s => s.id !== serviceId);
        this.renderServices();
        this.calculateTotal();
    },

    // Mută un serviciu în sus/jos
    moveService(serviceId, direction) {
        const index = this.currentServices.findIndex(s => s.id === serviceId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= this.currentServices.length) return;

        // Swap services
        [this.currentServices[index], this.currentServices[newIndex]] = 
        [this.currentServices[newIndex], this.currentServices[index]];

        // Update order
        this.currentServices.forEach((service, idx) => {
            service.ordine = idx + 1;
        });

        this.renderServices();
    },

    // Validează serviciile
    validateServices() {
        if (this.currentServices.length === 0) {
            NotificationModule.show('Trebuie să adaugi cel puțin un serviciu', 'warning');
            return false;
        }

        for (let service of this.currentServices) {
            if (!service.categorie) {
                NotificationModule.show('Toate serviciile trebuie să aibă o categorie selectată', 'warning');
                return false;
            }
            if (!service.descriere.trim()) {
                NotificationModule.show('Toate serviciile trebuie să aibă o descriere', 'warning');
                return false;
            }
        }

        return true;
    },

    // Calculează totalul automat pentru multi-service
    calculateTotal() {
        let totalPiese = 0;
        let totalManopera = 0;
        
        this.currentServices.forEach(service => {
            totalPiese += service.cost_piese;
            totalManopera += service.cost_manopera;
        });
        
        const totalGeneral = totalPiese + totalManopera;
        
        // Update display
        const totalPieseElement = document.getElementById('total-piese');
        const totalManoperaElement = document.getElementById('total-manopera');
        const totalGeneralElement = document.getElementById('total-general');
        
        if (totalPieseElement) {
            totalPieseElement.textContent = totalPiese.toFixed(2) + ' MDL';
        }
        if (totalManoperaElement) {
            totalManoperaElement.textContent = totalManopera.toFixed(2) + ' MDL';
        }
        if (totalGeneralElement) {
            totalGeneralElement.textContent = totalGeneral.toFixed(2) + ' MDL';
        }
        
        return {
            totalPiese,
            totalManopera,
            totalGeneral
        };
    },

    // Gestionează salvarea lucrării cu sistem multi-serviciu
    async handleSaveLucrare(lucrareId = null) {
        console.log('=== handleSaveLucrare STARTED (Multi-Service) ===');
        console.log('handleSaveLucrare called with:', lucrareId);
        const isEdit = lucrareId !== null;
        
        // Validare servicii
        if (!this.validateServices()) {
            return;
        }
        
        // Calculează totalul final
        const totals = this.calculateTotal();
        
        // Colectează datele principale ale lucrării
        const lucrareData = {
            client_id: document.getElementById('lucrare-client').value,
            numar_inmatriculare: document.getElementById('lucrare-nr-inmatriculare').value.trim(),
            marca: document.getElementById('lucrare-marca').value.trim(),
            model: document.getElementById('lucrare-model').value.trim(),
            an_fabricatie: parseInt(document.getElementById('lucrare-an').value) || null,
            km: parseInt(document.getElementById('lucrare-km').value) || null,
            vin: document.getElementById('lucrare-vin').value.trim(),
            combustibil: document.getElementById('lucrare-combustibil').value,
            putere_motor: parseInt(document.getElementById('lucrare-putere-motor').value) || null,
            // Prima categorie din servicii (pentru compatibilitate cu schema veche)
            categorie: this.currentServices[0]?.categorie || 'Multi-serviciu',
            data_intrare: document.getElementById('lucrare-data-intrare').value,
            stare: 'finalizat', // Toate lucrările sunt finalizate la intrare
            // Descriere generală (suma descrierilor serviciilor)
            descriere: this.currentServices.map(s => `${s.categorie}: ${s.descriere}`).join('; '),
            // Totale calculate din servicii
            cost_piese: totals.totalPiese,
            cost_manopera: totals.totalManopera,
            total_cost: totals.totalGeneral,
            observatii: '' // Nu mai folosim observații generale
        };

        // Validări
        if (!lucrareData.client_id) {
            NotificationModule.show('Selectează un client', 'warning');
            return;
        }

        // Numărul se generează automat în baza de date
        // if (!lucrareData.numar_lucrare) {
        //     NotificationModule.show('Numărul lucrării este obligatoriu', 'warning');
        //     return;
        // }

        if (!lucrareData.numar_inmatriculare) {
            NotificationModule.show('Numărul de înmatriculare este obligatoriu', 'warning');
            return;
        }

        try {
            console.log('Trying to save multi-service lucrare:', lucrareData);
            console.log('Services to save:', this.currentServices);

            let savedLucrare;

            if (isEdit) {
                // Actualizează lucrarea existentă
                console.log('Updating lucrare with ID:', lucrareId);
                savedLucrare = await db.lucrari.update(lucrareId, lucrareData);
                
                // Șterge serviciile existente pentru această lucrare
                const existingServices = await db.servicii.getAllByLucrareId(lucrareId);
                for (const service of existingServices) {
                    await db.servicii.delete(service.id);
                }
                
                NotificationModule.show('Lucrarea a fost actualizată cu succes!', 'success');
            } else {
                // Creează lucrare nouă
                console.log('Creating new lucrare...');
                savedLucrare = await db.lucrari.create(lucrareData);
                console.log('Created lucrare:', savedLucrare);
                
                NotificationModule.show('Lucrarea a fost adăugată cu succes!', 'success');
            }

            // Salvează toate serviciile pentru această lucrare
            console.log('Saving services for lucrare ID:', savedLucrare.id);
            for (const service of this.currentServices) {
                const serviceData = {
                    lucrare_id: savedLucrare.id,
                    categorie: service.categorie,
                    descriere: service.descriere,
                    cost_piese: service.cost_piese,
                    cost_manopera: service.cost_manopera,
                    observatii: service.observatii || '',
                    ordine: service.ordine
                };
                
                console.log('Saving service:', serviceData);
                await db.servicii.create(serviceData);
            }

            // Reset servicii curente
            this.currentServices = [];
            this.nextServiceId = 1;

            // Invalidează cache-ul
            StorageModule.invalidateCache('lucrari_list');
            
            // Reîncarcă datele complet
            await this.loadData();
            
            // Închide modal-ul
            ModalModule.hide();
            
        } catch (error) {
            console.error('Error saving lucrare:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Vizualizează o lucrare
    async viewLucrare(id) {
        const lucrare = this.lucrari.find(l => l.id === id);
        if (!lucrare) {
            NotificationModule.show('Lucrarea nu a fost găsită', 'error');
            return;
        }

        try {
            // Încarcă detaliile complete ale lucrării și serviciile
            const detaliiLucrare = await db.lucrari.getDetails(id);
            const servicii = await db.servicii.getAllByLucrareId(id);

            const modalHTML = `
                <div class="modal bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center ">
                        <h2 class="text-xl font-semibold text-gray-900">Detalii lucrare</h2>
                        <button id="close-view-modal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Informații client și mașină -->
                        <div class="lg:col-span-1">
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Client</h3>
                                <div class="space-y-2">
                                    <div>
                                        <span class="text-sm font-medium text-gray-500">Nume:</span>
                                        <p class="text-gray-900">${detaliiLucrare.clienti?.nume || lucrare.clienti?.nume || '-'}</p>
                                    </div>
                                    <div>
                                        <span class="text-sm font-medium text-gray-500">Telefon:</span>
                                        <p class="text-gray-900">${detaliiLucrare.clienti?.telefon || lucrare.clienti?.telefon || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Mașină</h3>
                                <div class="space-y-2">
                                    <div>
                                        <span class="text-sm font-medium text-gray-500">Nr. înmatriculare:</span>
                                        <p class="font-mono text-gray-900">${detaliiLucrare.numar_inmatriculare || lucrare.numar_inmatriculare || '-'}</p>
                                    </div>
                                    <div>
                                        <span class="text-sm font-medium text-gray-500">Marca/Model:</span>
                                        <p class="text-gray-900">${detaliiLucrare.marca || lucrare.marca || ''} ${detaliiLucrare.model || lucrare.model || ''}</p>
                                    </div>
                                    ${lucrare.an_fabricatie ? `
                                        <div>
                                            <span class="text-sm font-medium text-gray-500">An fabricație:</span>
                                            <p class="text-gray-900">${lucrare.an_fabricatie}</p>
                                        </div>
                                    ` : ''}
                                    ${lucrare.kilometraj ? `
                                        <div>
                                            <span class="text-sm font-medium text-gray-500">Kilometraj:</span>
                                            <p class="text-gray-900">${helpers.formatNumber(lucrare.kilometraj)} km</p>
                                        </div>
                                    ` : ''}
                                    ${(detaliiLucrare.vin || lucrare.vin) ? `
                                        <div>
                                            <span class="text-sm font-medium text-gray-500">VIN Code:</span>
                                            <p class="font-mono text-gray-900 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors select-all" 
                                               onclick="navigator.clipboard.writeText('${detaliiLucrare.vin || lucrare.vin}').then(() => NotificationModule.show('VIN copiat în clipboard!', 'success')).catch(() => NotificationModule.show('Eroare la copierea VIN-ului', 'error'))"
                                               title="Click pentru a copia VIN-ul">${detaliiLucrare.vin || lucrare.vin}</p>
                                        </div>
                                    ` : ''}
                                    ${(detaliiLucrare.combustibil || lucrare.combustibil) ? `
                                        <div>
                                            <span class="text-sm font-medium text-gray-500">Tip combustibil:</span>
                                            <p class="text-gray-900">${(detaliiLucrare.combustibil || lucrare.combustibil).charAt(0).toUpperCase() + (detaliiLucrare.combustibil || lucrare.combustibil).slice(1)}</p>
                                        </div>
                                    ` : ''}
                                    ${(detaliiLucrare.putere_motor || lucrare.putere_motor) ? `
                                        <div>
                                            <span class="text-sm font-medium text-gray-500">Puterea motorului:</span>
                                            <p class="text-gray-900">${detaliiLucrare.putere_motor || lucrare.putere_motor} CP</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Servicii efectuate și totale -->
                        <div class="lg:col-span-2">
                            <div class="bg-gray-50 rounded-lg p-4 mb-4">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">${lucrare.numar_lucrare}</h3>
                                        <p class="text-sm text-gray-500">${helpers.formatDate(lucrare.data_intrare)}</p>
                                    </div>
                                    ${this.getStareBadge(lucrare.stare)}
                                </div>
                            </div>
                            
                            <!-- Lista servicii efectuate -->
                            <div class="space-y-4 mb-6">
                                <h4 class="text-lg font-semibold text-gray-900">Servicii efectuate</h4>
                                ${servicii && servicii.length > 0 ? servicii.map((serviciu, index) => `
                                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                                        <div class="flex justify-between items-start mb-3">
                                            <div class="flex items-center space-x-3">
                                                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${index + 1}</span>
                                                <span class="status-badge status-info">${serviciu.categorie}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <p class="text-gray-900 font-medium">${serviciu.descriere}</p>
                                        </div>
                                        
                                        <div class="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span class="text-gray-500">Piese:</span>
                                                <p class="font-medium text-gray-900">${helpers.formatPrice(serviciu.cost_piese || 0)}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-500">Manoperă:</span>
                                                <p class="font-medium text-gray-900">${helpers.formatPrice(serviciu.cost_manopera || 0)}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-500">Total serviciu:</span>
                                                <p class="font-semibold text-blue-700">${helpers.formatPrice((serviciu.cost_piese || 0) + (serviciu.cost_manopera || 0))}</p>
                                            </div>
                                        </div>
                                        
                                        ${serviciu.observatii ? `
                                            <div class="mt-3 pt-3 border-t border-gray-100">
                                                <span class="text-sm font-medium text-gray-500">Observații:</span>
                                                <p class="text-sm text-gray-700 mt-1">${serviciu.observatii}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('') : `
                                    <div class="bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                                        <i class="fas fa-info-circle text-lg mb-2"></i>
                                        <p>Nu sunt servicii detaliate pentru această lucrare.</p>
                                        <p class="text-xs text-gray-400">Lucrarea a fost creată înainte de implementarea sistemului multi-serviciu.</p>
                                    </div>
                                `}
                            </div>
                            
                            <!-- Total general -->
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 class="text-lg font-semibold text-gray-900 mb-3">Cost total</h4>
                                <div class="grid grid-cols-3 gap-4 text-sm">
                                    <div class="text-center">
                                        <span class="text-gray-600">Total piese</span>
                                        <p class="font-semibold text-blue-700 text-lg">${helpers.formatPrice(detaliiLucrare.cost_piese || lucrare.cost_piese || 0)}</p>
                                    </div>
                                    <div class="text-center">
                                        <span class="text-gray-600">Total manoperă</span>
                                        <p class="font-semibold text-blue-700 text-lg">${helpers.formatPrice(detaliiLucrare.cost_manopera || lucrare.cost_manopera || 0)}</p>
                                    </div>
                                    <div class="text-center">
                                        <span class="text-gray-600">Total general</span>
                                        <p class="font-bold text-blue-800 text-xl">${helpers.formatPrice(detaliiLucrare.total_cost || lucrare.total_cost || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                        <button onclick="LucrariModule.editLucrare('${lucrare.id}')" class="btn btn-primary">
                            <i class="fas fa-edit mr-2"></i>
                            Editează
                        </button>
                    </div>
                </div>
            `;

            ModalModule.show(modalHTML, { size: '4xl' });

            document.getElementById('close-view-modal').addEventListener('click', () => {
                ModalModule.hide();
            });

        } catch (error) {
            console.error('Error loading lucrare details:', error);
            NotificationModule.show('Eroare la încărcarea detaliilor lucrării', 'error');
        }
    },

    // Editează o lucrare
    editLucrare(id) {
        this.showAddEditModal(id);
    },

    // Șterge o lucrare
    async deleteLucrare(id) {
        const confirmed = await ModalModule.confirm(
            'Ești sigur că vrei să ștergi această lucrare? Acțiunea nu poate fi anulată.',
            {
                title: 'Confirmă ștergerea',
                confirmText: 'Șterge',
                cancelText: 'Anulează'
            }
        );

        if (!confirmed) return;

        try {
            await db.lucrari.delete(id);
            
            // Actualizează lista locală
            this.lucrari = this.lucrari.filter(l => l.id !== id);
            
            // Invalidează cache-ul
            StorageModule.invalidateCache('lucrari_list');
            
            // Re-renderizează tabelul
            this.renderTable();
            
            NotificationModule.show(CONSTANTS.MESSAGES.SUCCESS.LUCRARE_STEARSA, 'success');
            
        } catch (error) {
            console.error('Error deleting lucrare:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Afișează modal pentru adăugare client nou rapid
    showAddClientModal() {
        const modalHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Client nou (rapid)</h2>
                    <button id="close-add-client-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="quick-client-form" class="space-y-4">
                    <div>
                        <label for="quick-client-nume" class="block text-sm font-medium text-gray-700">
                            Nume complet <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="quick-client-nume" required 
                               class="form-input mt-1">
                    </div>
                    
                    <div>
                        <label for="quick-client-telefon" class="block text-sm font-medium text-gray-700">
                            Telefon <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" id="quick-client-telefon" required 
                               class="form-input mt-1">
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancel-quick-client" class="btn btn-secondary">
                            Anulează
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save mr-2"></i>
                            Salvează și selectează
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Salvează modal-ul părinte pentru a-l putea restaura
        const parentModal = document.querySelector('#modal-container .modal');
        
        ModalModule.show(modalHTML);

        // Event listeners pentru modal
        document.getElementById('close-add-client-modal').addEventListener('click', () => {
            ModalModule.hide();
            // Restaurează modal-ul părinte
            if (parentModal) {
                setTimeout(() => {
                    ModalModule.show(parentModal.outerHTML, { size: '4xl' });
                    // Re-configurează event listeners pentru modal-ul părinte
                    this.loadClienti().then(clienti => {
                        this.setupModalEventListeners(null, clienti, []);
                    });
                }, 100);
            }
        });

        document.getElementById('cancel-quick-client').addEventListener('click', () => {
            ModalModule.hide();
            // Restaurează modal-ul părinte
            if (parentModal) {
                setTimeout(() => {
                    ModalModule.show(parentModal.outerHTML, { size: '4xl' });
                    // Re-configurează event listeners pentru modal-ul părinte
                    this.loadClienti().then(clienti => {
                        this.setupModalEventListeners(null, clienti, []);
                    });
                }, 100);
            }
        });

        document.getElementById('quick-client-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Quick client form submitted!');
            try {
                await this.handleSaveQuickClient(parentModal);
            } catch (error) {
                console.error('Error in quick client form submission:', error);
                NotificationModule.show('Eroare la salvarea clientului: ' + error.message, 'error');
            }
        });
    },

    // Gestionează salvarea rapidă a clientului
    async handleSaveQuickClient(parentModal) {
        console.log('handleSaveQuickClient called');
        const clientData = {
            nume: document.getElementById('quick-client-nume').value.trim(),
            telefon: document.getElementById('quick-client-telefon').value.trim(),
            activ: true
        };
        
        console.log('Client data:', clientData);

        // Validări
        if (!clientData.nume) {
            NotificationModule.show('Numele este obligatoriu', 'warning');
            return;
        }

        if (!clientData.telefon) {
            NotificationModule.show('Telefonul este obligatoriu', 'warning');
            return;
        }

        if (!helpers.validatePhone(clientData.telefon)) {
            NotificationModule.show('Numărul de telefon nu este valid', 'warning');
            return;
        }

        try {
            // Creează clientul nou
            const newClient = await db.clienti.create({
                ...clientData,
                data_inregistrare: new Date()
            });

            // Invalidează cache-ul clienților
            StorageModule.invalidateCache('clienti_list');
            
            NotificationModule.show('Client adăugat cu succes!', 'success');
            
            // Închide modal-ul și restaurează modal-ul părinte
            ModalModule.hide();
            
            if (parentModal) {
                setTimeout(async () => {
                    // Reîncarcă datele și afișează din nou modal-ul cu clientul nou selectat
                    const clienti = await this.loadClienti();
                    
                    // Actualizează HTML-ul cu noul client
                    const updatedHTML = parentModal.outerHTML.replace(
                        /<select id="lucrare-client"[^>]*>[\s\S]*?<\/select>/,
                        `<select id="lucrare-client" required class="form-input mt-1">
                            <option value="">Selectează client</option>
                            ${clienti.map(client => 
                                `<option value="${client.id}" ${client.id === newClient.id ? 'selected' : ''}>${client.nume}</option>`
                            ).join('')}
                        </select>`
                    );
                    
                    ModalModule.show(updatedHTML, { size: '4xl' });
                    
                    // Re-configurează event listeners
                    this.setupModalEventListeners(null, clienti);
                    
                    // Actualizează telefonul pentru clientul nou selectat
                    document.getElementById('lucrare-telefon').value = newClient.telefon;
                }, 100);
            }
            
        } catch (error) {
            console.error('Error saving quick client:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Afișează modal pentru export
    showExportModal() {
        console.log('Opening export modal');
        NotificationModule.show('Exportul va fi implementat în curând', 'info');
    }
};

// Inițializează modulul când se încarcă DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    // Așteaptă ca Supabase să fie inițializat
    setTimeout(() => {
        if (window.supabaseClient) {
            window.LucrariModule.init();
        }
    }, 100);
});