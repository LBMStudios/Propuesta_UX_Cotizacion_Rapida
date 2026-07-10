/* ========================================================================
   UNIVERSAL ASSISTANCE — One-Click Quote — Lógica de Aplicación
   v4.0 — Con datos maestros REALES (20 convenios, 12 productos)
   ======================================================================== */

// ── Estado Global ──────────────────────────────────────────────────────
let pax = { adultos: 1, mayores: 1, menores: 0 };
let activeConvenio = null; // Guardará el ID del convenio de la BD (ej. 'SEMM_UY')
let activeCardId = 'MAXIMUM_300K'; // Default a Maximum
let downloadQueue = []; // Cola de descarga de cotizaciones


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
                cardEl.style.opacity = '0.5';
                // NO bloqueamos pointer-events: el vendedor debe poder ver coberturas
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

// MODAL DETALLES DEL PLAN (dinámico desde dbBeneficios)
function abrirDetalles(planUiName) {
    document.getElementById('modal-plan-name').innerText = planUiName;
    
    let prodId = null;
    if (planUiName === 'Value') prodId = 'VALUE_80K';
    if (planUiName === 'Maximum') prodId = 'MAXIMUM_300K';
    if (planUiName === 'Exclusive') prodId = 'EXCLUSIVE_500K';
    
    const body = document.getElementById('modal-cobertura-body');
    if (!body) return;
    
    if (ultimaCotizacion && prodId) {
        const prodData = ultimaCotizacion.productos_ofrecidos.find(p => p.producto_id === prodId);
        if (prodData) {
            const oldPrice = prodData.descuento_porcentaje > 0 ? `USD ${prodData.importe_cotizado_original}` : '';
            document.getElementById('modal-old-price').innerText = oldPrice;
            document.getElementById('modal-new-price').innerText = `USD ${prodData.importe_cotizado_final}`;
            
            // Renderizar coberturas dinámicamente agrupadas por categoría
            const beneficios = prodData.beneficios_snapshot;
            const categorias = {
                'MEDICA':   { icon: '❤️', label: 'Asistencia Médica' },
                'EQUIPAJE': { icon: '🧳', label: 'Equipaje' },
                'VIAJE':    { icon: '✈️', label: 'Viaje' },
                'DEPORTE':  { icon: '⚽', label: 'Deportes' },
                'LEGAL':    { icon: '⚖️', label: 'Legal y Financiero' },
                'OTRO':     { icon: '⭐', label: 'Otros Beneficios' }
            };
            
            let html = '';
            for (const [catKey, catInfo] of Object.entries(categorias)) {
                const catBens = beneficios.filter(b => b.categoria === catKey);
                if (catBens.length === 0) continue;
                
                html += `<div style="padding:12px 24px; font-weight:700; color:var(--ua-blue); border-bottom:1px solid #f0f1f3; display:flex; align-items:center; gap:8px; font-size:0.85rem;">
                    ${catInfo.icon} ${catInfo.label}
                </div>`;
                html += '<ul class="striped-list">';
                catBens.forEach(b => {
                    const valDisplay = typeof b.valor === 'number' 
                        ? `USD ${b.valor.toLocaleString('es-UY')}` 
                        : b.valor;
                    html += `<li>${b.nombre_beneficio} <strong>${valDisplay}</strong></li>`;
                });
                html += '</ul>';
            }
            
            body.innerHTML = html;
        }
    }
    
    document.getElementById('modal-detalles').style.display = 'flex';
}

