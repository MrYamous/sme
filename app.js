const pricing = await fetch("pricing.json").then(r => r.json());

const form = document.querySelector("#calculator");
const departmentSelect = document.querySelector("#department");
const result = document.querySelector("#result");

const fuelMultiplierInput = document.querySelector("#fuelMultiplier");
fuelMultiplierInput.value = pricing.fuelMultiplier;

const departments = Object.keys(pricing.departments)
    .sort((a, b) => parseFloat(a) - parseFloat(b));

for (const department of departments) {
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

    const options = {
        appointment: document.querySelector("#appointment").checked,
    };

    const price = calculatePrice(department, bottles, fuelMultiplier, options);

    result.hidden = false;

    result.innerHTML = price
        .map(item => `
            <div>
                ${item.label} : <strong>${item.price.toFixed(2)} € HT</strong>
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

function calculatePrice(department, bottles, fuelMultiplier, options) {
    const calculations = bottles <= 78
        ? [{
            label: "Colis",
            method: "parcel",
            price: calculateParcelPrice(department, bottles),
        }]
        : [
            {
                label: "Poids",
                method: "weight",
                price: calculateWeightPrice(department, bottles),
            },
            {
                label: "Palette",
                method: "pallet",
                price: calculatePalletPrice(department, bottles),
            }
        ];

    return calculations.map(calculation => ({
        ...calculation,
        price: applyAdjustments(
            calculation.price,
            calculation.method,
            fuelMultiplier,
            options,
        ),
    }));
}

function calculateWeightPrice(department, bottles) {
    const weight = bottles * 1.250;

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

    throw new Error("Nombre de palettes non supporté");
}

function applyAdjustments(price, method, fuelMultiplier, options) {
    if (method === "parcel" || method === "weight") {
        price *= fuelMultiplier;
    }
    price += calculateAutomaticSurcharges(departmentSelect.value);

    price += calculateOptions(options);

    return price;
}

function calculateOptions(options) {
    let optionsPrice = 0;

    if (options.appointment) {
        optionsPrice += 8.69;
    }

    return optionsPrice;
}

function calculateAutomaticSurcharges(department) {
    if (["75", "77", "78", "91", "92", "93", "94", "95"].includes(department)) {
        return 7.52;
    }

    return 0;
}