# Campus Norte

**Explora universidades. Descubre una ciudad. Prepara tu próxima visita.**

## Integrantes

- **Integrante:** Luis Guillermo Perez Calle
- **Programa:** Especialización en Ingeniería de Software
- **Asignatura:** Desarrollo de Software II

## Propósito y alcance

Campus Norte es una aplicación web construida con Angular. Reúne un directorio de universidades y el clima de la ciudad donde se encuentran, de modo que alguien que evalúa dónde estudiar pueda explorar instituciones y preparar una visita desde un mismo lugar.

Consume dos APIs públicas: **Universities API (Hipo)** para el directorio y **OpenWeather** para el clima actual y el pronóstico.

Alcance y límites:

- Cubre universidades de Colombia, España, México, Argentina, Chile y Perú.
- Hipo devuelve nombre, país, provincia, dominios y sitio web; **no** devuelve ciudad, coordenadas, programas, costos ni rankings. Por eso `server/domain.mjs` asocia algunos dominios con una **sede sugerida** de un catálogo local y `server/data/cities.json` aporta coordenadas aproximadas del centro de cada ciudad.
- Las universidades sin asociación local muestran "Ciudad por elegir". Una universidad puede tener varias sedes.
- Favoritos y comparación se guardan en el `localStorage` del navegador: no hay cuentas, sincronización ni base de datos.
- Es un proyecto académico de ejecución local; el servidor escucha en `127.0.0.1`.

## Dependencias y ejecución

Requisitos: **Node.js 24 LTS** (el repositorio incluye `.nvmrc`), npm e Internet para instalar dependencias y consultar las APIs. No es necesario instalar Angular CLI de forma global.

```bash
npm install
npm start
```

Abre **http://localhost:4200**. El comando levanta Angular en el puerto 4200 y Express en el 3001; `Ctrl+C` detiene ambos.

> Node 25 no está en la matriz soportada por Angular 22. El proyecto incluye Node 24 como dependencia de desarrollo y los scripts de npm usan ese ejecutable local, así que no altera tu instalación global.

### Clave de OpenWeather

