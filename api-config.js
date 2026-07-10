/* ========================================================================
   UNIVERSAL ASSISTANCE — API Configuration
   Endpoints descubiertos via ingeniería inversa del Portal de Partners
   Base URL: https://co.ec.universal-assistance.com
   ======================================================================== */

const API_CONFIG = {
    baseUrl: 'https://co.ec.universal-assistance.com',
    
    endpoints: {
        // Formulario inicial de cotización (POST form-data)
        cotizar:         '/portal-de-partners-oferta-de-coberturas',
        
        // Recotizar desde sidebar (POST form-data)
        recotizar:       '/Emision/Recotizar',
        
        // Vouchers emitidos (GET)
        vouchers:        '/Emision/VouchersGenerados',
        
        // Precompras (GET)
        precompras:      '/Emision/Precompras',
        
        // Importar pasajeros CSV (POST multipart)
        importarPax:     '/Emision/ImportarPasajeros',
        
        // Descargar template CSV para import
        templateCSV:     '/Emision/DescargarTemplate',
        
        // Perfil de usuario (GET)
        perfil:          '/Emision/Perfil',
        
        // Mi cobertura (GET)
        miCobertura:     '/Emision/MiCobertura',
        
        // Login del portal
        login:           '/portal-de-partners-acceder',
        
        // Logout
        logout:          '/portal-de-partners-salir',
        
        // Seleccionar agencia
        seleccionarAgencia: '/portal-de-partners-seleccionar-agencia',
    },
    
    // Datos fijos de la sesión actual
    session: {
        origen:         'URUGUAY',
        organizacion:   'SURVIEW',
        usuario:        'LUCASB',
        culture:        'es',
    },
    
    // Parámetros del formulario de cotización (POST)
    formFields: {
        TipoProducto:       'Folleto',    // Folleto | Especiales | Precompras
        TipoViaje:          'Un viaje',   // Un viaje | Multi viaje
        Destino:            'Europa',     // Value interno del select
        FechaInicio:        '',           // DD/MM/YYYY
        FechaFin:           '',           // DD/MM/YYYY
        CantidadPasajeros:  '1',          // 1-15
        ListaEdades:        '30',         // CSV de edades (ej: "30,35,10")
        Prefiltro:          '',           // Tipo de cotización (hidden)
    },
    
    // Destinos disponibles (extraídos del <select> del portal)
    destinos: [
        { value: 'Argentina',                      label: 'Argentina' },
        { value: 'Centro america/Caribe',          label: 'Centroamérica y Caribe (excepto Cuba*)' },
        { value: 'Europa',                         label: 'Europa*' },
        { value: 'Internacional Mundo',            label: 'Múltiples Destinos*' },
        { value: 'America del norte',              label: 'Norteamérica' },
        { value: 'Asia',                           label: 'Oceanía, Asia*, África' },
        { value: 'Países Limítrofes',              label: 'Países Limítrofes' },
        { value: 'América del Sur (salvo Vzla)',   label: 'Sudamérica' },
        { value: 'Territorio Nacional',            label: 'Territorio Nacional' },
    ],
    
    // Stack tecnológico del portal
    tech: {
        framework:   'ASP.NET MVC',
        frontend:    'jQuery + Bootstrap 5',
        datepicker:  'daterangepicker v3.1 (Dan Grossman)',
        validation:  'jQuery Validation + Unobtrusive',
        antiForgery: '__RequestVerificationToken (cookie + hidden input)',
    },
};

// No exportar — este archivo es solo referencia documental
// Para uso futuro cuando se implemente integración directa