function cerrarDetalles() {
    document.getElementById('modal-detalles').style.display = 'none';
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
    const { nombre, plan, total, destino, dias } = _buildQuoteData();

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
    
    // Resetear cola de descarga y checkboxes
    downloadQueue = [];
    document.querySelectorAll('.descarga-cb').forEach(cb => cb.checked = false);
    updateBarraDescarga();

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

// ========================================================================
// DASHBOARD DE PENDIENTES / LEADS
// ========================================================================

function abrirDashboard() {
    document.getElementById('modal-dashboard').style.display = 'flex';
    renderDashboard();
}

function cerrarDashboard() {
    document.getElementById('modal-dashboard').style.display = 'none';
}

function _getLeads() {
    try {
        return JSON.parse(localStorage.getItem('ua_pendientes') || '[]');
    } catch(e) { return []; }
}

function renderDashboard() {
    const leads = _getLeads();
    const filterEstado = document.getElementById('dash-filter-estado')?.value || '';
    const searchTxt = (document.getElementById('dash-search')?.value || '').toLowerCase();
    
    let filtered = leads;
    if (filterEstado) filtered = filtered.filter(l => l.estado_cotizacion === filterEstado);
    if (searchTxt) filtered = filtered.filter(l => (l.prospecto?.nombre || '').toLowerCase().includes(searchTxt));
    
    const tbody = document.getElementById('dash-tbody');
    const emptyEl = document.getElementById('dash-empty');
    const countEl = document.getElementById('dash-count');
    
    if (countEl) countEl.textContent = leads.length;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '';
        emptyEl.style.display = 'block';
        return;
    }
    emptyEl.style.display = 'none';
    
    const estadoColors = {
        'BORRADOR': '#94a3b8', 'COTIZACION_ENVIADA': '#3b82f6', 'CONTACTADO': '#8b5cf6',
        'VENDIDO': '#22c55e', 'PERDIDO': '#ef4444'
    };
    
    tbody.innerHTML = filtered.map((lead, idx) => {
        const fecha = new Date(lead.fecha_cotizacion).toLocaleDateString('es-UY', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
        const nombre = lead.prospecto?.nombre || 'Sin nombre';
        const destino = lead.destino_id || '—';
        const plan = lead.productos_ofrecidos?.find(p => p.producto_id === (lead.plan_seleccionado || 'MAXIMUM_300K'));
        const planNombre = plan ? plan.nombre_comercial : '—';
        const total = plan ? `USD ${plan.importe_cotizado_final}` : '—';
        const estado = lead.estado_cotizacion || 'BORRADOR';
        const color = estadoColors[estado] || '#94a3b8';
        const realIdx = leads.indexOf(lead);
        
        return `<tr style="border-bottom:1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
            <td style="padding:8px 12px; color:#64748b;">${fecha}</td>
            <td style="padding:8px 12px; font-weight:600; color:#002447;">${nombre}<br><span style="font-size:0.55rem; color:#94a3b8;">${lead.prospecto?.telefono || ''}</span></td>
            <td style="padding:8px 12px;">${destino}</td>
            <td style="padding:8px 12px; font-weight:500;">${planNombre}</td>
            <td style="padding:8px 12px; text-align:right; font-weight:700; color:#002447;">${total}</td>
            <td style="padding:8px 12px; text-align:center;">
                <select onchange="cambiarEstadoLead(${realIdx}, this.value)" style="font-size:0.6rem; padding:2px 6px; border:1px solid ${color}; border-radius:12px; color:${color}; background:${color}15; font-weight:600; cursor:pointer;">
                    <option value="BORRADOR" ${estado==='BORRADOR'?'selected':''}>Borrador</option>
                    <option value="CONTACTADO" ${estado==='CONTACTADO'?'selected':''}>Contactado</option>
                    <option value="COTIZACION_ENVIADA" ${estado==='COTIZACION_ENVIADA'?'selected':''}>Cot. Enviada</option>
                    <option value="VENDIDO" ${estado==='VENDIDO'?'selected':''}>Vendido</option>
                    <option value="PERDIDO" ${estado==='PERDIDO'?'selected':''}>Perdido</option>
                </select>
            </td>
            <td style="padding:8px 12px; text-align:center;">
                <button onclick="eliminarLead(${realIdx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.75rem;" title="Eliminar">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

function cambiarEstadoLead(idx, nuevoEstado) {
    const leads = _getLeads();
    if (leads[idx]) {
        leads[idx].estado_cotizacion = nuevoEstado;
        localStorage.setItem('ua_pendientes', JSON.stringify(leads));
        renderDashboard();
        updatePendientesBadge();
    }
}

function eliminarLead(idx) {
    if (!confirm('¿Eliminar este lead?')) return;
    const leads = _getLeads();
    leads.splice(idx, 1);
    localStorage.setItem('ua_pendientes', JSON.stringify(leads));
    renderDashboard();
    updatePendientesBadge();
}

function exportarLeadsCSV() {
    const leads = _getLeads();
    if (leads.length === 0) { alert('No hay leads para exportar.'); return; }
    
    const headers = ['Fecha', 'Nombre', 'Teléfono', 'Email', 'Destino', 'Días', 'Plan', 'Total USD', 'Convenio', 'Estado'];
    const rows = leads.map(l => {
        const plan = l.productos_ofrecidos?.find(p => p.producto_id === (l.plan_seleccionado || 'MAXIMUM_300K'));
        return [
            new Date(l.fecha_cotizacion).toLocaleDateString('es-UY'),
            l.prospecto?.nombre || '',
            l.prospecto?.telefono || '',
            l.prospecto?.email || '',
            l.destino_id || '',
            l.dias || '',
            plan?.nombre_comercial || '',
            plan?.importe_cotizado_final || '',
            l.convenio_id || 'Sin convenio',
            l.estado_cotizacion || 'BORRADOR'
        ].join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UA_Leads_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// Override updatePendientesBadge to also update header badge
const _origUpdateBadge = typeof updatePendientesBadge === 'function' ? updatePendientesBadge : null;
function updatePendientesBadge() {
    const leads = _getLeads();
    const count = leads.length;
    // Footer badge
    const footerBadge = document.querySelector('.footer-pending-count');
    if (footerBadge) footerBadge.textContent = count;
    // Header badge
    const headerBadge = document.getElementById('header-pendientes-badge');
    if (headerBadge) headerBadge.textContent = count;
}

// ========================================================================
// LOGICA DE DESCARGA MULTIPLE Y GENERACION MOCK PDF
// ========================================================================

let barraDescargaExpandida = true;

function toggleBarraDescarga() {
    const barra = document.getElementById('barra-descarga');
    const icon = document.getElementById('barra-descarga-toggle-icon');
    if (!barra) return;
    
    barraDescargaExpandida = !barraDescargaExpandida;
    if (barraDescargaExpandida) {
        barra.classList.remove('colapsada');
        barra.classList.add('expandida');
        if (icon) icon.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    } else {
        barra.classList.remove('expandida');
        barra.classList.add('colapsada');
        if (icon) icon.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    }
}

function onDownloadCheckboxChange(checkbox) {
    const prodId = checkbox.value;
    if (checkbox.checked) {
        if (downloadQueue.length >= 4) {
            alert('Puedes seleccionar un máximo de 4 planes para descargar/comparar.');
            checkbox.checked = false;
            return;
        }
        if (!downloadQueue.includes(prodId)) {
            downloadQueue.push(prodId);
        }
    } else {
        downloadQueue = downloadQueue.filter(id => id !== prodId);
    }
    updateBarraDescarga();
}

function removeDownloadItem(prodId) {
    downloadQueue = downloadQueue.filter(id => id !== prodId);
    
    // Desmarcar checkbox en la UI
    document.querySelectorAll('.descarga-cb').forEach(cb => {
        if (cb.value === prodId) cb.checked = false;
    });
    
    updateBarraDescarga();
}

function updateBarraDescarga() {
    const barra = document.getElementById('barra-descarga');
    const countEl = document.getElementById('descarga-pax-count');
    const itemsContainer = document.getElementById('descarga-items');
    
    if (!barra || !countEl || !itemsContainer) return;
    
    countEl.textContent = downloadQueue.length;
    
    if (downloadQueue.length === 0) {
        barra.classList.remove('visible');
        return;
    }
    
    // Generar pills dinámicamente
    itemsContainer.innerHTML = downloadQueue.map(prodId => {
        const prodData = DataRepository.getProductoById(prodId);
        const name = prodData ? prodData.nombre_comercial : prodId;
        return `<div class="descarga-item-pill">
            <span>${name}</span>
            <span class="remove-item" onclick="removeDownloadItem('${prodId}')">&times;</span>
        </div>`;
    }).join('');
    
    barra.classList.add('visible');
    
    // Asegurar que esté expandida por defecto al mostrarse
    barra.classList.add('expandida');
    barra.classList.remove('colapsada');
    const icon = document.getElementById('barra-descarga-toggle-icon');
    if (icon) icon.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    barraDescargaExpandida = true;
}

function iniciarDescargaPDF() {
    if (downloadQueue.length === 0) return;
    
    const container = document.getElementById('descarga-progreso-container');
    const bar = document.getElementById('descarga-progreso-bar');
    const btn = document.getElementById('btn-descargar-pdf');
    
    if (!container || !bar || !btn) return;
    
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> PREPARANDO...`;
    container.style.display = 'block';
    bar.style.width = '0%';
    
    let w = 0;
    const interval = setInterval(() => {
        w += 5;
        bar.style.width = `${w}%`;
        if (w >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                container.style.display = 'none';
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-download"></i> DESCARGAR PDF`;
                generarPDF();
            }, 200);
        }
    }, 50);
}

function generarPDF() {
    if (!ultimaCotizacion || downloadQueue.length === 0) return;
    
    const selectedProds = ultimaCotizacion.productos_ofrecidos.filter(p => downloadQueue.includes(p.producto_id));
    if (selectedProds.length === 0) return;
    
    const nombreLead = document.getElementById('prospecto-nombre')?.value?.trim() || 'Cliente';
    const telLead = document.getElementById('prospecto-tel')?.value || '—';
    const emailLead = document.getElementById('prospecto-email')?.value || '—';
    
    const destinoEl = document.getElementById('destino');
    const destinoTxt = destinoEl ? destinoEl.options[destinoEl.selectedIndex].text : 'Europa*';
    const salidaVal = document.getElementById('salida')?.value || '';
    const regresoVal = document.getElementById('regreso')?.value || '';
    
    const formattedSalida = salidaVal ? new Date(salidaVal + 'T00:00:00').toLocaleDateString('es-UY') : '—';
    const formattedRegreso = regresoVal ? new Date(regresoVal + 'T00:00:00').toLocaleDateString('es-UY') : '—';
    
    const convenio = activeConvenio ? DataRepository.getConvenioById(activeConvenio) : null;
    const convenioNombre = convenio ? convenio.nombre : 'Directa (Folleto)';
    
    // Obtener todos los beneficios agrupados para la comparativa
    // Nos interesa comparar los beneficios clave
    const listadoBeneficiosClave = [
        { key: 'MEDICA', label: 'Asistencia Médica enfermedad/accidente' },
        { key: 'PREEXISTENCIA', label: 'Asistencia por Preexistencias' },
        { key: 'COVID', label: 'Asistencia Médica por COVID-19' },
        { key: 'ODONTO', label: 'Asistencia Odontológica' },
        { key: 'EQUIPAJE', label: 'Pérdida/Demora de Equipaje' },
        { key: 'HOTEL', label: 'Gastos de Hotel por Convalecencia' }
    ];
    
    let tableHeaders = `<th style="text-align:left; background:#002B5C; color:white; padding:12px; border:1px solid #cbd5e1;">Beneficio / Cobertura</th>`;
    selectedProds.forEach(p => {
        tableHeaders += `<th style="text-align:center; background:#002B5C; color:white; padding:12px; border:1px solid #cbd5e1; width: 180px;">${p.nombre_comercial}</th>`;
    });
    
    let tableRows = '';
    listadoBeneficiosClave.forEach(benInfo => {
        tableRows += `<tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding:10px 12px; font-weight:600; color:#0A4C8A; font-size:0.75rem; border:1px solid #cbd5e1;">${benInfo.label}</td>`;
            
        selectedProds.forEach(p => {
            let valStr = '—';
            // Buscar beneficio en el snapshot
            if (p.beneficios_snapshot) {
                const ben = p.beneficios_snapshot.find(b => {
                    if (benInfo.key === 'MEDICA') return b.categoria === 'MEDICA' && (b.nombre_beneficio.toLowerCase().includes('enfermedad') || b.nombre_beneficio.toLowerCase().includes('accidente') || b.beneficio_id.includes('MED'));
                    if (benInfo.key === 'PREEXISTENCIA') return b.nombre_beneficio.toLowerCase().includes('pre-existencia') || b.nombre_beneficio.toLowerCase().includes('preex');
                    if (benInfo.key === 'COVID') return b.nombre_beneficio.toLowerCase().includes('covid');
                    if (benInfo.key === 'ODONTO') return b.nombre_beneficio.toLowerCase().includes('odont');
                    if (benInfo.key === 'EQUIPAJE') return b.categoria === 'EQUIPAJE';
                    if (benInfo.key === 'HOTEL') return b.nombre_beneficio.toLowerCase().includes('hotel');
                    return false;
                });
                
                if (ben) {
                    valStr = typeof ben.valor === 'number' 
                        ? `USD ${ben.valor.toLocaleString('es-UY')}` 
                        : ben.valor;
                }
            }
            tableRows += `<td style="padding:10px 12px; text-align:center; font-size:0.75rem; border:1px solid #cbd5e1;">${valStr}</td>`;
        });
        tableRows += `</tr>`;
    });
    
    // Fila de Adicionales Seleccionados
    tableRows += `<tr style="border-bottom: 1px solid #e2e8f0; background:#f8fafc;">
        <td style="padding:10px 12px; font-weight:600; color:#0A4C8A; font-size:0.75rem; border:1px solid #cbd5e1;">Upgrades / Adicionales incluidos</td>`;
    selectedProds.forEach(p => {
        const extraNames = p.extras ? p.extras.map(e => e.nombre).join(', ') : '';
        tableRows += `<td style="padding:10px 12px; text-align:center; font-size:0.65rem; color:#64748b; border:1px solid #cbd5e1;">${extraNames || 'Ninguno'}</td>`;
    });
    tableRows += `</tr>`;
    
    // Fila de Precios
    tableRows += `<tr style="background:#fff0f3; font-weight:bold;">
        <td style="padding:12px; font-weight:800; color:#002B5C; font-size:0.85rem; border:1px solid #cbd5e1;">PRECIO TOTAL (Impuestos Inc.)</td>`;
    selectedProds.forEach(p => {
        const descText = p.descuento_porcentaje > 0 ? `<div style="font-size:0.55rem; color:#FF436E; text-transform:uppercase;">${p.descuento_porcentaje}% OFF aplicado</div>` : '';
        tableRows += `<td style="padding:12px; text-align:center; font-size:1.1rem; color:#002B5C; border:1px solid #cbd5e1;">
            USD ${p.importe_cotizado_final}
            ${descText}
        </td>`;
    });
    tableRows += `</tr>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Cotización de Viaje - Universal Assistance</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins', sans-serif; }
            body { background:#f1f5f9; padding:40px; color:#002B5C; }
            .container { max-width:800px; background:white; margin:0 auto; padding:40px; border-radius:12px; box-shadow:0 4px 20px rgba(0,43,92,0.1); border-top:6px solid #FF436E; }
            .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e2e8f0; padding-bottom:20px; margin-bottom:25px; }
            .logo-ua { height:45px; }
            .quote-title { text-align:right; }
            .quote-title h2 { font-size:1.2rem; font-weight:800; color:#002B5C; }
            .quote-title p { font-size:0.7rem; color:#64748b; margin-top:2px; }
            
            .section-title { font-size:0.8rem; font-weight:800; text-transform:uppercase; color:#002B5C; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:12px; letter-spacing:0.5px; }
            
            .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:25px; }
            .meta-card { background:#EAF3F4; padding:12px 16px; border-radius:8px; border:1px solid rgba(9,183,199,0.15); }
            .meta-item { font-size:0.75rem; margin-bottom:6px; }
            .meta-item strong { color:#002B5C; font-weight:600; }
            
            .comparison-table { width:100%; border-collapse:collapse; margin-bottom:25px; }
            
            .notes { background:#fff8e6; border:1px solid #ffeeba; border-radius:8px; padding:12px 16px; font-size:0.68rem; color:#856404; line-height:1.4; margin-bottom:25px; }
            
            .actions-print { display:flex; justify-content:center; gap:12px; margin-top:10px; }
            .btn-print { background:#002B5C; color:white; border:none; padding:8px 24px; border-radius:20px; font-weight:700; font-size:0.75rem; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s; }
            .btn-print:hover { background:#0A4C8A; }
            
            @media print {
                body { background:white; padding:0; }
                .container { box-shadow:none; padding:0; border-radius:0; border-top:none; }
                .actions-print { display:none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.universal-assistance.com/uy/wp-content/uploads/sites/18/2026/03/ua-blanco-zurich-hd.svg" class="logo-ua" style="filter: brightness(0) invert(0) sepia(1) saturate(5) hue-rotate(185deg);" alt="Universal Assistance">
                <div class="quote-title">
                    <h2>PROPUESTA DE VIAJE</h2>
                    <p>Cotización N° ${ultimaCotizacion.cotizacion_id}</p>
                </div>
            </div>
            
            <div class="meta-grid">
                <div class="meta-card">
                    <h3 class="section-title">Datos del Pasajero</h3>
                    <div class="meta-item"><strong>Nombre:</strong> ${nombreLead}</div>
                    <div class="meta-item"><strong>Teléfono:</strong> ${telLead}</div>
                    <div class="meta-item"><strong>Email:</strong> ${emailLead}</div>
                </div>
                <div class="meta-card">
                    <h3 class="section-title">Detalles del Viaje</h3>
                    <div class="meta-item"><strong>Destino:</strong> ${destinoTxt}</div>
                    <div class="meta-item"><strong>Fechas:</strong> ${formattedSalida} al ${formattedRegreso} (${ultimaCotizacion.dias} días)</div>
                    <div class="meta-item"><strong>Convenio:</strong> ${convenioNombre}</div>
                </div>
            </div>
            
            <h3 class="section-title">Comparativa de Planes</h3>
            <table class="comparison-table">
                <thead>
                    <tr>
                        ${tableHeaders}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            
            <div class="notes">
                <strong>Información de validez:</strong> Esta cotización tiene fines informativos y los precios finales están sujetos a cambios según la reglamentación y tipo de cambio vigente al momento de la emisión. Todos los importes expresados incluyen el Impuesto al Valor Agregado (IVA).
            </div>
            
            <div style="text-align:center; font-size:0.65rem; color:#64748b; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:15px;">
                Universal Assistance - A Zurich Company 🛡️ Uruguay. Teléfono Venta: 2 9017378
            </div>
            
            <div class="actions-print">
                <button class="btn-print" onclick="window.print()">Imprimir / Guardar como PDF</button>
                <button class="btn-print" style="background:#cbd5e1; color:#002B5C;" onclick="window.close()">Cerrar</button>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
        pdfWindow.document.open();
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();
    } else {
        alert('Por favor habilite las ventanas emergentes (pop-ups) para ver el PDF de cotización.');
    }
}

renderConveniosGrid();
selectCard('max');
recalcular();
updatePendientesBadge();
