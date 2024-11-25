const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function projectFromTable(keys) {
    return await withOracleDB(async (connection) => {
        let columns;
        console.log("keys", keys);
        if (Array.isArray(keys)) {
            columns = keys.join(',');
        } else {
            columns = keys;
        }
        console.log("columns", columns);
        const query = `SELECT ${columns} FROM WritesContract2`;
        const result = await connection.execute(query);
        return result.rows;
    }). catch(() => {
        console.error('Project from table failed:', error);
        throw error;
    })
}


/* 
** JOIN QUERY find the stageName and compensation 
of all artists with the same type of contract 
SELECT w2.stageName, w1.compensation
FROM WritesContract1 w1, WritesContract2 w2
WHERE w1.type = w2.type
*/
async function joinTable(whereAttribute) {
    return await withOracleDB(async (connection) => {
        
        const query = `SELECT w2.stageName, w1.compensation
         FROM WritesContract1 w1, WritesContract2 w2
         WHERE w1.${whereAttribute} = w2.${whereAttribute}`
        const result = await connection.execute(query);
        return result.rows;
    }). catch(() => {
        console.error('Joining the two failed:', error);
        throw error;
    })
}

// select 
async function selection(whereAttribute) {
    return await withOracleDB(async (connection) => {
        
        const query = `SELECT w2.stageName, w1.compensation
         FROM WritesContract1 w1, WritesContract2 w2
         WHERE w1.${whereAttribute} = w2.${whereAttribute}`
        const result = await connection.execute(query);
        return result.rows;
    }). catch(() => {
        console.error('Joining the two failed:', error);
        throw error;
    })
}



async function deleteFromTable(key, value) {
    return await withOracleDB(async (connection) => {
        const query = `DELETE FROM RecordLabel WHERE ${key} = :value`;
        const result = await connection.execute(query, { value }, 
            { autoCommit: true });
        return result.rowsAffected;
    }). catch(() => {
        console.error('Delete from table failed:', error);
        throw error;
    })
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM ArtistSigns1');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchWritesContractTable() {
    return await withOracleDB(async (connection) => {
        const query = 'SELECT * FROM WritesContract2';
        const result = await connection.execute(query);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        const dropTables = async () => {
            const dropStatements = [
                'DROP TABLE ArtistSigns1 CASCADE CONSTRAINTS',
                'DROP TABLE ArtistSigns2 CASCADE CONSTRAINTS',
                'DROP TABLE RecordLabel CASCADE CONSTRAINTS',
                'DROP TABLE WritesContract1 CASCADE CONSTRAINTS',
                'DROP TABLE WritesContract2 CASCADE CONSTRAINTS'
            ];
            
            for (const statement of dropStatements) {
                try {
                    await connection.execute(statement);
                    console.log(`Table dropped successfully with: ${statement}`);
                } catch (err) {
                    if (err.errorNum === 942) {
                        console.log(`Table from statement "${statement}" might not exist, proceeding...`);
                    } else {
                        console.error(`Error executing "${statement}":`, err);
                    }
                }
            }
        };

        const createTables = async () => {
            try {
                // create tables in the right order
                await connection.execute(`
                    CREATE TABLE RecordLabel(
                        labelName       VARCHAR2(50) PRIMARY KEY,
                        yearEstablished INT
                    )
                `);
        
                await connection.execute(`
                    CREATE TABLE WritesContract1(
                        type            VARCHAR2(50) PRIMARY KEY,
                        compensation    INT NOT NULL
                    )
                `);
        
                await connection.execute(`
                    CREATE TABLE ArtistSigns1(
                        legalName       VARCHAR2(50) PRIMARY KEY,
                        dateOfBirth     DATE NOT NULL
                    )
                `);
                console.log('ArtistSigns1 table created');
        
                await connection.execute(`
                    CREATE TABLE ArtistSigns2(
                        stageName       VARCHAR2(50) PRIMARY KEY,
                        legalName       VARCHAR2(50) NOT NULL,
                        FOREIGN KEY (legalName) REFERENCES ArtistSigns1 (legalName)
                    )
                `);
        
                await connection.execute(`
                    CREATE TABLE WritesContract2(
                        contractID      VARCHAR2(50) PRIMARY KEY,
                        type            VARCHAR2(50) NOT NULL,
                        stageName       VARCHAR2(50) UNIQUE NOT NULL,
                        labelName       VARCHAR2(50) NOT NULL,
                        startDate       DATE NOT NULL,
                        endDate         DATE,
                        FOREIGN KEY (labelName) REFERENCES RecordLabel(labelName) ON DELETE CASCADE,
                        FOREIGN KEY (stageName) REFERENCES ArtistSigns2(stageName),
                        FOREIGN KEY (type) REFERENCES WritesContract1 (type)
                    )
                `);

                
                console.log('WritesContract2 table created');
            } catch (error) {
                console.error('Error in createTables:', error);
                throw error;
            }
        };

        try {
            console.log('Starting table initialization...');
            
            // drop all tables
            await dropTables();
            console.log('All drops completed');
            
            // create all tables
            await createTables();
            console.log('All creates completed');

            return true;
        } catch (error) {
            console.error('Error during table initialization:', error);
            throw error;
        }
    }).catch((error) => {
        console.error('Database operation failed:', error);
        return false;
    });
}

