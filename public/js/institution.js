/**
 * Institution Module - Corporate Console Experience
 */
const InstitutionModule = {
    renderDashboard(app) {
        document.getElementById('page-title').textContent = 'Institutional Portal';
        const wrap = document.createElement('div');
        wrap.className = 'max-w-7xl mx-auto space-y-8 fade-in';

        const header = document.createElement('div');
        header.innerHTML = `<div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div><span class="text-secondary font-bold tracking-widest uppercase text-xs">Corporate Governance & Employee Records</span>
            <h1 class="text-3xl font-extrabold text-primary tracking-tight mt-1">Admin Overview</h1></div>
            <a href="#/console/upload" class="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-opacity-90 active:scale-95 transition-all">
                <span class="material-symbols-outlined text-lg">add</span> Issue New Certificate</a>
        </div>`;
        wrap.appendChild(header);
        
        if (typeof renderStatsBar === 'function') renderStatsBar(wrap);

        const explorer = document.createElement('div');
        explorer.className = 'bg-surface-container-lowest rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden';

        const categories = ['all', ...Object.keys(CATEGORY_MAP['b2b'])];

        explorer.innerHTML = `
            <div class="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    ${categories.map(cat => `
                        <button onclick="setCategory('${cat}')" class="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}">
                            ${cat}
                        </button>
                    `).join('')}
                </div>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input type="text" placeholder="Search records..." class="pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/20 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary/10 w-full md:w-64"/>
                </div>
            </div>
            <div id="vault-list" class="min-h-[400px]"></div>
        `;
        wrap.appendChild(explorer);
        app.appendChild(wrap);

        if (typeof loadVaultDocuments === 'function') {
            loadVaultDocuments(document.getElementById('vault-list'));
        }
    },

    renderUpload(app) {
        if (typeof renderUpload === 'function') renderUpload(app);
    },

    renderBatch(app) {
        if (typeof renderBatch === 'function') renderBatch(app);
    },

    renderAudit(app) {
        if (typeof renderAudit === 'function') renderAudit(app);
    },

    renderChain(app) {
        document.getElementById('page-title').textContent = 'Corporate Ledger';
        if (typeof renderChain === 'function') renderChain(app);
    },

    async renderAdmin(app) {
        if (typeof renderAdmin === 'function') await renderAdmin(app);
    },

    renderSettings(app) {
        if (typeof renderSettings === 'function') renderSettings(app);
    }
};

window.InstitutionModule = InstitutionModule;
