console.log("BOY PIT WALL v2 GELADEN");

let currentSessionType = "";

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
    "Sauber": "#52E252",
    "Audi": "#BB0000",
    "Cadillac": "#0047AB",
    "Racing Bulls": "#6692FF"
};

function getSessionCode(sessionName) {

    if (!sessionName) {
        return "-";
    }

    const session =
        sessionName.toLowerCase();

    if (session.includes("practice 1")) return "FP1";
    if (session.includes("practice 2")) return "FP2";
    if (session.includes("practice 3")) return "FP3";

    if (session.includes("sprint qualifying"))
        return "SQ";

    if (session.includes("sprint"))
        return "SPRINT";

    if (session.includes("qualifying"))
        return "QUALI";

    if (session.includes("race"))
        return "RACE";

    return sessionName;
}

async function loadSession() {

    const response = await fetch(
        "https://api.openf1.org/v1/sessions?session_key=latest"
    );

    const data = await response.json();

    console.log("Session:", data);

    if (!data.length) {
        return;
    }

    const session = data[0];

    currentSessionType =
        session.session_name;

    const sessionCode =
        getSessionCode(
            session.session_name
        );

    const sessionName =
        document.getElementById(
            "sessionName"
        );

    const circuitName =
        document.getElementById(
            "circuitName"
        );

    const countryName =
        document.getElementById(
            "countryName"
        );

    const eventName =
        document.getElementById(
            "eventName"
        );

    const sessionTitle =
        document.getElementById(
            "sessionTitle"
        );

    if (sessionName) {
        sessionName.textContent =
            session.session_name;
    }

    if (circuitName) {
        circuitName.textContent =
            session.circuit_short_name;
    }

    if (countryName) {
        countryName.textContent =
            session.country_name;
    }

    if (eventName) {
        eventName.textContent =
            session.meeting_name;
    }

    if (sessionTitle) {
        sessionTitle.textContent =
            sessionCode;
    }
}

async function loadLatestPositions() {

    const response = await fetch(
        "https://api.openf1.org/v1/position?session_key=latest"
    );

    const positions =
        await response.json();

    console.log(
        "Position records:",
        positions.length
    );

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

    const laps =
        await response.json();

    console.log(
        "Lap records:",
        laps.length
    );

    const latestLaps = {};

    laps.forEach(lap => {

        const driverNumber =
            lap.driver_number;

        if (
            !latestLaps[driverNumber]
        ) {
            latestLaps[driverNumber] =
                lap;

            return;
        }

        const currentDate =
            new Date(
                lap.date_start ||
                "1900-01-01"
            );

        const latestDate =
            new Date(
                latestLaps[
                    driverNumber
                ].date_start ||
                "1900-01-01"
            );

        if (currentDate > latestDate) {
            latestLaps[
                driverNumber
            ] = lap;
        }

    });

    return latestLaps;
}

async function loadDrivers() {

    const response = await fetch(
        "https://api.openf1.org/v1/drivers?session_key=latest"
    );

    const drivers =
        await response.json();

    console.log(
        "Drivers:",
        drivers.length
    );

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
                        : driver.driver_number,

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

    const driverList =
        document.getElementById(
            "driverList"
        );

    if (!driverList) {
        return;
    }

    driverList.innerHTML = "";

    leaderboard.forEach(driver => {

        const row =
            document.createElement("div");

        row.className =
            "driver";

        const color =
            teamColors[
                driver.team_name
            ] || "#FFFFFF";

        row.innerHTML = `

            <div
                class="position"
                style="
                    color:${color};
                    font-weight:bold;
                ">
                P${driver.position}
            </div>

            <div
                class="driverCode">
                ${driver.name_acronym}
            </div>

            <div
                class="lapTime">
                ${driver.lapTime}
            </div>

            <div
                class="team"
                style="
                    color:${color};
                    font-weight:bold;
                ">
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

}, 30000);
