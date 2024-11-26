/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Transforms date to YYYY-MM-DD format 
function transformDate(input) {
    if (typeof input === "string" && Date.parse(input)) {
        const date = new Date(input)
        const formatDate = 
        `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}-${String(date.getDay()+1).padStart(2, "0")}`;

        return formatDate;
    } else {
        return input;
    }
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

// Fetches data from the demotable and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/demotable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    mapDataToTable(demotableContent, tableBody);
    
}


// fetch writescontract table
async function fetchAndDisplayContract() {
    const tableElement = document.getElementById('writescontracttable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/write-table', {
        method: 'GET'
    });

    const responseData = await response.json();
    const contractContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    mapDataToTable(contractContent, tableBody);
    // contractContent.forEach(user => {
    //     const row = tableBody.insertRow();
    //     user.forEach((field, index) => {
    //         const cell = row.insertCell(index);
    //         cell.textContent = transformDate(field);
            
    //     });
    // });
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


    if (responseData.key !== 0) {
        messageElement.textContent = "Data deleted successfully!";
    } else {
        messageElement.textContent = "Data deleted unsuccessfully!";
    }
}

async function projectTable(event) {
    event.preventDefault();

    const projectKeys = Array.from( document.querySelectorAll('input[name="projectTable"]:checked'))
        .map(checkbox => checkbox.value);

    try {
        console.log("project keys", projectKeys);
        if (projectKeys.length === 0) {
            throw new Error;
        }

        const response = await fetch("/projecttable", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: projectKeys,
                
            })
        });
        const responseData = await response.json();
        console.log("responseData project", responseData);
        const messageElement = document.getElementById('projectResultMessage');


        if (responseData) {
            messageElement.textContent = "Choices processed succesfully!";
            displayProjectTable(projectKeys, responseData.data);
        } else {
            messageElement.textContent = "Error in processing choices!";
        }
        } catch (err) {
            console.error("Error occurred:" + err);
            messageElement = document.getElementById('projectResultMessage');
            messageElement.textContent = `Error! Please select at least one column`
        }  
}

async function fetchDropDownTable() {
        const contractData = await fetch("/contractdata", {
            method: 'GET'
        });
    
        const contractDataObject = await contractData.json();
        console.log("contract", contractDataObject.data);
        const contractDataArray = contractDataObject.data;

        createDropDownValues(contractDataArray);
}

async function joinTable(event) {
    event.preventDefault();

    const whereValue = document.querySelector('select[name="whereValue"]').value;
    console.log("where value", whereValue);
    try {

        const response = await fetch("/jointable", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                whereValue: whereValue
            })
        });
        const responseData = await response.json();
        const messageElement = document.getElementById('joinResultMsg');
    
        console.log("resp data join", responseData);
        if (responseData) {
            messageElement.textContent = "Success!";
            const tableElement = document.getElementById('jointabletable');
            const tableBody = tableElement.querySelector('tbody');
        
            const demotableContent = responseData.data;
        
            // Always clear old, already fetched data before new fetching process.
            if (tableBody) {
                tableBody.innerHTML = '';
            }
        
            mapDataToTable(demotableContent, tableBody);
            // demotableContent.forEach(user => {
            //     const row = tableBody.insertRow();
            //     user.forEach((field, index) => {
            //         const cell = row.insertCell(index);
            //         cell.textContent = field;
            //     });
            // });
            
        } else {
            messageElement.textContent = "Error processing data!";
        }
    } catch (err) {
            console.error("Error occurred:", err);
            const messageElement = document.getElementById('joinResultMsg');
            messageElement.textContent = `Error Processing data: ${err.message}`;
        
    }
    
}



// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!" + responseData);
    }
}

// Inserts new records into the demotable.
async function insertDemotable(event) {
    event.preventDefault();

    const legalNameValue = document.getElementById('legalName').value;
    const dateOfBirthValue = document.getElementById('dateOfBirth').value;
    const stageNameValue = document.getElementById('stageName').value;
    
    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            legalName: legalNameValue,
            dateOfBirth: dateOfBirthValue,
            stageName: stageNameValue
            
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!" + responseData.messageElement;
    }
}

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
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!" + responseData.messageElement;
    }
}


async function insertWritesContract(event) {
    event.preventDefault();
    const type = document.getElementById('type').value;
    const compensation = document.getElementById('compensation').value;
    const contractID = document.getElementById('contractID').value;
    const stageName = document.getElementById('stageName-w').value;
    const labelName = document.getElementById('labelName-w').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const response = await fetch('/insert-writescontract', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: type,
            compensation: compensation,
            contractID: contractID,
            stageName: stageName,
            labelName: labelName,
            startDate: startDate,
            endDate: endDate
        
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        alert("Need to first add artist information!");
        messageElement.textContent = "Error inserting data!" + responseData.messageElement;
    }
}