1. Regístrate en [OpenWeather](https://home.openweathermap.org/users/sign_up) y copia tu clave.
2. Crea el archivo `.env` a partir del ejemplo: `cp .env.example .env` (en PowerShell: `Copy-Item .env.example .env`).
3. Edita los valores:

```dotenv
OPENWEATHER_API_KEY=pega_aqui_tu_clave
DEMO_MODE=false
UNIVERSITIES_DEMO=false
PORT=3001
```

4. Reinicia `npm start`. El panel mostrará **"Datos de OpenWeather"** cuando reciba una respuesta válida.

La clave se lee **solo en el servidor**: nunca llega al bundle de Angular. `.env` está en `.gitignore`, por lo que se comparte únicamente `.env.example`. Universities API no requiere clave.

### Ejecutar sin clave ni Internet

Con `DEMO_MODE=true` y `UNIVERSITIES_DEMO=true`, la aplicación funciona con el catálogo incluido en `server/data/universities.json` y datos de clima ilustrativos, identificados en la interfaz como **demostración**.

### Comandos

| Comando              | Propósito                                                         |
| -------------------- | ----------------------------------------------------------------- |
| `npm start`          | Angular + API con recarga durante el desarrollo                   |
| `npm test`           | Pruebas de dominio y rutas HTTP; no requieren clave ni Internet   |
| `npm run build`      | Compilación optimizada con validación estricta                    |
| `npm run serve:prod` | Sirve el compilado en `http://localhost:3001`                     |
| `npm run test:e2e`   | Pruebas en Chrome sobre el compilado (ejecuta antes `npm run build`) |

## Funcionalidades

- Exploración de universidades de seis países, con búsqueda por nombre o dominio sin distinguir tildes ni mayúsculas.
- Filtros por país y ciudad, ordenamiento, paginación y alternancia entre vista de lista y de tarjetas.
- URLs que conservan país y filtros, de modo que una consulta se puede compartir.
- Favoritos persistentes en `localStorage`.
- Comparación de hasta tres universidades y descarga de sus datos en CSV.
- Ficha de cada universidad con enlace a su sitio institucional y checklist de visita.
- Clima actual de la ciudad: temperatura, sensación térmica, humedad y viento.
- Pronóstico de hasta cinco fechas con rangos térmicos y probabilidad de lluvia, incluida la sugerencia del día con menor probabilidad.
- Estados de carga, resultados vacíos, fallos de conexión, clave inválida y límite de peticiones.
- Diseño adaptable, navegación por teclado y etiquetas accesibles.

Capturas: [escritorio](docs/campus-desktop.png) · [móvil](docs/campus-mobile.png).

## Estructura del proyecto

```text
src/
  main.ts                       # Arranque y proveedores de Angular
  styles.css                    # Diseño adaptable y estilos compartidos
  app/
    app.component.ts            # Menú, cabecera, notificaciones y RouterOutlet
    app.routes.ts               # Rutas y carga de páginas bajo demanda
    core/
      models.ts                 # Interfaces TypeScript
      api.service.ts            # HttpClient: universidades, clima y configuración
      saved.service.ts          # Favoritos, comparación y localStorage
    shared/
      icon.component.ts         # Iconos SVG reutilizables
      university-card.component.ts
      weather-panel.component.ts
    pages/
      explore.component.ts      # Filtros, estado y paginación
      explore.component.html    # Plantilla del explorador
      detail.component.ts       # Ficha y preparación de visita
      saved.component.ts        # Favoritos
      compare.component.ts      # Comparación y exportación
      about.component.ts        # Propósito, APIs y configuración
server/
  index.mjs                     # Inicio del servidor
  app.mjs                       # Rutas Express, peticiones, caché y errores
  domain.mjs                    # Normalización y resumen del pronóstico
  data/                         # Catálogo, ciudades y licencia de Hipo
public/                         # Ilustración, favicon y fuentes con licencias
tests/                          # Pruebas unitarias, de API y de navegador
docs/                           # Evidencia visual
```

El navegador consulta rutas relativas `/api/...`. En desarrollo, `proxy.conf.json` las redirige a Express; en producción, Express sirve el Angular compilado y las rutas `/api` en el mismo origen. El servidor intermedio existe porque Hipolabs publica su API sobre HTTP y porque mantiene la clave de OpenWeather fuera del navegador.

## Consumo de las APIs

Se integran **dos proveedores y tres endpoints**:

| Servicio                  | Endpoint externo                                   | Parámetros                                       | Uso                              |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------ | -------------------------------- |
| Universities API          | `http://universities.hipolabs.com/search`          | `country`                                        | Directorio del país seleccionado |
| OpenWeather: clima actual | `https://api.openweathermap.org/data/2.5/weather`  | `lat`, `lon`, `appid`, `units=metric`, `lang=es` | Condiciones de la ciudad         |
| OpenWeather: pronóstico   | `https://api.openweathermap.org/data/2.5/forecast` | Los mismos parámetros                            | Intervalos de 3 horas por 5 días |

La búsqueda por nombre se aplica en Angular sobre la respuesta del país, para evitar una petición por cada tecla.

## Uso de IA

Se utilizó IA como guía para la creación del código. Este README fue redactado con IA.

## Créditos

- [Hipo · University Domains and Names Data List & API](https://github.com/Hipo/university-domains-list): datos y API, licencia MIT incluida en `server/data/HIPO-LICENSE.txt`.
- [OpenWeather](https://openweathermap.org/api): clima actual y pronóstico.
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) y [Manrope](https://fonts.google.com/specimen/Manrope): fuentes abiertas, licencias OFL en `public/fonts`.
- Ilustración SVG, iconos y marca Campus Norte creados para este proyecto.
