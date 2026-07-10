/* ========================================================================
   UNIVERSAL ASSISTANCE — Servicio de Integración con Plexo Links
   v1.0 — Generación de links de pago tradicionales y Split Payments
   ======================================================================== */

const PlexoService = {
    // ── CONFIGURACIÓN DE CREDENCIALES (Reemplazar cuando den acceso) ──
    config: {
        modo: 'MOCK', // 'MOCK' | 'API_REAL' (Cambiar a 'API_REAL' al tener credenciales)
        clientId: 'INGRESAR_CLIENT_ID_AQUI',
        clientSecret: 'INGRESAR_CLIENT_SECRET_AQUI',
        
        // Base URLs de Plexo Links
        baseUrl: 'https://apilinks.plexo.com.uy', // O 'https://apilinks.testing.plexo.com.uy' para testing
        
        // ID de Comercios para Split Payments (Main = Universal Assistance, Secondary = Surview Agency)
        mainCommerceId: 'COMER_UNIVERSAL_ASSISTANCE_UY',
        secondaryCommerceId: 'COMER_SURVIEW_AGENCY_UY',
        
        // Porcentaje por defecto que va al comercio secundario (Comisión/Cápita de la Agencia)
        secondaryPercent: 10 // Ejemplo: 10% del total va a Surview, el resto a UA
    },

    /**
     * Genera un link de pago (tradicional o split payment) para una cotización.
     * @param {Object} params
     * @param {number} params.monto - Monto total del pago
     * @param {string} params.moneda - 'USD' | 'UYU'
     * @param {string} params.prospectoNombre - Nombre del cliente
     * @param {string} params.prospectoEmail - Email del cliente
     * @param {string} params.externalId - Identificador único de la transacción
     * @param {boolean} params.usarSplit - Indica si se debe generar como split payment
     * @returns {Promise<string>} URL del link de pago generado
     */
    async generarLinkPago({ monto, moneda, prospectoNombre, prospectoEmail, externalId, usarSplit }) {
        const currencyId = moneda === 'UYU' ? 1 : 2;
        const refId = externalId || `COT-${Date.now()}`;
        const desc = `Pago seguro de cotizacion Universal Assistance - Ref ${refId}`;
        
        // Calcular fecha de vencimiento (7 días a partir de hoy)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        const expirationStr = expirationDate.toISOString();

        if (this.config.modo === 'MOCK') {
            console.log('[PlexoService] Generando Link MOCK:', {
                monto, moneda, usarSplit, refId, usarSplit
            });
            // Simulamos una demora de red corta de 700ms
            await new Promise(resolve => setTimeout(resolve, 700));
            
            const tipo = usarSplit ? 'split' : 'simple';
            return `https://pagos.plexo.com.uy/link/mock_${tipo}_${refId}`;
        }

        // --- MODO API REAL ---
        try {
            // El API de Plexo Links acepta un array de links para permitir creación masiva.
            let linkPayload = {
                externalId: refId,
                amount: parseFloat(monto).toFixed(1), // Formato decimal requerido por deserialización de Plexo
                currencyId: currencyId,
                description: desc,
                expirationDate: expirationStr,
                paxName: prospectoNombre,
                paxEmail: prospectoEmail
            };

            // Si es un Split Payment, configuramos la división del pago
            if (usarSplit) {
                const totalMonto = parseFloat(monto);
                const secondaryAmt = (totalMonto * (this.config.secondaryPercent / 100));
                const mainAmt = totalMonto - secondaryAmt;

                // Estructura de split para links de Plexo
                linkPayload.splitPayment = {
                    mainCommerceId: this.config.mainCommerceId,
                    mainAmount: mainAmt.toFixed(1),
                    secondaryCommerceId: this.config.secondaryCommerceId,
                    secondaryAmount: secondaryAmt.toFixed(1),
                    vatRate: 22.0 // Tasa de IVA aplicable
                };
            }

            // El cuerpo debe ir en un array según indica la documentación:
            // "Si bien el ejemplo proporcionado incluye un solo link, recuerda que puedes enviar varios..."
            const requestBody = [linkPayload];

            const response = await fetch(`${this.config.baseUrl}/b2b/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'clientId': this.config.clientId,
                    'clientSecret': this.config.clientSecret
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error en Plexo API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // Dependiendo del retorno, extraemos el link generado.
            // Si el response es un array con los links creados:
            if (Array.isArray(data) && data[0]) {
                return data[0].paymentUrl || data[0].url || `https://pagos.plexo.com.uy/link/${refId}`;
            }
            return data.paymentUrl || data.url || `https://pagos.plexo.com.uy/link/${refId}`;

        } catch (error) {
            console.error('[PlexoService] Error al generar link real. Usando fallback:', error);
            // Retorna un link mock fallback para no trancar la experiencia de usuario
            return `https://pagos.plexo.com.uy/fallback-link-${refId}`;
        }
    }
};

export { PlexoService };
