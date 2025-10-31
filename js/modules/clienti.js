// Modulul pentru gestionarea clienților
window.ClientiModule = {
    clienti: [],
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
        console.log('Clienti module initialized');
    },

    // Configurează event listeners
    setupEventListeners() {
        // Navigation click
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-section="clienti"]')) {
                e.preventDefault();
                this.show();
            }
        });
    },

    // Afișează secțiunea clienți
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
            console.error('Error showing clienti section:', error);
            NotificationModule.show('Eroare la încărcarea secțiunii clienți', 'error');
        }
    },

    // Actualizează navigația
    updateNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('text-primary-600', 'bg-primary-50');
            item.classList.add('text-gray-700', 'hover:text-primary-600', 'hover:bg-primary-50');
        });
        
        const clientiNav = document.querySelector('[data-section="clienti"]');
        if (clientiNav) {
            clientiNav.classList.add('text-primary-600', 'bg-primary-50');
            clientiNav.classList.remove('text-gray-700', 'hover:text-primary-600', 'hover:bg-primary-50');
        }
    },

    // Încarcă template-ul pentru secțiunea clienți
    async loadTemplate() {
        const content = `
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-2xl font-semibold text-gray-900 mb-1">Clienți</h1>
                    <p class="text-sm text-gray-500">Gestionează baza de date cu clienți</p>
                </div>
                <button id="add-client-btn" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Client nou
                </button>
            </div>

            <!-- Filtre și căutare -->
            <div class="modern-card p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Căutare -->
                    <div class="md:col-span-2 search-container">
                        <input type="text" id="search-clienti" placeholder="Caută după nume, telefon..."
                               class="search-input">
                        <i class="search-icon fas fa-search"></i>
                    </div>
                    
                    <!-- Filtru activ -->
                    <div>
                        <select id="filter-activ" class="form-input">
                            <option value="">Toți clienții</option>
                            <option value="true">Activi</option>
                            <option value="false">Inactivi</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-2 sm:space-y-0">
                    <div class="flex space-x-2">
                        <button id="clear-filters-btn" class="btn btn-secondary text-sm">
                            <i class="fas fa-times mr-1"></i>
                            Șterge filtrele
                        </button>
                        <button id="export-clienti-btn" class="btn btn-secondary text-sm">
                            <i class="fas fa-download mr-1"></i>
                            Export
                        </button>
                    </div>
                    
                    <div class="text-sm text-gray-500">
                        <span id="clienti-count">0</span> clienți găsiți
                    </div>
                </div>
            </div>

            <!-- Cards pentru clienți (mobile) -->
            <div id="clienti-cards" class="block md:hidden space-y-4 mb-6">
                <!-- Card-urile vor fi generate dinamic -->
            </div>

            <!-- Tabel clienți (desktop) -->
            <div id="clienti-table-container" class="hidden md:block notion-table">
                <div class="table-responsive">
                    <table class="w-full">
                        <thead>
                            <tr>
                                <th class="sortable" data-field="nume">
                                    Nume <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th class="sortable" data-field="telefon">
                                    Telefon <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th class="sortable" data-field="data_inregistrare">
                                    Data înregistrare <i class="fas fa-sort ml-1"></i>
                                </th>
                                <th>Status</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody id="clienti-table-body">
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
                    <i class="empty-state-icon fas fa-users"></i>
                    <h3 class="empty-state-title">Niciun client găsit</h3>
                    <p class="empty-state-description">
                        Nu există clienți care să corespundă criteriilor de căutare.
                    </p>
                    <div class="mt-4">
                        <button id="add-first-client-btn" class="btn btn-primary">
                            <i class="fas fa-plus mr-2"></i>
                            Adaugă primul client
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showContent(content);
    },

    // Afișează conținutul în secțiunea clienți
    showContent(content) {
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.add('hidden');
        });

        const clientiSection = document.getElementById('clienti-section');
        clientiSection.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                ${content}
            </div>
        `;
        clientiSection.classList.remove('hidden');
    },

    // Configurează event listeners pentru această secțiune
    setupSectionEventListeners() {
        // Buton adăugare client
        document.getElementById('add-client-btn')?.addEventListener('click', () => {
            this.showAddEditModal();
        });

        document.getElementById('add-first-client-btn')?.addEventListener('click', () => {
            this.showAddEditModal();
        });

        // Căutare
        const searchInput = document.getElementById('search-clienti');
        if (searchInput) {
            searchInput.addEventListener('input', helpers.debounce(() => {
                this.handleSearch();
            }, 300));
        }

        // Filtre
        document.getElementById('filter-activ')?.addEventListener('change', () => {
            this.handleFilter();
        });

        // Șterge filtre
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Export
        document.getElementById('export-clienti-btn')?.addEventListener('click', () => {
            this.showExportModal();
        });

        // Sortare
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                this.handleSort(header.dataset.field);
            });
        });
    },

    // Încarcă datele clienților
    async loadData() {
        try {
            // Încearcă să încarce din cache
            const cacheKey = 'clienti_list';
            let cachedData = StorageModule.getCache(cacheKey);

            if (cachedData && StorageModule.isOnlineStatus()) {
                this.clienti = cachedData;
                this.renderClienti();
            }

            // Încarcă din Supabase
            const data = await db.clienti.getAll();
            
            this.clienti = data || [];

            // Salvează în cache
            StorageModule.setCache(cacheKey, this.clienti);

            // Renderizează
            this.renderClienti();

        } catch (error) {
            console.error('Error loading clienti:', error);
            
            if (!StorageModule.isOnlineStatus()) {
                const cacheKey = 'clienti_list';
                const cachedData = StorageModule.getCache(cacheKey);
                
                if (cachedData) {
                    this.clienti = cachedData;
                    this.renderClienti();
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

    // Renderizează clienții
    renderClienti() {
        const tableBody = document.getElementById('clienti-table-body');
        const cardsContainer = document.getElementById('clienti-cards');
        const emptyState = document.getElementById('empty-state');
        const countElement = document.getElementById('clienti-count');

        if (!tableBody || !cardsContainer) return;

        // Aplică filtrele
        const filteredClienti = this.applyFilters();

        // Actualizează contorul
        if (countElement) {
            countElement.textContent = filteredClienti.length;
        }

        // Verifică dacă sunt date
        if (filteredClienti.length === 0) {
            tableBody.innerHTML = '';
            cardsContainer.innerHTML = '';
            emptyState?.classList.remove('hidden');
            document.getElementById('clienti-table-container')?.classList.add('hidden');
            return;
        }

        emptyState?.classList.add('hidden');
        document.getElementById('clienti-table-container')?.classList.remove('hidden');

        // Paginare
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedClienti = filteredClienti.slice(startIndex, endIndex);

        // Renderizează tabelul (desktop)
        this.renderTable(paginatedClienti);
        
        // Renderizează card-urile (mobile)
        this.renderCards(paginatedClienti);

        // Generează paginarea
        this.renderPagination(filteredClienti.length);
    },

    // Renderizează tabelul
    renderTable(clienti) {
        const tableBody = document.getElementById('clienti-table-body');
        
        tableBody.innerHTML = clienti.map(client => `
            <tr class="hover:bg-gray-50">
                <td>
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span class="font-medium text-primary-600">${client.nume.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${client.nume}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="text-gray-900">${client.telefon || '-'}</span>
                </td>
                <td>
                    <span class="text-gray-900">${helpers.formatDate(client.data_inregistrare || client.created_at)}</span>
                </td>
                <td>
                    ${this.getStatusBadge(client.activ)}
                </td>
                <td>
                    <div class="flex space-x-2">
                        <button onclick="ClientiModule.viewClient('${client.id}')" 
                                class="text-blue-600 hover:text-blue-800" title="Vizualizează">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="ClientiModule.editClient('${client.id}')" 
                                class="text-green-600 hover:text-green-800" title="Editează">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="ClientiModule.deleteClient('${client.id}')" 
                                class="text-red-600 hover:text-red-800" title="Șterge">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Renderizează card-urile pentru mobile
    renderCards(clienti) {
        const cardsContainer = document.getElementById('clienti-cards');
        
        cardsContainer.innerHTML = clienti.map(client => `
            <div class="modern-card p-4">
                <div class="flex items-start justify-between">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span class="font-medium text-primary-600">${client.nume.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">${client.nume}</h3>
                            <p class="text-sm text-gray-500">${helpers.formatDate(client.data_inregistrare || client.created_at)}</p>
                        </div>
                    </div>
                    ${this.getStatusBadge(client.activ)}
                </div>
                
                <div class="mt-4 space-y-2">
                    ${client.telefon ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <i class="fas fa-phone w-4 mr-2"></i>
                            <a href="tel:${client.telefon}" class="text-primary-600">${client.telefon}</a>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-4 flex space-x-2">
                    <button onclick="ClientiModule.viewClient('${client.id}')" 
                            class="flex-1 btn btn-secondary text-sm">
                        <i class="fas fa-eye mr-1"></i>
                        Vizualizează
                    </button>
                    <button onclick="ClientiModule.editClient('${client.id}')" 
                            class="flex-1 btn btn-primary text-sm">
                        <i class="fas fa-edit mr-1"></i>
                        Editează
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Obține badge-ul pentru status
    getStatusBadge(activ) {
        return activ !== false ? 
            '<span class="status-badge status-completed">Activ</span>' : 
            '<span class="status-badge status-cancelled">Inactiv</span>';
    },

    // Aplică filtrele
    applyFilters() {
        let filtered = [...this.clienti];

        // Filtru căutare
        const searchTerm = document.getElementById('search-clienti')?.value?.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(client => {
                const searchableText = [
                    client.nume,
                    client.telefon
                ].join(' ').toLowerCase();
                
                return searchableText.includes(searchTerm);
            });
        }

        // Filtru activ
        const activFilter = document.getElementById('filter-activ')?.value;
        if (activFilter !== '') {
            const isActive = activFilter === 'true';
            filtered = filtered.filter(client => client.activ === isActive);
        }

        // Sortare
        return helpers.sortBy(filtered, this.sortField, this.sortDirection === 'asc');
    },

    // Gestionează căutarea
    handleSearch() {
        this.currentPage = 1;
        this.renderClienti();
    },

    // Gestionează filtrarea
    handleFilter() {
        this.currentPage = 1;
        this.renderClienti();
    },

    // Șterge toate filtrele
    clearFilters() {
        document.getElementById('search-clienti').value = '';
        document.getElementById('filter-activ').value = '';
        
        this.currentPage = 1;
        this.renderClienti();
    },

    // Gestionează sortarea
    handleSort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }

        this.renderClienti();
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
                    onclick="ClientiModule.goToPage(${this.currentPage - 1})"
                    class="px-3 py-1 text-sm border rounded ${this.currentPage === 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'}">
                Anterior
            </button>
        `;

        // Numerele paginilor
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button onclick="ClientiModule.goToPage(${i})"
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
                    onclick="ClientiModule.goToPage(${this.currentPage + 1})"
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
        this.renderClienti();
    },

    // Afișează modal pentru adăugare/editare client
    showAddEditModal(clientId = null) {
        const isEdit = clientId !== null;
        const client = isEdit ? this.clienti.find(c => c.id === clientId) : null;

        const modalHTML = `
            <div class="modal bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">
                        ${isEdit ? 'Editează client' : 'Client nou'}
                    </h2>
                    <button id="close-client-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="client-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="client-nume" class="block text-sm font-medium text-gray-700">
                                Nume complet <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="client-nume" required 
                                   value="${client?.nume || ''}"
                                   class="form-input mt-1">
                        </div>
                        
                        <div>
                            <label for="client-telefon" class="block text-sm font-medium text-gray-700">
                                Telefon <span class="text-red-500">*</span>
                            </label>
                            <input type="tel" id="client-telefon" required 
                                   value="${client?.telefon || ''}"
                                   class="form-input mt-1">
                        </div>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="client-activ" 
                               ${client?.activ !== false ? 'checked' : ''}
                               class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                        <label for="client-activ" class="ml-2 text-sm text-gray-700">Client activ</label>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancel-client" class="btn btn-secondary">
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
        document.getElementById('close-client-modal').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('cancel-client').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('client-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaveClient(clientId);
        });
    },

    // Gestionează salvarea clientului
    async handleSaveClient(clientId = null) {
        const isEdit = clientId !== null;
        
        // Colectează datele din formular
        const clientData = {
            nume: document.getElementById('client-nume').value.trim(),
            telefon: document.getElementById('client-telefon').value.trim(),
            activ: document.getElementById('client-activ').checked
        };

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
            if (isEdit) {
                // Actualizează client existent
                await db.clienti.update(clientId, clientData);
                
                // Actualizează în lista locală
                const clientIndex = this.clienti.findIndex(c => c.id === clientId);
                if (clientIndex !== -1) {
                    this.clienti[clientIndex] = { ...this.clienti[clientIndex], ...clientData };
                }
                
                NotificationModule.show(CONSTANTS.MESSAGES.SUCCESS.CLIENT_MODIFICAT, 'success');
            } else {
                // Creează client nou
                const newClient = await db.clienti.create({
                    ...clientData,
                    data_inregistrare: new Date()
                });
                
                // Adaugă în lista locală
                this.clienti.unshift(newClient);
                
                NotificationModule.show(CONSTANTS.MESSAGES.SUCCESS.CLIENT_ADAUGAT, 'success');
            }

            // Invalidează cache-ul
            StorageModule.invalidateCache('clienti_list');
            
            // Re-renderizează
            this.renderClienti();
            
            // Închide modal-ul
            ModalModule.hide();
            
        } catch (error) {
            console.error('Error saving client:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Vizualizează un client
    async viewClient(id) {
        const client = this.clienti.find(c => c.id === id);
        if (!client) {
            NotificationModule.show('Clientul nu a fost găsit', 'error');
            return;
        }

        try {
            // Încarcă lucrările clientului
            const lucrari = await db.lucrari.getAll();
            const lucrariClient = lucrari.filter(l => l.client_id === id);

            const modalHTML = `
                <div class="modal bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-900">Detalii client</h2>
                        <button id="close-view-modal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Informații client -->
                        <div class="lg:col-span-1">
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="text-center mb-4">
                                    <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span class="text-2xl font-bold text-primary-600">${client.nume.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <h3 class="text-lg font-semibold text-gray-900">${client.nume}</h3>
                                    ${this.getStatusBadge(client.activ)}
                                </div>
                                
                                <div class="space-y-3">
                                    ${client.telefon ? `
                                        <div class="flex items-center text-sm">
                                            <i class="fas fa-phone w-4 mr-3 text-gray-400"></i>
                                            <a href="tel:${client.telefon}" class="text-primary-600">${client.telefon}</a>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="flex items-center text-sm">
                                        <i class="fas fa-calendar w-4 mr-3 text-gray-400"></i>
                                        <span class="text-gray-600">Înregistrat: ${helpers.formatDate(client.data_inregistrare || client.created_at)}</span>
                                    </div>
                                </div>
                                
                                <div class="mt-4 pt-4 border-t border-gray-200">
                                    <button onclick="ClientiModule.editClient('${client.id}')" 
                                            class="w-full btn btn-primary text-sm">
                                        <i class="fas fa-edit mr-2"></i>
                                        Editează client
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Istoric lucrări -->
                        <div class="lg:col-span-2">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">
                                Istoric lucrări (${lucrariClient.length})
                            </h4>
                            
                            ${lucrariClient.length > 0 ? `
                                <div class="space-y-3 max-h-96 overflow-y-auto">
                                    ${lucrariClient.map(lucrare => `
                                        <div class="border border-gray-200 rounded-lg p-4">
                                            <div class="flex justify-between items-start mb-2">
                                                <h5 class="font-medium text-gray-900">${lucrare.numar_lucrare}</h5>
                                                ${this.getStareBadge(lucrare.stare)}
                                            </div>
                                            <p class="text-sm text-gray-600 mb-2">${lucrare.descriere || 'Fără descriere'}</p>
                                            <div class="flex justify-between items-center text-xs text-gray-500">
                                                <span>${helpers.formatDate(lucrare.data_intrare)}</span>
                                                <span class="font-medium">${helpers.formatPrice(lucrare.total_cost || 0)}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="text-center py-8 text-gray-500">
                                    <i class="fas fa-wrench text-3xl mb-4"></i>
                                    <p>Nu există lucrări pentru acest client</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            ModalModule.show(modalHTML, { size: '4xl' });

            document.getElementById('close-view-modal').addEventListener('click', () => {
                ModalModule.hide();
            });

        } catch (error) {
            console.error('Error loading client details:', error);
            NotificationModule.show('Eroare la încărcarea detaliilor clientului', 'error');
        }
    },

    // Obține badge pentru starea lucrării
    getStareBadge(stare) {
        const badges = {
            'in_asteptare': '<span class="status-badge status-pending">În așteptare</span>',
            'in_lucru': '<span class="status-badge status-in-progress">În lucru</span>',
            'finalizat': '<span class="status-badge status-completed">Finalizat</span>',
            'livrat': '<span class="status-badge status-completed">Livrat</span>',
            'anulat': '<span class="status-badge status-cancelled">Anulat</span>'
        };
        
        return badges[stare] || '<span class="status-badge">-</span>';
    },

    // Editează un client
    editClient(id) {
        this.showAddEditModal(id);
    },

    // Șterge un client
    async deleteClient(id) {
        const client = this.clienti.find(c => c.id === id);
        if (!client) {
            NotificationModule.show('Clientul nu a fost găsit', 'error');
            return;
        }

        const confirmed = await ModalModule.confirm(
            `Ești sigur că vrei să ștergi clientul "${client.nume}"? Această acțiune nu poate fi anulată.`,
            {
                title: 'Confirmă ștergerea',
                confirmText: 'Șterge',
                cancelText: 'Anulează'
            }
        );

        if (!confirmed) return;

        try {
            await db.clienti.delete(id);
            
            // Actualizează lista locală
            this.clienti = this.clienti.filter(c => c.id !== id);
            
            // Invalidează cache-ul
            StorageModule.invalidateCache('clienti_list');
            
            // Re-renderizează
            this.renderClienti();
            
            NotificationModule.show(CONSTANTS.MESSAGES.SUCCESS.CLIENT_STERS, 'success');
            
        } catch (error) {
            console.error('Error deleting client:', error);
            const errorMessage = handleSupabaseError(error);
            NotificationModule.show(errorMessage, 'error');
        }
    },

    // Afișează modal pentru export
    showExportModal() {
        const modalHTML = `
            <div class="modal bg-white rounded-lg shadow-xl w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Export clienți</h2>
                    <button id="close-export-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Format export</label>
                        <select id="export-format" class="form-input">
                            <option value="csv">CSV (Excel)</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="export-all" checked 
                               class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                        <label for="export-all" class="ml-2 text-sm text-gray-700">
                            Exportă toți clienții (inclusiv cei filtrati)
                        </label>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 pt-6">
                    <button id="cancel-export" class="btn btn-secondary">
                        Anulează
                    </button>
                    <button id="confirm-export" class="btn btn-primary">
                        <i class="fas fa-download mr-2"></i>
                        Export
                    </button>
                </div>
            </div>
        `;

        ModalModule.show(modalHTML);

        document.getElementById('close-export-modal').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('cancel-export').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('confirm-export').addEventListener('click', () => {
            this.handleExport();
        });
    },

    // Gestionează exportul
    handleExport() {
        const format = document.getElementById('export-format').value;
        const exportAll = document.getElementById('export-all').checked;
        
        const dataToExport = exportAll ? this.clienti : this.applyFilters();
        
        if (format === 'csv') {
            this.exportToCSV(dataToExport);
        } else if (format === 'pdf') {
            this.exportToPDF(dataToExport);
        }
        
        ModalModule.hide();
    },

    // Export în CSV
    exportToCSV(data) {
        const headers = ['Nume', 'Telefon', 'Status', 'Data inregistrare'];
        const csvContent = [
            headers.join(','),
            ...data.map(client => [
                `"${client.nume}"`,
                `"${client.telefon || ''}"`,
                client.activ !== false ? 'Activ' : 'Inactiv',
                helpers.formatDate(client.data_inregistrare || client.created_at)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `clienti_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        NotificationModule.show('Fișierul CSV a fost descărcat', 'success');
    },

    // Export în PDF
    exportToPDF(data) {
        NotificationModule.show('Exportul PDF va fi implementat în curând', 'info');
    }
};

// Inițializează modulul când se încarcă DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.supabaseClient) {
            window.ClientiModule.init();
        }
    }, 100);
});