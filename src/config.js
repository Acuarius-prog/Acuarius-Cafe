// ============================================================================
//  CONFIGURACIÓN DE LA TIENDA  —  edita SOLO este archivo para personalizar
// ============================================================================
// Aquí cambias el nombre, el logo, los datos de contacto, los domicilios y
// los pagos. No necesitas tocar el resto del código.

export const CONFIG = {
  // ---- Marca -------------------------------------------------------------
  brand: {
    name: 'Carnes Finas Puerto Rico #2',
    tagline: 'Res, pollo y cerdo · frescos cada día',
    // LOGO: para usar tu propia imagen, pon el archivo en /public/icons/ y
    // escribe aquí la ruta, por ejemplo: logoSrc: '/icons/mi-logo.png'
    // Si lo dejas en null, se muestra el logo de texto de abajo.
    // Para QUITAR el logo por completo, pon showLogo: false.
    showLogo: true,
    logoSrc: null,
    // Logo de texto (se usa cuando logoSrc es null): número grande + nombre.
    logoBadge: 'PR',
    logoLine0: 'Carnes Finas',
    logoLine1: 'Puerto Rico',
    logoLine2: 'N.º 2',
  },

  // ---- Crédito del desarrollador (pie de página) ------------------------
  // Marca de quién desarrolló la página. Para ocultarlo: show: false.
  credit: {
    show: true,
    text: 'Desarrollada por',
    name: 'Maxik-IA Technology',
    logo: '/maxikia.png',   // pon null para mostrar solo el texto
    url: '',                // enlace opcional (ej: 'https://maxik-ia.com')
  },

  // ---- Contacto y ubicación ---------------------------------------------
  contact: {
    // WhatsApp en formato internacional SIN "+", SIN espacios (Colombia: 57...)
    whatsapp: '573001234567',
    phoneDisplay: '+57 300 123 4567',
    address: 'Calle 18 # 00-00, Bogotá',
    hours: 'Lun a Sáb 7:00 a.m. – 7:00 p.m. · Dom 8:00 a.m. – 2:00 p.m.',
    instagram: '@carnesfinaspr2',
  },

  // ---- Moneda y unidades -------------------------------------------------
  currency: {
    code: 'COP',
    locale: 'es-CO',
  },
  // 1 libra en Colombia = 500 g = 0.5 kg. Cambia si vendes en otra medida.
  libraEnKg: 0.5,

  // ---- Cerdo interactivo -------------------------------------------------
  // El cerdo se arma con piezas recortadas de tu despiece (una por corte) que
  // están en /public/piezas/ y se posicionan según src/data/pieces.json.
  // Tu imagen original queda en /public/despiece.png como referencia.
  // (No necesitas editar esto para el uso normal.)

  // ---- Domicilios --------------------------------------------------------
  delivery: {
    enablePickup: true,             // permitir recoger en tienda
    enableDelivery: true,           // permitir domicilio
    fee: 5000,                      // costo del domicilio (COP)
    freeOver: 120000,               // domicilio gratis desde este total (COP). 0 = nunca
    minOrder: 20000,                // pedido mínimo (COP)
    note: 'Cubrimos el barrio y alrededores. El domiciliario confirma el tiempo por WhatsApp.',
  },

  // ---- Pagos -------------------------------------------------------------
  payment: {
    // Métodos que se ofrecen en el checkout.
    cashOnDelivery: true,           // pago contra entrega (efectivo/datáfono)
    // Pago en línea con Wompi (Bancolombia). Deja la llave vacía para ocultarlo.
    // Consíguela en https://comercios.wompi.co  (usa la llave pública pub_...)
    wompiPublicKey: '',             // ej: 'pub_test_xxxxxxxx'
    // Redondeo mínimo de Wompi: los montos van en centavos (COP * 100).
  },
}

// Colores de la marca (deben coincidir con las variables CSS de styles.css).
export const THEME = {
  smoke: '#241a17',
  paper: '#efe6d3',
  paprika: '#c8451d',
  brass: '#c99a5b',
}
