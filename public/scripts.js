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


// Fetches data from the demotable and displays it.
// async function fetchAndDisplayUsers() {
//     const tableElement = document.getElementById('demotable');
//     const tableBody = tableElement.querySelector('tbody');
//     const tableName = 'ArtistSigns1';

//     const response = await fetch('/demotable', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             tableName: tableName
            
//         })
//     });

//     const responseData = await response.json();
//     const demotableContent = responseData.data;

//     // Always clear old, already fetched data before new fetching process.
//     if (tableBody) {
//         tableBody.innerHTML = '';
//     }

//     mapDataToTable(demotableContent, tableBody);
    
// }


// fetch writescontract table
// async function fetchAndDisplayContract() {
//     const tableElement = document.getElementById('writescontracttable');
//     const tableBody = tableElement.querySelector('tbody');

//     const response = await fetch('/write-table', {
//         method: 'GET'
//     });

//     const responseData = await response.json();
//     const contractContent = responseData.data;

//     // Always clear old, already fetched data before new fetching process.
//     if (tableBody) {
//         tableBody.innerHTML = '';
//     }

//     mapDataToTable(contractContent, tableBody);
    
// }

// async function deleteFromTable(event) {
//     event.preventDefault();

//     const deleteKeyValue = document.querySelector('select[name="deleteKey"]').value;
//     const valValue = document.getElementById('deleteValue').value;

//     const response = await fetch("/deletetable", {
//         method: 'DELETE',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             key: deleteKeyValue,
//             value: valValue
//         })
//     });
//     const responseData = await response.json();
//     const messageElement = document.getElementById('deleteResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "Data deleted successfully!";
//     } else {
//         messageElement.textContent = "Delete was unsuccessful!";
//     }
// }

// async function projectTable(event) {
//     event.preventDefault();

//     const projectKeys = Array.from( document.querySelectorAll('input[name="projectTable"]:checked'))
//         .map(checkbox => checkbox.value);

//     try {
//         console.log("project keys", projectKeys);
//         if (projectKeys.length === 0) {
//             throw new Error;
//         }

//         const response = await fetch("/projecttable", {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 key: projectKeys,
                
//             })
//         });
//         const responseData = await response.json();
//         console.log("responseData project", responseData);
//         const messageElement = document.getElementById('projectResultMessage');


//         if (responseData) {
//             messageElement.textContent = "Choices processed succesfully!";
//             displayProjectTable(projectKeys, responseData.data);
//         } else {
//             messageElement.textContent = "Error in processing choices!";
//         }
//         } catch (err) {
//             console.error("Error occurred:" + err);
//             messageElement = document.getElementById('projectResultMessage');
//             messageElement.textContent = `Error! Please select at least one column`
//         }  
// }

// async function fetchDropDownTable() {
//         const contractData = await fetch("/contractdata", {
//             method: 'GET'
//         });
    
//         const contractDataObject = await contractData.json();
//         console.log("contract", contractDataObject.data);
//         const contractDataArray = contractDataObject.data;

//         createDropDownValues(contractDataArray);
// }

// async function joinTable(event) {
//     event.preventDefault();

//     const whereValue = document.querySelector('select[name="whereValue"]').value;
//     console.log("where value", whereValue);
//     try {

//         const response = await fetch("/jointable", {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 whereValue: whereValue
//             })
//         });
//         console.log("r", response);
//         const responseData = await response.json();
//         const messageElement = document.getElementById('joinResultMsg');
    
//         console.log("resp data join", responseData);
//         if (responseData) {
//             messageElement.textContent = "Success!";
//             const tableElement = document.getElementById('jointabletable');
//             const tableBody = tableElement.querySelector('tbody');
        
//             const demotableContent = responseData.data;
        
//             // Always clear old, already fetched data before new fetching process.
//             if (tableBody) {
//                 tableBody.innerHTML = '';
//             }
        
//             mapDataToTable(demotableContent, tableBody);
            
//         } else {
//             messageElement.textContent = "Error processing data!";
//         }
//     } catch (err) {
//             console.error("Error occurred:", err);
//             const messageElement = document.getElementById('joinResultMsg');
//             messageElement.textContent = `Error Processing data: ${err.message}`;
        
//     }
    
// }


// // Inserts new records into the artist table
// async function insertDemotable(event) {
//     event.preventDefault();

//     const legalNameValue = document.getElementById('legalName').value;
//     const dateOfBirthValue = document.getElementById('dateOfBirth').value;
//     const stageNameValue = document.getElementById('stageName').value;
    
//     const response = await fetch('/insert-demotable', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             legalName: legalNameValue,
//             dateOfBirth: dateOfBirthValue,
//             stageName: stageNameValue
            
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('insertArtistMsg');

//     if (responseData.success) {
//         messageElement.textContent = "Data inserted successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error inserting data! " + responseData.message;
//     }
// }

// async function insertRecordLabel(event) {
//     event.preventDefault();

//     const labelName = document.getElementById('labelName').value;
//     const yearEstablished = document.getElementById('yearEstablished').value;
    
//     const response = await fetch('/insert-recordlabel', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },



// async function insertWritesContract(event) {
//     event.preventDefault();
//     const type = document.getElementById('type').value;
//     const compensation = document.getElementById('compensation').value;
//     const contractID = document.getElementById('contractID').value;
//     const stageName = document.getElementById('stageName-w').value;
//     const labelName = document.getElementById('labelName-w').value;
//     const startDate = document.getElementById('startDate').value;
//     const endDate = document.getElementById('endDate').value;
    
