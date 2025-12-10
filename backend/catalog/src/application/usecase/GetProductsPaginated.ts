import Presenter from "../../infra/presenter/Presenter";
import ProductRepository from "../repository/ProductRepository";
import RepositoryFactory from "../factory/RepositoryFactory";

export default class GetProductsPaginated {
        productRepository: ProductRepository;

        constructor(repositoryFactory: RepositoryFactory, readonly presenter: Presenter) {
                this.productRepository = repositoryFactory.createProductRepository();
        }

        async execute(page: number = 1, limit: number = 10): Promise<any> {
                const result = await this.productRepository.listPaginated(page, limit);
                
                const output: Output[] = [];
                for (const product of result.products) {
                        output.push({
                                idProduct: product.idProduct,
                                description: product.description,
                                price: product.price
                        });
                }
                
                return this.presenter.present({
                        data: output,
                        pagination: {
                                page,
                                limit,
                                total: result.total,
                                totalPages: result.totalPages,
                                hasNextPage: page < result.totalPages,
                                hasPreviousPage: page > 1
                        }
                });
        }
}

type Output = {
        idProduct: number,
        description: string,
        price: number
}
