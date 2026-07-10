/* ========================================================================
   UNIVERSAL ASSISTANCE — Motor de Cotización (Core Business Logic)
   ======================================================================== */

// Depende de DataRepository (de data-maestros.js)

class MotorCotizacion {
    
    // Función principal para generar el modelo transaccional "Cotizacion"
    static generarCotizacion(inputs) {
        const { 
            destino_nombre, 
            fecha_inicio, 
            fecha_fin, 
            dias, 
            pax, // { adultos: 1, mayores: 1, menores: 0 }
            convenio_id, 
            adicionales_ids // ['PREEX_EXT', 'TECH_PRO']
        } = inputs;

        // 1. Resolver Destino y Zona Tarifaria
        // NOTA: Para compatibilidad con el UI actual, mapeamos el string del select al destino.
        let destino = DataRepository.getDestinos().find(d => d.pais_nombre === destino_nombre);
        if (!destino) {
            // Fallback por si hay diferencias de texto
            destino = DataRepository.getDestinos().find(d => d.pais_nombre.includes(destino_nombre.substring(0, 5))) || DataRepository.getDestinos()[0];
        }
        
        const zona = DataRepository.getZonaById(destino.zona_tarifaria);
        const factorDestino = zona ? zona.factor_precio : 1.0;

        // 2. Resolver Factor de Duración (Regla comercial)
        const factorDias = this._factorDuracion(dias);

        // 3. Obtener Productos y Filtrar por Convenio
        let productos = DataRepository.getProductos();
        let convenio = null;
        if (convenio_id) {
            convenio = DataRepository.getConvenioById(convenio_id);
            if (convenio && convenio.productos_habilitados && convenio.productos_habilitados.length > 0) {
                productos = productos.filter(p => convenio.productos_habilitados.includes(p.producto_id));
            }
        }

        // 4. Calcular Precio por Producto
        const productosOfrecidos = productos.map(prod => {
            // Tarifa base individual (adulto/día)
            const precioPorDiaAdulto = prod.tarifa_diaria_base * factorDestino * factorDias;
            const tarifaMinimaAdulto = Math.max(precioPorDiaAdulto * dias, prod.tarifa_minima);

            // Calcular por tipo de pasajero según edad
            let precioTotalOriginal = 0;
            
            // Adultos (Factor 1.0)
            precioTotalOriginal += (tarifaMinimaAdulto * 1.0) * pax.adultos;
            
            // Mayores +65 (Factor 1.5 - Prototipo)
            precioTotalOriginal += (tarifaMinimaAdulto * 1.5) * pax.mayores;
            
            // Menores hasta 17 (Factor 0.65 - Prototipo)
            precioTotalOriginal += (tarifaMinimaAdulto * 0.65) * pax.menores;

            // Descuentos de Convenio
            let descuentoPorcentaje = 0;
            if (convenio && convenio.reglas_precio[prod.producto_id]) {
                descuentoPorcentaje = convenio.reglas_precio[prod.producto_id];
            }

            const descuentoMonto = precioTotalOriginal * descuentoPorcentaje;
            let precioFinal = precioTotalOriginal - descuentoMonto;

            // Adicionales
            let precioAdicionales = 0;
            let extrasSnapshot = [];
            const totalPax = pax.adultos + pax.mayores + pax.menores;
            
            if (adicionales_ids && adicionales_ids.length > 0) {
                adicionales_ids.forEach(addId => {
                    const ad = DataRepository.getAdicionalById(addId);
                    if (ad) {
                        const costoAdicional = ad.is_fixed ? (ad.tarifa_fija * totalPax) : (ad.tarifa_diaria * dias * totalPax);
                        precioAdicionales += costoAdicional;
                        extrasSnapshot.push({ adicional_id: ad.adicional_id, nombre: ad.nombre, costo: costoAdicional });
                    }
                });
            }

            precioFinal += precioAdicionales;

            return {
                producto_id: prod.producto_id,
                codigo_externo: prod.codigo_externo,
                nombre_comercial: prod.nombre_comercial,
                importe_cotizado_original: Math.round(precioTotalOriginal),
                descuento_porcentaje: Math.round(descuentoPorcentaje * 100),
                descuento_aplicado: Math.round(descuentoMonto),
                importe_cotizado_final: Math.round(precioFinal),
                extras: extrasSnapshot,
                beneficios_snapshot: DataRepository.getBeneficiosByProducto(prod.producto_id)
            };
        });

        // 5. Devolver el JSON Transaccional (Cotizacion)
        return {
            cotizacion_id: `COT-${Date.now()}`,
            lead_id: null, // Se asignaría si viene del CRM
            fecha_cotizacion: new Date().toISOString(),
            destino_id: destino.destino_id,
            zona_tarifaria: zona.zona_id,
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin,
            dias: parseInt(dias) || 1,
            cantidad_pasajeros: pax.adultos + pax.mayores + pax.menores,
            pasajeros: { ...pax }, // Snapshot de configuración
            convenio_id: convenio ? convenio.convenio_id : null,
            productos_ofrecidos: productosOfrecidos,
            fuente_precio: 'API_COTIZADOR_LOCAL',
            estado_cotizacion: 'BORRADOR'
        };
    }

    // Regla de Negocio: Factor por duración
    static _factorDuracion(dias) {
        if (dias <= 5) return 1.15;
        if (dias <= 10) return 1.0;
        if (dias <= 15) return 0.92;
        if (dias <= 30) return 0.85;
        if (dias <= 60) return 0.78;
        if (dias <= 90) return 0.72;
        return 0.65;
    }
}
