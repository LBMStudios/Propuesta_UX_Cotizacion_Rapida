/* ========================================================================
   UNIVERSAL ASSISTANCE — Datos Maestros REALES
   Fuente: Carpeta "Universal Assistance - Cotizador, CRM y Datos"
   Versión: 2.0 — Basado en Excel CAT-002, REQ-001, CAT-001 y CORP-000
   ======================================================================== */

// ═══════════════════════════════════════════════════════════════════════
// 3.1 — DESTINOS Y ZONAS TARIFARIAS
// Fuente: Portal Partners HAR + COT-001
// ═══════════════════════════════════════════════════════════════════════

const dbDestinos = [
    { destino_id: 'TERR_NAC',  pais_nombre: 'Territorio Nacional',                    pais_codigo_iso: 'UY', zona_tarifaria: 'NACIONAL',      activo: true },
    { destino_id: 'ARG',       pais_nombre: 'Argentina',                               pais_codigo_iso: 'AR', zona_tarifaria: 'ARGENTINA',     activo: true },
    { destino_id: 'LIMITROFE', pais_nombre: 'Países Limítrofes',                       pais_codigo_iso: '',   zona_tarifaria: 'LIMITROFE',     activo: true },
    { destino_id: 'SUDAMER',   pais_nombre: 'Sudamérica',                              pais_codigo_iso: '',   zona_tarifaria: 'SUDAMERICA',    activo: true },
    { destino_id: 'CENTAM',    pais_nombre: 'Centroamérica y Caribe (excepto Cuba*)',   pais_codigo_iso: '',   zona_tarifaria: 'INTERNACIONAL', activo: true },
    { destino_id: 'NORTAM',    pais_nombre: 'Norteamérica',                            pais_codigo_iso: 'US', zona_tarifaria: 'NORTEAMERICA',  activo: true },
    { destino_id: 'EUR',       pais_nombre: 'Europa*',                                 pais_codigo_iso: 'EU', zona_tarifaria: 'EUROPA',        activo: true },
    { destino_id: 'ASIA_AFR',  pais_nombre: 'Oceanía, Asia*, África',                  pais_codigo_iso: '',   zona_tarifaria: 'INTERNACIONAL', activo: true },
    { destino_id: 'MUNDO',     pais_nombre: 'Múltiples Destinos*',                     pais_codigo_iso: '',   zona_tarifaria: 'INTERNACIONAL', activo: true }
];

const dbZonasTarifarias = [
    { zona_id: 'NACIONAL',      nombre: 'Territorio Nacional', factor_precio: 0.50 },
    { zona_id: 'ARGENTINA',     nombre: 'Argentina',           factor_precio: 0.60 },
    { zona_id: 'LIMITROFE',     nombre: 'Países Limítrofes',   factor_precio: 0.70 },
    { zona_id: 'SUDAMERICA',    nombre: 'Sudamérica',          factor_precio: 0.85 },
    { zona_id: 'INTERNACIONAL', nombre: 'Internacional',       factor_precio: 1.00 },
    { zona_id: 'NORTEAMERICA',  nombre: 'Norteamérica',        factor_precio: 1.20 },
    { zona_id: 'EUROPA',        nombre: 'Europa',              factor_precio: 1.15 }
];

// ═══════════════════════════════════════════════════════════════════════
// 3.3 — PRODUCTOS RETAIL (Datos reales de CAT-001, CAT-002 y Portal)
// ═══════════════════════════════════════════════════════════════════════

