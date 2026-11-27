async function loadSession() {

    const response = await fetch(
        "https://api.openf1.org/v1/sessions?session_key=latest"
    );

    const data = await response.json();

    const session = data[0];

    document.getElementById("sessionName")
        .textContent = session.session_name;

    document.getElementById("circuitName")
        .textContent = session.circuit_short_name;

    document.getElementById("country")
        .textContent = session.country_name;

}

async function loadDrivers() {

    const response = await fetch(
        "https://api.openf1.org/v1/drivers?session_key=latest"
    );

    const drivers = await response.json();

    const list =
        document.getElementById("driverList");

    list.innerHTML = "";

    drivers
        .sort((a,b) => a.driver_number - b.driver_number)
        .forEach(driver => {

            const row =
                document.createElement("div");

            row.className = "driver";

            row.innerHTML = `
                <span class="number">
                    ${driver.driver_number}
                </span>

                <span>
                    ${driver.full_name}
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

    }

    catch(error) {

        console.error(error);

        document.getElementById("raceStatus")
            .textContent = "❌ API fout";

    }

}

loadDashboard();
