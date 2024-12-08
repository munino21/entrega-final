const carrito = [];
const listaCarrito = document.getElementById("lista-carrito");
const total = document.getElementById("total");

document.addEventListener("click", e => {
    if (e.target.classList.contains("agregar-carrito")) {
        const productoId = e.target.getAttribute("data-id");
        agregarProductoAlCarrito(productoId);
    } else if (e.target.id === "vaciar-carrito") {
        vaciarCarrito();
    } else if (e.target.id === "comprar") {
        finalizarCompra();
    } else if (e.target.classList.contains("eliminar")) {
        const productoId = e.target.getAttribute("data-id");
        eliminarProductoDelCarrito(productoId);
    }
});

function agregarProductoAlCarrito(id) {
    fetch("js/productos.json")
        .then(response => response.json())
        .then(data => {
            const producto = data.find(p => p.id == id);
            carrito.push(producto);
            actualizarCarrito();
        });
}

function actualizarCarrito() {
    listaCarrito.innerHTML = "";
    let totalCompra = 0;

    carrito.forEach(producto => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `
            ${producto.nombre} - $${producto.precio.toFixed(2)}
            <button class="btn btn-danger btn-sm float-end eliminar" data-id="${producto.id}">X</button>
        `;
        listaCarrito.appendChild(li);
        totalCompra += producto.precio;
    });

    total.textContent = `Total: $${totalCompra.toFixed(2)}`;
    guardarCarrito();
}

function vaciarCarrito() {
    carrito.length = 0;
    actualizarCarrito();
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarrito() {
    const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(...carritoGuardado);
    actualizarCarrito();
}

function eliminarProductoDelCarrito(id) {
    const indice = carrito.findIndex(producto => producto.id == id);
    if (indice !== -1) {
        carrito.splice(indice, 1); 
    }
    actualizarCarrito();  
}

function finalizarCompra() {
    alert("Gracias por tu compra. ¡Disfruta tus spinners!");
    vaciarCarrito();
}

cargarCarrito();
