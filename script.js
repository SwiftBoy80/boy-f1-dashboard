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

    const session = data[0];

    document.getElementById("sessionName").textContent =
        session.session_name;

    document.getElementById("circuitName").textContent =
        session.circuit_short_name;

    document.getElementById("country").textContent =
        session.country_name;
}

async function loadDrivers() {

    const response = await fetch(
        "https://api.openf1.org/v1/drivers?session_key=latest"
    );

    const drivers = await response.json();

    const list = document.getElementById("driverList");

    list.innerHTML = "";

    drivers
        .sort((a, b) => a.driver_number - b.driver_number)
        .forEach(driver => {

            const row = document.createElement("div");

            row.className = "driver";

            const color =
                teamColors[driver.team_name] || "#ffffff";

            row.innerHTML = `
                <span
                    class="number"
                    style="color:${color}">
                    ${driver.driver_number}
                </span>

                <span>
                    ${driver.full_name}
                </span>

                <span
                    class="team"
                    style="color:${color}">
                    ${driver.team_name}
                </span>
            `;

            list.appendChild(row);

        });
}

async function loadDashboard() {

    try {

        document.getElementById("raceStatus")
            .textContent = "✅ Verbonden";

        await loadSession();
        await loadDrivers();

    } catch (error) {

        console.error(error);

        document.getElementById("raceStatus")
            .textContent = "❌ API fout";
    }
}

loadDashboard();

setInterval(() => {
    loadDashboard();
}, 30000);