const dbProductos = [
    // ── Familia Master ──
    {
        producto_id: 'MASTER_BASIC_25K', codigo_externo: 'UA_MASTER_BASIC',
        nombre_comercial: 'Master Basic', familia: 'Master',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 25000,
        tarifa_diaria_base: 3.0, tarifa_minima: 25,
        limite_edad: 999, // Sin límite documentado explícito
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2022-03-01', fuente: 'CAT-001_MASTER_BASIC_03-22.pdf'
    },
    {
        producto_id: 'MASTER_ESPECIAL_40K', codigo_externo: 'UA_MASTER_ESP',
        nombre_comercial: 'Master Especial', familia: 'Master',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 40000,
        tarifa_diaria_base: 3.8, tarifa_minima: 30,
        limite_edad: 70,
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2022-03-01', fuente: 'CAT-001_MASTER_ESPECIAL_03-22.pdf'
    },
    {
        producto_id: 'MASTER_DEPORTE_40K', codigo_externo: 'UA_MASTER_DEP',
        nombre_comercial: 'Master Deporte', familia: 'Master',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 40000,
        tarifa_diaria_base: 4.2, tarifa_minima: 32,
        limite_edad: 70, incluye_deporte: true,
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2022-03-01', fuente: 'CAT-001_MASTER_DEPORTE_03-22.pdf'
    },
    // ── Familia Value ──
    {
        producto_id: 'VALUE_80K', codigo_externo: 'UA_VALUE_80',
        nombre_comercial: 'Value', familia: 'Value',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 80000,
        tarifa_diaria_base: 4.5, tarifa_minima: 35,
        limite_edad: 70,
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2025-01-01', fuente: 'CAT-002_VALUE.xlsx'
    },
    {
        producto_id: 'VALUE_ESPECIAL_80K', codigo_externo: 'UA_VALUE_ESP',
        nombre_comercial: 'Value Especial', familia: 'Value',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 80000,
        tarifa_diaria_base: 4.8, tarifa_minima: 38,
        limite_edad: 70,
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2022-03-01', fuente: 'CAT-001_VALUE_ESPECIAL_03-22.pdf'
    },
    {
        producto_id: 'VALUE_PREEX7_80K', codigo_externo: 'UA_VALUE_PX7',
        nombre_comercial: 'Value Preex 7', familia: 'Value',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 80000,
        tarifa_diaria_base: 5.2, tarifa_minima: 40,
        limite_edad: 70,
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2022-03-01', fuente: 'CAT-001_VALUE_PREEX_7_03-22.pdf'
    },
    {
        producto_id: 'VALUE_PREEX7_MAYORES', codigo_externo: 'UA_VALUE_PX7M',
        nombre_comercial: 'Value Preex 7 Mayores', familia: 'Value',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 80000,
        tarifa_diaria_base: 8.5, tarifa_minima: 65,
        limite_edad: 999, edad_minima: 70,
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2022-03-01', fuente: 'CAT-001_VALUE_PREEX_7_MAYORES_03-22.pdf'
    },
    {
        producto_id: 'VALUE_DEPORTE_80K', codigo_externo: 'UA_VALUE_DEP',
        nombre_comercial: 'Value Deporte', familia: 'Value',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 80000,
        tarifa_diaria_base: 5.5, tarifa_minima: 42,
        limite_edad: 70, incluye_deporte: true,
        ambito: 'Internacional',
        activo: true, vigencia_desde: '2022-03-01', fuente: 'CAT-001_VALUE_DEPORTE_03-22.pdf'
    },
    // ── Familia Excellence (CAT-002 actual) ──
    {
        producto_id: 'EXCELLENCE_150K', codigo_externo: 'UA_EXCELLENCE_150',
        nombre_comercial: 'Excellence', familia: 'Excellence',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 150000,
        tarifa_diaria_base: 6.5, tarifa_minima: 50,
        limite_edad: 70,
        ambito: 'Internacional/Nacional',
        activo: true, vigencia_desde: '2025-01-01', fuente: 'CAT-002_EXCELLENCE.xlsx'
    },
    // ── Familia Maximum (Portal Partners) ──
    {
        producto_id: 'MAXIMUM_300K', codigo_externo: 'UA_MAX_300',
        nombre_comercial: 'Maximum', familia: 'Maximum',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 300000,
        tarifa_diaria_base: 7.8, tarifa_minima: 55,
        limite_edad: 70,
        ambito: 'Internacional/Nacional',
        activo: true, vigencia_desde: '2025-01-01', fuente: 'API_COTIZADOR'
    },
    // ── Familia Exclusive ──
    {
        producto_id: 'EXCLUSIVE_500K', codigo_externo: 'UA_EXC_500',
        nombre_comercial: 'Exclusive', familia: 'Exclusive',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 500000,
        tarifa_diaria_base: 12.5, tarifa_minima: 85,
        limite_edad: 70,
        ambito: 'Internacional/Nacional',
        activo: true, vigencia_desde: '2025-01-01', fuente: 'API_COTIZADOR'
    },
    // ── 100K Grupal (detectado en HAR real del Portal Partners) ──
    {
        producto_id: 'URU_100K_GRUPAL', codigo_externo: '1-FJFOTUQ',
        nombre_comercial: '100K Grupal', familia: 'Value',
        tipo_producto: 'DIARIO', cobertura_principal_usd: 100000,
        tarifa_diaria_base: 5.0, tarifa_minima: 40,
        limite_edad: 70,
        ambito: 'Internacional/Nacional',
        activo: true, vigencia_desde: '2025-01-01', fuente: 'PARTNERS-HAR-001'
    }
];

