const funcionariosURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSSgLoaeGosvybo38c9bI3IDk9DGUXeAR9CtMgVhKOmGb_NX7cznU3flT9TzV4pBzkTOMywY2hF6e9I/pub?output=csv";

const ordenOficinas = [
    "SubDirección",
    "Coordinación Misional",
    "Coordinación Académica",
    "Administración Educativa",
    "Fondo Emprender",
    "Articuladora de planeacion",
    "Competencias laborales",
    "Financiera",
    "Programas especiales",
    "Bienestar al aprendiz",
    "Administración de la granja",
    "Planeación",
    "Tesorería",
    "Comunicación Social",
    "Coordinación de Formación"
];

function normalizarOficina(nombre) {
    const mapeo = {
        "Coordinación Academica": "Coordinación Académica",
        "Competencia laborales": "Competencias laborales"
    };
    return mapeo[nombre] || nombre;
}

async function cargarDatos(url) {
    try {
        let response = await fetch(url);
        let data = await response.text();
        let filas = data.split("\n").map(row => row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));
        let tbody = document.querySelector("#directorio tbody");
        tbody.innerHTML = "";

        let funcionariosMap = new Map();
        let oficinas = {};

        let encabezados = filas[0].map(e => e.trim().toLowerCase());
        let indiceDocumento = encabezados.indexOf("numdocumento");
        let indiceNombres = encabezados.indexOf("nombres");
        let indiceCorreo = encabezados.indexOf("correo");
        let indiceCelular = encabezados.indexOf("celular");
        let indiceOficina = encabezados.indexOf("oficina");
        let indiceFunciones = encabezados.indexOf("funcionalidad");
        let indiceSuperior = encabezados.indexOf("superior_id");

        if (indiceDocumento === -1 || indiceNombres === -1) {
            console.error("Error: No se encontraron las columnas requeridas en el CSV.");
            return;
        }

        // 1. Crear funcionarios en el mapa
        for (let i = 1; i < filas.length; i++) {
            let fila = filas[i].map(e => e.trim());
            if (fila.every(celda => celda === "")) continue;

            let documento = fila[indiceDocumento] || "Sin Documento";
            let oficina = normalizarOficina(fila[indiceOficina] || "Sin Oficina");
            let superior = fila[indiceSuperior] || null;

            let funcionario = {
                numDocumento: documento,
                nombres: fila[indiceNombres] || "Nombre desconocido",
                correo: fila[indiceCorreo] || "Sin correo",
                celular: fila[indiceCelular] || "Sin celular",
                funciones: fila[indiceFunciones] || "Sin funciones",
                subordinados: [],
                oficina: oficina,
                superior: superior
            };

            funcionariosMap.set(documento, funcionario);
        }

        // 2. Anidar subordinados dentro de sus superiores
        funcionariosMap.forEach((funcionario, documento) => {
            if (funcionario.superior && funcionariosMap.has(funcionario.superior)) {
                funcionariosMap.get(funcionario.superior).subordinados.push(funcionario);
            } else {
                let oficina = funcionario.oficina;
                if (!oficinas[oficina]) {
                    oficinas[oficina] = [];
                }
                oficinas[oficina].push(funcionario);
            }
        });

        // 3. Ordenar oficinas según la lista establecida
        let oficinasOrdenadas = Object.keys(oficinas).sort((a, b) => {
            let indexA = ordenOficinas.indexOf(a);
            let indexB = ordenOficinas.indexOf(b);
            return (indexA !== -1 ? indexA : 999) - (indexB !== -1 ? indexB : 999);
        });

        // 4. Renderizar la vista correctamente
        oficinasOrdenadas.forEach(oficina => {
            let trOficina = document.createElement("tr");
            let tdOficina = document.createElement("td");
            tdOficina.colSpan = 4;
            tdOficina.style.fontWeight = "bold";
            tdOficina.style.backgroundColor = "#f0f0f0";
            tdOficina.textContent = oficina;
            trOficina.appendChild(tdOficina);
            tbody.appendChild(trOficina);

            function renderizarFuncionario(funcionario, nivel = 0) {
                let trPersona = document.createElement("tr");

                let tdNombre = document.createElement("td");
                tdNombre.textContent = "➤ ".repeat(nivel) + funcionario.nombres;
                trPersona.appendChild(tdNombre);

                let tdCorreo = document.createElement("td");
                tdCorreo.textContent = funcionario.correo;
                trPersona.appendChild(tdCorreo);

                let tdCelular = document.createElement("td");
                tdCelular.textContent = funcionario.celular;
                trPersona.appendChild(tdCelular);

                let tdFunciones = document.createElement("td");
                tdFunciones.textContent = funcionario.funciones;
                trPersona.appendChild(tdFunciones);

                tbody.appendChild(trPersona);

                funcionario.subordinados.forEach(sub => renderizarFuncionario(sub, nivel + 1));
            }

            oficinas[oficina].forEach(funcionario => renderizarFuncionario(funcionario));
        });

    } catch (error) {
        console.error("Error al cargar datos:", error);
    }

    document.getElementById("directorio-container").style.display = "block";
    document.getElementById("search-container").style.display = "block";
}

document.getElementById("btn-ver-funcionarios").addEventListener("click", () => {
    cargarDatos(funcionariosURL);
});
