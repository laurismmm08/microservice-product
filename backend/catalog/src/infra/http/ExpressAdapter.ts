import HttpServer from "./HttpServer"
import express, { Request, Response } from "express"
import cors from "cors"

// framework and driver
export default class ExpressAdapter implements HttpServer {
    app: any

    constructor() {
        this.app = express()
        this.app.use(express.json())
        this.app.use(cors())
    }

    on(method: string, url: string, callback: Function): void {
        this.app[method](url, async function (req: Request, res: Response) {
            try {
                // Combina params da rota com query parameters
                const allParams = { ...req.params, ...req.query };
                const output = await callback(allParams, req.body, req.headers)
                
                // Detecta se é CSV (string com vírgulas e quebras de linha)
                const isLikelyCsv = typeof output === 'string' && 
                    (output.includes(',') || output.includes('\n'));
                
                if (isLikelyCsv) {
                    res.setHeader("Content-Type", "text/csv");
                    res.send(output);
                } else {
                    res.json(output);
                }
            } catch (e: any) {
                // Se o erro tiver status code específico, usa ele
                const statusCode = e.status || 422;
                const message = e.message || e;
                
                res.status(statusCode).json({
                    error: message,
                })
            }
        })
    }

    listen(port: number): void {
        this.app.listen(port)
    }

    use(path: string, ...handlers: any[]): void {
        this.app.use(path, ...handlers)
    }
}
