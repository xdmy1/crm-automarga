// Modulul pentru gestionarea pieselor
window.PieseModule = {
    piese: [],
    currentPage: 1,
    itemsPerPage: CONSTANTS.ITEMS_PER_PAGE,
    filters: {},
    sortField: 'nume',
    sortDirection: 'asc',
    isInitialized: false,

    // Inițializează modulul
    init() {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Piese module initialized');
    },

    // Configurează event listeners
    setupEventListeners() {
        // Navigation click
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-section="piese"]')) {
                e.preventDefault();
                this.show();
            }
        });
    },

    // Afișează secțiunea piese
    async show() {
        try {
            // Actualizează navigația
            this.updateNavigation();
            
            // Încarcă template-ul
            await this.loadTemplate();
            
            // Încarcă datele
            await this.loadData();
            
            // Configurează event listeners pentru această secțiune
            this.setupSectionEventListeners();
            
        } catch (error) {
            console.error('Error showing piese section:', error);
            NotificationModule.show('Eroare la încărcarea secțiunii piese', 'error');
        }
    },

    // Actualizează navigația
    updateNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('text-primary-600', 'bg-primary-50');
            item.classList.add('text-gray-700', 'hover:text-primary-600', 'hover:bg-primary-50');
        });
        
        const pieseNav = document.querySelector('[data-section="piese"]');
        if (pieseNav) {
            pieseNav.classList.add('text-primary-600', 'bg-primary-50');
            pieseNav.classList.remove('text-gray-700', 'hover:text-primary-600', 'hover:bg-primary-50');
        }
    },

    // Încarcă template-ul pentru secțiunea piese
    async loadTemplate() {
        const content = `
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900 mb-1">Piese</h1>
                    <p class="text-sm text-gray-500">Gestionează inventarul de piese</p>
                </div>
                <button id="add-piesa-btn" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Piesă nouă
                </button>
            </div>

            <!-- Filtre și căutare -->
            <div class="modern-card p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Căutare -->
                    <div class="md:col-span-2 search-container">
                        <input type="text" id="search-piese" placeholder="Caută după nume, cod piesă..."
                               class="search-input">
                        <i class="search-icon fas fa-search"></i>
                    </div>
                    
                    <!-- Filtru categorie -->
                    <div>
                        <select id="filter-categorie" class="form-input">
                            <option value="">Toate categoriile</option>
                            ${CONSTANTS.TIPURI_PIESE.map(tip => `<option value="${tip}">${tip}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Filtru stoc -->
                    <div>
                        <select id="filter-stoc" class="form-input">
                            <option value="">Toate stocurile</option>
                            <option value="critic">Stoc critic</option>
                            <option value="scazut">Stoc scăzut</option>
                            <option value="normal">Stoc normal</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-2 sm:space-y-0">
                    <div class="flex space-x-2">
                        <button id="clear-filters-btn" class="btn btn-secondary text-sm">
                            <i class="fas fa-times mr-1"></i>
                            Șterge filtrele
                        </button>
                        <button id="export-piese-btn" class="btn btn-secondary text-sm">
                            <i class="fas fa-download mr-1"></i>
                            Export
                        </button>
                        <button id="update-stock-btn" class="btn btn-secondary text-sm">
                            <i class="fas fa-boxes mr-1"></i>
                            Actualizare stoc
                        </button>
                    </div>
                    
                    <div class="text-sm text-gray-500">
                        <span id="piese-count">0</span> piese găsite
                    </div>
                </div>
            </div>

            <!-- Cards pentru piese (mobile) -->
            <div id="piese-cards" class="block md:hidden space-y-4 mb-6">
                <!-- Card-urile vor fi generate dinamic -->
            </div>

            <!-- Tabel piese (desktop) -->
            <div id="piese-table-container" class="hidden md:block notion-table">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th class="sortable" data-field="nume">
                                    Nume <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th class="sortable" data-field="cod_piesa">
                                    Cod <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th class="sortable" data-field="categorie">
                                    Categorie <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th class="sortable" data-field="pret_unitar">
                                    Preț <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th class="sortable" data-field="stoc">
                                    Stoc <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th>Status</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody id="piese-table-body">
                            <!-- Datele vor fi încărcate dinamic -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Paginare -->
                <div id="pagination-container" class="pagination">
                    <!-- Paginarea va fi generată dinamic -->
                </div>
            </div>

            <!-- Empty state -->
            <div id="empty-state" class="hidden">
                <div class="empty-state">
                    <i class="empty-state-icon fas fa-cogs"></i>
                    <h3 class="empty-state-title">Nicio piesă găsită</h3>
                    <p class="empty-state-description">
                        Nu există piese care să corespundă criteriilor de căutare.
                    </p>
                    <div class="mt-4">
                        <button id="add-first-piesa-btn" class="btn btn-primary">
                            <i class="fas fa-plus mr-2"></i>
                            Adaugă prima piesă
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showContent(content);
    },

    // Afișează conținutul în secțiunea piese
    showContent(content) {
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.add('hidden');
        });

        const pieseSection = document.getElementById('piese-section');
        pieseSection.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                ${content}
            </div>
        `;
        pieseSection.classList.remove('hidden');
    },

    // Configurează event listeners pentru această secțiune
    setupSectionEventListeners() {
        // Buton adăugare piesă
        document.getElementById('add-piesa-btn')?.addEventListener('click', () => {
            this.showAddEditModal();
        });

        document.getElementById('add-first-piesa-btn')?.addEventListener('click', () => {
            this.showAddEditModal();
        });

        // Căutare
        const searchInput = document.getElementById('search-piese');
        if (searchInput) {
            searchInput.addEventListener('input', helpers.debounce(() => {
                this.handleSearch();
            }, 300));
        }

        // Filtre
        document.getElementById('filter-categorie')?.addEventListener('change', () => {
            this.handleFilter();
        });

        document.getElementById('filter-stoc')?.addEventListener('change', () => {
            this.handleFilter();
        });

        // Șterge filtre
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Export
        document.getElementById('export-piese-btn')?.addEventListener('click', () => {
            this.showExportModal();
        });

        // Actualizare stoc
        document.getElementById('update-stock-btn')?.addEventListener('click', () => {
            this.showUpdateStockModal();
        });

        // Sortare
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                this.handleSort(header.dataset.field);
            });
        });
    },

    // Încarcă datele pieselor
    async loadData() {
        try {
            // Încearcă să încarce din cache
            const cacheKey = 'piese_list';
            let cachedData = StorageModule.getCache(cacheKey);

            if (cachedData && StorageModule.isOnlineStatus()) {
                this.piese = cachedData;
                this.renderPiese();
            }

            // Încarcă din Supabase
            const data = await db.piese.getAll();
            
            this.piese = data || [];

            // Salvează în cache
            StorageModule.setCache(cacheKey, this.piese);

            // Renderizează
            this.renderPiese();

        } catch (error) {
            console.error('Error loading piese:', error);
            
            if (!StorageModule.isOnlineStatus()) {
                const cacheKey = 'piese_list';
                const cachedData = StorageModule.getCache(cacheKey);
                
                if (cachedData) {
                    this.piese = cachedData;
                    this.renderPiese();
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

    // Renderizează piesele
    renderPiese() {
        const tableBody = document.getElementById('piese-table-body');
        const cardsContainer = document.getElementById('piese-cards');
        const emptyState = document.getElementById('empty-state');
        const countElement = document.getElementById('piese-count');

        if (!tableBody || !cardsContainer) return;

        // Aplică filtrele
        const filteredPiese = this.applyFilters();

        // Actualizează contorul
        if (countElement) {
            countElement.textContent = filteredPiese.length;
        }

        // Verifică dacă sunt date
        if (filteredPiese.length === 0) {
            tableBody.innerHTML = '';
            cardsContainer.innerHTML = '';
            emptyState?.classList.remove('hidden');
            document.getElementById('piese-table-container')?.classList.add('hidden');
            return;
        }

        emptyState?.classList.add('hidden');
        document.getElementById('piese-table-container')?.classList.remove('hidden');

        // Paginare
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedPiese = filteredPiese.slice(startIndex, endIndex);

        // Renderizează tabelul (desktop)
        this.renderTable(paginatedPiese);
        
        // Renderizează card-urile (mobile)
        this.renderCards(paginatedPiese);

        // Generează paginarea
        this.renderPagination(filteredPiese.length);
    },

    // Renderizează tabelul
    renderTable(piese) {
        const tableBody = document.getElementById('piese-table-body');
        
        tableBody.innerHTML = piese.map(piesa => `
            <tr class="hover:bg-gray-50">
                <td>
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-cog text-gray-600"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${piesa.nume}</div>
                            ${piesa.furnizor ? `<div class="text-sm text-gray-500">${piesa.furnizor}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="font-mono text-sm text-gray-900">${piesa.cod_piesa || '-'}</span>
                </td>
                <td>
                    <span class="status-badge status-info">${piesa.categorie || '-'}</span>
                </td>
                <td>
                    <span class="font-medium text-gray-900">${helpers.formatPrice(piesa.pret_unitar || 0)}</span>
                </td>
                <td>
                    <div class="flex items-center">
                        <span class="font-medium text-gray-900">${piesa.stoc || 0}</span>
                        <span class="text-sm text-gray-500 ml-1">${piesa.unitate_masura || 'buc'}</span>
                    </div>
                </td>
                <td>
                    ${this.getStockStatusBadge(piesa)}
                </td>
                <td>
                    <div class="flex space-x-2">
                        <button onclick="PieseModule.viewPiesa('${piesa.id}')" 
                                class="text-blue-600 hover:text-blue-800" title="Vizualizează">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="PieseModule.editPiesa('${piesa.id}')" 
                                class="text-green-600 hover:text-green-800" title="Editează">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="PieseModule.updateStock('${piesa.id}')" 
                                class="text-yellow-600 hover:text-yellow-800" title="Actualizează stoc">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button onclick="PieseModule.deletePiesa('${piesa.id}')" 
                                class="text-red-600 hover:text-red-800" title="Șterge">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Renderizează card-urile pentru mobile
    renderCards(piese) {
        const cardsContainer = document.getElementById('piese-cards');
        
        cardsContainer.innerHTML = piese.map(piesa => `
            <div class="modern-card p-4">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-cog text-gray-600"></i>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">${piesa.nume}</h3>
                            <p class="text-sm text-gray-500">${piesa.cod_piesa || 'Fără cod'}</p>
                        </div>
                    </div>
                    ${this.getStockStatusBadge(piesa)}
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-500">Preț</p>
                        <p class="font-medium text-gray-900">${helpers.formatPrice(piesa.pret_unitar || 0)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Stoc</p>
                        <p class="font-medium text-gray-900">${piesa.stoc || 0} ${piesa.unitate_masura || 'buc'}</p>
                    </div>
                </div>
                
                ${piesa.categorie ? `
                    <div class="mb-4">
                        <span class="status-badge status-info">${piesa.categorie}</span>
                    </div>
                ` : ''}
                
                <div class="flex space-x-2">
                    <button onclick="PieseModule.viewPiesa('${piesa.id}')" 
                            class="flex-1 btn btn-secondary text-sm">
                        <i class="fas fa-eye mr-1"></i>
                        Vezi
                    </button>
                    <button onclick="PieseModule.editPiesa('${piesa.id}')" 
                            class="flex-1 btn btn-primary text-sm">
                        <i class="fas fa-edit mr-1"></i>
                        Editează
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Obține badge-ul pentru statusul stocului
    getStockStatusBadge(piesa) {
        const stoc = piesa.stoc || 0;
        const stocMinim = piesa.stoc_minim || 0;
        
        if (stoc <= stocMinim) {
            return '<span class="status-badge status-cancelled">Critic</span>';
        } else if (stoc <= stocMinim * 2) {
            return '<span class="status-badge status-pending">Scăzut</span>';
        } else {
            return '<span class="status-badge status-completed">Normal</span>';
        }
    },

    // Aplică filtrele
    applyFilters() {
        let filtered = [...this.piese];

        // Filtru căutare
        const searchTerm = document.getElementById('search-piese')?.value?.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(piesa => {
                const searchableText = [
                    piesa.nume,
                    piesa.cod_piesa,
                    piesa.furnizor,
                    piesa.categorie
                ].join(' ').toLowerCase();
                
                return searchableText.includes(searchTerm);
            });
        }

        // Filtru categorie
        const categorieFilter = document.getElementById('filter-categorie')?.value;
        if (categorieFilter) {
            filtered = filtered.filter(piesa => piesa.categorie === categorieFilter);
        }

        // Filtru stoc
        const stocFilter = document.getElementById('filter-stoc')?.value;
        if (stocFilter) {
            filtered = filtered.filter(piesa => {
                const stoc = piesa.stoc || 0;
                const stocMinim = piesa.stoc_minim || 0;
                
                switch (stocFilter) {
                    case 'critic':
                        return stoc <= stocMinim;
                    case 'scazut':
                        return stoc > stocMinim && stoc <= stocMinim * 2;
                    case 'normal':
                        return stoc > stocMinim * 2;
                    default:
                        return true;
                }
            });
        }

        // Sortare
        return helpers.sortBy(filtered, this.sortField, this.sortDirection === 'asc');
    },

    // Gestionează căutarea
    handleSearch() {
        this.currentPage = 1;
        this.renderPiese();
    },

    // Gestionează filtrarea
    handleFilter() {
        this.currentPage = 1;
        this.renderPiese();
    },

    // Șterge toate filtrele
    clearFilters() {
        document.getElementById('search-piese').value = '';
        document.getElementById('filter-categorie').value = '';
        document.getElementById('filter-stoc').value = '';
        
        this.currentPage = 1;
        this.renderPiese();
    },

    // Gestionează sortarea
    handleSort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }

        this.renderPiese();
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
                    onclick="PieseModule.goToPage(${this.currentPage - 1})"
                    class="px-3 py-1 text-sm border rounded ${this.currentPage === 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'}">
                Anterior
            </button>
        `;

        // Numerele paginilor
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button onclick="PieseModule.goToPage(${i})"
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
                    onclick="PieseModule.goToPage(${this.currentPage + 1})"
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
        this.renderPiese();
    },

    // Afișează modal pentru adăugare/editare piesă
    showAddEditModal(piesaId = null) {
        const isEdit = piesaId !== null;
        const piesa = isEdit ? this.piese.find(p => p.id === piesaId) : null;

        const modalHTML = `
            <div class="modal bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">
                        ${isEdit ? 'Editează piesă' : 'Piesă nouă'}
                    </h2>
                    <button id="close-piesa-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="piesa-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="piesa-nume" class="block text-sm font-medium text-gray-700">
                                Nume piesă <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="piesa-nume" required 
                                   value="${piesa?.nume || ''}"
                                   class="form-input mt-1">
                        </div>
                        
                        <div>
                            <label for="piesa-cod" class="block text-sm font-medium text-gray-700">Cod piesă</label>
                            <input type="text" id="piesa-cod" 
                                   value="${piesa?.cod_piesa || ''}"
                                   class="form-input mt-1">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="piesa-categorie" class="block text-sm font-medium text-gray-700">Categorie</label>
                            <select id="piesa-categorie" class="form-input mt-1">
                                <option value="">Selectează categoria</option>
                                ${CONSTANTS.TIPURI_PIESE.map(tip => 
                                    `<option value="${tip}" ${piesa?.categorie === tip ? 'selected' : ''}>${tip}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label for="piesa-furnizor" class="block text-sm font-medium text-gray-700">Furnizor</label>
                            <input type="text" id="piesa-furnizor" 
                                   value="${piesa?.furnizor || ''}"
                                   class="form-input mt-1">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label for="piesa-pret" class="block text-sm font-medium text-gray-700">
                                Preț unitar <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="piesa-pret" required step="0.01" min="0"
                                   value="${piesa?.pret_unitar || ''}"
                                   class="form-input mt-1">
                        </div>
                        
                        <div>
                            <label for="piesa-stoc" class="block text-sm font-medium text-gray-700">Stoc actual</label>
                            <input type="number" id="piesa-stoc" min="0"
                                   value="${piesa?.stoc || ''}"
                                   class="form-input mt-1">
                        </div>
                        
                        <div>
                            <label for="piesa-stoc-minim" class="block text-sm font-medium text-gray-700">Stoc minim</label>
                            <input type="number" id="piesa-stoc-minim" min="0"
                                   value="${piesa?.stoc_minim || ''}"
                                   class="form-input mt-1">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="piesa-unitate" class="block text-sm font-medium text-gray-700">Unitate măsură</label>
                            <select id="piesa-unitate" class="form-input mt-1">
                                ${CONSTANTS.UNITATI_MASURA.map(unit => 
                                    `<option value="${unit}" ${piesa?.unitate_masura === unit ? 'selected' : ''}>${unit}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label for="piesa-locatie" class="block text-sm font-medium text-gray-700">Locație</label>
                            <input type="text" id="piesa-locatie" 
                                   value="${piesa?.locatie || ''}"
                                   placeholder="ex: Raft A3, Zona 2"
                                   class="form-input mt-1">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancel-piesa" class="btn btn-secondary">
                            Anulează
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save mr-2"></i>
                            ${isEdit ? 'Actualizează' : 'Salvează'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        ModalModule.show(modalHTML);

        // Event listeners pentru modal
        document.getElementById('close-piesa-modal').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('cancel-piesa').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('piesa-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSavePiesa(piesaId);
        });
    },

    // Gestionează salvarea piesei
    async handleSavePiesa(piesaId = null) {
        const isEdit = piesaId !== null;
        
        // Colectează datele din formular
        const piesaData = {
            nume: document.getElementById('piesa-nume').value.trim(),
            cod_piesa: document.getElementById('piesa-cod').value.trim(),
            categorie: document.getElementById('piesa-categorie').value,
            furnizor: document.getElementById('piesa-furnizor').value.trim(),
            pret_unitar: parseFloat(document.getElementById('piesa-pret').value) || 0,
            stoc: parseInt(document.getElementById('piesa-stoc').value) || 0,
            stoc_minim: parseInt(document.getElementById('piesa-stoc-minim').value) || 0,
            unitate_masura: document.getElementById('piesa-unitate').value,
            locatie: document.getElementById('piesa-locatie').value.trim()
        };

        // Validări
        if (!piesaData.nume) {
            NotificationModule.show('Numele piesei este obligatoriu', 'warning');
            return;
        }

        if (piesaData.pret_unitar <= 0) {
            NotificationModule.show('Prețul trebuie să fie mai mare decât 0', 'warning');
            return;
        }

        try {
            if (isEdit) {
                // Actualizează piesa existentă
                await db.piese.update(piesaId, piesaData);
                
                // Actualizează în lista locală
                const piesaIndex = this.piese.findIndex(p => p.id === piesaId);
                if (piesaIndex !== -1) {
                    this.piese[piesaIndex] = { ...this.piese[piesaIndex], ...piesaData };
                }
                
                NotificationModule.show(CONSTANTS.MESSAGES.SUCCESS.PIESA_MODIFICATA, 'success');
            } else {
                // Creează piesă nouă
                const newPiesa = await db.piese.create(piesaData);
                
                // Adaugă în lista locală
                this.piese.unshift(newPiesa);
                
                NotificationModule.show(CONSTANTS.MESSAGES.SUCCESS.PIESA_ADAUGATA, 'success');
            }

            // Invalidează cache-ul
            StorageModule.invalidateCache('piese_list');
            
            // Re-renderizează
            this.renderPiese();
            
            // Închide modal-ul
            ModalModule.hide();
            
        } catch (error) {
            console.error('Error saving piesa:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Vizualizează o piesă
    viewPiesa(id) {
        const piesa = this.piese.find(p => p.id === id);
        if (!piesa) {
            NotificationModule.show('Piesa nu a fost găsită', 'error');
            return;
        }

        const modalHTML = `
            <div class="modal bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Detalii piesă</h2>
                    <button id="close-view-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Informații generale -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Informații generale</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Nume</label>
                                <p class="text-gray-900">${piesa.nume}</p>
                            </div>
                            
                            ${piesa.cod_piesa ? `
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Cod piesă</label>
                                    <p class="font-mono text-gray-900">${piesa.cod_piesa}</p>
                                </div>
                            ` : ''}
                            
                            ${piesa.categorie ? `
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Categorie</label>
                                    <p class="text-gray-900">${piesa.categorie}</p>
                                </div>
                            ` : ''}
                            
                            ${piesa.furnizor ? `
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Furnizor</label>
                                    <p class="text-gray-900">${piesa.furnizor}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Stoc și preț -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Stoc și preț</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Preț unitar</label>
                                <p class="text-xl font-bold text-gray-900">${helpers.formatPrice(piesa.pret_unitar || 0)}</p>
                            </div>
                            
                            <div>
                                <label class="text-sm font-medium text-gray-500">Stoc actual</label>
                                <div class="flex items-center">
                                    <p class="text-lg font-semibold text-gray-900">${piesa.stoc || 0} ${piesa.unitate_masura || 'buc'}</p>
                                    ${this.getStockStatusBadge(piesa)}
                                </div>
                            </div>
                            
                            <div>
                                <label class="text-sm font-medium text-gray-500">Stoc minim</label>
                                <p class="text-gray-900">${piesa.stoc_minim || 0} ${piesa.unitate_masura || 'buc'}</p>
                            </div>
                            
                            ${piesa.locatie ? `
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Locație</label>
                                    <p class="text-gray-900">${piesa.locatie}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                    <button onclick="PieseModule.updateStock('${piesa.id}')" class="btn btn-secondary">
                        <i class="fas fa-boxes mr-2"></i>
                        Actualizează stoc
                    </button>
                    <button onclick="PieseModule.editPiesa('${piesa.id}')" class="btn btn-primary">
                        <i class="fas fa-edit mr-2"></i>
                        Editează
                    </button>
                </div>
            </div>
        `;

        ModalModule.show(modalHTML);

        document.getElementById('close-view-modal').addEventListener('click', () => {
            ModalModule.hide();
        });
    },

    // Editează o piesă
    editPiesa(id) {
        this.showAddEditModal(id);
    },

    // Șterge o piesă
    async deletePiesa(id) {
        const piesa = this.piese.find(p => p.id === id);
        if (!piesa) {
            NotificationModule.show('Piesa nu a fost găsită', 'error');
            return;
        }

        const confirmed = await ModalModule.confirm(
            `Ești sigur că vrei să ștergi piesa "${piesa.nume}"? Această acțiune nu poate fi anulată.`,
            {
                title: 'Confirmă ștergerea',
                confirmText: 'Șterge',
                cancelText: 'Anulează'
            }
        );

        if (!confirmed) return;

        try {
            await db.piese.delete(id);
            
            // Actualizează lista locală
            this.piese = this.piese.filter(p => p.id !== id);
            
            // Invalidează cache-ul
            StorageModule.invalidateCache('piese_list');
            
            // Re-renderizează
            this.renderPiese();
            
            NotificationModule.show(CONSTANTS.MESSAGES.SUCCESS.PIESA_STEARSA, 'success');
            
        } catch (error) {
            console.error('Error deleting piesa:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Actualizează stocul unei piese
    updateStock(id) {
        const piesa = this.piese.find(p => p.id === id);
        if (!piesa) {
            NotificationModule.show('Piesa nu a fost găsită', 'error');
            return;
        }

        const modalHTML = `
            <div class="modal bg-white rounded-lg shadow-xl w-full  p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Actualizează stoc</h2>
                    <button id="close-stock-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <h3 class="font-medium text-gray-900">${piesa.nume}</h3>
                    <p class="text-sm text-gray-500">Stoc actual: ${piesa.stoc || 0} ${piesa.unitate_masura || 'buc'}</p>
                </div>
                
                <form id="stock-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tip operație</label>
                        <select id="stock-operation" class="form-input">
                            <option value="add">Adaugă la stoc</option>
                            <option value="subtract">Scade din stoc</option>
                            <option value="set">Setează stoc nou</option>
                        </select>
                    </div>
                    
                    <div>
                        <label for="stock-quantity" class="block text-sm font-medium text-gray-700">
                            Cantitate <span class="text-red-500">*</span>
                        </label>
                        <input type="number" id="stock-quantity" required min="0" 
                               class="form-input mt-1">
                    </div>
                    
                    <div>
                        <label for="stock-reason" class="block text-sm font-medium text-gray-700">Motiv (opțional)</label>
                        <textarea id="stock-reason" rows="2" 
                                  placeholder="ex: Comandă nouă, utilizat în reparație..."
                                  class="form-input mt-1"></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancel-stock" class="btn btn-secondary">
                            Anulează
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save mr-2"></i>
                            Actualizează
                        </button>
                    </div>
                </form>
            </div>
        `;

        ModalModule.show(modalHTML);

        // Event listeners
        document.getElementById('close-stock-modal').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('cancel-stock').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('stock-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpdateStock(id);
        });
    },

    // Gestionează actualizarea stocului
    async handleUpdateStock(id) {
        const piesa = this.piese.find(p => p.id === id);
        const operation = document.getElementById('stock-operation').value;
        const quantity = parseInt(document.getElementById('stock-quantity').value);
        const reason = document.getElementById('stock-reason').value.trim();

        if (!quantity || quantity < 0) {
            NotificationModule.show('Cantitatea trebuie să fie un număr pozitiv', 'warning');
            return;
        }

        let newStock = piesa.stoc || 0;

        switch (operation) {
            case 'add':
                newStock += quantity;
                break;
            case 'subtract':
                newStock = Math.max(0, newStock - quantity);
                break;
            case 'set':
                newStock = quantity;
                break;
        }

        try {
            await db.piese.updateStock(id, newStock);
            
            // Actualizează în lista locală
            const piesaIndex = this.piese.findIndex(p => p.id === id);
            if (piesaIndex !== -1) {
                this.piese[piesaIndex].stoc = newStock;
            }
            
            // Invalidează cache-ul
            StorageModule.invalidateCache('piese_list');
            
            // Re-renderizează
            this.renderPiese();
            
            // Închide modal-ul
            ModalModule.hide();
            
            NotificationModule.show('Stocul a fost actualizat cu succes', 'success');
            
        } catch (error) {
            console.error('Error updating stock:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Afișează modal pentru actualizare stoc în masă
    showUpdateStockModal() {
        NotificationModule.show('Actualizarea stocului în masă va fi implementată în curând', 'info');
    },

    // Afișează modal pentru export
    showExportModal() {
        NotificationModule.show('Exportul pieselor va fi implementat în curând', 'info');
    }
};

// Inițializează modulul când se încarcă DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.supabaseClient) {
            window.PieseModule.init();
        }
    }, 100);
});