// Updates values in the writes contract table.
async function updateWritesContract(event) {
    event.preventDefault();

    const keyValue = document.querySelector('select[name="updateKeys"]').value;
    const oldValue = document.getElementById('oldValue').value;
    const newValue = document.getElementById('newValue').value;

    
    const response = await fetch('/update-writescontract', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: keyValue,
            oldValue: oldValue,
            newValue: newValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Values updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating values!";
    }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}

async function runGroupBy() {
    const messageElement = document.getElementById('groupByMsg');
    const response = await fetch("/group-by", {
        method: 'GET'
    });
    console.log("response", response)

    const responseData = await response.json();
    console.log("responseData", responseData);

    if (responseData.success) {
        const result = JSON.stringify(responseData.data);
        console.log(responseData);
        console.log(responseData.data);
        messageElement.textContent = `Query Results: \n${result}`;
    } else {
        alert("Error!");
    }

}

async function runHaving() {
    const messageElement = document.getElementById('havingMsg');
    const response = await fetch("/having", {
        method: 'GET'
    });

    const responseData = await response.json();

    if (responseData.success) {
        const result = JSON.stringify(responseData.data);
        messageElement.textContent = `Query Results: \n${result}`;
    } else {
        alert("Error!");
    }

}

async function runNestedGroupBy() {
    const messageElement = document.getElementById('nestedGroupByMsg');
    const response = await fetch("/nested-group-by", {
        method: 'GET'
    });

    const responseData = await response.json();

    if (responseData.success) {
        const result = JSON.stringify(responseData.data);
        messageElement.textContent = `Query Results: \n${result}`;
    } else {
        alert("Error!");
    }

}

async function runDivision() {
    const messageElement = document.getElementById('divisionMsg');
    const response = await fetch("/division", {
        method: 'GET'
    });

    const responseData = await response.json();

    if (responseData.success) {
        const result = JSON.stringify(responseData.data);
        messageElement.textContent = `Query Results: \n${result}`;
    } else {
        alert("Error!");
    }

}

async function runSelection(event) {
    event.preventDefault();
    const conditionBlocks = document.querySelectorAll(".condition");
    const conditions = [];

    conditionBlocks.forEach((block, index) => {
        const column = block.querySelector(".attribute").value;
        const operator = block.querySelector(".operator").value;
        const value = block.querySelector(".value").value.trim();
        const logicalOperator = index < conditionBlocks.length - 1 ? block.querySelector(".logicalOperator").value : null;

        if (column && operator && value) {
            conditions.push({column, operator, value, logicalOperator});
        } else {
            console.error("Please fill out all fields!");
        }
    })

    try {
        const response = await fetch("/selection", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({attributes: conditions}),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById("selectionResultMsg");

        if (responseData) {
            messageElement.textContext = "Success!";
            const tableElement = document.getElementById("selectionTable");
            const tableBody = tableElement.querySelector("tbody");

            const resultData = responseData.data;

            if (tableBody) {
                tableBody.innerHTML = "";
            }

            mapDataToTable(resultData, tableBody);
        } else {
            messageElement.textContext = "error: query failed!";
        }
    } catch (err) {
        console.error("Error occurred:", err);
        const messageElement = document.getElementById("selectionResultMsg");
        messageElement.textContent = `Error: ${err.message}`;
    }




}

function addCondition() {
    const form = document.getElementById("selectionForm");
    const firstCondition = form.querySelector(".condition");
    const newCondition = firstCondition.cloneNode(true);
    const inputs = newCondition.querySelectorAll("input, select");
    inputs.forEach(input => {
        if (input.type === "text" || input.type === "number" || input.type === "date") {
            input.value = "";
        } else if (input.tagName === "SELECT") {
            input.selectedIndex = 0;
        }
    })

    form.insertBefore(newCondition, document.getElementById("addCondition"));
}





// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
    document.getElementById("updateWritesContract").addEventListener("submit", updateWritesContract);
    document.getElementById("countDemotable").addEventListener("click", countDemotable);
    document.getElementById("insertRecordLabel").addEventListener("submit", insertRecordLabel);
    document.getElementById("insertWritesContract").addEventListener("submit", insertWritesContract);
    document.getElementById("deleteFromTable").addEventListener("submit", deleteFromTable);
    document.getElementById("projectTable").addEventListener("submit", projectTable);

    document.getElementById("runGroupBy").addEventListener("click", runGroupBy);
    document.getElementById("runHaving").addEventListener("click", runHaving);
    document.getElementById("runNestedGroupBy").addEventListener("click", runNestedGroupBy);
    document.getElementById("runDivision").addEventListener("click", runDivision);
    document.getElementById("submitQuery").addEventListener("click", runSelection);
    document.getElementById("addCondition").addEventListener("click", addCondition);

    document.getElementById("joinTable").addEventListener("submit", joinTable);



};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
    fetchAndDisplayContract();
    fetchDropDownTable();

}
