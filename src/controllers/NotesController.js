const knex = require("../database/knex");

class NotesController{
    async create(request, response){
        const { title, description, rating, tags } = request.body;
        const { user_id } = request.params;

        if ( rating && rating > 5 ) {
            rating = 5;
        } else if ( rating && rating < 1 ) {
            rating = 1;
        }

        const [ note_id ] = await knex("notes").insert({
            title,
            description,
            rating,
            user_id
        });

        const tagsInsert = tags.map( name => {
            return {
                note_id,
                name,
                user_id
            }
        });

        await knex("tags").insert(tagsInsert);

        response.json();

    }

    async getNotesById(request, response){
        const { id } = request.params;

        const note = await knex("notes").where({id}).first();

        const tags = await knex("tags").where({ note_id:id }).orderBy("name");

        return response.json({
            ...note,
            tags
        });
    }

    async delete(request, response){
        const { id } = request.params;

        await knex("notes").where({id}).delete();

        return response.json();
    }
}

module.exports = NotesController;