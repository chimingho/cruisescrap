var pool = require("./mysql.js");

test ('mysql pool', ()=>{
   expect(pool).toBeTruthy();
})

test('mysql connection callback', done =>{
    function callback(err, connection) {
        if (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('Database connection was closed.')
            }
            if (err.code === 'ER_CON_COUNT_ERROR') {
                console.error('Database has too many connections.')
            }
            if (err.code === 'ECONNREFUSED') {
                console.error('Database connection was refused.')
            }
        }
    
        expect(connection).toBeTruthy();
        done();

        if (connection) connection.release()
        return;
    }
    pool.getConnection(callback);
});

