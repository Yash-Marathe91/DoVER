/**
 * Institution Module - Corporate Console Experience
 */
const InstitutionModule = {
    renderDashboard(app) {
        if (typeof renderDashboard === 'function') renderDashboard(app);
    },
    renderUpload(app) {
        if (typeof renderGlobalUpload === 'function') renderGlobalUpload(app);
    },
    renderVerify(app) {
        if (typeof renderVerify === 'function') renderVerify(app);
    },
    renderBatch(app) {
        if (typeof renderGlobalBatch === 'function') renderGlobalBatch(app);
    },
    renderAudit(app) {
        if (typeof renderAudit === 'function') renderAudit(app);
    },
    renderChain(app) {
        if (typeof renderChain === 'function') renderChain(app);
    },
    async renderAdmin(app) {
        if (typeof renderGlobalAdmin === 'function') await renderGlobalAdmin(app);
    },
    renderSettings(app) {
        if (typeof renderSettings === 'function') renderSettings(app);
    },
    renderHelp(app) {
        document.getElementById('page-title').textContent = 'Institutional Console Guide';
        const wrap = document.createElement('div');
        wrap.className = 'max-w-7xl mx-auto space-y-20 fade-in';
        wrap.innerHTML = `<div class="text-center space-y-4">
            <h1 class="text-5xl font-black text-primary tracking-tight">Organization <span class="text-secondary">Console</span> Guide</h1>
            <p class="text-on-surface-variant text-lg max-w-2xl mx-auto">Enterprise tools for issuing and auditing official document flows.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
                <h3 class="text-xl font-bold text-primary">Issuing Documents</h3>
                <p class="text-sm text-slate-500">Secure official records with cryptographic signatures.</p>
            </div>
            <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
                <h3 class="text-xl font-bold text-primary">Compliance Logs</h3>
                <p class="text-sm text-slate-500">View detailed audit logs of all organization activities.</p>
            </div>
            <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
                <h3 class="text-xl font-bold text-primary">Batch Processing</h3>
                <p class="text-sm text-slate-500">Upload and secure multiple documents asynchronously.</p>
            </div>
        </div>`;
        app.appendChild(wrap);
    }
};
window.InstitutionModule = InstitutionModule;
