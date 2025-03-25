const hojas = {
    "Titulada": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD7uj2HJ5ecqX1xVn0j64ro-5SmfedFnmDFwv-BNsduQbnl_BSNQO8vyN0x5ul50JqeFaHd41FFNra/pub?gid=0&single=true&output=csv",
    "Bilinguismo": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD7uj2HJ5ecqX1xVn0j64ro-5SmfedFnmDFwv-BNsduQbnl_BSNQO8vyN0x5ul50JqeFaHd41FFNra/pub?gid=556001138&single=true&output=csv",
    "FIC": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD7uj2HJ5ecqX1xVn0j64ro-5SmfedFnmDFwv-BNsduQbnl_BSNQO8vyN0x5ul50JqeFaHd41FFNra/pub?gid=1375335995&single=true&output=csv",
    "Costa Pacifica": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD7uj2HJ5ecqX1xVn0j64ro-5SmfedFnmDFwv-BNsduQbnl_BSNQO8vyN0x5ul50JqeFaHd41FFNra/pub?gid=786344481&single=true&output=csv",
    "Titulada Campesena": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD7uj2HJ5ecqX1xVn0j64ro-5SmfedFnmDFwv-BNsduQbnl_BSNQO8vyN0x5ul50JqeFaHd41FFNra/pub?gid=1137034311&single=true&output=csv",
    "Economia Popular": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD7uj2HJ5ecqX1xVn0j64ro-5SmfedFnmDFwv-BNsduQbnl_BSNQO8vyN0x5ul50JqeFaHd41FFNra/pub?gid=2126129033&single=true&output=csv"
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
            
            let encabezados = filas[0].map(h => h.trim());
            let colIndices = {
                nombre: encabezados.indexOf("NOMBRE COMPLETO CONTRATISTA"),
                celular: encabezados.indexOf("CELULAR"),
                correo: encabezados.indexOf("CORREO ELECTRONICO"),
                perfil: encabezados.indexOf("PERFIL CONTRATISTA"),
                equipo: encabezados.indexOf("EQUIPO  EJECUTOR"),
                supervisor: encabezados.indexOf("SUPERVISOR")
            };
            
            let equipos = {};
            
            for (let i = 1; i < filas.length; i++) {
                let fila = filas[i];
                if (fila.length < Object.keys(colIndices).length) continue;
                
                let instructor = {
                    nombre: fila[colIndices.nombre].trim(),
                    celular: fila[colIndices.celular].trim(),
                    correo: fila[colIndices.correo].trim(),
                    perfil: fila[colIndices.perfil].trim(),
                    supervisor: fila[colIndices.supervisor].trim()
                };
                
                let equipo = fila[colIndices.equipo].trim() || "Sin Equipo";
                if (!equipos[equipo]) equipos[equipo] = [];
                equipos[equipo].push(instructor);
            }
            
            for (let equipo in equipos) {
                let trEquipo = document.createElement("tr");
                let tdEquipo = document.createElement("td");
                tdEquipo.colSpan = 4;
                tdEquipo.style.fontWeight = "bold";
                tdEquipo.style.backgroundColor = "#f0f0f0";
                tdEquipo.textContent = equipo;
                trEquipo.appendChild(tdEquipo);
                tbody.appendChild(trEquipo);
                
                let dinamizadores = equipos[equipo].filter(i => i.perfil.toLowerCase().includes("dinamizad"));
                let resto = equipos[equipo].filter(i => !i.perfil.toLowerCase().includes("dinamizad"));
                
                let ordenados = [...dinamizadores, ...resto];
                
                ordenados.forEach(instr => {
                    let tr = document.createElement("tr");
                    ["nombre", "celular", "correo", "supervisor"].forEach(campo => {
                        let td = document.createElement("td");
                        td.textContent = instr[campo];
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
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
        let columnas = fila.getElementsByTagName("td");

        if (columnas.length === 1) {
            // Es un encabezado de equipo (nombre del equipo en una sola celda con colspan)
            let equipo = columnas[0].textContent.toLowerCase();
            fila.dataset.equipo = equipo; // Guardamos el nombre del equipo en un atributo de la fila
            fila.style.display = input && equipo.includes(input) ? "" : "none";
            return;
        }

        let nombre = columnas[0].textContent.toLowerCase();
        let supervisor = columnas[3].textContent.toLowerCase();
        let equipoEjecutor = fila.previousElementSibling?.dataset.equipo || "";

        if (nombre.includes(input) || supervisor.includes(input) || equipoEjecutor.includes(input)) {
            fila.style.display = "";
            if (fila.previousElementSibling?.dataset.equipo) {
                fila.previousElementSibling.style.display = ""; // Asegurar que el título del equipo se muestre si tiene resultados
            }
        } else {
            fila.style.display = "none";
        }
    });
}

document.getElementById("btn-ver-instructores").addEventListener("click", function () {
    document.getElementById("directorio-container").style.display = "block";
    document.getElementById("search-container").style.display = "block"; // MOSTRAR LA BARRA DE BÚSQUEDA
    cargarInstructores();
});
