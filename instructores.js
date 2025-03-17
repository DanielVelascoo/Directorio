const hojas = {
    "Titulada Regular": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnivU_IkKLMxdj3IHvI0VGtMYCHJ0VyTua3zUm4K8a5VGowBcxJMcnZxYUnZHu9f6USuPpEC60-18O/pub?gid=0&single=true&output=csv",
    "Titulada Campesena": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnivU_IkKLMxdj3IHvI0VGtMYCHJ0VyTua3zUm4K8a5VGowBcxJMcnZxYUnZHu9f6USuPpEC60-18O/pub?gid=1652013493&single=true&output=csv",
    "FIC": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnivU_IkKLMxdj3IHvI0VGtMYCHJ0VyTua3zUm4K8a5VGowBcxJMcnZxYUnZHu9f6USuPpEC60-18O/pub?gid=1766232422&single=true&output=csv",
    "Economía Popular": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnivU_IkKLMxdj3IHvI0VGtMYCHJ0VyTua3zUm4K8a5VGowBcxJMcnZxYUnZHu9f6USuPpEC60-18O/pub?gid=501471652&single=true&output=csv",
    "CampeSer": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnivU_IkKLMxdj3IHvI0VGtMYCHJ0VyTua3zUm4K8a5VGowBcxJMcnZxYUnZHu9f6USuPpEC60-18O/pub?gid=132110007&single=true&output=csv",
    "Articulación": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnivU_IkKLMxdj3IHvI0VGtMYCHJ0VyTua3zUm4K8a5VGowBcxJMcnZxYUnZHu9f6USuPpEC60-18O/pub?gid=807927033&single=true&output=csv",
    "Víctimas": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnivU_IkKLMxdj3IHvI0VGtMYCHJ0VyTua3zUm4K8a5VGowBcxJMcnZxYUnZHu9f6USuPpEC60-18O/pub?gid=1612446204&single=true&output=csv"
};

async function cargarInstructores() {
    let tbody = document.querySelector("#directorio tbody");
    tbody.innerHTML = "";

    for (let [nombreHoja, url] of Object.entries(hojas)) {
        try {
            let response = await fetch(url);
            let data = await response.text();
            let filas = data.split("\n").map(row => row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));

            if (filas.length <= 1) continue;

            // Insertar título de la hoja
            let trTitulo = document.createElement("tr");
            let tdTitulo = document.createElement("td");
            tdTitulo.colSpan = 5;
            tdTitulo.style.fontWeight = "bold";
            tdTitulo.style.backgroundColor = "#f0f0f0";
            tdTitulo.textContent = nombreHoja;
            trTitulo.appendChild(tdTitulo);
            tbody.appendChild(trTitulo);

            // Insertar datos de instructores
            for (let i = 1; i < filas.length; i++) {
                let fila = filas[i];
                if (fila.length < 5) continue;

                let tr = document.createElement("tr");
                fila.slice(0, 5).forEach(texto => {
                    let td = document.createElement("td");
                    td.textContent = texto.trim();
                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            }
        } catch (error) {
            console.error(`Error al cargar datos de ${nombreHoja}:`, error);
        }
    }
}

function filtrarDirectorio() {
    let input = document.getElementById("search").value.toLowerCase();
    let filas = document.querySelectorAll("#directorio tbody tr");

    filas.forEach(fila => {
        let textoFila = fila.innerText.toLowerCase();
        fila.style.display = textoFila.includes(input) ? "" : "none";
    });
}

document.getElementById("btn-ver-instructores").addEventListener("click", function () {
    document.getElementById("directorio-container").style.display = "block";
    document.getElementById("search-container").style.display = "flex";
    cargarDatos(instructoresURL);
});
cargarInstructores();
