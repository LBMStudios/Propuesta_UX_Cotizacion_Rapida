# Notas de Reunión: Revisión del Proceso Comercial
**Participantes:** Marianna, equipo de ventas/atención, Javier y Lucas  
**Tema central:** Revisión del proceso comercial actual, problemas operativos del CRM/cotizador/Siebel y posibles mejoras o desarrollo futuro.

---

## 1. Situación Actual del Proceso de Venta

La operación está muy fragmentada. Para una venta típica deben usar varios sistemas separados:

| Sistema | Función |
|---------|---------|
| **Cotizador web** | Calcular precios |
| **Siebel** | Emitir vouchers |
| **CRM actual** | Registrar gestión comercial |
| **Mail / WhatsApp** | Enviar info al cliente |
| **Odoo / Contabilidad** | Validar información en algunos casos |

**Problema principal:** Muchos datos se cargan varias veces (fechas, pasajeros, destino, contacto, producto, importe, datos del cliente). Genera pérdida de tiempo, errores y desgaste operativo.

---

## 2. Problemas del Cotizador Actual

- No permite comparar fácilmente varios productos en una misma cotización.
- Si el cliente cambia de producto/convenio/condición → hay que volver a cargar todo desde cero.
- Destinos muy generales (ej: "Internacional"), salvo Argentina o Sudamérica.
- No siempre refleja todos los convenios disponibles.
- Para convenios como Itaú, OCA, SMI, MP → hay que cambiar la **organización emisora** y volver a cotizar.
- Algunas cotizaciones se hacen "de memoria" o manualmente porque el sistema es lento.

> **Conclusión:** El cotizador sirve, pero no está pensado para la operación real de venta directa de Uruguay.

---

## 3. Convenios y Promociones

Tipos de precios y condiciones según:

- Producto general o de folleto
- Convenios específicos
- **Organización emisora** (clave)
- Promociones vigentes
- Tipo de viaje
- Producto anual, por día o adicional
- Módulos adicionales (preexistencia, embarazo, deporte, etc.)

> **Problema:** Gran parte de esa información está en conocimiento operativo del equipo o en documentos/papeles, pero NO está centralizada en un sistema.

**Acción clave:** Documentar todos los convenios, condiciones, precios, vigencias y reglas comerciales.

---

## 4. Productos Adicionales y Módulos

Dificultad importante en el cálculo de adicionales:

- Preexistencia
- Embarazo
- Deportes
- Otros módulos complementarios

Valores no siempre estandarizados. Dependen del producto, días, destino o condición comercial.

> **Conclusión:** No impide avanzar, pero obliga a pensar por etapas. Primero automatizar los casos más frecuentes, dejar los complejos para consulta o carga manual.

---

## 5. Siebel como Sistema de Emisión

- Siebel es donde finalmente se emite el voucher.
- Permite dejar vouchers en estado **pendiente**.
- No cotiza bien varias alternativas → requiere saber previamente qué producto se va a emitir.
- La emisión implica cargar nuevamente muchos datos ya ingresados antes.

> **Solución ideal:** Enviar datos automáticamente a Siebel desde el cotizador y recibir el número de voucher como respuesta.

---

## 6. API o Integración con Siebel

Lucas ya consultó con Diego/Argentina sobre API de Siebel.

**Escenario ideal:**
1. Cargar datos una sola vez en pantalla propia
2. Cotizar / seleccionar producto/convenio
3. Enviar propuesta por WhatsApp o mail
4. Dejar el caso pendiente
5. Cuando el cliente confirma → enviar datos a Siebel
6. Recibir número de voucher
7. Actualizar automáticamente el CRM

**Plan B:** Si no hay API → automatizaciones que completen campos en Siebel (no ideal).

---

## 7. Visión del Sistema Integrado

El sistema debería permitir:

- [x] Cargar datos del cliente **una sola vez**
- [ ] Registrar lead, cotización, seguimiento y venta
- [x] Comparar productos de folleto y convenios
- [x] Seleccionar condiciones comerciales
- [x] Enviar cotización por WhatsApp o mail
- [ ] Guardar casos pendientes
- [ ] Integrarse con Siebel para emisión
- [ ] Integrarse eventualmente con Odoo/reportes contables
- [x] Tener convenios digitalizados y disponibles en pantalla

> **Principio básico:** El dato se carga una sola vez.

---

## 8. Impacto en ISO 9001

Obligaciones de registro:
- Pasajero cargado en CRM
- Voucher emitido
- Venta cobrada
- Mail enviado
- Llamada grabada
- Seguimiento correspondiente

> Mejorar el CRM y la integración no solo ayudaría a vender más rápido, sino también a cumplir con ISO.

---

## 9. Leads Web y Carga Masiva

- Llegan desde la web, especialmente fines de semana o alto volumen.
- Actualmente se bajan en Excel y se gestionan manualmente.

**Mejoras planteadas:**
- Pantalla/módulo independiente para leads web
- Importar Excel de forma masiva
- Registrar estados: pendiente, vendido, perdido, recontactar
- Usar Google Sheets como fuente intermedia

---

## 10. Pendientes Asignados

### Lucas
- Consultar con Argentina/Diego sobre API Siebel
- Pedir documentación técnica lectura/escritura Siebel
- Evaluar acceso a Odoo
- Pensar diseño funcional de cotizador/emisor integrado
- Hablar con Alejandro sobre licencias Microsoft 365
- Revisar WhatsApp/Genesys

### Equipo de Marianna
- **Documentar convenios comerciales actuales**
- **Listar productos, condiciones, beneficios y promociones**
- **Identificar casos de cotización más comunes**
- Marcar qué adicionales son frecuentes vs consulta especial
- Validar qué campos del CRM son realmente necesarios

### Javier
- Acompañar definición del proceso ideal
- Ordenar lógica funcional antes de desarrollo
- Evaluar alternativas si API Siebel no permite escritura

### CRM Actual (Mejoras Tácticas)
- Ajustar campos y orden de carga
- Mejorar recontactos
- Agregar exportación filtrada por fecha/estado
- Validar duplicados de voucher
- Agregar venta anual renovable para otra vendedora
- Revisar dashboards facturado / a facturar

---

## 11. Conclusión General

El problema de fondo: el proceso comercial está dividido entre demasiados sistemas que no conversan entre sí.

**Visión de mejora:**
> Flujo integrado donde ventas pueda: cotizar rápido → comparar opciones → registrar seguimiento → enviar propuestas → emitir vouchers → dejar trazabilidad completa para ISO, contabilidad y gestión comercial.

Mientras eso se define, hacer mejoras tácticas en el CRM actual para aliviar la operación diaria.
