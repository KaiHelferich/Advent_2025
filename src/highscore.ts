// Highscore-Verwaltung mit IndexedDB

export interface HighscoreEntry {
    id?: number;
    score: number;
    date: Date;
}

export class HighscoreManager {
    private dbName: string = 'SnakeGameDB';
    private storeName: string = 'highscores';
    private version: number = 1;
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error('IndexedDB konnte nicht geöffnet werden'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    objectStore.createIndex('score', 'score', { unique: false });
                    objectStore.createIndex('date', 'date', { unique: false });
                }
            };
        });
    }
    
    /**
     * addScore
     * Fügt ein neues Spielergebnis hinzu
     */
    async addScore(score: number): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Datenbank nicht initialisiert'));
                return;
            }

            const entry: HighscoreEntry = {
                score: score,
                date: new Date() // Wird automatisch als ISO-String gespeichert
            };

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(entry);

            request.onsuccess = async () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Score konnte nicht gespeichert werden'));
            };
        });
    }

    /**
     * getTopScores
     * Liefert die x-besten Ergebnisse
     */
    async getTopScores(limit: number = 5): Promise<HighscoreEntry[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Datenbank nicht initialisiert'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('score');
            const request = index.openCursor(null, 'prev'); // Absteigend sortiert

            const scores: HighscoreEntry[] = [];

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor && scores.length < limit) {
                    const entry = cursor.value;
                    // Konvertiere date String zurück zu Date-Objekt
                    if (typeof entry.date === 'string') {
                        entry.date = new Date(entry.date);
                    }
                    scores.push(entry);
                    cursor.continue();
                } else {
                    resolve(scores);
                }
            };

            request.onerror = () => {
                reject(new Error('Scores konnten nicht geladen werden'));
            };
        });
    }

    /**
     * clearAllScores
     * Löscht alle bisher gespeicherten Ergebnisse
     */
    async clearAllScores(): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Datenbank nicht initialisiert'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Scores konnten nicht gelöscht werden'));
            };
        });
    }
}