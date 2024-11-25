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
    const tableContent = await appService.deleteFromTable(key, value);
    res.json({data: tableContent});
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

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.get('/write-table', async (req, res) => {
    const tableContent = await appService.fetchWritesContractTable();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    
    const { legalName, dateOfBirth, stageName} = req.body;
    console.log("Request body:", req.body);

    const insertResult = await appService.insertDemotable(legalName, dateOfBirth, stageName);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-recordlabel", async (req, res) => {
    
    const { labelName, yearEstablished } = req.body;
    console.log("Request body:", req.body);

    const insertResult = await appService.insertRecordLabel(labelName, yearEstablished);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-writescontract", async (req, res) => {
    
    const { type, compensation, contractID, stageName, labelName, startDate, endDate } = req.body;
    console.log("Request body:", req.body);

    const insertResult = await appService.insertWritesContract(type, compensation, contractID, stageName, labelName, startDate, endDate);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
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

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});


module.exports = router;