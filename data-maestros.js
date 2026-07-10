/* ========================================================================
   UNIVERSAL ASSISTANCE — Datos Maestros (Mock Base de Datos)
   ======================================================================== */

// 3.1 Países y destinos
const dbDestinos = [
    { destino_id: 'ARG', pais_nombre: 'Argentina', pais_codigo_iso: 'AR', zona_tarifaria: 'ARGENTINA', activo: true },
    { destino_id: 'URY', pais_nombre: 'Uruguay (Territorio Nacional)', pais_codigo_iso: 'UY', zona_tarifaria: 'NACIONAL', activo: true },
    { destino_id: 'BRA', pais_nombre: 'Brasil', pais_codigo_iso: 'BR', zona_tarifaria: 'SUDAMERICA', activo: true },
    { destino_id: 'CHL', pais_nombre: 'Chile', pais_codigo_iso: 'CL', zona_tarifaria: 'LIMITROFE', activo: true },
    { destino_id: 'USA', pais_nombre: 'Norteamérica', pais_codigo_iso: 'US', zona_tarifaria: 'NORTEAMERICA', activo: true },
    { destino_id: 'EUR', pais_nombre: 'Europa*', pais_codigo_iso: 'EU', zona_tarifaria: 'EUROPA', activo: true },
    { destino_id: 'MUNDO', pais_nombre: 'Múltiples Destinos*', pais_codigo_iso: '', zona_tarifaria: 'INTERNACIONAL', activo: true },
    { destino_id: 'ASIA', pais_nombre: 'Oceanía, Asia*, África', pais_codigo_iso: '', zona_tarifaria: 'INTERNACIONAL', activo: true },
    { destino_id: 'CEN', pais_nombre: 'Centroamérica y Caribe (excepto Cuba*)', pais_codigo_iso: '', zona_tarifaria: 'INTERNACIONAL', activo: true }
];

// 3.2 Zonas tarifarias (factores de precio base)
const dbZonasTarifarias = [
    { zona_id: 'ARGENTINA', nombre: 'Argentina', factor_precio: 0.6, requiere_destino_especifico: true },
    { zona_id: 'NACIONAL', nombre: 'Territorio Nacional', factor_precio: 0.5, requiere_destino_especifico: true },
    { zona_id: 'SUDAMERICA', nombre: 'Sudamérica', factor_precio: 0.85, requiere_destino_especifico: false },
    { zona_id: 'LIMITROFE', nombre: 'Países Limítrofes', factor_precio: 0.7, requiere_destino_especifico: false },
    { zona_id: 'NORTEAMERICA', nombre: 'Norteamérica', factor_precio: 1.2, requiere_destino_especifico: false },
    { zona_id: 'EUROPA', nombre: 'Europa', factor_precio: 1.15, requiere_destino_especifico: false },
    { zona_id: 'INTERNACIONAL', nombre: 'Resto del Mundo', factor_precio: 1.25, requiere_destino_especifico: false }
];

// 3.3 Productos / planes
// Precios base: base = USD 4.5, max = USD 7.8, pre = USD 12.5 (Adulto/día x factor = 1.0)
const dbProductos = [
    { 
        producto_id: 'VALUE_80K', codigo_externo: 'UA_VAL_80', nombre_comercial: 'Value', 
        tipo_producto: 'DIARIO', cobertura_principal_usd: 80000, 
        tarifa_diaria_base: 4.5, tarifa_minima: 35,
        activo: true, vigencia_desde: '2025-01-01', fuente: 'API_COTIZADOR'
    },
    { 
        producto_id: 'MAXIMUM_300K', codigo_externo: 'UA_MAX_300', nombre_comercial: 'Maximum', 
        tipo_producto: 'DIARIO', cobertura_principal_usd: 300000, 
        tarifa_diaria_base: 7.8, tarifa_minima: 55,
        activo: true, vigencia_desde: '2025-01-01', fuente: 'API_COTIZADOR'
    },
    { 
        producto_id: 'EXCLUSIVE_500K', codigo_externo: 'UA_EXC_500', nombre_comercial: 'Exclusive', 
        tipo_producto: 'DIARIO', cobertura_principal_usd: 500000, 
        tarifa_diaria_base: 12.5, tarifa_minima: 85,
        activo: true, vigencia_desde: '2025-01-01', fuente: 'API_COTIZADOR'
    }
];

