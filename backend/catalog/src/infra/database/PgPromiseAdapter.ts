import pgp from "pg-promise";
import DatabaseConnection from "./DatabaseConnection";

export default class PgPromiseAdapter implements DatabaseConnection {
    private connection: any;

    async connect(): Promise<void> {
        this.connection = pgp()({
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "123456",
            database: "app",
        });
    }

    async query(statement: string, params: any[]): Promise<any> {
        return this.connection.query(statement, params);
    }

    async close(): Promise<void> {
        // PostgreSQL não precisa de close explícito para cada query
    }
}
