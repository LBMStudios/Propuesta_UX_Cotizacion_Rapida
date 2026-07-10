/* ========================================================================
   UNIVERSAL ASSISTANCE — Portal Partners — Extractor de Estructura
   ========================================================================
   
   INSTRUCCIONES:
   1. Abrí el portal de partners en tu browser (ya logueado)
   2. Abrí DevTools (F12)
   3. Andá a la pestaña Console
   4. Copiá y pegá TODO este script
   5. Apretá Enter
   6. El resultado se descarga como JSON automáticamente
   ======================================================================== */

(function() {
    const result = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        title: document.title,
        
        // ── Formularios ──
        forms: [],
        
        // ── Links y navegación ──
        navigation: [],
        
        // ── Scripts inline (posibles endpoints) ──
        inlineScripts: [],
        
        // ── Scripts externos ──
        externalScripts: [],
        
        // ── CSS externos ──
        externalCSS: [],
        
        // ── Selects con opciones (destinos, agencias, etc) ──
        selects: [],
        
        // ── Inputs ──
        inputs: [],
        
        // ── Botones ──
        buttons: [],
        
        // ── Data attributes ──
        dataAttributes: [],
        
        // ── Fetch/XHR interceptados ──
        apiEndpoints: []
    };

    // 1. Formularios
    document.querySelectorAll('form').forEach((form, i) => {
        const fields = [];
        form.querySelectorAll('input, select, textarea').forEach(el => {
            fields.push({
                tag: el.tagName,
                type: el.type || '',
                name: el.name || '',
                id: el.id || '',
                value: el.type === 'password' ? '***' : (el.value || '').substring(0, 200),
                placeholder: el.placeholder || '',
                options: el.tagName === 'SELECT' ? 
                    Array.from(el.options).map(o => ({ value: o.value, text: o.text.trim() })) : undefined
            });
        });
        result.forms.push({
            index: i,
            action: form.action || '',
            method: form.method || '',
            id: form.id || '',
            className: form.className || '',
            fieldCount: fields.length,
            fields
        });
    });

    // 2. Links de navegación
    document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            result.navigation.push({
                text: a.textContent.trim().substring(0, 100),
                href: href,
                className: a.className.substring(0, 100)
            });
        }
    });

    // 3. Scripts inline (buscar endpoints API)
    document.querySelectorAll('script:not([src])').forEach(s => {
        const code = s.textContent.trim();
        if (code.length > 10 && code.length < 50000) {
            // Buscar URLs/endpoints
            const urlMatches = code.match(/['"`](\/[a-zA-Z][\w\-\/]*(?:\?[^'"`]*)?)['"``]/g) || [];
            const fetchMatches = code.match(/fetch\s*\([^)]+\)/g) || [];
            const ajaxMatches = code.match(/\$\.(?:ajax|get|post|getJSON)\s*\([^)]+\)/g) || [];
            const urlActionMatches = code.match(/url\s*[:=]\s*['"][^'"]+['"]/gi) || [];
            
            if (urlMatches.length > 0 || fetchMatches.length > 0 || ajaxMatches.length > 0 || urlActionMatches.length > 0) {
                result.inlineScripts.push({
                    preview: code.substring(0, 3000),
                    urls: urlMatches.map(m => m.replace(/['"``]/g, '')),
                    fetches: fetchMatches.map(m => m.substring(0, 200)),
                    ajax: ajaxMatches.map(m => m.substring(0, 200)),
                    urlActions: urlActionMatches.map(m => m.substring(0, 200))
                });
            }
        }
    });

    // 4. Scripts externos
    document.querySelectorAll('script[src]').forEach(s => {
        result.externalScripts.push(s.src);
    });

    // 5. CSS externos
    document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
        result.externalCSS.push(l.href);
    });

    // 6. Selects con opciones
    document.querySelectorAll('select').forEach(sel => {
        const options = Array.from(sel.options).map(o => ({
            value: o.value,
            text: o.text.trim(),
            selected: o.selected
        }));
        result.selects.push({
            name: sel.name || '',
            id: sel.id || '',
            className: sel.className.substring(0, 100),
            optionCount: options.length,
            options: options.slice(0, 100) // Limitar a 100 opciones
        });
    });

    // 7. Inputs
    document.querySelectorAll('input').forEach(inp => {
        result.inputs.push({
            type: inp.type || 'text',
            name: inp.name || '',
            id: inp.id || '',
            value: inp.type === 'password' ? '***' : (inp.value || '').substring(0, 100),
            placeholder: inp.placeholder || '',
            dataAttributes: Object.keys(inp.dataset).reduce((acc, key) => {
                acc[key] = inp.dataset[key].substring(0, 200);
                return acc;
            }, {})
        });
    });

    // 8. Botones
    document.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach(btn => {
        result.buttons.push({
            tag: btn.tagName,
            text: btn.textContent?.trim().substring(0, 100) || '',
            type: btn.type || '',
            id: btn.id || '',
            onclick: btn.getAttribute('onclick')?.substring(0, 200) || '',
            className: btn.className.substring(0, 100)
        });
    });

    // 9. Elementos con data-* attributes relevantes
    document.querySelectorAll('[data-url], [data-action], [data-endpoint], [data-api], [data-ajax]').forEach(el => {
        result.dataAttributes.push({
            tag: el.tagName,
            id: el.id || '',
            data: { ...el.dataset }
        });
    });

    // 10. HTML completo de secciones clave (formulario de cotización si existe)
    const mainContent = document.querySelector('main, .container, .content, #content');
    if (mainContent) {
        result.mainHTML = mainContent.innerHTML.substring(0, 80000);
    }

    // Descargar como JSON
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portal-partners-estructura-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Estructura extraída y descargada.');
    console.log('📊 Resumen:');
    console.log(`   Forms: ${result.forms.length}`);
    console.log(`   Selects: ${result.selects.length}`);
    console.log(`   Inputs: ${result.inputs.length}`);
    console.log(`   Buttons: ${result.buttons.length}`);
    console.log(`   Nav links: ${result.navigation.length}`);
    console.log(`   External JS: ${result.externalScripts.length}`);
    console.log(`   Inline scripts con URLs: ${result.inlineScripts.length}`);
    
    return result;
})();