// ═══════════════════════════════════════════════════════════════════════
// 3.4 — COBERTURAS / BENEFICIOS REALES
// Fuente: CAT-002_VALUE.xlsx, CAT-002_EXCELLENCE.xlsx, CAT-001 PDFs,
//         PARTNERS-HAR-000 (jsProductos)
// ═══════════════════════════════════════════════════════════════════════

const dbBeneficios = [
    // ── VALUE 80K (datos REALES de CAT-002_VALUE.xlsx) ──
    { beneficio_id: 'VAL_MED',     producto_id: 'VALUE_80K', nombre_beneficio: 'Asistencia médica por enfermedad',              categoria: 'MEDICA',    valor: 80000,  moneda: 'USD' },
    { beneficio_id: 'VAL_ACC',     producto_id: 'VALUE_80K', nombre_beneficio: 'Asistencia médica por accidente',               categoria: 'MEDICA',    valor: 80000,  moneda: 'USD' },
    { beneficio_id: 'VAL_PREEX',   producto_id: 'VALUE_80K', nombre_beneficio: 'Asistencia médica por pre-existencia',          categoria: 'MEDICA',    valor: 7000,   moneda: 'USD' },
    { beneficio_id: 'VAL_COVID',   producto_id: 'VALUE_80K', nombre_beneficio: 'Asistencia médica por COVID-19',                categoria: 'MEDICA',    valor: 80000,  moneda: 'USD' },
    { beneficio_id: 'VAL_MED_AMB', producto_id: 'VALUE_80K', nombre_beneficio: 'Medicamentos internación o ambulatorio',        categoria: 'MEDICA',    valor: 2000,   moneda: 'USD' },
    { beneficio_id: 'VAL_ODONTO',  producto_id: 'VALUE_80K', nombre_beneficio: 'Odontología',                                   categoria: 'MEDICA',    valor: 500,    moneda: 'USD' },
    { beneficio_id: 'VAL_EQUIP',   producto_id: 'VALUE_80K', nombre_beneficio: 'Pérdida de equipaje complementaria',            categoria: 'EQUIPAJE',  valor: 2000,   moneda: 'USD' },
    { beneficio_id: 'VAL_DEMORA',  producto_id: 'VALUE_80K', nombre_beneficio: 'Demora de equipaje (8 horas)',                  categoria: 'EQUIPAJE',  valor: 300,    moneda: 'USD' },
    { beneficio_id: 'VAL_VUELO',   producto_id: 'VALUE_80K', nombre_beneficio: 'Gastos por vuelo demorado (+6 hs)',             categoria: 'VIAJE',     valor: 150,    moneda: 'USD' },
    { beneficio_id: 'VAL_CANCEL',  producto_id: 'VALUE_80K', nombre_beneficio: 'Cancelación/interrupción c/restricción (h/70)', categoria: 'VIAJE',     valor: 2000,   moneda: 'USD' },
    { beneficio_id: 'VAL_DEP',     producto_id: 'VALUE_80K', nombre_beneficio: 'Práctica recreativa de deportes',               categoria: 'DEPORTE',   valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'VAL_EMB',     producto_id: 'VALUE_80K', nombre_beneficio: 'Asistencia embarazadas (hasta semana 26)',       categoria: 'MEDICA',    valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'VAL_LEGAL',   producto_id: 'VALUE_80K', nombre_beneficio: 'Asistencia legal en caso de accidente',         categoria: 'LEGAL',     valor: 1500,   moneda: 'USD' },
    { beneficio_id: 'VAL_FIANZA',  producto_id: 'VALUE_80K', nombre_beneficio: 'Anticipo de fondos para fianza',                categoria: 'LEGAL',     valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'VAL_FONDOS',  producto_id: 'VALUE_80K', nombre_beneficio: 'Transferencia de fondos',                       categoria: 'LEGAL',     valor: 2500,   moneda: 'USD' },
    { beneficio_id: 'VAL_GIFT',    producto_id: 'VALUE_80K', nombre_beneficio: 'Secure Gift',                                   categoria: 'OTRO',      valor: 500,    moneda: 'USD' },
    { beneficio_id: 'VAL_HOTEL',   producto_id: 'VALUE_80K', nombre_beneficio: 'Gastos de hotel por convalecencia (total)',      categoria: 'MEDICA',    valor: 800,    moneda: 'USD' },
    { beneficio_id: 'VAL_CRUCERO', producto_id: 'VALUE_80K', nombre_beneficio: 'Válido en cruceros',                            categoria: 'OTRO',      valor: 'Incluido', moneda: null },
    { beneficio_id: 'VAL_TELE',    producto_id: 'VALUE_80K', nombre_beneficio: 'Teleasistencia',                                categoria: 'MEDICA',    valor: 'Incluido', moneda: null },
    { beneficio_id: 'VAL_REPAT',   producto_id: 'VALUE_80K', nombre_beneficio: 'Traslado y repatriación sanitaria',             categoria: 'MEDICA',    valor: 'Incluido', moneda: null },

    // ── EXCELLENCE 150K (datos REALES de CAT-002_EXCELLENCE.xlsx) ──
    { beneficio_id: 'EXC_MED',     producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Asistencia médica enfermedad o accidente',  categoria: 'MEDICA',   valor: 150000, moneda: 'USD' },
    { beneficio_id: 'EXC_COVID',   producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Asistencia médica por COVID-19',            categoria: 'MEDICA',   valor: 150000, moneda: 'USD' },
    { beneficio_id: 'EXC_PREEX',   producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Asistencia médica por pre-existencia',      categoria: 'MEDICA',   valor: 3000,   moneda: 'USD' },
    { beneficio_id: 'EXC_NAC',     producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Asistencia médica nacional enf./acc.',      categoria: 'MEDICA',   valor: 37500,  moneda: 'USD' },
    { beneficio_id: 'EXC_MED_AMB', producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Medicamentos ambulatorio',                  categoria: 'MEDICA',   valor: 3000,   moneda: 'USD' },
    { beneficio_id: 'EXC_ODONTO',  producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Odontología',                               categoria: 'MEDICA',   valor: 1000,   moneda: 'USD' },
    { beneficio_id: 'EXC_EQUIP',   producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Pérdida de equipaje suplementaria',         categoria: 'EQUIPAJE', valor: 2000,   moneda: 'USD' },
    { beneficio_id: 'EXC_DEMORA',  producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Demora de equipaje (8 horas)',              categoria: 'EQUIPAJE', valor: 400,    moneda: 'USD' },
    { beneficio_id: 'EXC_VUELO',   producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Gastos por vuelo demorado (+6 hs)',         categoria: 'VIAJE',    valor: 200,    moneda: 'USD' },
    { beneficio_id: 'EXC_CANCEL',  producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Cancelación/interrupción c/restricción (h/70)', categoria: 'VIAJE', valor: 2000,  moneda: 'USD' },
    { beneficio_id: 'EXC_DEP',     producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Práctica recreativa de deportes',           categoria: 'DEPORTE',  valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'EXC_EMB',     producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Asistencia embarazadas (hasta semana 26)',   categoria: 'MEDICA',   valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'EXC_LEGAL',   producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Asistencia legal en caso de accidente',     categoria: 'LEGAL',    valor: 1500,   moneda: 'USD' },
    { beneficio_id: 'EXC_FIANZA',  producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Anticipo de fondos para fianza',            categoria: 'LEGAL',    valor: 12000,  moneda: 'USD' },
    { beneficio_id: 'EXC_FONDOS',  producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Transferencia de fondos',                   categoria: 'LEGAL',    valor: 5000,   moneda: 'USD' },
    { beneficio_id: 'EXC_GIFT',    producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Secure Gift',                               categoria: 'OTRO',     valor: 500,    moneda: 'USD' },
    { beneficio_id: 'EXC_HOTEL',   producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Gastos de hotel por convalecencia (total)',  categoria: 'MEDICA',   valor: 1000,   moneda: 'USD' },
    { beneficio_id: 'EXC_TELE',    producto_id: 'EXCELLENCE_150K', nombre_beneficio: 'Teleasistencia',                            categoria: 'MEDICA',   valor: 'Incluido', moneda: null },

    // ── MAXIMUM 300K (datos del portal + CORP-000) ──
    { beneficio_id: 'MAX_MED',     producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Asistencia médica enfermedad o accidente',  categoria: 'MEDICA',   valor: 300000, moneda: 'USD' },
    { beneficio_id: 'MAX_COVID',   producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Asistencia médica por COVID-19',            categoria: 'MEDICA',   valor: 300000, moneda: 'USD' },
    { beneficio_id: 'MAX_PREEX',   producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Asistencia médica por pre-existencia',      categoria: 'MEDICA',   valor: 25000,  moneda: 'USD' },
    { beneficio_id: 'MAX_NAC',     producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Asistencia médica nacional enf./acc.',      categoria: 'MEDICA',   valor: 75000,  moneda: 'USD' },
    { beneficio_id: 'MAX_MED_AMB', producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Medicamentos ambulatorio',                  categoria: 'MEDICA',   valor: 3000,   moneda: 'USD' },
    { beneficio_id: 'MAX_ODONTO',  producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Odontología',                               categoria: 'MEDICA',   valor: 3000,   moneda: 'USD' },
    { beneficio_id: 'MAX_EQUIP',   producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Pérdida de equipaje complementaria',        categoria: 'EQUIPAJE', valor: 2000,   moneda: 'USD' },
    { beneficio_id: 'MAX_HOTEL',   producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Gastos de hotel por convalecencia',         categoria: 'MEDICA',   valor: 15000,  moneda: 'USD' },
    { beneficio_id: 'MAX_DEP',     producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Práctica recreativa de deportes',           categoria: 'DEPORTE',  valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'MAX_TELE',    producto_id: 'MAXIMUM_300K', nombre_beneficio: 'Teleasistencia',                            categoria: 'MEDICA',   valor: 'Incluido', moneda: null },
    { beneficio_id: 'MAX_VIP',     producto_id: 'MAXIMUM_300K', nombre_beneficio: 'VIP Delay',                                 categoria: 'VIAJE',    valor: 'Incluido', moneda: null },

    // ── EXCLUSIVE 500K ──
    { beneficio_id: 'EXCL_MED',    producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Asistencia médica enfermedad o accidente', categoria: 'MEDICA',   valor: 500000, moneda: 'USD' },
    { beneficio_id: 'EXCL_COVID',  producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Asistencia médica por COVID-19',           categoria: 'MEDICA',   valor: 250000, moneda: 'USD' },
    { beneficio_id: 'EXCL_PREEX',  producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Asistencia médica por pre-existencia',     categoria: 'MEDICA',   valor: 30000,  moneda: 'USD' },
    { beneficio_id: 'EXCL_NAC',    producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Asistencia médica nacional enf./acc.',     categoria: 'MEDICA',   valor: 90000,  moneda: 'USD' },
    { beneficio_id: 'EXCL_MED_AMB',producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Medicamentos ambulatorio',                 categoria: 'MEDICA',   valor: 5000,   moneda: 'USD' },
    { beneficio_id: 'EXCL_ODONTO', producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Odontología',                              categoria: 'MEDICA',   valor: 5000,   moneda: 'USD' },
    { beneficio_id: 'EXCL_EQUIP',  producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Pérdida de equipaje complementaria',       categoria: 'EQUIPAJE', valor: 2500,   moneda: 'USD' },
    { beneficio_id: 'EXCL_HOTEL',  producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Gastos de hotel por convalecencia',        categoria: 'MEDICA',   valor: 20000,  moneda: 'USD' },
    { beneficio_id: 'EXCL_DEP',    producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Deportes',                                 categoria: 'DEPORTE',  valor: 17000,  moneda: 'USD' },
    { beneficio_id: 'EXCL_TELE',   producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'Teleasistencia',                           categoria: 'MEDICA',   valor: 'Incluido', moneda: null },
    { beneficio_id: 'EXCL_VIP',    producto_id: 'EXCLUSIVE_500K', nombre_beneficio: 'VIP Delay',                                categoria: 'VIAJE',    valor: 'Incluido', moneda: null },

    // ── 100K GRUPAL (datos del HAR real) ──
    { beneficio_id: 'G100_MED',    producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Asistencia médica enfermedad/accidente',   categoria: 'MEDICA',   valor: 100000, moneda: 'USD' },
    { beneficio_id: 'G100_COVID',  producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Asistencia médica por COVID-19',           categoria: 'MEDICA',   valor: 100000, moneda: 'USD' },
    { beneficio_id: 'G100_PREEX',  producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Pre-existencia',                          categoria: 'MEDICA',   valor: 2000,   moneda: 'USD' },
    { beneficio_id: 'G100_NAC',    producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Asistencia médica nacional enf./acc.',     categoria: 'MEDICA',   valor: 20000,  moneda: 'USD' },
    { beneficio_id: 'G100_EQUIP',  producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Pérdida de equipaje complementaria',      categoria: 'EQUIPAJE', valor: 1000,   moneda: 'USD' },
    { beneficio_id: 'G100_DEP',    producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Práctica recreativa de deportes',          categoria: 'DEPORTE',  valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'G100_EMB',    producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Asistencia embarazadas (hasta semana 26)', categoria: 'MEDICA',   valor: 10000,  moneda: 'USD' },
    { beneficio_id: 'G100_TELE',   producto_id: 'URU_100K_GRUPAL', nombre_beneficio: 'Teleasistencia',                          categoria: 'MEDICA',   valor: 'Incluido', moneda: null }
];

// ═══════════════════════════════════════════════════════════════════════
// 3.5 — CONVENIOS REALES (Fuente: REQ-001_CONVENIOS_DE_SALUD_Y_BANCOS.xlsx)
// ═══════════════════════════════════════════════════════════════════════

const dbConvenios = [
    // ── Salud (con cápita) ──
    { convenio_id: 'SEMM_UY',       nombre: 'SEMM',                 organizacion_emisora: 'SEMM',                      tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.30, 'EXCLUSIVE_500K': 0.20 } },
    { convenio_id: 'SEMM_CALL_UY',  nombre: 'SEMM Call',            organizacion_emisora: 'SEMM CALL',                 tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.30, 'EXCLUSIVE_500K': 0.20 } },
    { convenio_id: 'MP_UY',         nombre: 'Medicina Personalizada', organizacion_emisora: 'MEDICINA PERSONALIDA',     tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'H_EVANG_UY',    nombre: 'Hospital Evangélico',  organizacion_emisora: 'HOSPITAL EVANGELICO',        tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'CASMU_UY',      nombre: 'CASMU',                organizacion_emisora: 'CASMU',                      tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'ASOC_ESP_UY',   nombre: 'Asociación Española',  organizacion_emisora: 'ASOCIACION ESPAÑOLA',        tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'SUMMUM_UY',     nombre: 'Summum',               organizacion_emisora: 'SUMMUM TRAVEL',               tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'AMECOM_UY',     nombre: 'AMECOM',               organizacion_emisora: 'AMECOM',                      tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'SMI_UY',        nombre: 'SMI',                  organizacion_emisora: 'SMI',                          tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'SEG_AMER_UY',   nombre: 'Seguro Americano',     organizacion_emisora: 'SEGURO AMERICANO',             tipo_convenio: 'SALUD',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    // ── Salud (sin cápita) ──
    { convenio_id: 'AMSJ_UY',       nombre: 'Asoc. Médica San José', organizacion_emisora: 'AMSJ',                       tipo_convenio: 'SALUD',  tiene_capita: false, vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.05, 'MAXIMUM_300K': 0.10, 'EXCLUSIVE_500K': 0.10 } },
    { convenio_id: 'COMERO_UY',     nombre: 'COMERO',               organizacion_emisora: 'COMERO',                       tipo_convenio: 'SALUD',  tiene_capita: false, vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.05, 'MAXIMUM_300K': 0.10, 'EXCLUSIVE_500K': 0.10 } },
    { convenio_id: 'SAPP_UY',       nombre: 'SAPP',                 organizacion_emisora: 'SAPP',                         tipo_convenio: 'SALUD',  tiene_capita: false, vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.05, 'MAXIMUM_300K': 0.10, 'EXCLUSIVE_500K': 0.10 } },
    { convenio_id: 'SAT_UY',        nombre: 'SAT',                  organizacion_emisora: 'SAT',                           tipo_convenio: 'SALUD',  tiene_capita: false, vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.05, 'MAXIMUM_300K': 0.10, 'EXCLUSIVE_500K': 0.10 } },
    // ── Bancos ──
    { convenio_id: 'OCA_UY',        nombre: 'OCA',                  organizacion_emisora: 'OCA',                           tipo_convenio: 'BANCO',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.15, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'ITAU_UY',       nombre: 'Itaú',                 organizacion_emisora: 'METLIFE ITAU',                  tipo_convenio: 'BANCO',  tiene_capita: true,  vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.20, 'EXCLUSIVE_500K': 0.15 } },
    { convenio_id: 'BBVA_UY',       nombre: 'BBVA',                 organizacion_emisora: 'BBVA',                          tipo_convenio: 'BANCO',  tiene_capita: false, vende_oficina_propia: false, vende_oficina_convenio: true,  activo: true,
      reglas_precio: { 'VALUE_80K': 0.05, 'MAXIMUM_300K': 0.10, 'EXCLUSIVE_500K': 0.10 } },
    // ── Tarjetas ──
    { convenio_id: 'MASTER_UY',     nombre: 'Mastercard',           organizacion_emisora: 'MASTERCARD',                    tipo_convenio: 'TARJETA', tiene_capita: false, vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.05, 'MAXIMUM_300K': 0.10, 'EXCLUSIVE_500K': 0.10 } },
    { convenio_id: 'SANTANDER_UY',  nombre: 'Santander',            organizacion_emisora: 'SANTANDER',                     tipo_convenio: 'BANCO',  tiene_capita: false, vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.25, 'EXCLUSIVE_500K': 0.20 } },
    { convenio_id: 'SANTANDER_MC',  nombre: 'Santander Mastercard', organizacion_emisora: 'SANTANDER',                     tipo_convenio: 'BANCO',  tiene_capita: false, vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: { 'VALUE_80K': 0.10, 'MAXIMUM_300K': 0.25, 'EXCLUSIVE_500K': 0.20 } },
    // ── Folleto / Sin convenio ──
    { convenio_id: 'FOLLETO',       nombre: 'Folleto (sin convenio)', organizacion_emisora: 'SURVIEW',                     tipo_convenio: 'DIRECTO', tiene_capita: false, vende_oficina_propia: true,  vende_oficina_convenio: false, activo: true,
      reglas_precio: {} }
];

// ═══════════════════════════════════════════════════════════════════════
// 3.7 — ADICIONALES / MÓDULOS
// ═══════════════════════════════════════════════════════════════════════

const dbAdicionales = [
    { adicional_id: 'PREEX_EXT',  nombre: 'Preexistencias Extendidas',  tipo: 'MEDICO',   tarifa_diaria: 4.5,  is_fixed: false, activo: true },
    { adicional_id: 'TECH_PRO',   nombre: 'Tecnología Protegida',       tipo: 'EQUIPAJE', tarifa_diaria: 15,   is_fixed: false, activo: true },
    { adicional_id: 'DEP_ADV',    nombre: 'Deportes de Aventura',       tipo: 'DEPORTIVO', tarifa_diaria: 8,   is_fixed: false, activo: true },
    { adicional_id: 'CANC_VIAJE', nombre: 'Cancel. de Viaje',           tipo: 'SEGURO',   tarifa_diaria: 3.5,  is_fixed: false, activo: true },
    { adicional_id: 'EMBARAZO',   nombre: 'Cobertura Embarazo',         tipo: 'MEDICO',   tarifa_diaria: 6,    is_fixed: false, activo: true },
    { adicional_id: 'MASCOTAS',   nombre: 'Mascotas',                   tipo: 'MASCOTA',  tarifa_fija: 10,     is_fixed: true,  activo: true }
];

// ═══════════════════════════════════════════════════════════════════════
// REPOSITORIO DE DATOS (API Interna)
// ═══════════════════════════════════════════════════════════════════════

const DataRepository = {
    getDestinos:          ()       => dbDestinos.filter(d => d.activo),
    getZonaById:          (id)     => dbZonasTarifarias.find(z => z.zona_id === id),
    getZonaByDestinoId:   (destId) => { const d = dbDestinos.find(x => x.destino_id === destId); return d ? dbZonasTarifarias.find(z => z.zona_id === d.zona_tarifaria) : null; },
    
    getProductos:         ()       => dbProductos.filter(p => p.activo),
    getProductoById:      (id)     => dbProductos.find(p => p.producto_id === id),
    getProductosByFamilia:(fam)    => dbProductos.filter(p => p.activo && p.familia === fam),
    
    // Filtra productos elegibles por edad del pasajero mayor
    getProductosElegibles: (edadMaxPasajero) => {
        return dbProductos.filter(p => {
            if (!p.activo) return false;
            if (p.edad_minima && edadMaxPasajero < p.edad_minima) return false;
            if (p.limite_edad && p.limite_edad < 999 && edadMaxPasajero > p.limite_edad) return false;
            return true;
        });
    },
    
    getBeneficiosByProducto: (prodId) => dbBeneficios.filter(b => b.producto_id === prodId),
    
    getConvenios:         ()       => dbConvenios.filter(c => c.activo),
    getConvenioById:      (id)     => dbConvenios.find(c => c.convenio_id === id),
    getConveniosByTipo:   (tipo)   => dbConvenios.filter(c => c.activo && c.tipo_convenio === tipo),
    
    getAdicionalById:     (id)     => dbAdicionales.find(a => a.adicional_id === id),
    getAdicionales:       ()       => dbAdicionales.filter(a => a.activo)
};
