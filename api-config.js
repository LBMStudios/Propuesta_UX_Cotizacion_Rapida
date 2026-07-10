/* ========================================================================
   UNIVERSAL ASSISTANCE — Adaptador de API del Portal Partners
   Fuente: PARTNERS-HAR-000, TEC-001
   
   Este módulo abstrae la fuente de precios. Actualmente usa el motor local,
   pero está preparado para switchear a la API real del Portal Partners
   cuando se dispongan de credenciales.
   ======================================================================== */

const ApiConfig = {
    // ── Configuración ──
    modo: 'LOCAL', // 'LOCAL' | 'API_PARTNERS' | 'MOCK'
    
    // Endpoints reales del Portal Partners Uruguay (de PARTNERS-HAR-000)
    ENDPOINTS: {
        base_url: 'https://partners.universal-assistance.com',
        recotizar:            '/Emision/Recotizar?culture=es',
        prefiltros:           '/Emision/GetPrefiltros',
        tipo_viaje:           '/Emision/GetTipoViajePrefiltroTipoProducto',
        completar_datos:      '/portal-de-partners-completar-datos-de-pasajeros',
        imprimir_detalle:     '/Emision/ImprimirDetalleProducto',
        imprimir_cotizacion:  '/Emision/ImprimirCotizacion',
        enviar_por_mail:      '/Emision/EnviarCotizacionPorMail',
        numeros_precompra:    '/Emision/GetNumerosPrecompra',
        validar_limite:       '/Emision/ValidarPopupLimiteCredito',
        continuar_credito:    '/Emision/PopupABtnContinuar'
    },

    // Datos de agencia detectados en HAR (SURVIEW)
    AGENCIA: {
        codigo: '1-QN2H3',
        nombre: 'SURVIEW',
        pais: 'Uruguay',
        canal_venta: 'Retail',
        moneda: 'USD',
        permite_precompra: true,
        cobro_obligatorio: true
    },

    // ── Cotizar ──
    async cotizar(params) {
        switch (this.modo) {
            case 'LOCAL':
                return this._cotizarLocal(params);
            case 'API_PARTNERS':
                return this._cotizarAPI(params);
            default:
                return this._cotizarLocal(params);
        }
    },

    _cotizarLocal(params) {
        return MotorCotizacion.generarCotizacion(params);
    },

    async _cotizarAPI(params) {
        const payload = {
            fechaSalida: params.fecha_inicio,
            fechaRegreso: params.fecha_fin,
            cantidadPasajeros: params.pax.adultos + params.pax.mayores + params.pax.menores,
            edades: this._buildEdades(params.pax),
            destino: params.destino_nombre,
            agencia: this.AGENCIA.codigo
        };

        try {
            const response = await fetch(this.ENDPOINTS.base_url + this.ENDPOINTS.recotizar, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(payload),
                credentials: 'include'
            });

            if (!response.ok) {
                console.warn('[ApiConfig] API Partners no disponible, fallback a motor local');
                return this._cotizarLocal(params);
            }

            const html = await response.text();
            return this._parseJsProductos(html, params);
        } catch (err) {
            console.warn('[ApiConfig] Error conectando a API Partners:', err.message);
            return this._cotizarLocal(params);
        }
    },

    _parseJsProductos(html, params) {
        const match = html.match(/var\s+jsProductos\s*=\s*(\[[\s\S]*?\]);/);
        if (!match) return this._cotizarLocal(params);

        try {
            const productos = JSON.parse(match[1]);
            return {
                cotizacion_id: `COT-API-${Date.now()}`,
                fecha_cotizacion: new Date().toISOString(),
                productos_ofrecidos: productos.map(p => ({
                    producto_id: p.Codigo,
                    codigo_externo: p.Codigo,
                    nombre_comercial: p.NombreProducto,
                    familia: p.Familia,
                    elegible: true,
                    importe_cotizado_original: parseFloat(p.PrecioEmision),
                    importe_cotizado_final: parseFloat(p.PrecioEmision),
                    beneficios_snapshot: this._parseAtributos(p.Atributos)
                })),
                fuente_precio: 'API_PARTNERS_REAL',
                estado_cotizacion: 'BORRADOR'
            };
        } catch (e) {
            return this._cotizarLocal(params);
        }
    },

    _parseAtributos(attrStr) {
        if (!attrStr) return [];
        try {
            const attrs = JSON.parse(attrStr);
            return Object.entries(attrs).map(([key, val]) => ({
                nombre_beneficio: key, valor: val, moneda: typeof val === 'number' ? 'USD' : null
            }));
        } catch (e) { return []; }
    },

    _buildEdades(pax) {
        const edades = [];
        for (let i = 0; i < pax.adultos; i++) edades.push(35);
        for (let i = 0; i < pax.mayores; i++) edades.push(72);
        for (let i = 0; i < pax.menores; i++) edades.push(10);
        return edades;
    },

    descargarPDF(codigoProducto) {
        if (this.modo === 'LOCAL') {
            alert('Descarga de PDF no disponible en modo local.\nSe habilitará al conectar con el Portal Partners.');
            return;
        }
        window.open(`${this.ENDPOINTS.base_url}${this.ENDPOINTS.imprimir_cotizacion}?codigoProducto=${encodeURIComponent(codigoProducto)}&nombrePDF=CotizacionEmisionPDF`, '_blank');
    },

    getStatus() {
        return {
            modo: this.modo,
            api_disponible: this.modo === 'API_PARTNERS',
            agencia: this.AGENCIA.nombre,
            endpoints_configurados: Object.keys(this.ENDPOINTS).length - 1
        };
    }
};