async function insertArtist1(legalName, dateOfBirth) {
    return await withOracleDB(async (connection) => {
        try {

            const insertResult = await connection.execute(
                `INSERT INTO ArtistSigns1 (legalName, dateofBirth) VALUES (:legalName, TO_DATE(:dateOfBirth, 'YYYY-MM-DD'))`,
                { legalName: legalName, dateOfBirth: dateOfBirth },
                { autoCommit: true }
            );
            console.log(`Successfully inserted into Artist1`);
            return insertResult.rowsAffected > 0;
        } catch (error) {
            console.error('Error in Artist1:', error);
            throw error;
        }
    });
}

async function insertArtist2(stageName, legalName) {
    return await withOracleDB(async (connection) => {
        try {
            
            const insertResult = await connection.execute(
                `INSERT INTO ArtistSigns2 (stageName, legalName) VALUES (:stageName, :legalName)`,
                { stageName: stageName, legalName: legalName },
                { autoCommit: true }
            );
            console.log(`Successfully inserted into Artist2`);
            return insertResult.rowsAffected > 0;
        } catch (error) {
            console.error('Error in insertArtist2:', error);
            throw error;
        }
    });
}

async function insertRecordLabel(labelName, yearEstablished) {
            return await withOracleDB(async (connection) => {
                try {
                    const checkResult = await connection.execute(
                        `SELECT COUNT(*) AS count FROM RecordLabel WHERE labelName = :labelName`,
                        { labelName: labelName }
                    );
                    const row = checkResult.rows[0];
                    console.log("row", row);
                    if (row[0] > 0) {
                        console.log(`RecordLabel with labelName ${labelName} already exists.`);
                    } else {
                        const insertResult = await connection.execute(
                            `INSERT INTO RecordLabel (labelName, yearEstablished) VALUES (:labelName, :yearEstablished)`,
                            { labelName: labelName, yearEstablished: yearEstablished },
                            { autoCommit: true }
                        );
                        
                        console.log(`Successfully inserted into RecordLabel`);
                        return insertResult.rowsAffected > 0;
                    }
                    return true; 
                } catch (error) {
                    console.error('Error in RecordLabel:', error);
                    throw error;
                }
            });
}

async function insertWritesContract1 (type, compensation) {
    return await withOracleDB(async (connection) => {
        try {
            
            const insertResult = await connection.execute(
                `INSERT INTO WritesContract1 (type, compensation) VALUES (:type, :compensation)`,
                { type: type, compensation: compensation },
                { autoCommit: true }
            );
            console.log(`Successfully inserted into WritesContract1`);
            return insertResult.rowsAffected > 0;
        } catch (error) {
            console.error('Error in WritesContract1:', error);
            throw error;
        }
    });
}

