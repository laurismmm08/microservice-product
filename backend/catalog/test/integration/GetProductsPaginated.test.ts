import request from "supertest";
import DatabaseConnection from "../../src/infra/database/DatabaseConnection";
import ExpressAdapter from "../../src/infra/http/ExpressAdapter";
import HttpController from "../../src/infra/http/HttpController";
import UsecaseFactory from "../../src/infra/factory/UsecaseFactory";
import DatabaseRepositoryFactory from "../../src/infra/factory/DatabaseRepositoryFactory";
import SqliteAdapter from "../../src/infra/database/SqliteAdapter";
import { initSqliteSchema } from "../../src/infra/database/sqlite_init";

describe("GET /products with pagination", () => {
    let connection: DatabaseConnection;
    let httpServer: any;

    beforeAll(async () => {
        // Configura banco de testes em memória
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

    test("should return paginated products with default values", async () => {
        const response = await request(httpServer)
            .get("/products?page=1&limit=5")
            .set("Content-Type", "application/json")
            .expect(200);

        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(response.body.data).toHaveLength(5);
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(5);
        expect(response.body.pagination.total).toBe(100);
        expect(response.body.pagination.totalPages).toBe(20);
        expect(response.body.pagination.hasNextPage).toBe(true);
        expect(response.body.pagination.hasPreviousPage).toBe(false);
    });

    test("should return second page of products", async () => {
        const response = await request(httpServer)
            .get("/products?page=2&limit=10")
            .set("Content-Type", "application/json")
            .expect(200);

        expect(response.body.data).toHaveLength(10);
        expect(response.body.pagination.page).toBe(2);
        expect(response.body.pagination.hasNextPage).toBe(true);
        expect(response.body.pagination.hasPreviousPage).toBe(true);
    });

    test("should return last page correctly", async () => {
        const response = await request(httpServer)
            .get("/products?page=10&limit=10")
            .set("Content-Type", "application/json")
            .expect(200);

        expect(response.body.pagination.page).toBe(10);
        expect(response.body.pagination.totalPages).toBe(10);
        expect(response.body.pagination.hasNextPage).toBe(false);
        expect(response.body.pagination.hasPreviousPage).toBe(true);
    });

    test("should return CSV format when requested", async () => {
        const response = await request(httpServer)
            .get("/products?page=1&limit=3")
            .set("Content-Type", "text/csv")
            .expect(200);

        expect(response.headers["content-type"]).toContain("text/csv");
        expect(response.text).toContain("idProduct");
        expect(response.text).toContain("description");
        expect(response.text).toContain("price");
    });

    test("should validate page parameter", async () => {
        const response = await request(httpServer)
            .get("/products?page=0&limit=10")
            .set("Content-Type", "application/json")
            .expect(400);

        expect(response.body.error).toContain("Page must be greater than 0");
    });

    test("should validate limit parameter - too high", async () => {
        const response = await request(httpServer)
            .get("/products?page=1&limit=20000")
            .set("Content-Type", "application/json")
            .expect(400);

        expect(response.body.error).toContain("Limit must be between 1 and 10000");
    });

    test("should validate limit parameter - too low", async () => {
        const response = await request(httpServer)
            .get("/products?page=1&limit=0")
            .set("Content-Type", "application/json")
            .expect(400);

        expect(response.body.error).toContain("Limit must be between 1 and 10000");
    });
});
