# Fuentes de datos de RadarTheus

RadarTheus separa tres conceptos para no presentar estimaciones como hechos:

1. **Mercado observado**: precios visibles públicamente en marketplaces mexicanos en una fecha concreta.
2. **Mayoreo verificado**: precio mayorista solamente cuando existe una cotización pública o una integración autenticada que lo confirma.
3. **Proveedor verificado**: significa que se verificó la identidad y el portal oficial del mayorista. No significa que RadarTheus garantice stock, precio, calidad del servicio o un SKU concreto.

## Observación inicial — 23 de agosto de 2026

### Power Bank magnético Qi2

Fuente: Mercado Libre México

- https://listado.mercadolibre.com.mx/power-bank-qi2
- En la observación se encontraron entre los primeros resultados Power Banks Anker Qi2 de 5,000 mAh alrededor de $710 MXN y una opción de 10,000 mAh alrededor de $810 MXN.
- Rango almacenado como **mercado observado**: $710–$810 MXN.
- No se almacena un costo mayorista porque todavía no existe una cotización mayorista verificable para esos SKU.

### Cargador GaN USB-C 65W

Fuente: Mercado Libre México

- https://listado.mercadolibre.com.mx/cargador-65w-gan
- La observación mostró una publicación de 65W marcada como “Más vendido” alrededor de $271 MXN y alternativas de marca alrededor de $738 MXN.
- Rango almacenado como **mercado observado**: $271–$738 MXN.
- Se excluyeron del límite inferior publicaciones internacionales extremadamente baratas para no mezclarlas con referencias locales comparables.

### Audífonos Open-Ear

Fuentes: Mercado Libre México

- https://listado.mercadolibre.com.mx/audifonos-open-ear
- https://listado.mercadolibre.com.mx/electronica-audio-video/audio/audifonos/open-ear/_Tienda_all
- La categoría mostraba miles de resultados en la búsqueda amplia y más de 200 resultados dentro de la categoría Open-Ear al momento de la revisión.
- Entre resultados locales comparables se observaron opciones alrededor de $177 MXN y modelos Soundcore alrededor de $685 MXN.
- Rango almacenado como **mercado observado**: $177–$685 MXN.

## Mayoristas verificados

### Exel del Norte

- Portal oficial: https://www.exel.com.mx/
- Página corporativa: https://www.exel.com.mx/acerca-de-exel
- Catálogo/tienda: https://www.exel.com.mx/xlstore/Landing/Nuevo
- El propio sitio se describe como mayorista de tecnología y muestra categorías como accesorios celulares, audífonos, cargadores, cómputo y electrónica de consumo.
- Los precios pueden requerir una cuenta de distribuidor, por lo que RadarTheus no inventa un precio mayorista.

### Grupo CVA

- Portal oficial: https://www.grupocva.com/
- Registro de distribuidor: https://grupocva.com/distribuidorcva/index.php
- Se presenta como mayorista de tecnología y publica categorías de electrónica de consumo, energía, gaming, IoT/wearables, cómputo y otras soluciones.
- Inventarios y precios se consultan mediante su canal de distribución; RadarTheus no los da por confirmados sin acceso verificable.

## ElectroScore

El `ElectroScore` inicial es una heurística interna, no una métrica proporcionada por Mercado Libre ni una garantía de ventas. En la primera observación `growthScore` se mantiene neutral porque no hay dos puntos temporales para calcular crecimiento real.

La dirección de tendencia permanece `STABLE` hasta acumular historial suficiente. Cuando haya varias observaciones, RadarTheus podrá comparar precio, oferta, competencia y señales de demanda entre fechas para clasificar `RISING`, `STABLE` o `FALLING`.

## Regla de integridad

Si RadarTheus no puede verificar un precio mayorista, debe mostrar `N/D` o `Consultar`; nunca debe completar el dato con una estimación presentada como real.
