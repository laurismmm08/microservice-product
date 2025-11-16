import DatabaseRepositoryFactory from "../../src/infra/factory/DatabaseRepositoryFactory"
import GetProducts from "../../src/application/usecase/GetProducts"
import JsonPresenter from "../../src/infra/presenter/JsonPresenter"
import SqliteAdapter from "../../src/infra/database/SqliteAdapter"
import { initSqliteSchema } from "../../src/infra/database/sqlite_init"

// main
test("Deve listar os produtos (SQLite)", async function () {
    const connection = new SqliteAdapter()
    await connection.connect("./catalog_test.sqlite")
    await initSqliteSchema(connection)
    const repositoryFactory = new DatabaseRepositoryFactory(connection)
    const getProducts = new GetProducts(repositoryFactory, new JsonPresenter())
    const output = await getProducts.execute()
    expect(output).toHaveLength(100)
    // sanity check on first and last
    expect(output[0].idProduct).toBe(1)
    expect(output[0].price).toBe(10)
    expect(output[99].idProduct).toBe(100)
    expect(output[99].price).toBe(1000)
    await connection.close()
})
