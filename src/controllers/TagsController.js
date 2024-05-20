const knex = require("../database/knex");

class TagsController {
    async getAllTagsByNoteId(request, response) {
        const { note_id } = request.params;

        const tags = await knex("tags")
            .where({ note_id })

        return response.json(tags);
    }
}

module.exports = TagsController;