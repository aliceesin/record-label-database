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

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM EmploysEmployee3');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchHireDateFromDb() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT e3.employeeName
            FROM employsemployee3 e3
            JOIN employsemployee2 e2
            ON e3.hireDate = e2.hireDate
            WHERE e2.salary > 40000
            `;
        const result = await connection.execute(query);
        return result.rows;
    }).catch(() => {
        return [];
    });
}



async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE EmploysEmployee3`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE EmploysEmployee3
            (
                employeeID   VARCHAR2(50) PRIMARY KEY,
                employeeName VARCHAR2(50)        NOT NULL,
                SIN          VARCHAR2(50) UNIQUE NOT NULL,
                hireDate     DATE                NOT NULL,
                labelName    VARCHAR2(50)        NOT NULL,
                role         VARCHAR2(50)        NOT NULL,
                FOREIGN KEY (labelName) REFERENCES RecordLabel(labelName) ON DELETE CASCADE,
                FOREIGN KEY (hireDate) REFERENCES EmploysEmployee2 (hireDate),
                FOREIGN KEY (role) REFERENCES EmploysEmployee1 (role)
                
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateEmployee2Table() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE EmploysEmployee2`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE EmploysEmployee2
            (
                hireDate DATE PRIMARY KEY,
                salary   INT NOT NULL
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateEmployee1Table() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE EmploysEmployee1`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE EmploysEmployee1(
                role 			VARCHAR2(50) 	PRIMARY KEY,
                dept			VARCHAR2(50) 	NOT NULL
                )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(employeeID, employeeName, sin, hireDate, labelName, role, dept, salary) {
    try {
        console.log('Inserting into tables...');
        const employeeInsertResult = await insertEmployeeTables(employeeID, employeeName, sin, hireDate, labelName, role, dept, salary);
        if (!employeeInsertResult) {
            throw new Error("Failed to insert into Employee tables.");
        }

        // insert into EmploysEmployee3
        const result = await withOracleDB(async (connection) => {
            const insertResult = await connection.execute(
                `INSERT INTO EmploysEmployee3 (employeeID, employeeName, sin, hireDate, labelName, role) 
                 VALUES (:employeeID, :employeeName, :sin, TO_DATE(:hireDate, 'YYYY-MM-DD'), :labelName, :role)`,
                {
                    employeeID: employeeID,
                    employeeName: employeeName,
                    sin: sin,
                    hireDate: hireDate,  
                    labelName: labelName,
                    role: role
                },
                { autoCommit: true }
            );

            return insertResult.rowsAffected > 0;
        });

        return result;
    } catch (error) {
        console.error("Error inserting into the database:", error);
        return false;
    }
}



async function insertEmployeeTables(employeeID, employeeName, sin, hireDate, labelName, role, dept, salary) {
    try {
        // Ensure data is correctly passed to the tables
        const e1 = await withOracleDB(async (connection) => {
            const insertResult = await connection.execute(
                `INSERT INTO EmploysEmployee1 (role, dept) VALUES (:role, :dept)`,
                {
                    role: role,
                    dept: dept  
                },
                { autoCommit: true }
            );
            return insertResult.rowsAffected > 0;
        });

        const e2 = await withOracleDB(async (connection) => {
            const insertResult = await connection.execute(
                `INSERT INTO EmploysEmployee2 (hireDate, salary) VALUES (TO_DATE(:hireDate, 'YYYY-MM-DD'), :salary)`,
                {
                    hireDate: hireDate,
                    salary: salary  // Ensure salary is passed in
                },
                { autoCommit: true }
            );

            return insertResult.rowsAffected > 0;
        });

        return e1 && e2;
    } catch (error) {
        console.error("Error inserting into the database:", error);
        return false;
    }
      
}




async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE EmploysEmployee3 SET role=:newName where role=:oldName`,
            [newName, oldName],
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

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    fetchHireDateFromDb,
    initiateDemotable, 
    initiateEmployee2Table,
    insertDemotable, 
    updateNameDemotable, 
    countDemotable
};