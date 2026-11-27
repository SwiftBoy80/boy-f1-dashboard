async function loadDrivers() {

    const url =
      "https://api.openf1.org/v1/drivers?session_key=latest";

    const response = await fetch(url);
    const drivers = await response.json();

    const container =
      document.getElementById("driverList");

    container.innerHTML = "";

    drivers.forEach(driver => {

        const row =
          document.createElement("div");

        row.className = "driver";

        row.innerHTML = `
            <span>${driver.driver_number}</span>
            <span>${driver.full_name}</span>
        `;

        container.appendChild(row);

    });

}

loadDrivers();
