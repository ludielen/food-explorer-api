const knex = require("../database/knex")
const sqliteConnection = require("../database/sqlite")
const appError = require("../utils/appError")
const DiskStorage = require("../providers/DiskStorage")

class PlatesController {

    async getPlates(request, response) {
        const plate_name = request.query.name;
        const plate_category = request.query.category;


        if (plate_name !== undefined && plate_name !== null) {
            const platesWithIngredientsQuery = await knex
                .select(
                    'plate.id as plate_id',
                    'plate.title as plate_title',
                    'plate.description as plate_description',
                    'plate.price as plate_price',
                    'plate.picture as plate_picture',
                    'ingredient.name as ingredient_name',
                    'plate.category as plate_category'
                )
                .from('plate')
                .leftJoin('ingredient', 'plate.id', 'ingredient.plate_id')
                .where('plate.title', 'like', `%${plate_name}%`)
                .orderBy('plate.id');

            const groupedResult = [];

            platesWithIngredientsQuery.forEach(row => {
                const existingPlate = groupedResult.find(item => item.plate_id === row.plate_id);

                if (existingPlate) {
                    existingPlate.plate_ingredients.push(row.ingredient_name);
                } else {
                    groupedResult.push({
                        plate_id: row.plate_id,
                        plate_title: row.plate_title,
                        plate_description: row.plate_description,
                        plate_price: row.plate_price,
                        plate_picture: row.plate_picture,
                        plate_category: row.plate_category,
                        plate_ingredients: row.ingredient_name ? [row.ingredient_name] : []
                    });
                }
            });

            return response.json(groupedResult);
        } else if (plate_category !== undefined && plate_category !== null) {
            const platesWithIngredientsQuery = await knex
                .select(
                    'plate.id as plate_id',
                    'plate.title as plate_title',
                    'plate.description as plate_description',
                    'plate.price as plate_price',
                    'plate.picture as plate_picture',
                    'ingredient.name as ingredient_name',
                    'plate.category as plate_category'
                )
                .from('plate')
                .leftJoin('ingredient', 'plate.id', 'ingredient.plate_id')
                .where('plate.category', `${plate_category}`)
                .orderBy('plate.id');

            const groupedResult = [];

            platesWithIngredientsQuery.forEach(row => {
                const existingPlate = groupedResult.find(item => item.plate_id === row.plate_id);

                if (existingPlate) {
                    existingPlate.plate_ingredients.push(row.ingredient_name);
                } else {
                    groupedResult.push({
                        plate_id: row.plate_id,
                        plate_title: row.plate_title,
                        plate_description: row.plate_description,
                        plate_price: row.plate_price,
                        plate_picture: row.plate_picture,
                        plate_category: row.plate_category,
                        plate_ingredients: row.ingredient_name ? [row.ingredient_name] : []
                    });
                }
            });

            return response.json(groupedResult);
        } else {
            const platesWithIngredientsQuery = await knex
                .select(
                    'plate.id as plate_id',
                    'plate.title as plate_title',
                    'plate.description as plate_description',
                    'plate.price as plate_price',
                    'plate.picture as plate_picture',
                    'ingredient.name as ingredient_name',
                    'plate.category as plate_category'
                )
                .from('plate')
                .leftJoin('ingredient', 'plate.id', 'ingredient.plate_id')
                .orderBy('plate.id');

            const groupedResult = [];

            platesWithIngredientsQuery.forEach(row => {
                const existingPlate = groupedResult.find(item => item.plate_id === row.plate_id);

                if (existingPlate) {
                    existingPlate.plate_ingredients.push(row.ingredient_name);
                } else {
                    groupedResult.push({
                        plate_id: row.plate_id,
                        plate_title: row.plate_title,
                        plate_description: row.plate_description,
                        plate_price: row.plate_price,
                        plate_picture: row.plate_picture,
                        plate_category: row.plate_category,
                        plate_ingredients: row.ingredient_name ? [row.ingredient_name] : []
                    });
                }
            });

            return response.json(groupedResult);
        }
    }

    async updatePlate(request, response) {
        const { plate_id, plate_title, plate_description, plate_price, ingredient_list } = request.body

        const database = await sqliteConnection()

        const hasExistPlate = await database.get("SELECT * FROM plate WHERE id = (?)", [plate_id])

        if (!hasExistPlate) {
            throw new appError("Plate Id invalid", 404)
        }

        await database.run(`
    UPDATE plate SET 
    title = ?,
    description = ?,
    price = ?
    WHERE id = ?`,
            [plate_title, plate_description, plate_price, plate_id])

        await database.run(`
            DELETE from ingredient WHERE plate_id = ?`,
            [plate_id])

        const ingredientToUpdate = ingredient_list.map(name => {
            return {
                plate_id,
                name
            }
        })

        await knex("ingredient").insert(ingredientToUpdate);

        const plateUpdated = await database.get("SELECT * FROM plate WHERE id = (?)", [plate_id]);

        return response.json(plateUpdated)

    }

    async deletePlate(request, response) {
        const { plate_id } = request.params

        const database = await sqliteConnection()

        const hasExistPlate = await database.get("SELECT * FROM plate WHERE id = (?)", [plate_id])

        if (!hasExistPlate) {
            throw new appError("Plate Id invalid or not exist", 404)
        }

        await database.run(`
    DELETE FROM plate
    WHERE id = ?`,
            [plate_id])

        const isPlateNotDeleted = await database.get("SELECT * FROM plate WHERE id = (?)", [plate_id]);

        if (isPlateNotDeleted) {
            throw new appError("Error to delete the plate", 500)
        }

        return response.json()

    }

    async createPlate(request, response) {
        const { plate_title, plate_description, plate_price, ingredient_list, plate_category } = request.body

        const database = await sqliteConnection()

        const hasPlateWithSameName = await database.get("SELECT * FROM plate WHERE title = (?)", [plate_title])

        if (hasPlateWithSameName) {
            throw new appError("Duplicate plate name", 409)
        }
        const validPlates = ["refeicao", "sobremesa", "bebida"];
        if (plate_category === undefined || !validPlates.includes(plate_category)) {
            throw new appError("Opção de prato inválida. Precisa ser [refeicao, sobremesa ou bebida] ", 400)
        }

        const [plate_id] = await knex("plate").insert({
            title: plate_title,
            description: plate_description,
            price: plate_price,
            category: plate_category
        })

        const ingredientToInsert = ingredient_list.map(name => {
            return {
                plate_id,
                name
            }
        })

        await knex("ingredient").insert(ingredientToInsert);

        response.status(201).json({ "plate_id": plate_id })
    }

    async uploadPicture(request, response) {
        const { plate_id } = request.params
        const plate_picture = request.file.filename

        const database = await sqliteConnection()

        const hasExistPlate = await database.get("SELECT * FROM plate WHERE id = (?)", [plate_id])

        if (!hasExistPlate) {
            throw new appError("Plate Id invalid or not exist", 404)
        }

        const diskStorage = new DiskStorage()

        const plate_picture_name = await diskStorage.saveFile(plate_picture)

        await database.run(`
    UPDATE plate SET 
    picture = ?
    WHERE id = ?`,
            [plate_picture_name, plate_id])

        response.status(204).send();
    }

}

module.exports = PlatesController