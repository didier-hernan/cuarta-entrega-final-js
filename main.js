  // Función para ordenar los productos según el criterio seleccionado
  async function ordenarProductos() {
    const orden = document.getElementById("orden").value;
  
    if (orden === "precioAscendente") {
      productos.sort((a, b) => a.precio - b.precio);
    } else if (orden === "precioDescendente") {
      productos.sort((a, b) => b.precio - a.precio);
    }
    mostrarResultados(productos);
  }
  
  // Función para limpiar los campos de entrada
  function limpiarCampos() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
  }
  
  let productos = [];
  
  // Función para cargar los productos desde el archivo JSON
  async function cargarProductos() {
    try {
      const data = await $.getJSON("productos.json");
      productos = data;
      const productosGuardados = localStorage.getItem("productos");
      if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
      } else {
        guardarProductos();
      }
      mostrarResultados(productos);
      actualizarStockCatalogo();
    } catch (error) {
      alert("Error al cargar los productos.");
    }
  }
  
  // Función para inicializar la aplicación
  async function init() {
    try {
      await cargarProductos();
      const agregarStockBtn = $("#agregarStockBtn");
      const formularioEliminar = $("#formularioEliminar");
      const ordenSelect = $("#orden");
      const mostrarCatalogoBtn = $("#mostrarCatalogoBtn");
      const confirmarCompraBtn = $("#confirmarCompraBtn");
  
      agregarStockBtn.on("click", agregarStock);
      formularioEliminar.on("submit", eliminarStock);
      ordenSelect.on("change", ordenarProductos);
      mostrarCatalogoBtn.on("click", mostrarCatalogo);
      confirmarCompraBtn.on("click", confirmarCompra);
    } catch (error) {
      alert(error.message);
    }
  }
  
  // Función para guardar los productos en el LocalStorage
  function guardarProductos() {
    localStorage.setItem("productos", JSON.stringify(productos));
  }
  // Función para buscar productos en el catálogo y habilitar el autocompletado en el formulario de eliminar producto
  function buscarProductosEliminar() {
    const busqueda = removerAcentos(document.getElementById("nombreEliminar").value.toLowerCase());
    const resultados = productos.filter(producto =>
      removerAcentos(producto.nombre.toLowerCase()).includes(busqueda)
    );
  
    const autocompleteList = document.getElementById("autocompleteList");
    let htmlAutocomplete = "";
  
    resultados.forEach((producto) => {
      htmlAutocomplete += `
        <li>${producto.nombre}</li>
      `;
    });
  
    autocompleteList.innerHTML = htmlAutocomplete;
  
    // Agregar evento "click" a los elementos de la lista de autocompletado
    const listItems = autocompleteList.getElementsByTagName("li");
    for (let i = 0; i < listItems.length; i++) {
      listItems[i].addEventListener("click", function () {
        seleccionarProductoEliminar(this.textContent);
      });
    }
  }
  // En el evento "DOMContentLoaded", se llama a la función init de manera asíncrona
  document.addEventListener("DOMContentLoaded", async function () {
    await init();
    const catalogo = document.getElementById("catalogo");
    if (catalogo) {
      catalogo.addEventListener("click", manejarClicProducto);
    }
    const busquedaInput = document.getElementById("busqueda");
    if (busquedaInput) {
      busquedaInput.addEventListener("keyup", buscarProductos);
    }
    const nombreEliminarInput = document.getElementById("nombreEliminar");
    if (nombreEliminarInput) {
      nombreEliminarInput.addEventListener("input", buscarProductosEliminar);
    }
  });
  // Función para buscar productos en el catálogo
  function buscarProductos() {
    const busqueda = removerAcentos(document.getElementById("busqueda").value.toLowerCase());
    const resultados = productos.filter(producto =>
      removerAcentos(producto.nombre.toLowerCase()).includes(busqueda)
    );
    mostrarResultados(resultados);
  }
  // Función para remover acentos y caracteres especiales
  function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  // Función para manejar el clic en el botón "+" para agregar productos al carrito
  function manejarClicProducto(event) {
    const target = event.target;
    if (target.classList.contains("btn-agregar")) {
      const productoId = target.getAttribute("data-id");
      agregarProducto(parseInt(productoId)); 
    }
  }
  
  // Función para agregar un producto al stock
  function agregarStock() {
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const stock = document.getElementById("stock").value;
  
    if (!nombre || !precio || !stock) {
      alert("Por favor, complete todos los campos.");
      return;
    }
  
    const nuevoProducto = {
      id: generarIdUnico(),
      nombre: nombre,
      precio: parseFloat(precio),
      cantidad: 0,
      stock: parseInt(stock),
      imagen: "nueva.jpg",
    };
  
    productos.push(nuevoProducto);
  
    guardarProductos();
  
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
  
    mostrarResultados(productos);
    limpiarCampos();
  }
  
  // Función para generar un ID único para los productos
  function generarIdUnico() {
    return productos.length + 1;
  }
  
  // Función para eliminar un producto del stock
  function eliminarStock(event) {
    event.preventDefault();
  
    const nombreProducto = document.getElementById("nombreEliminar").value.toLowerCase();
  
    const productoIndex = productos.findIndex((producto) => producto.nombre.toLowerCase() === nombreProducto);
  
    if (productoIndex !== -1) {
      productos.splice(productoIndex, 1);
      guardarProductos();
      mostrarResultados(productos);
      document.getElementById("formularioEliminar").reset();
      actualizarStockCatalogo();
  
      // Mostrar el mensaje de alerta para el producto eliminado
      alert(`Producto "${nombreProducto}" fue eliminado.`);
    } else {
      alert("No se encontró un producto con ese nombre");
    }
  }
  
  // Función para actualizar el stock en el catálogo
  function actualizarStockCatalogo() {
    const catalogo = document.getElementById("catalogo");
  
    // Eliminar todos los elementos hijos del catálogo para limpiarlo
    while (catalogo.firstChild) {
      catalogo.removeChild(catalogo.firstChild);
    }
  
    productos.forEach((producto) => {
      const divProducto = document.createElement("div");
      divProducto.classList.add("col-md-6");
      divProducto.innerHTML = `
          <div class="producto" data-id="${producto.id}">
              <img src="img/${producto.imagen}" alt="${producto.nombre}" class="img-fluid">
              <h3>${producto.nombre}</h3>
              <p class="precio">$${producto.precio}</p>
              <p class="stock">Stock: ${producto.stock}</p>
              <button class="btn btn-primary btn-agregar" data-id="${producto.id}">+</button>
          </div>
      `;
      catalogo.appendChild(divProducto);
    });
  }
  
  // Función para mostrar u ocultar el catálogo
  function mostrarCatalogo() {
    const catalogo = document.getElementById("catalogo");
  
    if (!catalogo) {
      return;
    }
  
    if (catalogo.style.display === "none") {
      catalogo.style.display = "block";
      mostrarResultados(productos);
    } else {
      catalogo.style.display = "none";
      mostrarResultados([]); // Limpiar el catálogo cuando se oculta
    }
  }
  
  // Función para mostrar los resultados en el catálogo
  function mostrarResultados(resultados) {
    const catalogo = document.getElementById("catalogo");
    let htmlCatalogo = "";
  
    resultados.forEach((producto) => {
      htmlCatalogo += `
          <div class="col-md-6">
              <div class="producto" data-id="${producto.id}">
                  <img src="img/${producto.imagen}" alt="${producto.nombre}" class="img-fluid">
                  <h3>${producto.nombre}</h3>
                  <p class="precio">$${producto.precio}</p>
                  <p class="stock">Stock: ${producto.stock}</p>
                  <button class="btn btn-primary btn-agregar" data-id="${producto.id}">+</button>
              </div>
          </div>
      `;
    });
  
    catalogo.innerHTML = htmlCatalogo;
  }
  
  const carrito = [];
  
  // Función para agregar un producto al carrito
  function agregarProducto(id) {
    const producto = productos.find((p) => p.id === id);
  
    if (producto) {
      const carritoProducto = carrito.find((p) => p.id === id);
  
      if (carritoProducto) {
        if (carritoProducto.cantidad < producto.stock) {
          carritoProducto.cantidad++; 
          guardarProductos(); 
          actualizarStockCatalogo(); 
          actualizarCarrito(); 
        } else {
          alert('No se puede agregar más al carrito. Stock insuficiente.');
        }
      } else {
        if (producto.stock > 0) {
          carrito.push({ ...producto, cantidad: 1 }); 
          guardarProductos(); 
          actualizarStockCatalogo(); 
          actualizarCarrito(); 
        } else {
          alert('No hay stock disponible para agregar al carrito.');
        }
      }
    } else {
      alert('Producto no encontrado');
    }
  }
  
  // Función para obtener la cantidad disponible de un producto en el stock
  function obtenerCantidadDisponible(id) {
    const producto = productos.find((p) => p.id === parseInt(id));
    const carritoProducto = carrito.find((p) => p.id === parseInt(id));
    const stockDisponible = producto ? producto.stock : 0;
    const carritoCantidad = carritoProducto ? carritoProducto.cantidad : 0;
    return stockDisponible - carritoCantidad;
  }
  
  // Función para eliminar un producto del carrito
  function eliminarProductoCarrito(id) {
    const producto = carrito.find((item) => item.id === id);
  
    if (producto) {
      producto.cantidad--;
      producto.stock++;
  
      if (producto.cantidad === 0) {
        const index = carrito.findIndex((item) => item.id === id);
        carrito.splice(index, 1);
        const productoEnStock = productos.find((p) => p.id === id);
        if (productoEnStock) {
          productoEnStock.stock++; 
        }
      }
  
      actualizarStockCatalogo();
      actualizarCarrito();
    }
  }
  
  
  // Función para confirmar la compra y vaciar el carrito
  function confirmarCompra() {
    alert("Compra confirmada. ¡Gracias por tu compra!");
  
    // Actualizar el stock de los productos en base a las unidades vendidas
    carrito.forEach((producto) => {
      const productoEnStock = productos.find((p) => p.id === producto.id);
      if (productoEnStock) {
        productoEnStock.stock -= producto.cantidad;
      }
    });
  
    carrito.length = 0;
    guardarProductos(); 
    actualizarStockCatalogo(); 
    actualizarCarrito();
  }
  
  // Función para actualizar el contenido del carrito en la página
  function actualizarCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");
    const totalPrecio = document.getElementById("total-precio");
    let htmlCarrito = "";
    let total = 0;
  
    carrito.forEach((producto) => {
      htmlCarrito += `<li>${producto.nombre} - $${producto.precio} x ${producto.cantidad} <button onclick="eliminarProductoCarrito(${producto.id})">-</button></li>`;
      total += producto.precio * producto.cantidad;
    });
  
    listaCarrito.innerHTML = htmlCarrito;
    totalPrecio.textContent = total;
  }
  
  mostrarResultados(productos);