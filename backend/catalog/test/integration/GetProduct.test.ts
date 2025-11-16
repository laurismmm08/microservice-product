import DatabaseRepositoryFactory from "../../src/infra/factory/DatabaseRepositoryFactory"
import GetProduct from "../../src/application/usecase/GetProduct"
import SqliteAdapter from "../../src/infra/database/SqliteAdapter"
import { initSqliteSchema } from "../../src/infra/database/sqlite_init"

// main
test("Deve retornar um produto (SQLite)", async function () {
    const connection = new SqliteAdapter()
    await connection.connect("./catalog_test.sqlite")
    await initSqliteSchema(connection)
    const repositoryFactory = new DatabaseRepositoryFactory(connection)
    const getProduct = new GetProduct(repositoryFactory)
    const output = await getProduct.execute(1)
    expect(output.idProduct).toBe(1)
    expect(output.description).toBe("Product 1")
    expect(output.price).toBe(10)
    expect(output.width).toBe(11)
    expect(output.height).toBe(6)
    expect(output.length).toBe(9)
    expect(output.weight).toBe(2)
    // Volume aproximado: 11/100 * 6/100 * 9/100 = 0.000594
    expect(output.volume).toBeCloseTo(0.000594, 10)
    expect(output.density).toBeCloseTo(2 / 0.000594, 2)
    await connection.close()
})
