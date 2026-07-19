const pricing = await fetch("pricing.json").then(r => r.json());

const form = document.querySelector("#calculator");
const departmentSelect = document.querySelector("#department");
const result = document.querySelector("#result");

for (const department of Object.keys(pricing.departments)) {
    const option = document.createElement("option");
    option.value = department;
    option.textContent = department;
    departmentSelect.append(option);
}

form.addEventListener("submit", e => {

    e.preventDefault();

    const department = departmentSelect.value;
    const bottles = Number(document.querySelector("#bottles").value);

    const index = pricing.steps.findIndex(step => bottles <= step);

    if (index === -1) {
        result.hidden = false;
        result.textContent = "Nombre de bouteilles non supporté";
        return;
    }

    const price = pricing.departments[department][index];

    result.hidden = false;
    result.textContent = `${price.toFixed(2)} €`;
});