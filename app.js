/* ========================================================================
   UNIVERSAL ASSISTANCE — One-Click Quote — Lógica de Aplicación
   v4.0 — Con datos maestros REALES (20 convenios, 12 productos)
   ======================================================================== */

// ── Estado Global ──────────────────────────────────────────────────────
let pax = { adultos: 1, mayores: 1, menores: 0 };
let activeConvenio = null; // Guardará el ID del convenio de la BD (ej. 'SEMM_UY')
let activeCardId = 'MAXIMUM_300K'; // Default a Maximum

// IDs de los 3 productos que se muestran en las tarjetas de la UI
const DISPLAY_PRODUCTS = ['VALUE_80K', 'MAXIMUM_300K', 'EXCLUSIVE_500K'];
const MAP_PRODUCTOS = { 'base': 'VALUE_80K', 'max': 'MAXIMUM_300K', 'pre': 'EXCLUSIVE_500K' };
const REVERSE_MAP_PROD = { 'VALUE_80K': 'base', 'MAXIMUM_300K': 'max', 'EXCLUSIVE_500K': 'pre' };

// Mapeo de valores de checkbox HTML → IDs de adicionales en la BD
const MAP_ADICIONALES = {
    '4.5': 'PREEX_EXT',
    '15': 'TECH_PRO',
    '8': 'DEP_ADV',
    '3.5': 'CANC_VIAJE',
    '6': 'EMBARAZO',
    '10': 'MASCOTAS'
};

