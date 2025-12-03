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

            //TODO
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

            //TODO
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

            //TODO
        });
    }
}