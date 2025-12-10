import ProductRepository from "../../application/repository/ProductRepository"
import Product from "../../domain/entity/Product"
import DatabaseConnection from "../database/DatabaseConnection"

// SQLite-specific repository (no schema prefix)
export default class ProductRepositorySqlite implements ProductRepository {
    constructor(readonly connection: DatabaseConnection) {}

    async list(): Promise<Product[]> {
        const productsData = await this.connection.query(
            "select * from product order by id_product",
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

    async listPaginated(page: number, limit: number): Promise<{ products: Product[], total: number, totalPages: number }> {
        const offset = (page - 1) * limit;
        
        // Busca produtos paginados
        const productsData = await this.connection.query(
            "select * from product order by id_product limit ? offset ?",
            [limit, offset]
        );
        
        // Busca total de produtos
        const totalResult = await this.connection.query(
            "select count(*) as total from product",
            []
        );
        
        const total = parseInt(totalResult[0].total || totalResult[0]?.["count(*)"] || "0");
        const totalPages = Math.ceil(total / limit);
        
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
        
        return { products, total, totalPages };
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