// Colores para los badges de tipo de convenio
const CONVENIO_STYLES = {
    'SALUD':   { bg: '#e8f5e9', color: '#2e7d32', border: '#c8e6c9' },
    'BANCO':   { bg: '#e3f2fd', color: '#1565c0', border: '#bbdefb' },
    'TARJETA': { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' },
    'DIRECTO': { bg: '#f3e5f5', color: '#6a1b9a', border: '#ce93d8' }
};

// Variable para guardar la última cotización completa generada
let ultimaCotizacion = null;

// ========================================================================
// RECALCULAR -> MOTOR -> RENDER
// ========================================================================

function recalcular() {
    const totalPax = pax.adultos + pax.mayores + pax.menores;
    if (totalPax === 0) return;

    const diasEl = document.getElementById('dias');
    const dias = diasEl ? (parseInt(diasEl.value) || 1) : 1;
    const destinoEl = document.getElementById('destino');
    const destinoNombre = destinoEl ? destinoEl.value : 'Europa*';
    const salidaEl = document.getElementById('salida');
    const regresoEl = document.getElementById('regreso');

    // Extraer adicionales desde los checkbox usando mapeo a IDs de la BD
    let adicionalesSeleccionados = [];
    document.querySelectorAll('.extra-cbx:checked').forEach(cb => {
        const dbId = MAP_ADICIONALES[cb.value];
        if (dbId) adicionalesSeleccionados.push(dbId);
    });
    adicionalesSeleccionados = [...new Set(adicionalesSeleccionados)];

    // 1. Invocar al Motor de Cotización (Core)
    const inputs = {
        destino_nombre: destinoNombre,
        fecha_inicio: salidaEl ? salidaEl.value : '',
        fecha_fin: regresoEl ? regresoEl.value : '',
        dias: dias,
        pax: pax,
        convenio_id: activeConvenio,
        adicionales_ids: adicionalesSeleccionados
    };

    ultimaCotizacion = MotorCotizacion.generarCotizacion(inputs);

    // 2. Renderizar UI basado en el objeto de cotización
    renderUI(ultimaCotizacion);
}

function triggerPriceAnimation(id) {
    const el = document.getElementById(`${id}-fin`);
    if(el) {
        el.classList.remove('updating');
        void el.offsetWidth; // Force DOM reflow
        el.classList.add('updating');
    }
}

function renderUI(cotizacion) {
    // Filtrar solo los 3 productos que mostramos en tarjetas
    const displayProds = cotizacion.productos_ofrecidos.filter(p => DISPLAY_PRODUCTS.includes(p.producto_id));
    const totalPax = cotizacion.cantidad_pasajeros;
    
    // Render de cada tarjeta de producto
    displayProds.forEach(prod => {
        const uiId = REVERSE_MAP_PROD[prod.producto_id];
        if (!uiId) return;

        const cardEl = document.getElementById(`card-${uiId}`);
        const oriEl = document.getElementById(`${uiId}-ori`);
        const finEl = document.getElementById(`${uiId}-fin`);
        const discEl = document.getElementById(`${uiId}-disc`);
        const subEl = document.getElementById(`${uiId}-sub`);
        const totEl = document.getElementById(`${uiId}-tot`);

        // ── ELEGIBILIDAD POR EDAD ──
        if (cardEl) {
            if (!prod.elegible) {
                cardEl.style.opacity = '0.45';
                cardEl.style.pointerEvents = 'none';
                // Agregar badge de no elegible si no existe
                let badge = cardEl.querySelector('.age-badge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'age-badge';
                    badge.style.cssText = 'position:absolute;top:6px;right:6px;background:#E40046;color:white;font-size:0.5rem;padding:2px 6px;border-radius:10px;font-weight:700;z-index:5;';
                    cardEl.style.position = 'relative';
                    cardEl.appendChild(badge);
                }
                badge.textContent = `⚠ ${prod.limite_edad || 70}+ NO`;
                badge.style.display = 'block';
            } else {
                cardEl.style.opacity = '1';
                cardEl.style.pointerEvents = '';
                const badge = cardEl.querySelector('.age-badge');
                if (badge) badge.style.display = 'none';
            }
        }

        const tieneDescuento = prod.descuento_porcentaje > 0;

        if (oriEl) {
            oriEl.innerText = `${prod.importe_cotizado_original}`;
            oriEl.style.display = tieneDescuento ? 'block' : 'none';
            const wrapper = oriEl.closest('.price-old-wrapper');
            if (wrapper) wrapper.style.display = tieneDescuento ? 'flex' : 'none';
        }
        if (finEl) {
            const newVal = `${prod.importe_cotizado_final}`;
            if (finEl.innerText !== newVal) triggerPriceAnimation(uiId);
            finEl.innerText = newVal;
        }
        if (discEl) {
            if (tieneDescuento) {
                discEl.innerText = `${prod.descuento_porcentaje}% OFF`;
                discEl.style.display = 'inline-block';
            } else {
                discEl.style.display = 'none';
            }
        }
        if (subEl) subEl.innerText = `USD ${Math.round(prod.importe_cotizado_final / totalPax)}`;
        if (totEl) totEl.innerText = `USD ${prod.importe_cotizado_final}`;
    });

    // Render footer
    const activeProd = cotizacion.productos_ofrecidos.find(p => p.producto_id === activeCardId);
    if (activeProd) {
        const fPlan = document.getElementById('footer-plan-name');
        const fTotal = document.getElementById('footer-total');
        const fDisc = document.getElementById('footer-discount');

        if (fPlan) fPlan.innerText = activeProd.nombre_comercial;
        if (fTotal) fTotal.innerText = `USD ${activeProd.importe_cotizado_final}`;
        
        if (fDisc) {
            if (activeProd.descuento_porcentaje > 0) {
                const convInfo = DataRepository.getConvenioById(cotizacion.convenio_id);
                const label = convInfo ? convInfo.nombre : '';
                fDisc.innerText = `¡${label} -${activeProd.descuento_porcentaje}% aplicado!`;
                fDisc.style.display = '';
            } else {
                fDisc.style.display = 'none';
            }
        }
    }

    // ── ALERTAS DE ELEGIBILIDAD ──
    renderAlertas(cotizacion.alertas);
}

function renderAlertas(alertas) {
    let container = document.getElementById('alertas-container');
    if (!container) {
        // Crear contenedor de alertas antes del footer
        const footer = document.querySelector('footer');
        if (footer) {
            container = document.createElement('div');
            container.id = 'alertas-container';
            container.style.cssText = 'padding:0 12px; display:flex; flex-direction:column; gap:4px;';
            footer.parentNode.insertBefore(container, footer);
        }
    }
    if (!container) return;

    if (!alertas || alertas.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = alertas.map(a => {
        const colors = a.severidad === 'WARNING' 
            ? 'background:#fff3cd;border:1px solid #ffc107;color:#856404;' 
            : 'background:#d1ecf1;border:1px solid #17a2b8;color:#0c5460;';
        const icon = a.severidad === 'WARNING' ? '⚠️' : '💡';
        return `<div style="${colors} padding:6px 10px; border-radius:8px; font-size:0.65rem; line-height:1.3;">
            ${icon} ${a.mensaje}
        </div>`;
    }).join('');
}

// ========================================================================
// F7 — GUARDAR PENDIENTE (JSON DE ORDENANZA)
// ========================================================================

function guardarPendiente() {
    if (!ultimaCotizacion) return;

    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const spinner = document.getElementById('modal-spinner');

    // Obtener datos del prospecto (Lead data combinada con Cotizacion)
    const nombre = document.getElementById('prospecto-nombre')?.value?.trim() || '';
    const tel = document.getElementById('prospecto-tel')?.value || '';
    const email = document.getElementById('prospecto-email')?.value || '';

    // Clonamos la cotización y le inyectamos los datos del prospecto para guardarlo como Lead
    const leadRecord = {
        ...ultimaCotizacion, // Todo el modelo transaccional puro
        lead_id: `LEAD-${Date.now()}`,
        prospecto_nombre: nombre,
        prospecto_tel: tel,
        prospecto_email: email,
        producto_seleccionado_ui: activeCardId
    };

    const pendientes = JSON.parse(localStorage.getItem('ua_pendientes') || '[]');
    pendientes.unshift(leadRecord);
    localStorage.setItem('ua_pendientes', JSON.stringify(pendientes));
    updatePendientesBadge();

    modal.style.display = 'flex';
    title.innerText = "Guardando Lead estructurado...";
    title.style.color = "#002447";
    desc.innerText = "Generando JSON bajo Ordenanza de Datos...";
    spinner.style.display = "block";

    setTimeout(() => {
        spinner.style.display = "none";
        title.innerText = "\u2705 Lead Guardado (Ordenanza v2)";
        title.style.color = "var(--success)";
        
        const actProd = ultimaCotizacion.productos_ofrecidos.find(p => p.producto_id === activeCardId);
        const planName = actProd ? actProd.nombre_comercial : '';
        const total = actProd ? actProd.importe_cotizado_final : '';

        desc.innerHTML = `<strong>Cotización guardada exitosamente.</strong><br>
            <span style="color:#7f8c8d;font-size:0.8rem;">${leadRecord.cotizacion_id} \u2014 ${nombre || 'Sin nombre'} \u2014 ${planName} USD ${total}</span><br>
            <span style="color:#7f8c8d;font-size:0.7rem;">Estado: <b>${leadRecord.estado_cotizacion}</b> &mdash; Listo para integrar con Siebel/CRM.</span>`;
        setTimeout(() => { modal.style.display = 'none'; }, 2500);
    }, 800);
}

function updatePendientesBadge() {
    const pendientes = JSON.parse(localStorage.getItem('ua_pendientes') || '[]');
    let badge = document.getElementById('pendientes-badge');
    if (!badge) {
        const f7Btn = document.querySelector('[onclick*="guardarPendiente"]') || document.querySelector('.footer-btn');
        if (f7Btn) {
            badge = document.createElement('span');
            badge.id = 'pendientes-badge';
            badge.style.cssText = 'background:#E40046; color:white; font-size:0.6rem; font-weight:800; padding:1px 5px; border-radius:10px; margin-left:4px; min-width:16px; text-align:center; display:inline-block;';
            f7Btn.appendChild(badge);
        }
    }
    if (badge) {
        if (pendientes.length > 0) {
            badge.textContent = pendientes.length;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ========================================================================
// HELPERS — Construcción de mensaje WA/Email
// ========================================================================

function _buildQuoteData() {
    const nombre = document.getElementById('prospecto-nombre')?.value?.trim() || '';
    if(!ultimaCotizacion) return { nombre, plan: '', total: '', destino: '', dias: '', totalPax: 0, convenioNombre: null, descuento: 0 };
    
    const actProd = ultimaCotizacion.productos_ofrecidos.find(p => p.producto_id === activeCardId);
    const convInfo = activeConvenio ? DataRepository.getConvenioById(activeConvenio) : null;
    const descPct = actProd ? actProd.descuento_porcentaje : 0;
    
    return { 
        nombre, 
        plan: actProd ? actProd.nombre_comercial : '', 
        total: actProd ? `USD ${actProd.importe_cotizado_final}` : '', 
        destino: document.getElementById('destino')?.value || '', 
        dias: ultimaCotizacion.dias, 
        totalPax: ultimaCotizacion.cantidad_pasajeros,
        convenioNombre: convInfo ? convInfo.nombre : null,
        descuento: descPct
    };
}

// ========================================================================
// EVENT LISTENERS — Toggles, Selects, Inputs
// ========================================================================

// Toggle buttons (Tipo de viaje)
document.querySelectorAll('.btn-group .btn-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const group = e.target.closest('.btn-group');
        group.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        recalcular();
    });
});

// Selects e inputs disparan recalcular
document.querySelectorAll('select, input[type="number"], .extra-cbx').forEach(el => {
    el.addEventListener('change', recalcular);
});

// FECHA & DÍAS
function calcDias() {
    const outStr = document.getElementById('salida')?.value;
    const retStr = document.getElementById('regreso')?.value;
    if (outStr && retStr) {
        const out = new Date(outStr + 'T00:00:00');
        const ret = new Date(retStr + 'T00:00:00');
        if (!isNaN(out) && !isNaN(ret)) {
            const diffTime = ret - out;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const diasEl = document.getElementById('dias');
            if (diasEl) diasEl.value = diffDays > 0 ? diffDays : 1;
            recalcular();
        }
    }
}
document.getElementById('salida')?.addEventListener('change', calcDias);
document.getElementById('regreso')?.addEventListener('change', calcDias);

function onDiasInput() {
    const diasEl = document.getElementById('dias');
    const salidaEl = document.getElementById('salida');
    const regresoEl = document.getElementById('regreso');
    if (diasEl && salidaEl && regresoEl) {
        const days = parseInt(diasEl.value) || 1;
        const outDate = new Date(salidaEl.value + 'T00:00:00');
        if (!isNaN(outDate)) {
            outDate.setDate(outDate.getDate() + days);
            const yyyy = outDate.getFullYear();
            const mm = String(outDate.getMonth() + 1).padStart(2, '0');
            const dd = String(outDate.getDate()).padStart(2, '0');
            regresoEl.value = `${yyyy}-${mm}-${dd}`;
            recalcular();
        }
    }
}

// PASAJEROS
function updatePax(type, delta) {
    if(pax[type] + delta >= 0) pax[type] += delta;
    document.getElementById(`pax-${type}`).innerText = pax[type];
    recalcular();
}

// SELECCIÓN DE TARJETAS (CARDS)
function selectCard(uiId) {
    document.querySelectorAll('.prod-card').forEach(c => c.classList.remove('card-active'));
    const cardEl = document.getElementById(`card-${uiId}`);
    if(cardEl) cardEl.classList.add('card-active');
    activeCardId = MAP_PRODUCTOS[uiId] || 'MAXIMUM_300K';
    recalcular();
}
document.querySelectorAll('.prod-card').forEach(card => {
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.ver-mas')) {
            const cardId = card.id.replace('card-', '');
            selectCard(cardId);
        }
    });
});

