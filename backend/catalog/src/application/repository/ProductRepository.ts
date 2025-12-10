import Product from "../../domain/entity/Product";

export default interface ProductRepository {
        list(): Promise<Product[]>;
        listPaginated(page: number, limit: number): Promise<{ products: Product[], total: number, totalPages: number }>;
        get(idProduct: number): Promise<Product>;
}
