import axios from "axios"
import SqliteAdapter from "../../src/infra/database/SqliteAdapter"
import { initSqliteSchema } from "../../src/infra/database/sqlite_init"
import DatabaseRepositoryFactory from "../../src/infra/factory/DatabaseRepositoryFactory"
import UsecaseFactory from "../../src/infra/factory/UsecaseFactory"
import ExpressAdapter from "../../src/infra/http/ExpressAdapter"
import HttpController from "../../src/infra/http/HttpController"

axios.defaults.validateStatus = () => true

let server: ExpressAdapter
let connection: SqliteAdapter

beforeAll(async () => {
    connection = new SqliteAdapter()
    await connection.connect("./catalog_api_test.sqlite")
    await initSqliteSchema(connection)
    const repositoryFactory = new DatabaseRepositoryFactory(connection)
    const usecaseFactory = new UsecaseFactory(repositoryFactory)
    server = new ExpressAdapter()
    new HttpController(server, usecaseFactory)
    server.listen(3001)
})

afterAll(async () => {
    await connection.close()
})

test("Deve listar os produtos em json (SQLite)", async function () {
    const response = await axios.get("http://localhost:3001/products", {
        headers: { "content-type": "application/json" },
    })
    const output = response.data
    expect(output).toHaveLength(100)
    expect(output[0].idProduct).toBe(1)
    expect(output[0].price).toBe(10)
})

test("Deve listar os produtos em csv (SQLite)", async function () {
    const response = await axios.get("http://localhost:3001/products", {
        headers: { "content-type": "text/csv" },
    })
    const output: string = response.data
    const firstLine = output.split("\n")[0]
    expect(firstLine).toBe("1;Product 1;10")
})

test("Deve retornar um produto (SQLite)", async function () {
    const response = await axios.get("http://localhost:3001/products/1")
    const output = response.data
    expect(output.idProduct).toBe(1)
    expect(output.description).toBe("Product 1")
    expect(output.price).toBe(10)
    expect(output.width).toBe(11)
    expect(output.height).toBe(6)
    expect(output.length).toBe(9)
    expect(output.weight).toBe(2)
    expect(output.volume).toBeCloseTo(0.000594, 10)
    expect(output.density).toBeCloseTo(2 / 0.000594, 2)
})
