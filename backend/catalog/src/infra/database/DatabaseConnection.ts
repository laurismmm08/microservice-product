export default interface DatabaseConnection {
    connect(filename?: string): Promise<void>;
    query(statement: string, params: any[]): Promise<any>;
    close(): Promise<void>;
}
