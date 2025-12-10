import sqlite3 from "sqlite3";
import DatabaseConnection from "./DatabaseConnection";

export default class SqliteAdapter implements DatabaseConnection {
    private connection: sqlite3.Database | null = null;

    async connect(filename?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = new sqlite3.Database(
                filename || "./catalog.sqlite",
                (err) => {
                    if (err) {
                        console.error("SQLite connection error:", err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async query(statement: string, params: any[]): Promise<any> {
        if (!this.connection) {
            throw new Error("Connection not established");
        }
        return new Promise((resolve, reject) => {
            this.connection!.all(statement, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                resolve();
                return;
            }
            this.connection.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    this.connection = null;
                    resolve();
                }
            });
        });
    }
}
