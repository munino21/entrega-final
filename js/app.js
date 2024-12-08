const carrito = [];
const listaCarrito = document.getElementById("lista-carrito");
const total = document.getElementById("total");
const cantidadCarrito = document.getElementById("cantidad-carrito");
let productos = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("js/productos.json")
        .then(response => response.json())
        .then(data => {
            productos = data;
            productos.forEach(producto => {
                producto.stock = Math.floor(Math.random() * 20) + 1; 
            });
            renderizarProductos();
        })
        .catch(error => console.error("Error al cargar los productos:", error));

    cargarCarrito();
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
                    <p class="card-text">Stock disponible: ${producto.stock}</p>
                    <button class="btn btn-primary agregar-carrito" data-id="${producto.id}">Agregar al Carrito</button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

document.addEventListener("click", e => {
    if (e.target.classList.contains("agregar-carrito")) {
        const productoId = e.target.getAttribute("data-id");
        agregarProductoAlCarrito(productoId);
    } else if (e.target.classList.contains("eliminar")) {
        const productoId = e.target.getAttribute("data-id");
        eliminarProductoDelCarrito(productoId);
    } else if (e.target.id === "vaciar-carrito") {
        vaciarCarrito();
    } else if (e.target.id === "comprar") {
        mostrarFormularioPago();
    }
});

function agregarProductoAlCarrito(id) {
    const producto = productos.find(p => p.id == id);
    const existe = carrito.find(p => p.id == id);

    if (producto.stock > 0) {
        if (existe) {
            if (existe.cantidad < producto.stock) {
                existe.cantidad++;
                producto.stock--; 
            } else {
                Swal.fire("No hay suficiente stock", "Ya no puedes agregar más de este producto.", "warning");
            }
        } else {
            carrito.push({ ...producto, cantidad: 1 });
            producto.stock--; 
        }
        actualizarCarrito();
        renderizarProductos(); 
    } else {
        Swal.fire("No hay stock disponible", "El producto ya no está disponible.", "error");
    }
}

function actualizarCarrito() {
    listaCarrito.innerHTML = "";
    let totalCompra = 0;
    let cantidadTotal = 0;

    carrito.forEach(producto => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `
            ${producto.nombre} - $${producto.precio.toFixed(2)} x ${producto.cantidad}
            <button class="btn btn-danger btn-sm float-end eliminar" data-id="${producto.id}">X</button>
        `;
        listaCarrito.appendChild(li);
        totalCompra += producto.precio * producto.cantidad;
        cantidadTotal += producto.cantidad;
    });

    total.textContent = `Total: $${totalCompra.toFixed(2)}`;
    cantidadCarrito.textContent = cantidadTotal;
    guardarCarrito();
}

function vaciarCarrito() {
    carrito.length = 0;
    productos.forEach(producto => producto.stock = Math.floor(Math.random() * 20) + 1); 
    actualizarCarrito();
    renderizarProductos(); 
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
    const index = carrito.findIndex(producto => producto.id == id);
    if (index !== -1) {
        carrito[index].cantidad--;
        const producto = productos.find(p => p.id == id);
        producto.stock++;
        if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    }
    actualizarCarrito();
    renderizarProductos(); 
}

function mostrarFormularioPago() {
    const modalHTML = `
        <div class="modal fade" id="modalPago" tabindex="-1" aria-labelledby="modalPagoLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalPagoLabel">Método de Pago</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formPago">
                            <div class="mb-3">
                                <label for="nombre" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="apellido" class="form-label">Apellido</label>
                                <input type="text" class="form-control" id="apellido" required>
                            </div>
                            <div class="mb-3">
                                <label for="dni" class="form-label">DNI</label>
                                <input type="text" class="form-control" id="dni" required>
                            </div>
                            <div class="mb-3">
                                <label for="direccion" class="form-label">Dirección</label>
                                <input type="text" class="form-control" id="direccion" required>
                            </div>
                            <div class="mb-3">
                                <label for="tarjeta" class="form-label">Número de tarjeta</label>
                                <input type="text" class="form-control" id="tarjeta" required minlength="9" maxlength="11">
                                <div id="errorTarjeta" class="text-danger" style="display: none;">El número de tarjeta debe tener entre 9 y 11 dígitos.</div>
                            </div>
                            <button type="submit" class="btn btn-primary">Confirmar Pago</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    const modal = new bootstrap.Modal(document.getElementById("modalPago"));
    modal.show();

    document.getElementById("formPago").addEventListener("submit", (e) => {
        e.preventDefault();

        const tarjeta = document.getElementById("tarjeta").value;
        if (tarjeta.length < 9 || tarjeta.length > 11) {
            document.getElementById("errorTarjeta").style.display = "block";
            return;
        } else {
            document.getElementById("errorTarjeta").style.display = "none";
        }


        const aprobado = Math.random() > 0.5; 

        if (aprobado) {
            Swal.fire("Compra aprobada", "¡Tu pago ha sido aprobado y tus productos serán enviados!", "success");
        } else {
            Swal.fire("Compra rechazada", "El pago fue rechazado. Intenta nuevamente.", "error");
        }

        vaciarCarrito(); 
        modal.hide(); 
    });
}










