import SqliteAdapter from "../../src/infra/database/SqliteAdapter"
import { initSqliteSchema } from "../../src/infra/database/sqlite_init"
import ProductRepositorySqlite from "../../src/infra/repository/ProductRepositorySqlite"

test("Deve obter um produto do banco SQLite", async function () {
    const connection = new SqliteAdapter()
    await connection.connect("./catalog_test.sqlite")
    await initSqliteSchema(connection)
    const productRepository = new ProductRepositorySqlite(connection)
    const productData = await productRepository.get(1)
    expect(productData.idProduct).toBe(1)
    expect(productData.description).toBe("Product 1")
    expect(productData.price).toBe(10) // conforme seed (10 * id)
    await connection.close()
})