// CONVENIOS
function toggleConvenio(convenioDbId) {
    document.querySelectorAll('.convenio-logo').forEach(c => c.classList.remove('active'));
    
    if (activeConvenio === convenioDbId) {
        activeConvenio = null;
    } else {
        activeConvenio = convenioDbId;
        const el = document.getElementById(`conv-${convenioDbId}`);
        if(el) el.classList.add('active');
    }
    
    // Update convenio message
    const msgEl = document.getElementById('convenio-msg');
    if (msgEl) {
        if (activeConvenio) {
            const convData = DataRepository.getConvenioById(activeConvenio);
            if (convData) {
                const val = convData.reglas_precio['VALUE_80K'] ? (convData.reglas_precio['VALUE_80K']*100) : 0;
                const max = convData.reglas_precio['MAXIMUM_300K'] ? (convData.reglas_precio['MAXIMUM_300K']*100) : 0;
                const pre = convData.reglas_precio['EXCLUSIVE_500K'] ? (convData.reglas_precio['EXCLUSIVE_500K']*100) : 0;
                const capitaTag = convData.tiene_capita ? ' <span style="background:#e8f5e9;color:#2e7d32;padding:1px 5px;border-radius:8px;font-size:0.55rem;">CON CÁPITA</span>' : '';
                msgEl.innerHTML = `<i class="fa-solid fa-tag" style="color:#E40046;"></i> <b>${convData.nombre}${capitaTag}:</b> ${max}% Maximum / ${pre}% Exclusive / ${val}% Value`;
            }
        } else {
            msgEl.innerHTML = 'Selecciona un convenio para ver descuentos';
        }
    }
    recalcular();
}

