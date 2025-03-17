document.getElementById("startBlock").addEventListener("click", function() {
    let minutes = parseInt(document.getElementById("timeInput").value);

    if (!isNaN(minutes) && minutes > 0) {
        chrome.runtime.sendMessage({ command: "startBlocking", minutes: minutes }, (response) => {
            if (response && response.success) {
                alert(`Blocking distractions for ${minutes} minutes!`);
                saveFocusTime(minutes);
            } else {
                alert("Error: Could not start blocking.");
            }
        });
    } else {
        alert("Please enter a valid number of minutes.");
    }
});

document.getElementById("viewStats").addEventListener("click", function() {
    displayStats();
});

function saveFocusTime(minutes) {
    chrome.storage.local.get(["focusStats"], function(data) {
        let stats = data.focusStats || {};
        let today = new Date().toISOString().split("T")[0];

        stats[today] = (stats[today] || 0) + minutes;

        chrome.storage.local.set({ focusStats: stats });
    });
}

function displayStats() {
    chrome.storage.local.get(["focusStats"], function(data) {
        let stats = data.focusStats || {};
        let statsDisplay = document.getElementById("statsDisplay");
        statsDisplay.innerHTML = "<b>Focus Time:</b><br>";

        let totalWeek = 0, totalMonth = 0;
        let today = new Date();
        let oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        let oneMonthAgo = new Date();
        oneMonthAgo.setDate(today.getDate() - 30);

        for (let date in stats) {
            let dateObj = new Date(date);
            let minutes = stats[date];

            if (dateObj >= oneWeekAgo) totalWeek += minutes;
            if (dateObj >= oneMonthAgo) totalMonth += minutes;
        }

        statsDisplay.innerHTML += `🔹 Today: ${stats[today.toISOString().split("T")[0]] || 0} min<br>`;
        statsDisplay.innerHTML += `🔹 This Week: ${totalWeek} min<br>`;
        statsDisplay.innerHTML += `🔹 This Month: ${totalMonth} min`;
    });
    // Function to check if a tab is in incognito mode
function checkIncognito(tab) {
    chrome.windows.get(tab.windowId, (window) => {
        if (window.incognito) {
            console.warn("Incognito mode detected. Extension will not work.");
            alert("Incognito mode is not allowed. Please use a normal window.");
            
            // Close the incognito tab
            chrome.tabs.remove(tab.id);
        }
    });
}

// Listen for new tabs being opened
chrome.windows.getCurrent((window) => {
    if (window.incognito) {
        document.body.innerHTML = "<h2 style='color: red;'>Incognito mode is disabled for this extension.</h2>";
    }
});


}
