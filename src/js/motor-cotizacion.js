/* ========================================================================
   UNIVERSAL ASSISTANCE — Motor de Cotización (Core Business Logic)
   v2.0 — Con reglas de elegibilidad por edad y estados CRM
   ======================================================================== */

import { DataRepository } from './data-maestros.js';

export class MotorCotizacion {
    
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
        // Adultos hasta 69, menores hasta 20, y seniors 70+.
        const edadMaxEstimada = (pax.seniors || 0) > 0 ? 70 : ((pax.adultos || 0) > 0 ? 21 : 17);
        const hayMayores70 = (pax.seniors || 0) > 0;

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
            // Productos "Mayores" (edad mínima 70+): NO elegibles si NO hay pasajeros mayores
            if (edadMinima > 0 && !hayMayores70) {
                elegible = false;
                motivo_no_elegible = `Solo disponible para pasajeros de ${edadMinima}+ años.`;
            }

            // ── CÁLCULO DE PRECIO ──
            const precioPorDiaAdulto = prod.tarifa_diaria_base * factorDestino * factorDias;
            const tarifaMinimaAdulto = Math.max(precioPorDiaAdulto * dias, prod.tarifa_minima);

            let precioTotalOriginal = 0;
            
            // Adultos hasta 69 (Factor 1.0)
            precioTotalOriginal += (tarifaMinimaAdulto * 1.0) * (pax.adultos || 0);
            
            // Seniors 70+ (Factor 1.5 — recargo por edad)
            precioTotalOriginal += (tarifaMinimaAdulto * 1.5) * (pax.seniors || 0);
            