function filtrarConvenios() {
    const input = document.querySelector('input[placeholder*="Escribe para buscar"]');
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    document.querySelectorAll('.convenio-logo').forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = (query === '' || text.includes(query)) ? '' : 'none';
    });
}

// MODAL DETALLES DEL PLAN
function abrirDetalles(planUiName) { // Recibe 'Value', 'Maximum', 'Exclusive'
    document.getElementById('modal-plan-name').innerText = planUiName;
    
    let prodId = null;
    let uiId = null;
    if (planUiName === 'Value') { prodId = 'VALUE_80K'; uiId = 'base'; }
    if (planUiName === 'Maximum') { prodId = 'MAXIMUM_300K'; uiId = 'max'; }
    if (planUiName === 'Exclusive') { prodId = 'EXCLUSIVE_500K'; uiId = 'pre'; }
    
    if (ultimaCotizacion && prodId) {
        const prodData = ultimaCotizacion.productos_ofrecidos.find(p => p.producto_id === prodId);
        if (prodData) {
            const oldPrice = prodData.descuento_porcentaje > 0 ? `USD ${prodData.importe_cotizado_original}` : '';
            const newPrice = `USD ${prodData.importe_cotizado_final}`;
            
            document.getElementById('modal-old-price').innerText = oldPrice;
            document.getElementById('modal-new-price').innerText = newPrice;
            
            // Actualizar coberturas iterando el array de beneficios de la Ordenanza
            // Nota: En un sistema real esto generaría filas dinámicas en el HTML.
            // Aquí setearemos las clásicas hardcodeadas para no romper el CSS actual.
            const getVal = (nom) => {
                const ben = prodData.beneficios_snapshot.find(b => b.nombre_beneficio.includes(nom));
                return ben ? ben.valor : 'Incluido';
            };
            
            const setVal = (id, val) => { const el = document.getElementById(`modal-detalles-${id}`); if (el) el.innerText = val; };
            setVal('medica', getVal('médica'));
            setVal('preex', getVal('Pre-existencias') || 'USD 10.000');
            setVal('tele', 'Incluido');
        }
    }
    
    document.getElementById('modal-detalles').style.display = 'flex';
}

