const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: 'db/data.db',
    },
});

export default class DBStorage {

    constructor() {
/*
        knex.schema
            .createTableIfNotExists('b3dm', table => {
                table.increments('id');
                table.string('b3dm_name');
                table.binary('data');
            }).then(() => {
            console.log('Create table done')
        })
 */
    }

    insertB3DM(b3dmName, blob) {
        try {
            knex('b3dm')
                .insert({b3dm_name: b3dmName, data: blob});
        } catch (ex){
            console.log('DBStorage insertB3DM Exc : ' + ex);
        }
    }

    close(){
       // knex.destroy();
    }

}