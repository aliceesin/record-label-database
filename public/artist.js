
// Inserts new records into the artist table
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
    const messageElement = document.getElementById('insertArtistMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchAndDisplayUsers();
    } else {
        messageElement.textContent = "Error inserting data! " + responseData.message;
    }
}

async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');
    const tableName = 'ArtistSigns1';

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




window.onload = function() {
    document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
    fetchAndDisplayUsers();
};