// 3.4 Coberturas y beneficios (Simplificadas para el prototipo)
const dbBeneficios = [
    { beneficio_id: 'MED_VAL', producto_id: 'VALUE_80K', nombre_beneficio: 'Asistencia médica', valor: 'USD 80.000' },
    { beneficio_id: 'EQUI_VAL', producto_id: 'VALUE_80K', nombre_beneficio: 'Demora de equipaje', valor: 'USD 1.000' },
    { beneficio_id: 'PRE_VAL', producto_id: 'VALUE_80K', nombre_beneficio: 'Pre-existencias', valor: 'USD 10.000' },
    { beneficio_id: 'MED_MAX', producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Asistencia médica', valor: 'USD 300.000' },
    { beneficio_id: 'EQUI_MAX', producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Demora de equipaje', valor: 'USD 2.000' },
    { beneficio_id: 'PRE_MAX', producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Pre-existencias', valor: 'USD 25.000' },
    { beneficio_id: 'MED_EXC', producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Asistencia médica', valor: 'USD 500.000' },
    { beneficio_id: 'EQUI_EXC', producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Demora de equipaje', valor: 'USD 2.500' },
    { beneficio_id: 'PRE_EXC', producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Pre-existencias', valor: 'USD 30.000' }
];

// 3.5 Convenios
const dbConvenios = [
    { 
        convenio_id: 'SEMM_UY', nombre: 'SEMM', organizacion_emisora: 'SEMM', tipo_convenio: 'SALUD',
        productos_habilitados: ['VALUE_80K', 'MAXIMUM_300K', 'EXCLUSIVE_500K'],
        reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.30, 'EXCLUSIVE_500K': 0.20 },
        activo: true
    },
    { 
        convenio_id: 'OCA_UY', nombre: 'OCA', organizacion_emisora: 'OCA', tipo_convenio: 'BANCO',
        productos_habilitados: ['VALUE_80K', 'MAXIMUM_300K', 'EXCLUSIVE_500K'],
        reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 },
        activo: true
    },
    { 
        convenio_id: 'MASTER_UY', nombre: 'Mastercard', organizacion_emisora: 'MASTERCARD', tipo_convenio: 'BANCO',
        productos_habilitados: ['VALUE_80K', 'MAXIMUM_300K', 'EXCLUSIVE_500K'],
        reglas_precio: { 'VALUE_80K': 0.05, 'MAXIMUM_300K': 0.10, 'EXCLUSIVE_500K': 0.10 },
        activo: true
    },
    { 
        convenio_id: 'ITAU_UY', nombre: 'Itaú', organizacion_emisora: 'ITAU', tipo_convenio: 'BANCO',
        productos_habilitados: ['VALUE_80K', 'MAXIMUM_300K', 'EXCLUSIVE_500K'],
        reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.20, 'EXCLUSIVE_500K': 0.15 },
        activo: true
    },
    { 
        convenio_id: 'SANTANDER_UY', nombre: 'Santander', organizacion_emisora: 'SANTANDER', tipo_convenio: 'BANCO',
        productos_habilitados: ['VALUE_80K', 'MAXIMUM_300K', 'EXCLUSIVE_500K'],
        reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.25, 'EXCLUSIVE_500K': 0.20 },
        activo: true
    },
    { 
        convenio_id: 'SANTANDER_MC_UY', nombre: 'Santander Mastercard', organizacion_emisora: 'SANTANDER', tipo_convenio: 'BANCO',
        productos_habilitados: ['VALUE_80K', 'MAXIMUM_300K', 'EXCLUSIVE_500K'],
        reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.25, 'EXCLUSIVE_500K': 0.20 },
        activo: true
    }
];

// 3.7 Adicionales / Módulos
const dbAdicionales = [
    { adicional_id: 'PREEX_EXT', nombre: 'Preexistencias Extendidas', tipo: 'MEDICO', tarifa_diaria: 4.5, is_fixed: false, activo: true },
    { adicional_id: 'TECH_PRO', nombre: 'Tecnología Protegida', tipo: 'EQUIPAJE', tarifa_diaria: 15, is_fixed: false, activo: true },
    { adicional_id: 'DEP_ADV', nombre: 'Deportes de Aventura', tipo: 'DEPORTIVO', tarifa_diaria: 8, is_fixed: false, activo: true },
    { adicional_id: 'CANC_VIAJE', nombre: 'Cancel. de Viaje', tipo: 'SEGURO', tarifa_diaria: 3.5, is_fixed: false, activo: true },
    { adicional_id: 'EMBARAZO', nombre: 'Cobertura Embarazo', tipo: 'MEDICO', tarifa_diaria: 6, is_fixed: false, activo: true },
    { adicional_id: 'MASCOTAS', nombre: 'Mascotas', tipo: 'MASCOTA', tarifa_fija: 10, is_fixed: true, activo: true }
];

// ========================================================================
// REPOSITORIO DE DATOS
// ========================================================================

const DataRepository = {
    getDestinos: () => dbDestinos.filter(d => d.activo),
    getZonaById: (id) => dbZonasTarifarias.find(z => z.zona_id === id),
    getZonaByDestinoId: (destinoId) => {
        const dest = dbDestinos.find(d => d.destino_id === destinoId);
        return dest ? dbZonasTarifarias.find(z => z.zona_id === dest.zona_tarifaria) : null;
    },
    getProductos: () => dbProductos.filter(p => p.activo),
    getProductoById: (id) => dbProductos.find(p => p.producto_id === id),
    getBeneficiosByProducto: (prodId) => dbBeneficios.filter(b => b.producto_id === prodId),
    getConvenioById: (id) => dbConvenios.find(c => c.convenio_id === id),
    getAdicionalById: (id) => dbAdicionales.find(a => a.adicional_id === id)
};
