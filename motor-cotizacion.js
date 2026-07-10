/* ========================================================================
   UNIVERSAL ASSISTANCE — Motor de Cotización (Core Business Logic)
   v2.0 — Con reglas de elegibilidad por edad y estados CRM
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
        let destino = DataRepository.getDestinos().find(d => d.pais_nombre === destino_nombre);
        if (!destino) {
            destino = DataRepository.getDestinos().find(d => d.pais_nombre.includes(destino_nombre.substring(0, 5))) || DataRepository.getDestinos()[0];
        }
        
        const zona = DataRepository.getZonaById(destino.zona_tarifaria);
        const factorDestino = zona ? zona.factor_precio : 1.0;

        // 2. Resolver Factor de Duración (Regla comercial)
        const factorDias = this._factorDuracion(dias);

        // 3. Obtener Productos y resolver Convenio
        let productos = DataRepository.getProductos();
        let convenio = null;
        if (convenio_id) {
            convenio = DataRepository.getConvenioById(convenio_id);
        }

        // 4. Resolver elegibilidad por edad (COT-001, Paso 3)
        // La categoría "mayores" en la UI corresponde a pasajeros 65+.
        // Si hay pasajeros "mayores", la edad máxima estimada es 71+ (conservador).
        const edadMaxEstimada = pax.mayores > 0 ? 71 : (pax.adultos > 0 ? 65 : 17);
        const hayMayores70 = pax.mayores > 0;

        // 5. Calcular Precio por Producto
        const productosOfrecidos = productos.map(prod => {
            // ── ELEGIBILIDAD POR EDAD ──
            const limiteEdad = prod.limite_edad || 999;
            const edadMinima = prod.edad_minima || 0;
            let elegible = true;
            let motivo_no_elegible = null;

            // Productos con límite 70 años: NO elegibles si hay pasajeros mayores de 70
            if (hayMayores70 && limiteEdad <= 70 && !prod.edad_minima) {
                elegible = false;
                motivo_no_elegible = `Límite de edad: ${limiteEdad} años. Pasajero(s) mayor(es) de 70.`;
            }
            // Productos "Mayores" (edad mínima 71+): NO elegibles si NO hay pasajeros mayores
            if (edadMinima > 0 && !hayMayores70) {
                elegible = false;
                motivo_no_elegible = `Solo disponible para pasajeros de ${edadMinima}+ años.`;
            }

            // ── CÁLCULO DE PRECIO ──
            const precioPorDiaAdulto = prod.tarifa_diaria_base * factorDestino * factorDias;
            const tarifaMinimaAdulto = Math.max(precioPorDiaAdulto * dias, prod.tarifa_minima);

            let precioTotalOriginal = 0;
            
            // Adultos 18-64 (Factor 1.0)
            precioTotalOriginal += (tarifaMinimaAdulto * 1.0) * pax.adultos;
            
            // Mayores +65 (Factor 1.5 — COT-001: recargo por edad)
            precioTotalOriginal += (tarifaMinimaAdulto * 1.5) * pax.mayores;
            
            // Menores hasta 17 (Factor 0.65 — descuento menores)
            precioTotalOriginal += (tarifaMinimaAdulto * 0.65) * pax.menores;

            // ── DESCUENTOS DE CONVENIO ──
            let descuentoPorcentaje = 0;
            if (convenio && convenio.reglas_precio[prod.producto_id]) {
                descuentoPorcentaje = convenio.reglas_precio[prod.producto_id];
            }

            const descuentoMonto = precioTotalOriginal * descuentoPorcentaje;
            let precioFinal = precioTotalOriginal - descuentoMonto;

            // ── ADICIONALES ──
            let precioAdicionales = 0;
            let extrasSnapshot = [];
            const totalPax = pax.adultos + pax.mayores + pax.menores;
            
            if (adicionales_ids && adicionales_ids.length > 0) {
                adicionales_ids.forEach(addId => {
                    const ad = DataRepository.getAdicionalById(addId);
                    if (ad) {
                        const costoAdicional = ad.is_fixed ? (ad.tarifa_fija * totalPax) : (ad.tarifa_diaria * dias * totalPax);
                        precioAdicionales += costoAdicional;
                        extrasSnapshot.push({ adicional_id: ad.adicional_id, nombre: ad.nombre, costo: Math.round(costoAdicional) });
                    }
                });
            }

            precioFinal += precioAdicionales;

            return {
                producto_id: prod.producto_id,
                codigo_externo: prod.codigo_externo,
                nombre_comercial: prod.nombre_comercial,
                familia: prod.familia,
                cobertura_principal_usd: prod.cobertura_principal_usd,
                limite_edad: limiteEdad < 999 ? limiteEdad : null,
                elegible: elegible,
                motivo_no_elegible: motivo_no_elegible,
                importe_cotizado_original: Math.round(precioTotalOriginal),
                descuento_porcentaje: Math.round(descuentoPorcentaje * 100),
                descuento_aplicado: Math.round(descuentoMonto),
                importe_cotizado_final: Math.round(precioFinal),
                extras: extrasSnapshot,
                beneficios_snapshot: DataRepository.getBeneficiosByProducto(prod.producto_id)
            };
        });

        // 6. Alertas de elegibilidad
        const alertas = [];
        if (hayMayores70) {
            const prodNoElegibles = productosOfrecidos.filter(p => !p.elegible && p.motivo_no_elegible);
            if (prodNoElegibles.length > 0) {
                alertas.push({
                    tipo: 'EDAD',
                    severidad: 'WARNING',
                    mensaje: `${prodNoElegibles.length} producto(s) no disponible(s) para pasajeros mayores de 70 años.`,
                    productos_afectados: prodNoElegibles.map(p => p.nombre_comercial)
                });
            }
            // Sugerencia del producto "Mayores"
            const prodMayores = productosOfrecidos.find(p => p.producto_id === 'VALUE_PREEX7_MAYORES' && p.elegible);
            if (prodMayores) {
                alertas.push({
                    tipo: 'SUGERENCIA',
                    severidad: 'INFO',
                    mensaje: `Para pasajeros +70 se recomienda: ${prodMayores.nombre_comercial} (USD ${prodMayores.cobertura_principal_usd / 1000}K, preex USD 7.000).`
                });
            }
        }

        // 7. Devolver el JSON Transaccional (Cotizacion)
        return {
            cotizacion_id: `COT-${Date.now()}`,
            lead_id: null,
            fecha_cotizacion: new Date().toISOString(),
            destino_id: destino.destino_id,
            zona_tarifaria: zona.zona_id,
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin,
            dias: parseInt(dias) || 1,
            cantidad_pasajeros: pax.adultos + pax.mayores + pax.menores,
            pasajeros: { ...pax },
            convenio_id: convenio ? convenio.convenio_id : null,
            productos_ofrecidos: productosOfrecidos,
            alertas: alertas,
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

// ═══════════════════════════════════════════════════════════════════════
// PLANTILLAS DE MENSAJE (Fuente: ENV-004)
// Estados CRM y templates según tipo de lead
// ═══════════════════════════════════════════════════════════════════════

const PlantillasMsg = {
    // Estados CRM (de ENV-004)
    ESTADOS_CRM: [
        'LEAD_NUEVO_WEB', 'LEAD_NUEVO_OCA', 'CONTACTADO', 'PENDIENTE_DATOS',
        'COTIZACION_PREPARANDO', 'COTIZACION_ENVIADA', 'RECONTACTO_1', 'RECONTACTO_2',
        'CLIENTE_INTERESADO', 'DATOS_CONTRATACION_SOLICITADOS', 'PAGO_PENDIENTE',
        'VENDIDO', 'PERDIDO'
    ],

    // Templates
    TEMPLATES: {
        COTIZACION_WA: {
            id: 'COT_WA_ENVIO',
            canal: 'WhatsApp',
            generar: (data) => {
                const { nombre, plan, total, destino, dias, totalPax, convenioNombre, descuento } = data;
                const lines = [
                    `Hola *${nombre}*! 👋`,
                    '',
                    'Te comparto la cotización de tu seguro de viaje con *Universal Assistance*:',
                    '',
                    `🌍 Destino: *${destino}*`,
                    `📅 Días: *${dias}*`,
                    `👥 Pasajeros: *${totalPax}*`,
                    `📋 Plan: *${plan}*`,
                    convenioNombre ? `🏷️ Convenio: *${convenioNombre}* (${descuento}% dto)` : null,
                    '',
                    `💰 *TOTAL: ${total}*`,
                    '',
                    '✅ Para confirmar tu reserva podés responder este mensaje.',
                    '',
                    '📞 Cualquier consulta: *2 9017378*',
                    '',
                    '_Universal Assistance - A Zurich Company_ 🛡️'
                ].filter(l => l !== null).join('\n');
                return lines;
            }
        },
        COTIZACION_EMAIL: {
            id: 'COT_EMAIL_ENVIO',
            canal: 'Email',
            generar: (data) => {
                const { nombre, plan, total, destino, dias, totalPax, convenioNombre, descuento } = data;
                const convenioLine = convenioNombre ? `\nConvenio: ${convenioNombre} (${descuento}% descuento)\n` : '';
                return {
                    subject: `Cotización Seguro de Viaje – Plan ${plan} | Universal Assistance`,
                    body: `Estimado/a ${nombre},\n\nGracias por tenernos en cuenta para brindar nuestros servicios de asistencia en viajes.\n\nLe compartimos su cotización personalizada:\n\nDestino: ${destino}\nDías: ${dias}\nPasajeros: ${totalPax}\nPlan: ${plan}${convenioLine}\nTotal: ${total}\n\nPara confirmar su reserva, comuníquese con su agente al 2 9017378.\n\nSaludos cordiales,\nUniversal Assistance – A Zurich Company`
                };
            }
        },
        LEAD_PRIMER_CONTACTO: {
            id: 'LEAD_CONFIRMAR_ENVIO',
            canal: 'WhatsApp',
            generar: (data) => {
                return [
                    `Hola *${data.nombre}*! 👋`,
                    '',
                    'Soy de *Universal Assistance Uruguay*. Estamos preparando tu cotización de seguro de viaje.',
                    '',
                    'Para armarte la mejor propuesta, ¿podrías confirmarme estos datos?',
                    '',
                    '📅 Fecha de salida de Uruguay:',
                    '📅 Fecha de regreso:',
                    '🎂 Edad(es) del/los pasajero(s):',
                    '🌍 Destino:',
                    '',
                    '¡Gracias! Te respondo enseguida con opciones. 😊',
                    '',
                    '_Universal Assistance - A Zurich Company_ 🛡️'
                ].join('\n');
            }
        },
        RECONTACTO: {
            id: 'LEAD_RECONTACTO',
            canal: 'WhatsApp',
            generar: (data) => {
                return [
                    `Hola *${data.nombre}*! 👋`,
                    '',
                    `Te escribimos de *Universal Assistance*. Te habíamos enviado una cotización para tu viaje.`,
                    '',
                    '¿Pudiste verla? ¿Tenés alguna duda o te gustaría que te arme otra opción?',
                    '',
                    'Estamos a las órdenes. 😊',
                    '',
                    '_Universal Assistance - A Zurich Company_ 🛡️'
                ].join('\n');
            }
        },
        DATOS_CONTRATACION: {
            id: 'LEAD_DATOS_CONTRATACION',
            canal: 'WhatsApp',
            generar: (data) => {
                return [
                    `Hola *${data.nombre}*! 👋`,
                    '',
                    '¡Genial que quieras contratar! Para emitir tu voucher necesitamos:',
                    '',
                    '📝 Nombre y apellido completo',
                    '📝 Fecha de nacimiento',
                    '📝 C.I. o Pasaporte',
                    '📝 Fecha de salida',
                    '📝 Fecha de regreso',
                    '📝 Producto elegido',
                    '📝 Contacto de emergencia (nombre + teléfono) _(opcional)_',
                    '',
                    '💳 *Formas de pago:*',
                    '• Link de pago (tarjetas)',
                    '• Transferencia bancaria',
                    '• Mercado Pago',
                    '',
                    'Una vez recibidos los datos, emitimos el voucher al instante.',
                    '',
                    '_Universal Assistance - A Zurich Company_ 🛡️'
                ].join('\n');
            }
        }
    },

    // Selector de plantilla según estado (ENV-004, sección 10)
    seleccionarTemplate(estadoCRM, canal) {
        const map = {
            'LEAD_NUEVO_WEB':     'LEAD_PRIMER_CONTACTO',
            'LEAD_NUEVO_OCA':     'LEAD_PRIMER_CONTACTO',
            'CONTACTADO':         'COTIZACION_WA',
            'COTIZACION_ENVIADA': 'RECONTACTO',
            'CLIENTE_INTERESADO': 'DATOS_CONTRATACION'
        };
        const templateKey = map[estadoCRM] || (canal === 'email' ? 'COTIZACION_EMAIL' : 'COTIZACION_WA');
        return this.TEMPLATES[templateKey];
    }
};
