import type { IUser } from "../models/user.js";

export class UserService {
    private users: IUser[] = [
        {
            id: 1,
            name: "Maria",
            email: "maria@gmail.com",
            isActive: true,
        },
        {
            id: 2,
            name: "Carlos",
            email: "carlos@gmail.com",
            isActive: false,
        },
    ];

    getAll(): IUser[] {
        return this.users;
    }

    getById(id: number): IUser | undefined {
        return this.users.find((user) => user.id === id);
    }

    create(user: IUser): IUser {
        this.users.push(user);

        return user;
    }

    update(id: number, user: Partial<IUser>): IUser | undefined {
        const index = this.users.findIndex((existingUser) => existingUser.id === id);

        if (index === -1) {
            return undefined;
        }

        this.users[index] = {
            ...this.users[index]!,
            ...user,
        };

        return this.users[index];
    }

    delete(id: number): IUser | undefined {
        const index = this.users.findIndex((user) => user.id === id);

        if (index === -1) {
            return undefined;
        }

        const [removedUser] = this.users.splice(index, 1);

        return removedUser;
    }
}