import pgp from "pg-promise";
import ProductRepository from "../../application/repository/ProductRepository";
import Product from "../../domain/entity/Product";
import DatabaseConnection from "../database/DatabaseConnection";

// interface adapters
export default class ProductRepositoryDatabase implements ProductRepository {

        constructor(readonly connection: DatabaseConnection) {
        }

        async list(): Promise<Product[]> {
                const productsData = await this.connection.query("select * from cccat11.product order by id_product", []);
                const products: Product[] = [];
                for (const productData of productsData) {
                        products.push(new Product(productData.id_product, productData.description, parseFloat(productData.price), productData.width, productData.height, productData.length, parseFloat(productData.weight)));
                }
                return products;
        }

        async listPaginated(page: number, limit: number): Promise<{ products: Product[], total: number, totalPages: number }> {
                const offset = (page - 1) * limit;
                
                // Busca produtos paginados
                const productsData = await this.connection.query(
                        "select * from cccat11.product order by id_product limit $1 offset $2", 
                        [limit, offset]
                );
                
                // Busca total de produtos
                const totalResult = await this.connection.query(
                        "select count(*) as total from cccat11.product", 
                        []
                );
                
                const total = parseInt(totalResult[0].total);
                const totalPages = Math.ceil(total / limit);
                
                const products: Product[] = [];
                for (const productData of productsData) {
                        products.push(new Product(
                                productData.id_product, 
                                productData.description, 
                                parseFloat(productData.price), 
                                productData.width, 
                                productData.height, 
                                productData.length, 
                                parseFloat(productData.weight)
                        ));
                }
                
                return { products, total, totalPages };
        }

        async get(idProduct: number) {
                const [productData] = await this.connection.query("select * from cccat11.product where id_product = $1", [idProduct]);
                return new Product(productData.id_product, productData.description, parseFloat(productData.price), productData.width, productData.height, productData.length, parseFloat(productData.weight));
        }
}