async function insertWritesContract2 (contractID, type, stageName, labelName, startDate, endDate) {
    return await withOracleDB(async (connection) => {
        try {
            
            const insertResult = await connection.execute(
                `INSERT INTO WritesContract2 (contractID, type, stageName, labelName, startDate, endDate) 
                VALUES (:contractID, :type, :stageName, :labelName, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'))`,
                { contractID: contractID, 
                    type: type,
                    stageName: stageName,
                    labelName: labelName,
                    startDate: startDate,
                    endDate: endDate
                 },
                { autoCommit: true }
            );
            console.log(`Successfully inserted into WritesContract2`);
            return insertResult.rowsAffected > 0;
        } catch (error) {
            console.error('Error in WritesContract2:', error);
            throw error;
        }
    });
}

async function insertWritesContract (type, compensation, contractID, stageName, labelName, startDate, endDate) {
    try {
        console.log('Inserting into tables...');
    

        const e1InsertResult = await insertWritesContract1(type, compensation);
        if (!e1InsertResult) {
            throw new Error("Failed to insert into EmploysEmployee1.");
        }

        const e2InsertResult = await insertWritesContract2(contractID, type, stageName, labelName, startDate, endDate);
        if (!e2InsertResult) {
            throw new Error("Failed to insert into EmploysEmployee2.");
        }
        return e2InsertResult;

    } catch (error) {
        console.error("Error inserting into the database:", error);
        return false;
    }
}

async function insertDemotable(legalName, dateOfBirth, stageName) {
    try {
        console.log('Inserting into tables...');
    

        const e1InsertResult = await insertArtist1(legalName, dateOfBirth);
        if (!e1InsertResult) {
            throw new Error("Failed to insert into EmploysEmployee1.");
        }

        const e2InsertResult = await insertArtist2(stageName, legalName);
        if (!e2InsertResult) {
            throw new Error("Failed to insert into EmploysEmployee2.");
        }
        return e2InsertResult;

    } catch (error) {
        console.error("Error inserting into the database:", error);
        return false;
    }
}




async function updateWritesContract(key, oldValue, newValue) {
    return await withOracleDB(async (connection) => {
        console.log("key", key);
        console.log("old", oldValue);
        console.log("new", newValue);
 
        const result = await connection.execute(
            `UPDATE WritesContract2 
             SET ${key} = TO_DATE(:newValue, 'YYYY-MM-DD') 
             WHERE ${key} = TO_DATE(:oldValue, 'YYYY-MM-DD')`,
            [newValue, oldValue],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM EmploysEmployee3');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

async function groupBy() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT stageName, MIN(numTracks)
                 FROM Album 
                 WHERE professionalName = 'Jack Antonoff'
                 GROUP BY stageName`
            );
            console.log(result.rows);
            return result.rows;
        } catch (error) {
            console.error("Error in GROUP BY", error);
            return false;
        }
    })
}

async function having() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT stageName, COUNT(*) 
                 FROM Album 
                 WHERE numTracks > 9 
                 GROUP BY stageName 
                 HAVING COUNT(*) > 1`
            );
            return result.rows;
        } catch (error) {
            console.error("Error in HAVING", error);
            return false;
        }
    })
}

async function nestedGroupBy() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT professionalName, AVG(numTracks) 
                 FROM Album
                 GROUP BY professionalName
                 HAVING AVG(numTracks) >= (
                     SELECT AVG(numTracks)
                     FROM Album)`
            );
            return result.rows;
        } catch (error) {
            console.error("Error in nested GROUP BY", error);
            return false;
        }
    })
}

async function division() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT DISTINCT A.stageName
                 FROM Album A
                 WHERE NOT EXISTS (
                     SELECT S.genre
                     FROM Song S
                     WHERE NOT EXISTS (
                         SELECT *
                         FROM Album A2, Song S2
                         WHERE A2.stageName = A.stageName AND S2.genre = S.genre AND A2.UPC = S2.UPC))`
            );
            return result.rows;
        } catch (error) {
            console.error("Error in division", error);
            return false;
        }
    })
}


module.exports = {
    testOracleConnection,
    deleteFromTable,
    fetchDemotableFromDb,
    fetchWritesContractTable,
    initiateDemotable, 
    insertDemotable, 
    insertWritesContract,
    insertRecordLabel,
    updateWritesContract, 
    countDemotable,
    joinTable,
    projectFromTable,
    groupBy,
    having,
    nestedGroupBy,
    division
};