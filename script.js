const funcionariosURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSSgLoaeGosvybo38c9bI3IDk9DGUXeAR9CtMgVhKOmGb_NX7cznU3flT9TzV4pBzkTOMywY2hF6e9I/pub?output=csv";

const ordenOficinas = [
    "SubDirección",
    "Coordinación Misional",
    "Coordinación Académica",
    "Administración Educativa",
    "Fondo Emprender",
    "Articuladora de planeacion",
    "Competencia laborales",
    "Financiera",
    "Programas especiales",
    "Bienestar al aprendiz",
    "Administración de la granja",
    "Planeación",
    "Tesorería"
];

async function cargarDatos(url) {
    try {
        let response = await fetch(url);
        let data = await response.text();
        let filas = data.split("\n").map(row => row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));

        let tbody = document.querySelector("#directorio tbody");
        tbody.innerHTML = "";

        let oficinas = {};
        let funcionariosMap = new Map();

        // Obtener índices de las columnas
        let encabezados = filas[0].map(e => e.trim().toLowerCase());
        let indiceNombres = encabezados.indexOf("nombres");
        let indiceCorreo = encabezados.indexOf("correo");
        let indiceCelular = encabezados.indexOf("celular");
        let indiceOficina = encabezados.indexOf("oficina");
        let indiceFunciones = encabezados.indexOf("funcionalidad");
        let indiceSuperior = encabezados.indexOf("superior_id");
        let indiceDocumento = encabezados.indexOf("numdocumento");

        for (let i = 1; i < filas.length; i++) {
            let fila = filas[i].map(e => e.trim());
            if (fila.every(celda => celda === "")) continue;
        
            // ✅ Quitar espacios innecesarios en los nombres de oficina
            let oficina = (indiceOficina !== -1) ? fila[indiceOficina].trim() || "Sin Oficina" : "Sin Categoría";
            let documento = fila[indiceDocumento]?.trim() || "Sin Documento";
            let superior = fila[indiceSuperior]?.trim() || null;
        
            let funcionario = {
                numDocumento: documento,
                nombres: fila[indiceNombres]?.trim() || "Nombre desconocido",
                correo: fila[indiceCorreo]?.trim() || "Sin correo",
                celular: fila[indiceCelular]?.trim() || "Sin celular",
                funciones: fila[indiceFunciones]?.trim() || "Sin funciones",
                subordinados: []
            };
        
            funcionariosMap.set(documento, funcionario);
        
            if (!oficinas[oficina]) {
                oficinas[oficina] = [];
            }
        }
        

        // Asignar subordinados a sus superiores
funcionariosMap.forEach((funcionario, documento) => {
    let superior = filas.find(f => f[indiceDocumento] === documento)?.[indiceSuperior];

    if (superior && funcionariosMap.has(superior)) {
        funcionariosMap.get(superior).subordinados.push(funcionario);
    } else {
        let oficina = filas.find(f => f[indiceDocumento] === documento)?.[indiceOficina] || "Sin Oficina";
        
        // ⚠️ Corrección: Asegurar que la oficina existe
        if (!oficina || !oficinas[oficina]) {
            console.warn(`Oficina "${oficina}" no encontrada. Creando nueva entrada.`);
            oficinas[oficina] = [];
        }

        oficinas[oficina].push(funcionario);
    }
});

        // Ordenar oficinas
        let oficinasOrdenadas = Object.keys(oficinas).sort((a, b) => {
            let indexA = ordenOficinas.indexOf(a);
            let indexB = ordenOficinas.indexOf(b);
            return (indexA !== -1 ? indexA : 999) - (indexB !== -1 ? indexB : 999);
        });

        // Renderizar oficinas y funcionarios en el orden jerárquico
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
}

// Evento para cargar funcionarios con jerarquía de oficinas
document.getElementById("btn-ver-funcionarios").addEventListener("click", () => cargarDatos(funcionariosURL));
