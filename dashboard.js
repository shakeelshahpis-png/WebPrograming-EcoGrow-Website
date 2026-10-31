// GreenGrow Dashboard

const userNameElement = document.getElementById("userName");
const welcomeNameElement = document.getElementById("welcomeName");
const logoutButton = document.getElementById("logoutButton");

const growthForm = document.getElementById("growthForm");
const plantNameInput = document.getElementById("plantName");
const plantHeightInput = document.getElementById("plantHeight");
const recordDateInput = document.getElementById("recordDate");

const growthTable = document.getElementById("growthTable");
const emptyMessage = document.getElementById("emptyMessage");
const trackerStatus = document.getElementById("trackerStatus");
const plantCount = document.getElementById("plantCount");

// Check login session
let currentUser = null;

try {
    currentUser = JSON.parse(
        sessionStorage.getItem("greengrowDemoUser") || "null"
    );
} catch (error) {
    currentUser = null;
}

// Redirect to login if user is not logged in
if (!currentUser || !currentUser.email) {
    window.location.replace("login.html");
} else {
    const displayName = currentUser.name || "Farmer";

    userNameElement.textContent = displayName;
    welcomeNameElement.textContent = displayName;
}

// Storage key for each user
function getStorageKey() {
    return "greengrowGrowth_" + currentUser.email;
}

// Load saved plant records
function loadRecords() {
    try {
        const savedData = localStorage.getItem(getStorageKey());
        const records = JSON.parse(savedData || "[]");

        return Array.isArray(records) ? records : [];
    } catch (error) {
        trackerStatus.textContent =
            "Unable to read saved records from this browser.";
        return [];
    }
}

// Save plant records
function saveRecords(records) {
    localStorage.setItem(
        getStorageKey(),
        JSON.stringify(records)
    );
}

// Display records in the table
function renderRecords() {
    const records = loadRecords();

    growthTable.replaceChildren();
    plantCount.textContent = records.length;
    emptyMessage.hidden = records.length > 0;

    records.forEach(function (record) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = record.name;

        const heightCell = document.createElement("td");
        heightCell.textContent = record.height + " cm";

        const dateCell = document.createElement("td");
        dateCell.textContent = record.date;

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            const updatedRecords = loadRecords().filter(
                function (item) {
                    return item.id !== record.id;
                }
            );

            try {
                saveRecords(updatedRecords);
                trackerStatus.textContent =
                    "Growth record deleted successfully!";
                renderRecords();
            } catch (error) {
                trackerStatus.textContent =
                    "Unable to delete the record.";
            }
        });

        actionCell.appendChild(deleteButton);

        row.append(
            nameCell,
            heightCell,
            dateCell,
            actionCell
        );

        growthTable.appendChild(row);
    });
}

// Set today's date
function getLocalDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

const localToday = getLocalDate();

recordDateInput.value = localToday;
recordDateInput.max = localToday;

// Add a new plant growth record
growthForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = plantNameInput.value.trim();
    const height = Number(plantHeightInput.value);
    const date = recordDateInput.value;

    if (
        !name ||
        !date ||
        plantHeightInput.value.trim() === "" ||
        !Number.isFinite(height) ||
        height < 0
    ) {
        trackerStatus.textContent =
            "Please enter a valid plant name, height and date.";
        return;
    }

    if (date > localToday) {
        trackerStatus.textContent =
            "Please select today or an earlier date.";
        return;
    }

    const records = loadRecords();

    const newRecord = {
        id: Date.now().toString() +
            Math.random().toString(16).slice(2),
        name: name,
        height: height,
        date: date
    };

    records.push(newRecord);

    try {
        saveRecords(records);

        trackerStatus.textContent =
            "Plant growth record added successfully!";

        growthForm.reset();
        recordDateInput.value = localToday;

        renderRecords();
    } catch (error) {
        trackerStatus.textContent =
            "Unable to save the record. Please check browser storage.";
    }
});

// Logout
logoutButton.addEventListener("click", function () {
    sessionStorage.removeItem("greengrowDemoUser");
    window.location.href = "login.html";
});

// Show previously saved records
renderRecords();