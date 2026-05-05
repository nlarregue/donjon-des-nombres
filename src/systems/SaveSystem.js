const SAVE_KEY = 'donjon-des-nombres-v1';

export const SaveSystem = {
    save(data) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Sauvegarde impossible:', e);
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    clear() {
        localStorage.removeItem(SAVE_KEY);
    },

    hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }
};
