import { OpenAPIV3 } from "openapi-types";

export const openApiSpec: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "Product Catalog API",
        version: "1.0.0",
        description: "API for product catalog with pagination support",
    },
    servers: [{ url: "http://localhost:3001", description: "Development server" }],
    paths: {
        "/products": {
            get: {
                summary: "Get products",
                description: "Retrieve products with optional pagination",
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        description: "Page number (default: 1)",
                        required: false,
                        schema: { type: "integer", minimum: 1, default: 1 },
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Items per page (default: 10, max: 100)",
                        required: false,
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
                    },
                    {
                        name: "Content-Type",
                        in: "header",
                        description: "Response format",
                        required: false,
                        schema: { 
                            type: "string", 
                            enum: ["application/json", "text/csv"],
                            default: "application/json"
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Successful response",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    idProduct: { type: "integer" },
                                                    description: { type: "string" },
                                                    price: { type: "number" },
                                                },
                                            },
                                        },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: { type: "integer" },
                                                limit: { type: "integer" },
                                                total: { type: "integer" },
                                                totalPages: { type: "integer" },
                                                hasNextPage: { type: "boolean" },
                                                hasPreviousPage: { type: "boolean" },
                                            },
                                        },
                                    },
                                },
                            },
                            "text/csv": {
                                schema: { type: "string" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid parameters",
                    },
                    "500": {
                        description: "Internal server error",
                    },
                },
            },
        },
        "/products/{idProduct}": {
            get: {
                summary: "Get product by ID",
                parameters: [
                    {
                        name: "idProduct",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Product found",
                    },
                    "404": {
                        description: "Product not found",
                    },
                },
            },
        },
    },
};
