async function runGroupBy() {
    const messageElement = document.getElementById('groupByMsg');
    const response = await fetch("/group-by", {
        method: 'GET'
    });
    console.log("response", response)

    const responseData = await response.json();
    console.log("responseData", responseData);

    if (responseData.success) {
        const tableElement = document.getElementById("groupByTable");
        const tableBody = tableElement.querySelector("tbody");

        const resultData = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = "";
        }

        mapDataToTable(resultData, tableBody);
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
        const tableElement = document.getElementById("havingTable");
        const tableBody = tableElement.querySelector("tbody");

        const resultData = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = "";
        }

        mapDataToTable(resultData, tableBody);
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
        const tableElement = document.getElementById("nestedGroupByTable");
        const tableBody = tableElement.querySelector("tbody");

        const resultData = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = "";
        }

        mapDataToTable(resultData, tableBody);
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
        const tableElement = document.getElementById("divisionTable");
        const tableBody = tableElement.querySelector("tbody");

        const resultData = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = "";
        }

        mapDataToTable(resultData, tableBody);
    } else {
        alert("Error!");
    }

}
async function runSelection(event) {
    event.preventDefault();

    const conditionBlocks = document.querySelectorAll(".condition");
    const conditions = [];
    const messageElement = document.getElementById("selectionResultMsg");
    messageElement.textContent = ""; // Clear any previous messages

    try {
        conditionBlocks.forEach((block, index) => {
            const column = block.querySelector(".attribute").value;
            const operator = block.querySelector(".operator").value;
            const value = block.querySelector(".value").value.trim();
            const logicalOperator = index < conditionBlocks.length - 1
                ? block.querySelector(".logicalOperator").value
                : null;

            if (column && operator && value) {
                conditions.push({ column, operator, value, logicalOperator });
            }


            if (conditions.length > 1) {
                const logicalOperatorCount = conditions.filter(cond => cond.logicalOperator).length;
                if (logicalOperatorCount < conditions.length - 1) {
                    throw new Error("Missing AND/OR!");
                }
            }


            if (!column || !operator || !value) {
                throw new Error("Please fill out all fields!");
            }
        });


        const response = await fetch("/selection", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ attributes: conditions }),
        });

        const responseData = await response.json();

        if (responseData && responseData.data.length > 0) {
            messageElement.textContent = "Success!";
            const tableElement = document.getElementById("selectionTable");
            const tableBody = tableElement.querySelector("tbody");

            if (tableBody) {
                tableBody.innerHTML = "";
            }

            mapDataToTable(responseData.data, tableBody);
        } else {
            messageElement.textContent = "No results found.";
        }
    } catch (err) {
        console.error("Error occurred:", err);
        messageElement.textContent = err.message || "An error occurred.";
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



window.onload = function() {
    document.getElementById("runGroupBy").addEventListener("click", runGroupBy);
    document.getElementById("runHaving").addEventListener("click", runHaving);
    document.getElementById("runNestedGroupBy").addEventListener("click", runNestedGroupBy);
    document.getElementById("runDivision").addEventListener("click", runDivision);
    document.getElementById("submitQuery").addEventListener("click", runSelection);
    document.getElementById("addCondition").addEventListener("click", addCondition);


};