const pricing = await fetch("pricing.json").then(r => r.json());

const form = document.querySelector("#calculator");
const departmentSelect = document.querySelector("#department");
const result = document.querySelector("#result");

const fuelMultiplierInput = document.querySelector("#fuelMultiplier");
fuelMultiplierInput.value = pricing.fuelMultiplier;

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

    const fuelMultiplier = Number(fuelMultiplierInput.value);

    const price = calculatePrice(department, bottles, fuelMultiplier);

    result.hidden = false;

    result.innerHTML = price
        .map(item => `
            <div>
                ${item.method} : <strong>${item.price.toFixed(2)} €</strong>
            </div>
        `)
        .join("");
});

function calculateParcelPrice(department, bottles) {
    const index = pricing.steps.findIndex(step => bottles <= step);

    if (index === -1) {
        throw new Error("Nombre de bouteilles non supporté");
    }

    return pricing.departments[department][index];
}

function calculatePrice(department, bottles, fuelMultiplier) {
    if (bottles <= 78) {
        return [
            {
                method: "parcel",
                price: calculateParcelPrice(department, bottles) * fuelMultiplier,
            }
        ];
    }

    const weightPrice = calculateWeightPrice(department, bottles);
    const palletPrice = calculatePalletPrice(department, bottles);

    return [
        {
            method: "weight",
            price: weightPrice * fuelMultiplier,
        },
        {
            method: "pallet",
            price: palletPrice,
        }
    ];
}

function calculateWeightPrice(department, bottles) {
    const weight = bottles * 1.240;

    if (weight < 100) {
        return null;
    }

    if (weight <= 250) {
        return pricing.weight.price100to250[department] * (weight / 100);
    }

    return pricing.weight.priceOver250[department] * (weight / 250);
}

function calculatePalletPrice(department, bottles) {
    const pallets = Math.ceil(bottles / 600);

    if (pallets === 1) {
        return pricing.pallet.one[department];
    }

    if (pallets === 2) {
        return pricing.pallet.two[department];
    }

    return null;
}