import GetProducts from "../../src/application/usecase/GetProducts";
import DatabaseRepositoryFactory from "../../src/infra/factory/DatabaseRepositoryFactory";
import SqliteAdapter from "../../src/infra/database/SqliteAdapter";
import JsonPresenter from "../../src/infra/presenter/JsonPresenter";
import { initSqliteSchema } from "../../src/infra/database/sqlite_init";

test("Deve listar os produtos (SQLite)", async () => {
    const connection = new SqliteAdapter()
    await connection.connect(":memory:")
    await initSqliteSchema(connection)
    const repositoryFactory = new DatabaseRepositoryFactory(connection)
    const getProducts = new GetProducts(repositoryFactory, new JsonPresenter())
    const output = await getProducts.execute()
    
    // JsonPresenter retorna o array diretamente
    expect(Array.isArray(output)).toBe(true)
    expect(output).toHaveLength(100)
    
    // sanity check on first and last
    expect(output[0].idProduct).toBe(1)
    expect(output[0].price).toBe(10)
    expect(output[99].idProduct).toBe(100)
    expect(output[99].price).toBe(1000)
    
    await connection.close()
})
