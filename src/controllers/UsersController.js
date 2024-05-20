const AppError = require("../utils/AppError");
const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");

class UsersController {
    async create(request, response) {
        const { name, email, password, avatar } = request.body;

        const checkIfEmailExists = await knex("users").where({ email }).first();

        if ( checkIfEmailExists ) {
            throw new AppError("E-mail já cadastrado no sistema.");
        }

        const hashedPassword = await hash(password, 8);

        await knex("users").insert({
            name,
            email,
            password: hashedPassword,
            avatar
        });

        response.status(201).json();
    }

    async update(request, response) {
        const { name, email, newPassword, oldPassword, avatar } = request.body;
        const { id } = request.params;

        const user = await knex("users").where({ id }).first();

        if ( !user ) {
            throw new AppError("Usuário não encontrado.");
        }

        const checkEmailPersisted = await knex("users").where({ email }).first();

        if ( checkEmailPersisted && checkEmailPersisted.id !== user.id ) {
            throw new AppError("E-mail já em uso.")
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.avatar = avatar ?? user.avatar;

        if ( newPassword && !oldPassword ) {
            throw new AppError("Você deve informar a senha atual.")
        }

        if ( newPassword && oldPassword ) {
            const checkPassword = await compare(oldPassword, user.password);

            if ( !checkPassword ) {
                throw new AppError("Senha atual inválida.");
            }
            user.password = await hash( newPassword, 8 );
        }

        await knex("users").where({ id }).update({
            name: user.name,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
            updated_at: knex.fn.now()
        });

        response.status(200).json(`Usuário atualizado com sucesso!`);
    }

    async delete(request, response) {
        const { id } = request.params;

        await knex("users").where({id}).delete();

        return response.json();
    }
}

module.exports = UsersController;