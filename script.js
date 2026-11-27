console.log("BOY PIT WALL - SCRIPT GELADEN");

const teamColors = {
    "Red Bull Racing": "#3671C6",
    "McLaren": "#FF8000",
    "Ferrari": "#E80020",
    "Mercedes": "#27F4D2",
    "Aston Martin": "#229971",
    "Williams": "#64C4FF",
    "Alpine": "#0093CC",
    "Haas F1 Team": "#B6BABD",
    "Kick Sauber": "#52E252",
    "Racing Bulls": "#6692FF"
};

async function loadSession() {

    const response = await fetch(
        "https://api.openf1.org/v1/sessions?session_key=latest"
    );

    const data = await response.json();

    console.log("Session:", data);

    if (!data || data.length === 0) {
        return;
    }

    const session = data[0];

    const sessionName = document.getElementById("sessionName");
    const circuitName = document.getElementById("circuitName");
    const countryName = document.getElementById("countryName");
    const eventName = document.getElementById("eventName");
    const sessionTitle = document.getElementById("sessionTitle");

    if (sessionName) {
        sessionName.textContent =
            session.session_name || "-";
    }

    if (circuitName) {
        circuitName.textContent =
            session.circuit_short_name || "-";
    }

    if (countryName) {
        countryName.textContent =
            session.country_name || "-";
    }

    if (eventName) {
        eventName.textContent =
            session.meeting_name || "Formula 1";
    }

    if (sessionTitle) {
        sessionTitle.textContent =
            session.session_name || "-";
    }
}

async function loadLatestPositions() {

    const response = await fetch(
        "https://api.openf1.org/v1/position?session_key=latest"
    );

    const positions = await response.json();

    console.log("Positions:", positions.length);

    const latestPositions = {};

    positions.forEach(position => {

        const driverNumber =
            position.driver_number;

        if (
            !latestPositions[driverNumber] ||
            new Date(position.date) >
            new Date(
                latestPositions[driverNumber].date
            )
        ) {
            latestPositions[driverNumber] =
                position;
        }

    });

    return latestPositions;
}

async function loadDrivers() {

    const response = await fetch(
        "https://api.openf1.org/v1/drivers?session_key=latest"
    );

    const drivers = await response.json();

    console.log("Drivers:", drivers.length);

    const positions =
        await loadLatestPositions();

    const leaderboard = drivers.map(driver => {

        const positionData =
            positions[
            driver.driver_number
            ];

        return {

            ...driver,

            position:
                positionData
                    ? positionData.position
                    : 99

        };

    });

    leaderboard.sort((a, b) =>
        a.position - b.position
    );

    const driverList =
        document.getElementById(
            "driverList"
        );

    if (!driverList) {
        console.error(
            "driverList niet gevonden"
        );
        return;
    }

    driverList.innerHTML = "";

    leaderboard.forEach(driver => {

        const row =
            document.createElement("div");

        row.className = "driver";

        const color =
            teamColors[
                driver.team_name
            ] || "#ffffff";

        row.innerHTML = `
            <div class="position" style="color:${color}">
                P${driver.position}
            </div>

            <div class="driverCode">
                ${driver.name_acronym || driver.full_name}
            </div>

            <div class="lapTime">
                -
            </div>

            <div class="team" style="color:${color}">
                ${driver.team_name}
            </div>
        `;

        driverList.appendChild(row);

    });

}

async function loadDashboard() {

    try {

        const raceStatus =
            document.getElementById(
                "raceStatus"
            );

        if (raceStatus) {
            raceStatus.textContent =
                "🟢 LIVE";
        }

        await loadSession();

        await loadDrivers();

        const lastUpdate =
            document.getElementById(
                "lastUpdate"
            );

        if (lastUpdate) {
            lastUpdate.textContent =
                new Date().toLocaleTimeString(
                    "nl-NL"
                );
        }

    }
    catch (error) {

        console.error(error);

        const raceStatus =
            document.getElementById(
                "raceStatus"
            );

        if (raceStatus) {
            raceStatus.textContent =
                "🔴 OFFLINE";
        }

    }

}

loadDashboard();

setInterval(() => {

    loadDashboard();

}, 10000);