//     const response = await fetch('/insert-writescontract', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             type: type,
//             compensation: compensation,
//             contractID: contractID,
//             stageName: stageName,
//             labelName: labelName,
//             startDate: startDate,
//             endDate: endDate
        
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('insertWritesMsg');
//     console.log("resp", responseData);

//     if (responseData.success) {
//         messageElement.textContent = "Data inserted successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error inserting data! " + responseData.message;
//     }
// }

// // Updates values in the writes contract table.
// async function updateWritesContract(event) {
//     event.preventDefault();

//     const keyValue = document.querySelector('select[name="updateKeys"]').value;
//     const oldValue = document.getElementById('oldValue').value;
//     const newValue = document.getElementById('newValue').value;

    
//     const response = await fetch('/update-writescontract', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             key: keyValue,
//             oldValue: oldValue,
//             newValue: newValue
//         })
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('updateNameResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "Values updated successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error updating values!";
//     }
// }

// async function runGroupBy() {
//     const messageElement = document.getElementById('groupByMsg');
//     const response = await fetch("/group-by", {
//         method: 'GET'
//     });
//     console.log("response", response)

//     const responseData = await response.json();
//     console.log("responseData", responseData);

//     if (responseData.success) {
//         const tableElement = document.getElementById("groupByTable");
//         const tableBody = tableElement.querySelector("tbody");

//         const resultData = responseData.data;

//         if (tableBody) {
//             tableBody.innerHTML = "";
//         }

//         mapDataToTable(resultData, tableBody);
//     } else {
//         alert("Error!");
//     }

// }

// async function runHaving() {
//     const messageElement = document.getElementById('havingMsg');
//     const response = await fetch("/having", {
//         method: 'GET'
//     });

//     const responseData = await response.json();

//     if (responseData.success) {
//         const tableElement = document.getElementById("havingTable");
//         const tableBody = tableElement.querySelector("tbody");

//         const resultData = responseData.data;

//         if (tableBody) {
//             tableBody.innerHTML = "";
//         }

//         mapDataToTable(resultData, tableBody);
//     } else {
//         alert("Error!");
//     }





// }

// async function runNestedGroupBy() {
//     const messageElement = document.getElementById('nestedGroupByMsg');
//     const response = await fetch("/nested-group-by", {
//         method: 'GET'
//     });

//     const responseData = await response.json();

//     if (responseData.success) {
//         const tableElement = document.getElementById("nestedGroupByTable");
//         const tableBody = tableElement.querySelector("tbody");

//         const resultData = responseData.data;

//         if (tableBody) {
//             tableBody.innerHTML = "";
//         }

//         mapDataToTable(resultData, tableBody);
//     } else {
//         alert("Error!");
//     }

// }

// async function runDivision() {
//     const messageElement = document.getElementById('divisionMsg');
//     const response = await fetch("/division", {
//         method: 'GET'
//     });

//     const responseData = await response.json();

//     if (responseData.success) {
//         const tableElement = document.getElementById("divisionTable");
//         const tableBody = tableElement.querySelector("tbody");

//         const resultData = responseData.data;

//         if (tableBody) {
//             tableBody.innerHTML = "";
//         }

//         mapDataToTable(resultData, tableBody);
//     } else {
//         alert("Error!");
//     }

// }
// async function runSelection(event) {
//     event.preventDefault();

//     const conditionBlocks = document.querySelectorAll(".condition");
//     const conditions = [];
//     const messageElement = document.getElementById("selectionResultMsg");
//     messageElement.textContent = ""; // Clear any previous messages

//     try {
//         conditionBlocks.forEach((block, index) => {
//             const column = block.querySelector(".attribute").value;
//             const operator = block.querySelector(".operator").value;
//             const value = block.querySelector(".value").value.trim();
//             const logicalOperator = index < conditionBlocks.length - 1
//                 ? block.querySelector(".logicalOperator").value
//                 : null;

//             if (column && operator && value) {
//                 conditions.push({ column, operator, value, logicalOperator });
//             }


//             if (conditions.length > 1) {
//                 const logicalOperatorCount = conditions.filter(cond => cond.logicalOperator).length;
//                 if (logicalOperatorCount < conditions.length - 1) {
//                     throw new Error("Missing AND/OR!");
//                 }
//             }


//             if (!column || !operator || !value) {
//                 throw new Error("Please fill out all fields!");
//             }
//         });


//         const response = await fetch("/selection", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ attributes: conditions }),
//         });

//         const responseData = await response.json();

//         if (responseData && responseData.data.length > 0) {
//             messageElement.textContent = "Success!";
//             const tableElement = document.getElementById("selectionTable");
//             const tableBody = tableElement.querySelector("tbody");

//             if (tableBody) {
//                 tableBody.innerHTML = "";
//             }

//             mapDataToTable(responseData.data, tableBody);
//         } else {
//             messageElement.textContent = "No results found.";
//         }
//     } catch (err) {
//         console.error("Error occurred:", err);
//         messageElement.textContent = err.message || "An error occurred.";
//     }
// }


// function addCondition() {
//     const form = document.getElementById("selectionForm");
//     const firstCondition = form.querySelector(".condition");
//     const newCondition = firstCondition.cloneNode(true);
//     const inputs = newCondition.querySelectorAll("input, select");
//     inputs.forEach(input => {
//         if (input.type === "text" || input.type === "number" || input.type === "date") {
//             input.value = "";
//         } else if (input.tagName === "SELECT") {
//             input.selectedIndex = 0;
//         }
//     })

//     form.insertBefore(newCondition, document.getElementById("addCondition"));
// }





// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.


window.onload = function() {
    // checkDbConnection();
    
    

};
