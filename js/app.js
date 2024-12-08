let carrito = [];
let productos = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("js/productos.json")
        .then(response => response.json())
        .then(data => {
            productos = data.map(producto => ({
                ...producto,
                stock: Math.floor(Math.random() * 16) + 5 
            }));
            renderizarProductos();
        })
        .catch(error => console.error("Error al cargar los productos:", error));
});

function renderizarProductos() {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";
    productos.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4");
        card.innerHTML = `
            <div class="card h-100">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text fw-bold">Precio: $${producto.precio}</p>
                    <p class="card-text">Stock disponible: <span id="stock-${producto.id}">${producto.stock}</span></p>
                    <button class="btn btn-primary agregar-carrito" data-id="${producto.id}" ${producto.stock === 0 ? "disabled" : ""}>Agregar al Carrito</button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

document.addEventListener("click", e => {
    if (e.target.classList.contains("agregar-carrito")) {
        const productoId = parseInt(e.target.getAttribute("data-id"));
        agregarProductoAlCarrito(productoId);
    } else if (e.target.id === "vaciar-carrito") {
        vaciarCarrito();
    } else if (e.target.classList.contains("eliminar")) {
        const productoId = parseInt(e.target.getAttribute("data-id"));
        eliminarProductoDelCarrito(productoId);
    } else if (e.target.classList.contains("aumentar")) {
        const productoId = parseInt(e.target.getAttribute("data-id"));
        cambiarCantidad(productoId, 1);
    } else if (e.target.classList.contains("reducir")) {
        const productoId = parseInt(e.target.getAttribute("data-id"));
        cambiarCantidad(productoId, -1);
    } else if (e.target.id === "comprar") {
        mostrarFormularioDatosUsuario();
    }
});

function agregarProductoAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (producto.stock > 0) {
        const productoEnCarrito = carrito.find(p => p.id === id);
        if (productoEnCarrito && productoEnCarrito.cantidad < producto.stock) {
            productoEnCarrito.cantidad++;
        } else if (!productoEnCarrito) {
            carrito.push({ ...producto, cantidad: 1 });
        }
        producto.stock--;
        actualizarCarrito();
        actualizarStock(id);
    }
}

function cambiarCantidad(id, cantidad) {
    const productoEnCarrito = carrito.find(p => p.id === id);
    const producto = productos.find(p => p.id === id);
    if (productoEnCarrito && productoEnCarrito.cantidad + cantidad > 0 && producto.stock - cantidad >= 0) {
        productoEnCarrito.cantidad += cantidad;
        producto.stock -= cantidad;
        actualizarCarrito();
        actualizarStock(id);
    } else if (productoEnCarrito.cantidad + cantidad === 0) {
        eliminarProductoDelCarrito(id);
    }
}

function actualizarStock(id) {
    const stockElemento = document.getElementById(`stock-${id}`);
    const producto = productos.find(p => p.id === id);
    stockElemento.textContent = producto.stock;
    const boton = document.querySelector(`.agregar-carrito[data-id="${id}"]`);
    if (producto.stock === 0) {
        boton.disabled = true;
    } else {
        boton.disabled = false;
    }
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");
    const cantidadCarrito = document.getElementById("cantidad-carrito");
    const total = document.getElementById("total");
    listaCarrito.innerHTML = "";
    let totalPrecio = 0;
    carrito.forEach(producto => {
        totalPrecio += producto.precio * producto.cantidad;
        const itemCarrito = document.createElement("li");
        itemCarrito.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        itemCarrito.innerHTML = `
            ${producto.nombre} - $${producto.precio} x ${producto.cantidad}
            <button class="btn btn-danger btn-sm eliminar" data-id="${producto.id}">Eliminar</button>
            <button class="btn btn-secondary btn-sm aumentar" data-id="${producto.id}">+</button>
            <button class="btn btn-secondary btn-sm reducir" data-id="${producto.id}">-</button>
        `;
        listaCarrito.appendChild(itemCarrito);
    });
    cantidadCarrito.textContent = carrito.length;
    total.textContent = `Total: $${totalPrecio.toFixed(2)}`;
}

function vaciarCarrito() {
    carrito = [];
    productos.forEach(p => p.stock = Math.floor(Math.random() * 16) + 5); 
    actualizarCarrito();
}

function eliminarProductoDelCarrito(id) {
    carrito = carrito.filter(p => p.id !== id);
    const producto = productos.find(p => p.id === id);
    producto.stock++;
    actualizarCarrito();
    actualizarStock(id);
}

function mostrarFormularioDatosUsuario() {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Tu carrito está vacío.',
            text: 'Por favor, agrega productos a tu carrito antes de proceder con la compra.',
            confirmButtonText: 'Cerrar'
        });
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('modalDatosUsuario'));
    modal.show();
}

document.getElementById('confirmar-datos').addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const direccion = document.getElementById('direccion').value;

    if (!nombre || !email || !direccion) {
        Swal.fire({
            icon: 'error',
            title: 'Faltan datos',
            text: 'Por favor, completa todos los campos.',
            confirmButtonText: 'Cerrar'
        });
        return;

    }
    Swal.fire({
        icon: 'success',
        title: 'Compra realizada con éxito!',
        text: `¡Gracias, ${nombre}! Tu compra ha sido realizada y será enviada a: ${direccion}.`,
        confirmButtonText: 'Aceptar'

    }).then(() => {
        vaciarCarrito();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalDatosUsuario'));
        modal.hide();
    });
});


