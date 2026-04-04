class Loading {
    static show() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.classList.remove('hidden');
    }

    static hide() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    static showError(message) {
        const errorEl = document.getElementById('error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            setTimeout(() => {
                errorEl.classList.add('hidden');
            }, 5000);
        }
    }
}