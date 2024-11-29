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
    const messageElement = document.getElementById('insertWritesMsg');
    console.log("resp", responseData);

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchAndDisplayContract();
    } else {
        messageElement.textContent = "Error inserting data! " + responseData.message;
    }
}

async function updateWritesContract(event) {
    event.preventDefault();

    const keyValue = document.querySelector('select[name="updateKeys"]').value;
    const oldValue = document.getElementById('oldValue').value;
    const newValue = document.getElementById('newValue').value;
    const contractIDValue = document.getElementById("contractID-u").value;

    
    const response = await fetch('/update-writescontract', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contractID: contractIDValue,
            key: keyValue,
            oldValue: oldValue,
            newValue: newValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Values updated successfully!";
        fetchAndDisplayContract();
    } else {
        messageElement.textContent = "Error updating values!";
    }
}


window.onload = function() {
    fetchAndDisplayContract();
    document.getElementById("insertWritesContract").addEventListener("submit", insertWritesContract);
    document.getElementById("projectTable").addEventListener("submit", projectTable);
    document.getElementById("updateWritesContract").addEventListener("submit", updateWritesContract);



}