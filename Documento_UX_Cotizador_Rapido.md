# Propuesta UX: Tarificador Rápido "One-Click Quote"
**Cliente:** Universal Assistance (Uruguay)
**Objetivo:** Reducir drásticamente el tiempo de cotización telefónica, mitigar la pérdida de leads por demoras en el sistema Siebel y proveer a las vendedoras de una herramienta en tiempo real para cotizar y confirmar pagos sin ventanas emergentes (pop-ups).

---

## 1. El Concepto: Pantalla Única (Single Page Layout)
La interfaz de usuario está diseñada para funcionar como un **Tarificador Rápido en tiempo real** de una sola pantalla. Se divide visualmente en tres columnas estructuradas de izquierda a derecha para seguir un flujo de lectura natural. 

Toda la aplicación está optimizada para el uso exclusivo del teclado (Tabulador, flechas, teclado numérico y teclas de función F4, F8, F9, F10) permitiendo a la vendedora mantener la velocidad durante la llamada.

### Columna 1: DATOS DE CONTACTO Y VIAJE
*Ubicada a la izquierda. Su objetivo es capturar el lead inmediatamente y establecer los parámetros básicos del viaje.*

- **Datos del Prospecto (Siempre Visibles):**
  - **Nombre Completo:** Campo de texto único para ahorrar saltos.
  - **Teléfono/Celular:** Campo numérico. (Detecta automáticamente números locales, ej: 099, para habilitar el envío por WhatsApp).
  - **Email:** Campo de correo.
- **Captura de Datos del Viaje:**
  - **Destino Principal:** Buscador inteligente con autocompletar (Ej. Europa, Básico América).
  - **Tipo de Viaje:** Botones de selección rápida (Vacaciones, Trabajo, Estudios).
  - **Fechas / Duración:** Opción rápida de "Cantidad de días" como atajo para cotizar inmediatamente sin definir fechas exactas.
  - **Pasajeros:** Selectores de cantidad con botones `[ - ]` y `[ + ]` agrupados por edad:
    - Adultos (-65)
    - Mayores (65+)
    - Menores
- **Acción Inferior:** Botón prominente `[F4] APLICAR CONVENIOS`.

### Columna 2: SELECCIÓN DE CONVENIO Y EXTRAS
*Ubicada en el centro. El acelerador de ventas que resuelve el problema del cálculo manual de descuentos locales.*

- **Selección de Convenios Activos:**
  - Grilla visual con logotipos de entidades locales (SEMM, OCA, Mastercard, Itaú Visa, Santander, Scotiabank, ANDA, BROU).
  - Al seleccionar una entidad, se despliega instantáneamente el beneficio (Ej. "Descuento 30% en Maximum").
- **Adicionales y Extras (Upgrades):**
  - Listado de add-ons mediante botones grandes tipo "Checkbox", con un impacto financiero instantáneo.
  - Opciones como:
    - Preexistencias Extendidas (+USD 4.50 p/día)
    - Tecnología Protegida (+USD 15 Fijo)
    - Pack Deportes Extremos (+USD 3.00 p/día)
    - Cobertura Mascotas (+USD 10 Fijo)
    - Cancelación de Viaje Plus
  - Al marcar uno de estos, los precios en la Columna 3 se recalculan en menos de 1 segundo.
- **Resumen:** Total parcial de adicionales y descuentos aplicados.

### Columna 3: PROPUESTA Y COTIZACIÓN
*Ubicada a la derecha. Presenta tres opciones claras de venta (Bueno, Bonito y Mejor) con precios dinámicos.*

- **Parrilla de Resultados:**
  - **Opción Económica (Básico):** Precio de lista tachado vs Precio final.
  - **Opción Recomendada (Maximum - Best Value):** Tarjeta destacada visualmente con los descuentos de la Columna 2 y Extras ya sumados.
  - **Opción Premium:** Mayor cobertura para up-selling.
- **Visualización de cada tarjeta:**
  - Nombre del plan y tope de cobertura ($60K, $150K, $300K).
  - Desglose: Precio por Pasajero y Total General (Impuestos Incluidos).
  - 3 Bullets Comerciales para argumentar la venta.
- **Acciones Rápidas (Pie de página):**
  - `[F8] ENVIAR POR WA / EMAIL`
  - `[F9] EXPORTAR A SIEBEL PARA PAGO`
  - `[F10] NUEVA COTIZACIÓN`

---

## 2. Flujo de Cierre y Pago Express (Workflow)

El flujo evita interactuar con el CRM Siebel hasta que la transacción está matemáticamente cerrada y el pago se ha confirmado.

1. **Identificación Rápida:** La vendedora digita nombre y teléfono al saludar. Si la llamada cae, el lead queda guardado.
2. **Parámetros y Calificación:** Se define el viaje, los pasajeros y se indaga si el cliente posee tarjeta/convenio para seleccionar en la Columna 2.
3. **Descubrimiento y Presentación:** Se añaden upgrades y se presenta la oferta de la Columna 3.
4. **Decisión del Cliente:**
   - **No compra al instante:** Presiona `[F8]` y el sistema envía un PDF/Link por WhatsApp y agenda el lead para seguimiento posterior.
   - **Acepta el Precio:** La vendedora inicia el "Cierre Express".
5. **Generación del Pago Inmediato:**
   - Se despliega modal para: **Generar Link de Pago Tarjeta** o **Copiar Datos de Depósito**.
   - Con un botón, se envía el link por WhatsApp/Email al cliente.
6. **Estado de Escucha Activa (Spinner):**
   - El sistema en pantalla atenúa la cotización y muestra un spinner: *🔄 Esperando confirmación de pago de la pasarela...* junto a un temporizador.
7. **Validación Automática:**
   - Cuando la pasarela aprueba (API/Webhook), suena un 'ping' y aparece un bloque verde: *¡PAGO APROBADO CON ÉXITO!*.
   - El botón `[F9] EXPORTAR A SIEBEL` se enciende (rojo vibrante o azul).
8. **Exportación a Siebel:**
   - Al presionar `[F9]`, todos los datos (Contacto + Viaje + Convenio + Transacción) viajan al CRM y precargan el 80% de los campos obligatorios.
   - La vendedora ingresa a Siebel únicamente para tipear las Cédulas/Nombres de los acompañantes y emitir el voucher final.

---

## 3. Beneficios Técnicos y Operativos
- **Tiempo de Cotización:** Se reduce de 3-4 minutos a menos de 20 segundos.
- **Cero Frustración Mental:** Eliminación de planillas de Excel y cálculos manuales de descuentos por pasajero.
- **Cierre Seguro:** Se cobra o valida la transferencia antes de realizar el ingreso de datos lentos, reduciendo tiempos muertos por tarjetas rechazadas en instancias finales.
- **Interrupción de Caída de Leads:** Al recolectar el celular al principio y ofrecer el botón `[F8]`, las oportunidades no se evaporan al cortar el teléfono.
