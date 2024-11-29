const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

const allowedTableNames = ["RecordLabel",
    "EMPLOYSEMPLOYEE1",
    "EMPLOYSEMPLOYEE2",
    "EMPLOYSEMPLOYEE3",
    "WritesContract1",
    "AWARDSHOW",
    "ArtistSigns1",
    "ArtistSigns2",
    "WritesContract2",
    "MUSICPROFESSIONAL",
    "COLLABORATESWITH",
    "WRITER",
    "PRODUCER",
    "ALBUM",
    "SONG",
    "WRITES",
    "SINGLE",
    "ALBUMTRACK",
    "CONCERT1",
    "CONCERT2",
    "PERFORMSAT",
    "ISSUETICKET2",
    "ISSUETICKET1"];

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
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
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
    const validColumns = ['contractID', 'type', 'stageName', 'labelName', 'startDate', 'endDate'];
    return await withOracleDB(async (connection) => {
        let columns;
        if (Array.isArray(keys)) {
            const sanitizedKeys = keys.filter((key) => validColumns.includes(key));
            if (sanitizedKeys.length === 0) {
                throw new Error('Invalid column names provided');
            }
            columns = sanitizedKeys.join(',');
        } else {
            if (!validColumns.includes(keys)) {
                throw new Error('Invalid column name provided');
            }
            columns = keys;
        }
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
of all artists with the same type of contract type
It joins WritesContract1 and WritesContract2
*/
async function joinTable(whereValue) {
    return await withOracleDB(async (connection) => {
        const whereValueInput = whereValue;
        console.log(whereValue);
        const query = `SELECT DISTINCT p.stageName, c.ticketsSold
FROM PerformsAt p, Concert2 c
WHERE p.concertVenue = c.concertVenue
AND p.concertDate = c.concertDate
AND p.concertVenue = :whereValueInput
`
        const result = await connection.execute(query, {whereValueInput});
        return result.rows;
    }). catch(() => {
        console.error('Joining the two failed:', error);
        throw error;
    })
}

async function fetchContractTypes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT DISTINCT concertVenue FROM Concert2`);
        return result.rows;
    }).catch(() => {
        return [];
    });
    
}


// select 
async function selection(attributes) {
    try {
        return await withOracleDB(async (connection) => {
            const conditions = [];
            const params = {};

            attributes.forEach((condition, index) => {
                const { column, operator, value, logicalOperator } = condition;
                const paramName = `param${index}`;

                if (column === "releaseDate") {
                    conditions.push(`${column} ${operator} TO_DATE(:${paramName}, 'YYYY-MM-DD')`);
                } else if (column === "duration") {
                    conditions.push(`${column} ${operator} :${paramName}`);
                } else {
                    conditions.push(`UPPER(${column}) ${operator} UPPER(:${paramName})`);
                }
                params[paramName] = value;

                if (logicalOperator) {
                    conditions.push(logicalOperator);
                }
            });

            const newAttributes = conditions.join(" ");

            const query = `SELECT *
                FROM Song
                WHERE ${newAttributes}`;

            const result = await connection.execute(query, params);
            return result.rows;
        });
    } catch (error) {
        console.error('Select failed:', error);
        throw error;
    }
}


async function deleteFromTable(key, value) {
    const validKeys = ['labelName'];
    if (!validKeys.includes(key)) {
        throw new Error('Invalid column name.');
    }
    return await withOracleDB(async (connection) => {
        const query = `DELETE FROM RecordLabel WHERE ${key} = :value`;
        const result = await connection.execute(query, { value }, 
            { autoCommit: true });
        return result.rowsAffected;
    }). catch(() => {
        return 0;
    })
}

async function fetchDemotableFromDb(tableName) {
    if (!allowedTableNames.includes(tableName)) {
        throw new Error("Invalid table name");
    }
    return await withOracleDB(async (connection) => {
        const query = `SELECT * FROM ${tableName}`;
        const result = await connection.execute(query);
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



async function insertArtist1(legalName, dateOfBirth) {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(
                `INSERT INTO ArtistSigns1 (legalName, dateofBirth) VALUES (:legalName, TO_DATE(:dateOfBirth, 'YYYY-MM-DD'))`,
                { legalName, dateOfBirth },
                { autoCommit: true }
            );
            return "success";
        } catch (error) {
            if (error.errorNum === 1) { 
                return "duplicate";
            } else {
                console.error('Error in Artist1:', error);
                throw error;
            }
        }
    });
}


async function insertArtist2(stageName, legalName) {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(
                `INSERT INTO ArtistSigns2 (stageName, legalName) VALUES (:stageName, :legalName)`,
                { stageName: stageName, legalName: legalName },
                { autoCommit: true }
            );
            return "success"
        } catch (error) {
            if (error.errorNum === 1) { 
                return "duplicate";
            } else {
                console.error('Error in Artist2:', error);
                throw error;
            }
        }
    });
}

async function insertRecordLabel(labelName, yearEstablished) {
            return await withOracleDB(async (connection) => {
                try {
                        await connection.execute(
                            `INSERT INTO RecordLabel (labelName, yearEstablished) VALUES (:labelName, :yearEstablished)`,
                            { labelName: labelName, yearEstablished: yearEstablished },
                            { autoCommit: true }
                        );
                        return "success";
                } catch (error) {
                    if (error.errorNum === 1) { 
                        return "duplicate";
                    } else {
                    console.error('Error in RecordLabel:', error);
                    throw error;
                    }
                }
            });
}

async function insertWritesContract1(type, stageName, compensation) {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(
                `INSERT INTO WritesContract1 (type, stageName, compensation) VALUES (:type, :stageName, :compensation)`,
                { type: type, stageName: stageName, compensation: compensation },
                { autoCommit: true }
            );
            return "success";  
        } catch (error) {
            if (error.errorNum === 1) {
                return "duplicate";  
            } else if (error.errorNum === 2291) {
                return "parentKeyNotFound";  
            } else {
                console.error('Unexpected Error:', error);  
                throw error; 
            }
        }
    });
}


async function insertWritesContract2 (contractID, type, stageName, labelName, startDate, endDate) {
    return await withOracleDB(async (connection) => {
        try {
            
            await connection.execute(
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
            return "success"
        } catch (error) {
            if (error.errorNum === 1) {
                return "duplicate";  
            } else if (error.errorNum === 2291) {  
                return "parentKeyNotFound";
            } else {
                console.error('Error in WritesContract2:', error);
                throw error;  
            }
        }
    });
}

async function insertWritesContract(type, compensation, contractID, stageName, labelName, startDate, endDate) {
    try {

        const e1InsertResult = await insertWritesContract1(type, stageName, compensation);

        if (e1InsertResult === "duplicate") {
            return { status: "duplicate", table: "WritesContract1" };
        } else if (e1InsertResult === "parentKeyNotFound") {
            return { status: "parentKeyNotFound", table: "WritesContract1" };
        } else if (e1InsertResult !== "success") {
            throw new Error("Failed to insert into WritesContract1.");
        }

        const e2InsertResult = await insertWritesContract2(contractID, type, stageName, labelName, startDate, endDate);

        if (e2InsertResult === "duplicate") {  
            return { status: "duplicate", table: "WritesContract2" };
        } else if (e2InsertResult === "parentKeyNotFound") {  
            return { status: "parentKeyNotFound", table: "WritesContract2" };
        } else if (e2InsertResult !== "success") {  
            throw new Error("Failed to insert into WritesContract2.");
        }

        return { status: "success" };

    } catch (error) {
        console.error("Error inserting into the database:", error);
        throw error;
    }
}


async function insertDemotable(legalName, dateOfBirth, stageName) {
    try {
        const e1InsertResult = await insertArtist1(legalName, dateOfBirth);
        if (e1InsertResult === "duplicate") {
            return { status: "duplicate", table: "ArtistSigns1" };
        } else if (e1InsertResult !== "success") {
            throw new Error("Failed to insert into ArtistSigns1.");
        }

        const e2InsertResult = await insertArtist2(stageName, legalName);
        if (e2InsertResult === "duplicate") {
            return { status: "duplicate", table: "ArtistSigns2" };
        } else if (e2InsertResult !== "success") {
            throw new Error("Failed to insert into ArtistSigns2.");
        }
        return { status: "success" };

    } catch (error) {
        console.error("Error inserting into the database:", error);
        throw error; 
    }
}

/* UPDATE */
/** We are using Oracle as our DBMS so it cannot compute ON UPDATE CASCADE
 * However, this relation has a UNIQUE constraint and has multiple foreign Keys 
 * Only start date and end date was implemented for update as all the other
 * attributes were foreign keys that cascades on update (stageName, labelName, type).
 * ON UPDATE CASCADE statements were taken out of the script for valid table creation
 * in Oracle.
 */
async function updateWritesContract(contractID, key, oldValue, newValue) {
    const validKeys = ['startDate', 'endDate', 'labelName', 'stageName', 'type']; 
    
    if (!validKeys.includes(key)) {
        throw new Error("Invalid key provided.");
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE WritesContract2 
             SET ${key} = TO_DATE(:newValue, 'YYYY-MM-DD') 
             WHERE ${key} = TO_DATE(:oldValue, 'YYYY-MM-DD') AND contractID = :contractID`,
            {   newValue: newValue,
                oldValue: oldValue,
                contractID: contractID
            },
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function groupBy() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT stageName, professionalName, MAX(numTracks)
FROM Album 
WHERE numTracks <15
GROUP BY stageName, professionalName
ORDER BY stageName`
            );

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
    insertDemotable, 
    insertWritesContract,
    insertRecordLabel,
    updateWritesContract, 
    joinTable,
    projectFromTable,
    groupBy,
    having,
    nestedGroupBy,
    division,
    selection,
    fetchContractTypes
};