function cerrarDetalles(e) {
    if(!e || e.target.id === 'modal-detalles') {
        document.getElementById('modal-detalles').style.display = 'none';
    }
}

// ========================================================================
// ACCIONES Y ATAJOS
// ========================================================================

function enviarWhatsAppProspecto() {
    const tel = document.getElementById('prospecto-tel')?.value?.replace(/\D/g,'');
    if (!tel) { alert('Ingresa el teléfono del prospecto primero.'); return; }
    const data = _buildQuoteData();
    if (!data.nombre) { alert('Ingresa el nombre del prospecto primero.'); return; }
    
    // Usar plantilla real de ENV-004
    const template = PlantillasMsg.TEMPLATES.COTIZACION_WA;
    const mensaje = template.generar(data);
    
    window.open(`https://wa.me/598${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function enviarEmailProspecto() {
    const email = document.getElementById('prospecto-email')?.value;
    if (!email) { alert('Ingresá el email del prospecto primero.'); return; }
    const data = _buildQuoteData();
    
    // Usar plantilla real de ENV-004
    const template = PlantillasMsg.TEMPLATES.COTIZACION_EMAIL;
    const resultado = template.generar(data);
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(resultado.subject)}&body=${encodeURIComponent(resultado.body)}`;
}

function enviarContacto() {
    const tel = document.getElementById('prospecto-tel')?.value?.trim();
    if (tel) enviarWhatsAppProspecto();
    else enviarEmailProspecto();
}

function cargarSiebel() {
    const modal   = document.getElementById('modal');
    const title   = document.getElementById('modal-title');
    const desc    = document.getElementById('modal-desc');
    const spinner = document.getElementById('modal-spinner');
    const { nombre, plan, total, destino, dias } = _buildQuoteMsg();

    const steps = [
        { t: 0,    icon: '🔗', txt: 'Conectando con Siebel CRM...' },
        { t: 800,  icon: '👤', txt: `Enviando JSON modelo Ordenanza...` },
        { t: 1700, icon: '📋', txt: `Validando cotización: Plan <b>${plan}</b>` },
        { t: 2600, icon: '💰', txt: `Registrando precio: <b>${total}</b>` },
        { t: 3500, icon: '✅', txt: `<b>¡Sincronización completa!</b><br><span style="color:#7f8c8d;font-size:0.8rem;">Oportunidad creada en Siebel</span>` },
    ];

    modal.style.display = 'flex';
    spinner.style.display = 'block';
    title.innerText = '⚙️ Exportando a Siebel...';
    title.style.color = '#002447';

    steps.forEach((s, i) => {
        setTimeout(() => {
            if (i < steps.length - 1) {
                desc.innerHTML = `${s.icon} ${s.txt}`;
            } else {
                spinner.style.display = 'none';
                title.innerText = '✅ Siebel Actualizado';
                title.style.color = 'var(--success, #27ae60)';
                desc.innerHTML = s.txt;
                setTimeout(() => { modal.style.display = 'none'; }, 2500);
            }
        }, s.t);
    });
}

function nuevaCotizacion() {
    if (!confirm('\u00bfIniciar una nueva cotizacion? Se perderan los datos actuales.')) return;
    document.getElementById('prospecto-nombre').value = '';
    document.getElementById('prospecto-tel').value    = '';
    document.getElementById('prospecto-email').value  = '';
    pax = { adultos: 1, mayores: 0, menores: 0 };
    ['adultos','mayores','menores'].forEach(k => {
        const el = document.getElementById(`pax-${k}`);
        if (el) el.innerText = pax[k];
    });
    activeConvenio = null;
    document.querySelectorAll('.convenio-logo').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.extra-cbx').forEach(cb => cb.checked = false);
    selectCard('max');
    recalcular();
}

window.addEventListener('keydown', function(e) {
    if (e.key === 'F7') { e.preventDefault(); guardarPendiente(); }
    if (e.key === 'F8') { e.preventDefault(); enviarContacto(); }
    if (e.key === 'F9') { e.preventDefault(); cargarSiebel(); }
    if (e.key === 'F10') { e.preventDefault(); nuevaCotizacion(); }
});

// ========================================================================
// RENDER DINÁMICO DE CONVENIOS (desde data-maestros.js)
// ========================================================================

function renderConveniosGrid() {
    const grid = document.getElementById('convenios-grid');
    if (!grid) return;
    
    const convenios = DataRepository.getConvenios().filter(c => c.convenio_id !== 'FOLLETO');
    
    grid.innerHTML = convenios.map(conv => {
        const style = CONVENIO_STYLES[conv.tipo_convenio] || CONVENIO_STYLES['DIRECTO'];
        const capitaDot = conv.tiene_capita ? '<span style="position:absolute;top:2px;right:3px;width:5px;height:5px;background:#27ae60;border-radius:50;"></span>' : '';
        return `<div class="convenio-logo" id="conv-${conv.convenio_id}" 
                     onclick="toggleConvenio('${conv.convenio_id}')" 
                     style="background:${style.bg}; color:${style.color}; border:1px solid ${style.border}; position:relative; font-size:0.58rem;">
                    ${capitaDot}${conv.nombre}
                </div>`;
    }).join('');
}

// INICIALIZACIÓN
renderConveniosGrid();
selectCard('max');
recalcular();
updatePendientesBadge();
