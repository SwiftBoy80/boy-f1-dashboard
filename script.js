alert("NIEUWE SCRIPT GELADEN");
console.log("SCRIPT VERSION 27-11-2026");
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

    if (!data.length) {
        return;
    }

    const session = data[0];

    const sessionName =
        document.getElementById("sessionName");

    const circuitName =
        document.getElementById("circuitName");

    const countryName =
        document.getElementById("countryName");

    const eventName =
        document.getElementById("eventName");

    const sessionTitle =
        document.getElementById("sessionTitle");

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

async function loadLatestLaps() {

    const response = await fetch(
        "https://api.openf1.org/v1/laps?session_key=latest"
    );

    const laps = await response.json();

    const latestLaps = {};

    laps.forEach(lap => {

        const driverNumber =
            lap.driver_number;

        if (
            !latestLaps[driverNumber] ||
            (
                lap.date_start &&
                latestLaps[driverNumber].date_start &&
                new Date(lap.date_start) >
                new Date(
                    latestLaps[driverNumber].date_start
                )
            )
        ) {
            latestLaps[driverNumber] = lap;
        }

    });

    return latestLaps;
}

async function loadDrivers() {

    const driversResponse = await fetch(
        "https://api.openf1.org/v1/drivers?session_key=latest"
    );

    const drivers =
        await driversResponse.json();

    const positions =
        await loadLatestPositions();

    const laps =
        await loadLatestLaps();

    const leaderboard =
        drivers.map(driver => {

            const positionData =
                positions[
                    driver.driver_number
                ];

            const lapData =
                laps[
                    driver.driver_number
                ];

            return {

                ...driver,

                position:
                    positionData
                        ? positionData.position
                        : 99,

                lapTime:
                    lapData?.lap_duration
                        ? lapData.lap_duration.toFixed(3)
                        : "---"

            };

        });

    leaderboard.sort(
        (a, b) =>
            a.position - b.position
    );

    const list =
        document.getElementById(
            "driverList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    leaderboard.forEach(driver => {

        const row =
            document.createElement("div");

        row.className = "driver";

        const color =
            teamColors[
                driver.team_name
            ] || "#ffffff";

        row.innerHTML = `
            <div
                class="position"
                style="color:${color}">
                P${driver.position}
            </div>

            <div class="driverCode">
                ${driver.name_acronym || driver.full_name}
            </div>

            <div class="lapTime">
                ${driver.lapTime}
            </div>

            <div
                class="team"
                style="color:${color}">
                ${driver.team_name || "-"}
            </div>
        `;

        list.appendChild(row);

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
