import ProductRepository from "../../application/repository/ProductRepository"
import Product from "../../domain/entity/Product"
import DatabaseConnection from "../database/DatabaseConnection"

// SQLite-specific repository (no schema prefix)
export default class ProductRepositorySqlite implements ProductRepository {
    constructor(readonly connection: DatabaseConnection) {}

    async list(): Promise<Product[]> {
        const productsData = await this.connection.query(
            "select * from product",
            []
        )
        const products: Product[] = []
        for (const productData of productsData) {
            products.push(
                new Product(
                    productData.id_product,
                    productData.description,
                    parseFloat(productData.price),
                    productData.width,
                    productData.height,
                    productData.length,
                    parseFloat(productData.weight)
                )
            )
        }
        return products
    }

    async get(idProduct: number): Promise<Product> {
        const productsData = await this.connection.query(
            "select * from product where id_product = ?",
            [idProduct]
        )
        const productData = productsData[0]
        return new Product(
            productData.id_product,
            productData.description,
            parseFloat(productData.price),
            productData.width,
            productData.height,
            productData.length,
            parseFloat(productData.weight)
        )
    }
}
