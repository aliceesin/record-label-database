// const p = require('./script.js');

async function insertRecordLabel(event) {
    event.preventDefault();

    const labelName = document.getElementById('labelName').value;
    const yearEstablished = document.getElementById('yearEstablished').value;
    
    const response = await fetch('/insert-recordlabel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            labelName: labelName,
            yearEstablished: yearEstablished,
            
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertRecordMsg');
    console.log("responseData", responseData);

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchAndDisplay();
    } else {
        messageElement.textContent = "Error inserting data! " + responseData.message;
    }
}
    
    async function fetchAndDisplay() {
        const tableElement = document.getElementById('recordtable');
        const tableBody = tableElement.querySelector('tbody');
        const tableName = 'RecordLabel';
    
        const response = await fetch('/demotable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tableName: tableName
                
            })
        });
    
        const responseData = await response.json();
        const demotableContent = responseData.data;
    
        // Always clear old, already fetched data before new fetching process.
        if (tableBody) {
            tableBody.innerHTML = '';
        }
    
        mapDataToTable(demotableContent, tableBody);
        
    }

    // Transforms date to YYYY-MM-DD format 
function transformDate(input) {
    const oracleDateFormat = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z?)?$/;
    if (typeof input === "string" && oracleDateFormat.test(input)) {
        const date = new Date(input);
        if (!isNaN(date)) {
            const formatDate = 
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            return formatDate;
        }
    }
    return input; 
}


function mapDataToTable(demotableContent, tableBody) {
    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = transformDate(field);
        });
    });
}

async function deleteFromTable(event) {
    event.preventDefault();

    const deleteKeyValue = document.querySelector('select[name="deleteKey"]').value;
    const valValue = document.getElementById('deleteValue').value;

    const response = await fetch("/deletetable", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: deleteKeyValue,
            value: valValue
        })
    });
    const responseData = await response.json();
    const messageElement = document.getElementById('deleteResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data deleted successfully!";
    } else {
        messageElement.textContent = "Delete was unsuccessful!";
    }
}



window.onload = function() {
    document.getElementById("deleteFromTable").addEventListener("submit", deleteFromTable);
    document.getElementById("insertRecordLabel").addEventListener("submit", insertRecordLabel);
    fetchAndDisplay();
    



};