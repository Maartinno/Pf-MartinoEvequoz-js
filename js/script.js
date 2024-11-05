let carrito = [];

// Función para cargar el archivo productos.json y mostrarlo en el DOM
function cargarProductos() {
    fetch("productos.json") // Asegúrate de que la ruta sea correcta
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo JSON");
            }
            return response.json();
        })
        .then(data => {
            mostrarProductos(data); // Llama a la función para mostrar los productos en el DOM
        })
        .catch(error => console.error("Error al cargar los productos:", error));
}

window.onload = cargarProductos;

// Función para renderizar los productos en el DOM
function mostrarProductos(productos) {
    const container = document.querySelector('.container');
    container.innerHTML = ''; // Limpiar contenido previo

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h2>${producto.nombre}</h2>
            <p>Precio: $${producto.precio}</p>
            <button onclick="abrirModal('${producto.nombre}', ${producto.precio}, '${producto.imagen}')">Comprar</button>
        `;
        container.appendChild(card);
    });
}


function abrirModal(nombre, precio, imagen) {
    document.getElementById("modalProducto").style.display = "block";
    document.getElementById("modalNombre").innerText = nombre;
    document.getElementById("modalPrecio").innerText = `Precio: $${precio}`;
    document.getElementById("modalImagen").src = imagen;
    document.getElementById("modalCantidad").value = "";
    document.getElementById("modalCantidad").setAttribute("data-nombre", nombre);
    document.getElementById("modalCantidad").setAttribute("data-precio", precio);
    
    // Asegurarse de que los elementos "Cantidad" y "Agregar al Carrito" estén visibles
    document.getElementById("modalCantidad").style.display = "block";
    document.getElementById("agregarAlCarritoDesdeModal").style.display = "block";
    
    // Eliminar el mensaje "Agregado" si existe
    const agregadoMsg = document.getElementById("agregadoMsg");
    if (agregadoMsg) {
        agregadoMsg.remove();
    }
}

// Función para cerrar el modal del producto
function cerrarModal() {
    document.getElementById("modalProducto").style.display = "none";
    
    // Restaurar el botón y el campo de cantidad
    document.getElementById("modalCantidad").style.display = "block";
    document.getElementById("agregarAlCarritoDesdeModal").style.display = "block";
    
    // Eliminar el mensaje "Agregado" si existe
    const agregadoMsg = document.getElementById("agregadoMsg");
    if (agregadoMsg) {
        agregadoMsg.remove();
    }
}


function agregarAlCarritoDesdeModal() {
    const nombre = document.getElementById("modalCantidad").getAttribute("data-nombre");
    const precio = parseFloat(document.getElementById("modalCantidad").getAttribute("data-precio"));
    const cantidad = parseInt(document.getElementById("modalCantidad").value);

    if (isNaN(cantidad) || cantidad <= 0) {
        Swal.fire({
            title: 'Cantidad inválida',
            text: 'Por favor, ingresa una cantidad válida.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Verifica si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.producto === nombre);
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
        productoExistente.precio += precio * cantidad;
    } else {
        carrito.push({ producto: nombre, precio: precio * cantidad, cantidad: cantidad });
    }

    guardarCarrito();
    renderizarCarrito();

    Swal.fire({
        title: 'Producto agregado',
        text: `Has agregado ${cantidad} unidad(es) de ${nombre} al carrito.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });

    cerrarModal();
}




// Función para abrir el modal del carrito
function abrirCarrito() {
    document.getElementById("modalCarrito").style.display = "block";
    renderizarCarrito();
}

// Función para cerrar el modal del carrito
function cerrarCarrito() {
    document.getElementById("modalCarrito").style.display = "none";
}

// Función para renderizar el carrito en el modal
function renderizarCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");
    listaCarrito.innerHTML = ""; // Limpiar el carrito
    
    carrito.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${item.producto} - Cantidad: ${item.cantidad}, Subtotal: $${item.precio} 
            <button onclick="eliminarProducto(${index})">Eliminar</button>`;
        listaCarrito.appendChild(li);
    });

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    document.getElementById("total").innerText = `Total: $${total}`;
}

// Función para eliminar un producto específico del carrito
function eliminarProducto(index) {
    carrito.splice(index, 1); // Eliminar producto en el índice dado
    guardarCarrito();
    renderizarCarrito();
}

function vaciarCarrito() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción vaciará todo el carrito.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
            Swal.fire(
                'Carrito vaciado',
                'El carrito ha sido vaciado correctamente.',
                'success'
            );
        }
    });
}


function pagar() {
    if (carrito.length === 0) {
        Swal.fire({
            title: 'Carrito vacío',
            text: 'El carrito está vacío. Agrega productos antes de pagar.',
            icon: 'info',
            confirmButtonText: 'Aceptar'
        });
    } else {
        Swal.fire({
            title: 'Gracias por tu compra!',
            text: `Total pagado: $${carrito.reduce((sum, item) => sum + item.precio, 0)}`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            // Vacía el carrito después de mostrar el mensaje de compra exitosa
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
        });
    }
}



// Función para guardar el carrito en localStorage
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function mostrarProductosCaros() {
    const productosCaros = productos.filter(producto => producto.precio > 50);
    mostrarProductos(productosCaros); // Muestra solo los productos filtrados
}
function aplicarDescuento() {
    const productosConDescuento = productos.map(producto => ({
        ...producto,
        precio: (producto.precio * 0.9).toFixed(2) // Aplica un descuento del 10% y redondea a 2 decimales
    }));
    mostrarProductos(productosConDescuento); // Muestra los productos con descuento
}

// Función para cargar el archivo productos.json y mostrarlo en el DOM
function cargarProductos() {
    fetch("productos.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo JSON");
            }
            return response.json();
        })
        .then(data => {
            productos = data; // Guarda los productos en la variable global
            mostrarProductos(productos); // Muestra todos los productos por defecto
        })
        .catch(error => console.error("Error al cargar los productos:", error));
}

window.onload = cargarProductos;

// Función para renderizar los productos en el DOM
function mostrarProductos(productos) {
    const container = document.querySelector('.container');
    container.innerHTML = ''; // Limpiar contenido previo

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h2>${producto.nombre}</h2>
            <p>Precio: $${producto.precio}</p>
            <button onclick="abrirModal('${producto.nombre}', ${producto.precio}, '${producto.imagen}')">Comprar</button>
        `;
        container.appendChild(card);
    });
}

// Funciones de filtro y mapeo

function mostrarProductosCaros() {
    const productosCaros = productos.filter(producto => producto.precio > 50);
    mostrarProductos(productosCaros);
}

function mostrarProductosEconomicos() {
    const productosEconomicos = productos.filter(producto => producto.precio <= 50);
    mostrarProductos(productosEconomicos);
}

function aplicarDescuento() {
    const productosConDescuento = productos.map(producto => ({
        ...producto,
        precio: (producto.precio * 0.9).toFixed(2) // Aplica un descuento del 10% y redondea a 2 decimales
    }));
    mostrarProductos(productosConDescuento);
}




window.onload = function() {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    cargarProductos(); // Cargar los productos desde JSON
    renderizarCarrito();
};
