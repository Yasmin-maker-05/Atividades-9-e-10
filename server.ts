import express from "express";
import type { Request, Response } from "express";

import { errorHandler } from "./src/middlewares/error-handler.middleware.js";
import { AppError } from "./src/errors/app-error.js";
import { ProductService } from "./src/services/product.service.js";
import type { IProduct } from "./src/models/product.js";

import type { IUser } from "./src/models/user.js";
import { UserService } from "./src/services/user.service.js";
import { loggerMiddleware } from "./src/middlewares/logger.middleware.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(loggerMiddleware);

const userService = new UserService();
const productService = new ProductService();

function isValidUser(body: unknown): body is IUser {
    if (typeof body !== "object" || body === null) {
        return false;
    }

    const user = body as Record<string, unknown>;

    return (
        typeof user.id === "number" &&
        typeof user.name === "string" &&
        typeof user.email === "string" &&
        typeof user.isActive === "boolean"
    );
}

// GET /users
app.get("/users", (_req: Request, res: Response<IUser[]>) => {
    const users = userService.getAll();

    res.json(users);
});

// GET /users/:id
app.get(
    "/users/:id",
    (
        req: Request<{ id: string }>,
        res: Response<IUser | { error: string }>
    ) => {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        const user = userService.getById(id);

        if (!user) {
            res.status(404).json({ error: "Usuário não encontrado" });
            return;
        }

        res.json(user);
    }
);

// POST /users
app.post(
    "/users",
    (
        req: Request<object, IUser | { error: string }, IUser>,
        res: Response<IUser | { error: string }>
    ) => {
        const body: IUser = req.body;

        if (!isValidUser(body)) {
            res.status(400).json({
                error: "Corpo inválido. Esperado: { id: number, name: string, email: string, isActive: boolean }",
            });
            return;
        }

        const exists = userService.getById(body.id);

        if (exists) {
            res.status(409).json({
                error: "Já existe um usuário com este ID",
            });
            return;
        }

        const newUser = userService.create(body);

        res.status(201).json(newUser);
    }
);

// PUT /users/:id
app.put(
    "/users/:id",
    (
        req: Request<{ id: string }, IUser | { error: string }, IUser>,
        res: Response<IUser | { error: string }>
    ) => {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        const body: IUser = req.body;

        if (!isValidUser(body)) {
            res.status(400).json({
                error: "Corpo inválido. Esperado: { id: number, name: string, email: string, isActive: boolean }",
            });
            return;
        }

        if (body.id !== id) {
            res.status(400).json({
                error: "O ID do corpo deve corresponder ao ID da rota",
            });
            return;
        }

        const updatedUser = userService.update(id, body);

        if (!updatedUser) {
            res.status(404).json({
                error: "Usuário não encontrado",
            });
            return;
        }

        res.json(updatedUser);
    }
);

// DELETE /users/:id
app.delete(
    "/users/:id",
    (
        req: Request<{ id: string }>,
        res: Response<IUser | { error: string }>
    ) => {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }

        const removedUser = userService.delete(id);

        if (!removedUser) {
            res.status(404).json({
                error: "Usuário não encontrado",
            });
            return;
        }

        res.json(removedUser);
    }
);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.get("/teste-erro", () => {
    throw new AppError("Esse é um erro de teste", 400);
});

// GET /products
app.get("/products", (_req: Request, res: Response<IProduct[]>) => {
    const products = productService.getAll();

    res.json(products);
});

// GET /products/:id
app.get(
    "/products/:id",
    (
        req: Request<{ id: string }>,
        res: Response<IProduct | { message: string }>
    ) => {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            throw new AppError("ID inválido", 400);
        }

        const product = productService.getById(id);

        res.json(product);
    }
);

app.post("/products", (req, res, next) => {
    try {
        const product = req.body;

        const newProduct = productService.create(product);

        res.status(201).json(newProduct);
    } catch (error: unknown) {
        next(error);
    }
});

app.put(
    "/products/:id",
    (req: Request<{ id: string }>, res: Response, next) => {
        try {
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                throw new AppError("ID inválido", 400);
            }

            const updatedProduct = productService.update(id, req.body);

            res.json(updatedProduct);
        } catch (error: unknown) {
            next(error);
        }
    }
);

app.delete(
    "/products/:id",
    (req: Request<{ id: string }>, res: Response, next) => {
        try {
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                throw new AppError("ID inválido", 400);
            }

            productService.delete(id);

            res.status(204).send();
        } catch (error: unknown) {
            next(error);
        }
    }
);

app.use(errorHandler);