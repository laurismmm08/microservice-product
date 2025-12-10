import CsvPresenter from "../presenter/CsvPresenter";
import HttpServer from "./HttpServer";
import JsonPresenter from "../presenter/JsonPresenter";
import UsecaseFactory from "../factory/UsecaseFactory";

// interface adapter
export default class HttpController {

        constructor(httpServer: HttpServer, usecaseFactory: UsecaseFactory) {

                // Endpoint sempre usa paginação, com valores padrão quando não especificado
                httpServer.on("get", "/products", async function (params: any, body: any, headers: any) {
                        const contentType = headers["content-type"] || "application/json";
                        const getProductsPaginated = usecaseFactory.createGetProductsPaginated(contentType);
                        
                        // Extrai parâmetros de paginação com valores padrão
                        const page = params.page ? parseInt(params.page) : 1;
                        const limit = params.limit ? parseInt(params.limit) : 1000; // Grande número para "todos"
                        
                        // Validações
                        if (page < 1) {
                                throw { status: 400, message: "Page must be greater than 0" };
                        }
                        if (limit < 1 || limit > 10000) {
                                throw { status: 400, message: "Limit must be between 1 and 10000" };
                        }
                        
                        return await getProductsPaginated.execute(page, limit);
                });

                httpServer.on("get", "/products/:idProduct", async function (params: any, body: any, headers: any) {
                        const getProduct = usecaseFactory.createGetProduct();
                        const output = await getProduct.execute(params.idProduct);
                        return output;
                });
        }
}
