import request from "supertest";
import DatabaseConnection from "../../src/infra/database/DatabaseConnection";
import ExpressAdapter from "../../src/infra/http/ExpressAdapter";
import HttpController from "../../src/infra/http/HttpController";
import UsecaseFactory from "../../src/infra/factory/UsecaseFactory";
import DatabaseRepositoryFactory from "../../src/infra/factory/DatabaseRepositoryFactory";
import SqliteAdapter from "../../src/infra/database/SqliteAdapter";
import { initSqliteSchema } from "../../src/infra/database/sqlite_init";

describe("API Integration Tests", () => {
    let connection: DatabaseConnection;
    let httpServer: any;

    beforeAll(async () => {
        connection = new SqliteAdapter();
        await connection.connect();
        await initSqliteSchema(connection);
    });

    beforeEach(() => {
        const adapter = new ExpressAdapter();
        httpServer = adapter.app;
        const repositoryFactory = new DatabaseRepositoryFactory(connection);
        const usecaseFactory = new UsecaseFactory(repositoryFactory);
        new HttpController(adapter, usecaseFactory);
    });

    test("Deve listar os produtos em json (SQLite)", async () => {
        const response = await request(httpServer)
            .get("/products")
            .set("Content-Type", "application/json")
            .expect(200);

        // Sempre retorna formato paginado agora
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.pagination).toBeDefined();
    });

    test("Deve listar um produto específico", async () => {
        const response = await request(httpServer)
            .get("/products/1")
            .set("Content-Type", "application/json")
            .expect(200);

        expect(response.body.idProduct).toBe(1);
        expect(response.body.description).toBe("Product 1");
        expect(response.body.price).toBe(10);
    });

    test("Deve listar os produtos em csv", async () => {
        const response = await request(httpServer)
            .get("/products")
            .set("Content-Type", "text/csv")
            .expect(200);

        expect(response.headers["content-type"]).toContain("text/csv");
        expect(response.text).toContain("idProduct");
        expect(response.text).toContain("description");
        expect(response.text).toContain("price");
    });

    test("Deve retornar 400 para página inválida", async () => {
        const response = await request(httpServer)
            .get("/products?page=0")
            .set("Content-Type", "application/json")
            .expect(400);

        expect(response.body.error).toContain("Page must be greater than 0");
    });
});
