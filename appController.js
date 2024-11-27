const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.delete('/deletetable', async (req, res) => {
    const {key, value} = req.body;
    try {
        const tableContent = await appService.deleteFromTable(key, value);
        console.log("tb", tableContent);
        if (tableContent > 0) {
            res.status(200).json({ 
                success: true,  
                data: tableContent
            });
        } else {
            
            res.status(500).json({ 
                success: false, 
                data: tableContent
            });
        }
    } catch (error) {
            console.error(error); 
        }
});

router.post('/projecttable', async (req, res) => {
    const keys = req.body;
    console.log("keys in controller", keys.key);
    const tableContent = await appService.projectFromTable(keys.key);
    res.json({data: tableContent})
});

router.post('/jointable', async (req, res) => {
    const whereValue = req.body.whereValue;
    const tableContent = await appService.joinTable(whereValue);
    res.json({data: tableContent});
});

router.get('/contractdata', async (req, res) => {
    const tableContent = await appService.fetchContractTypes();
    res.json({data: tableContent});
});

// router.get('/demotable', async (req, res) => {
//     const tableContent = await appService.fetchDemotableFromDb();
//     res.json({data: tableContent});
// });

router.post('/demotable', async (req, res) => {
    const tableName = req.body.tableName;
    console.log("table name", tableName);
    const tableContent = await appService.fetchDemotableFromDb(tableName);
    console.log("tablecontent", tableContent);
    res.json({data: tableContent});
});

router.get('/write-table', async (req, res) => {
    const tableContent = await appService.fetchWritesContractTable();
    res.json({data: tableContent});
});

router.get('/having', async (req, res) => {
    try {
        const data = await appService.having();
        res.status(200).json({success: true, data});
    } catch (error) {
        console.error("Error in having:", error);
        res.status(500).json({success: false, error: "Failed to fetch group-by data"});
    }
});


router.get('/group-by', async (req, res) => {
    try {
        const data = await appService.groupBy();
        res.status(200).json({success: true, data: data});
    } catch (error) {
        console.error("Error in group-by:", error);
        res.status(500).json({success: false, error: "Failed to fetch group-by data"});
    }
});

router.get('/nested-group-by', async (req, res) => {
    try {
        const data = await appService.nestedGroupBy();
        res.status(200).json({success: true, data});
    } catch (error) {
        console.error("Error in nested-group-by:", error);
        res.status(500).json({success: false, error: "Failed to fetch group-by data"});
    }
});


router.get('/division', async (req, res) => {
    try {
        const data = await appService.division();
        res.status(200).json({success: true, data});
    } catch (error) {
        console.error("Error in division:", error);
        res.status(500).json({success: false, error: "Failed to fetch group-by data"});
    }
});


router.post("/insert-demotable", async (req, res) => {
    
    const { legalName, dateOfBirth, stageName} = req.body;
    console.log("Request body:", req.body);

    const insertResult = await appService.insertDemotable(legalName, dateOfBirth, stageName);
    console.log("artist insert result", insertResult);
    console.log("artist insert result table", insertResult.table);
    if (insertResult.status === "success") {
        res.json({ success: true });
    } else if (insertResult.status === "duplicate") {
        res.status(400).json({ success: false, message: "This is a duplicate entry. It has already been added in " + insertResult.table})
    } else {
        res.status(500).json({ success: false, message: "Error inserting into " + insertResult.table });
    }
});

router.post("/insert-recordlabel", async (req, res) => {
    
    const { labelName, yearEstablished } = req.body;
    console.log("Request body:", req.body);

    const insertResult = await appService.insertRecordLabel(labelName, yearEstablished);
    console.log("result", insertResult);
    if (insertResult === "success") {
        res.status(200).json({ success: true });
    } else if (insertResult === "duplicate") {
        res.status(400).json({ success: false, message: "This is a duplicate. It has already been added." });
    } else {
        res.status(500).json({ success: false, message: "Error inserting into record label" });
    }
});

router.post("/insert-writescontract", async (req, res) => {
    
    const { type, compensation, contractID, stageName, labelName, startDate, endDate } = req.body;
    console.log("Request body:", req.body);

    const insertResult = await appService.insertWritesContract(type, compensation, contractID, stageName, labelName, startDate, endDate);
    console.log("controller result", insertResult);
    console.log("controller result status", insertResult.status);
    if (insertResult.status === "success") {
        res.status(200).json({ success: true });
    } else if (insertResult.status === "duplicate") {
        res.status(400).json({ success: false, message: "This is a duplicate entry. It has already been added in " + insertResult.table})
    } else {
        res.status(500).json({ success: false, message: "Error inserting into " + insertResult.table });
    }
});

router.post("/update-writescontract", async (req, res) => {
    const { key, oldValue, newValue } = req.body;
    const updateResult = await appService.updateWritesContract(key, oldValue, newValue);
    console.log("update result", updateResult);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


router.post('/selection', async (req, res) => {
    const {attributes} = req.body;
    const result = await appService.selection(attributes);
    res.json({data: result});

})


module.exports = router;