            // Menores hasta 20 (Factor 0.65 — descuento menores)
            precioTotalOriginal += (tarifaMinimaAdulto * 0.65) * (pax.menores || 0);

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
            const totalPax = (pax.adultos || 0) + (pax.seniors || 0) + (pax.menores || 0);
            
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
            cantidad_pasajeros: (pax.adultos || 0) + (pax.seniors || 0) + (pax.menores || 0),
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

export const PlantillasMsg = {
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
                const { nombre, plan, total, destino, dias, totalPax, convenioNombre, descuento, opcionesAdicionales, linkPago } = data;
                
                // Formatear opciones adicionales
                let altLines = '';
                if (opcionesAdicionales && opcionesAdicionales.length > 0) {
                    altLines = '\n\u{1F50D} *Otras opciones comparadas en propuesta PDF:*' + 
                        opcionesAdicionales.map(opt => `\n• Plan *${opt.nombre}*: ${opt.total}`).join('') + '\n';
                }

                // Línea de link de pago Plexo
                const paymentLine = linkPago ? `\n\u{1F4B3} *Link de Pago Seguro (Plexo):*\n${linkPago}\n` : '';

                const lines = [
                    `Hola *${nombre}*! \u{1F44B}`,
                    '',
                    'Te comparto la cotización de tu seguro de viaje con *Universal Assistance*:',
                    '',
                    `\u{1F30D} Destino: *${destino}*`,
                    `\u{1F4C5} Días: *${dias}*`,
                    `\u{1F465} Pasajeros: *${totalPax}*`,
                    `\u{1F4CB} Plan Seleccionado: *${plan}*`,
                    convenioNombre ? `\u{1F3F7}\u{FE0F} Convenio: *${convenioNombre}* (${descuento}% dto)` : null,
                    altLines || null,
                    `\u{1F4B0} *TOTAL: ${total}*`,
                    paymentLine || null,
                    '\u{2705} Para confirmar tu reserva podés responder este mensaje o realizar el pago en el link de arriba.',
                    '',
                    '\u{1F4DE} Cualquier consulta: *2 9017378*',
                    '',
                    '_Universal Assistance - A Zurich Company_ \u{1F6E1}\u{FE0F}'
                ].filter(l => l !== null).join('\n');
                return lines;
            }
        },
        COTIZACION_EMAIL: {
            id: 'COT_EMAIL_ENVIO',
            canal: 'Email',
            generar: (data) => {
                const { nombre, plan, total, destino, dias, totalPax, convenioNombre, descuento, opcionesAdicionales, linkPago } = data;
                const convenioLine = convenioNombre ? `\nConvenio: ${convenioNombre} (${descuento}% descuento)` : '';
                
                let altText = '';
                if (opcionesAdicionales && opcionesAdicionales.length > 0) {
                    altText = '\nOtras opciones comparadas en propuesta PDF:\n' + 
                        opcionesAdicionales.map(opt => `- Plan ${opt.nombre}: ${opt.total}`).join('\n') + '\n';
                }

                const paymentText = linkPago ? `\nLink de Pago Seguro (Plexo) para el plan ${plan}:\n${linkPago}\n` : '';

                return {
                    subject: `Cotización Seguro de Viaje – Plan ${plan} | Universal Assistance`,
                    body: `Estimado/a ${nombre},\n\nGracias por tenernos en cuenta para brindar nuestros servicios de asistencia en viajes.\n\nLe compartimos su cotización personalizada:\n\nDestino: ${destino}\nDías: ${dias}\nPasajeros: ${totalPax}\nPlan Seleccionado: ${plan}${convenioLine}\n${altText}\nTotal: ${total}\n${paymentText}\nPara confirmar su reserva, comuníquese con su agente al 2 9017378 o realice el pago directamente en el link adjunto.\n\nSaludos cordiales,\nUniversal Assistance – A Zurich Company`
                };
            }
        },
        LEAD_PRIMER_CONTACTO: {
            id: 'LEAD_CONFIRMAR_ENVIO',
            canal: 'WhatsApp',
            generar: (data) => {
                return [
                    `Hola *${data.nombre}*! \u{1F44B}`,
                    '',
                    'Soy de *Universal Assistance Uruguay*. Estamos preparando tu cotización de seguro de viaje.',
                    '',
                    'Para armarte la mejor propuesta, ¿podrías confirmarme estos datos?',
                    '',
                    '\u{1F4C5} Fecha de salida de Uruguay:',
                    '\u{1F4C5} Fecha de regreso:',
                    '\u{1F382} Edad(es) del/los pasajero(s):',
                    '\u{1F30D} Destino:',
                    '',
                    '¡Gracias! Te respondo enseguida con opciones. \u{1F60A}',
                    '',
                    '_Universal Assistance - A Zurich Company_ \u{1F6E1}\u{FE0F}'
                ].join('\n');
            }
        },
        RECONTACTO: {
            id: 'LEAD_RECONTACTO',
            canal: 'WhatsApp',
            generar: (data) => {
                return [
                    `Hola *${data.nombre}*! \u{1F44B}`,
                    '',
                    `Te escribimos de *Universal Assistance*. Te habíamos enviado una cotización para tu viaje.`,
                    '',
                    '¿Pudiste verla? ¿Tenés alguna duda o te gustaría que te arme otra opción?',
                    '',
                    'Estamos a las órdenes. \u{1F60A}',
                    '',
                    '_Universal Assistance - A Zurich Company_ \u{1F6E1}\u{FE0F}'
                ].join('\n');
            }
        },
        DATOS_CONTRATACION: {
            id: 'LEAD_DATOS_CONTRATACION',
            canal: 'WhatsApp',
            generar: (data) => {
                return [
                    `Hola *${data.nombre}*! \u{1F44B}`,
                    '',
                    '¡Genial que quieras contratar! Para emitir tu voucher necesitamos:',
                    '',
                    '\u{1F4DD} Nombre y apellido completo',
                    '\u{1F4DD} Fecha de nacimiento',
                    '\u{1F4DD} C.I. o Pasaporte',
                    '\u{1F4DD} Fecha de salida',
                    '\u{1F4DD} Fecha de regreso',
                    '\u{1F4DD} Producto elegido',
                    '\u{1F4DD} Contacto de emergencia (nombre + teléfono) _(opcional)_',
                    '',
                    '\u{1F4B3} *Formas de pago:*',
                    '• Link de pago (tarjetas)',
                    '• Transferencia bancaria',
                    '• Mercado Pago',
                    '',
                    'Una vez recibidos los datos, emitimos el voucher al instante.',
                    '',
                    '_Universal Assistance - A Zurich Company_ \u{1F6E1}\u{FE0F}'
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
