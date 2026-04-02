# IdeasPADIA

IdeasPADIA es una plataforma integral diseñada para la concepción, votación, discusión y seguimiento del ciclo de vida de ideas y proyectos de software. La comunidad puede aportar ideas, iterarlas con Inteligencia Artificial, proponer proyectos de implementación y votar por el mejor enfoque hasta llegar a una etapa oficial de desarrollo técnico.

---

## Características Principales

- **Gestión del Ciclo de Vida de Ideas**: Seguimiento de los requisitos a través de las fases: `Idea` ➔ `Exploración` ➔ `Validada` ➔ `En proyecto` ➔ `Desarrollada` ➔ `Descartada`.
- **Asistente de IA Integrado (OpenAI)**: Herramienta interactiva para realizar *brainstorming* y afinar el análisis de los requerimientos y descripciones técnicas de las ideas propuestas.
- **Sistema de Propuestas y Votación Dinámica**: Los usuarios pueden proponer implementaciones técnicas (proyectos) basadas en una sola idea. La comunidad otorga votos libremente y, si cambian de opinión, pueden retirar o mover su voto iterativamente hacia otras opciones.
- **Asignación de Ganadores**: Los administradores evalúan y declaran a un proyecto como ganador oficial frente a los demás. Cuando la idea asciende al estatus final de "Desarrollada", el sistema habilita y enruta el enlace de repositorio final en GitHub para el uso público de todos los interesados.
- **Comentarios y Discusiones**: Capa conversacional donde los miembros entran en debates para discutir ventajas o debilidades sobre un proyecto sin saturar el esquema base de la vista.
- **Permisos Estrictos y RBAC (Control Basado en Rol)**: Envolturas de seguridad tanto en la interfaz (React) como en la API backend (FastAPI), validando el acceso a herramientas de eliminación, edición de autor original y controles de administración global (`admin`).

---

## Arquitectura y Tecnologías

### Frontend (Cliente SPA)
- **Framework Core**: React 19 + Vite.
- **Estilos y Maquetación**: Tailwind CSS, proporcionando esquemas ligeros sin archivos CSS gigantescos.
- **Llamadas API REST**: Axios.
- **Iconografía Activa**: Lucide React.
- **Ruteo**: React Router DOM (v7).

### Backend (API RESTful)
- **Framework Web**: FastAPI (Python 3.10+).
- **Base de Datos**: SQLite nativo mapeando objetos ORM mediante SQLAlchemy.
- **Seguridad / Criptografía**: Hash seguro de contraseñas Bcrypt mediante `passlib`, tokens `JWT` a través de `python-jose`.
- **Inteligencia Artificial**: OpenAI API Python SDK nativo.
- **Servidor ASGI**: Uvicorn.

---

## Requisitos Previos

1. [Node.js](https://nodejs.org/es/) (v18 LTS o superior) junto al administrador de paquetes nativo `npm`.
2. Entorno [Python](https://www.python.org/downloads/) en versión `3.10` o superior.
3. Una cuenta de [OpenAI](https://platform.openai.com/) y un **API Key activo**. IMPORTANTE: El token debe disponer de créditos/saldo en banda Tier, a fin de evitar caídas HTTP bajo reportes de un `Error code: 401 - Incorrect API key provided`.

---

## Instalación y Configuración Local

### 1. Clonar el repositorio
Extrae la información principal de la carpeta remota y accede a su origen:
```bash
git clone <URL_DEL_REPOSITORIO>
cd IdeasPADIA
```

### 2. Configuración del Servidor API (Backend)
```bash
# Entra al directorio de trabajo del servidor python
cd backend

# Aislar el entorno dependencias de terceros (Obligatorio)
python -m venv .venv

# Activa el entorno virtual:
# - En entornos Windows con Powershell:
.\.venv\Scripts\Activate.ps1
# - En entornos MacOS/Linux estándar:
source .venv/bin/activate

# Descarga las dependencias
pip install -r requirements.txt

# Configura las cláves secretas de Entorno (OBLIGATORIO)
# Asegúrate que el archivo `.env` contenga tus datos para arrancar motores como la DB y OpenAI.
cp .env.example .env

# Echa a andar el servidor Uvicorn en caliente ("--reload")
uvicorn app.main:app --reload

# Por defecto, el servidor empezará a resolver peticiones en: http://127.0.0.1:8000
```

### 3. Configuración del Cliente Visual (Frontend)
Abriendo un hilo de terminal paralelo u otra pestaña:
```bash
# Entra a la ruta base de React
cd frontend

# Compila y atrae todo el set dependiente de Node en `/node_modules`
npm install

# Corre el servidor local instantáneo basado en Vite:
npm run dev

# Al finalizar la carga, tu interfaz habitualmente estará alojada y dispuesta en: http://localhost:5173
```

---

## Despliegue con Docker Compose (Opcional)

Si deseas utilizar la infraestructura aislada mediante contendores en vez de compilar mediante entornos virtuales y archivos Node, la raíz principal del proyecto implementa abstracción de los dos nodos a través de `compose`.  
*(Verifica primero haber configurado las variables `.env` dentro de las carpetas internas para dotar a las build variables contextuales)*.

```bash
docker compose up --build
```

---

## Estructura Esencial de Carpetas

```text
IdeasPADIA/
├── .gitignore              # Exclusiones de repositorios seguros Git (Evitación de tokens filtrados)
├── README.md               # Este documento
├── backend/                # Endpoints controlados directamente con FastAPI y Python
│   ├── .env.example        # Base template para configurar la API e incrustar claves (.env protegido)
│   ├── requirements.txt    # Lista depurable y rastreable del backend de pip
│   ├── app/
│   │   ├── main.py         # Entrypoint asíncrono
│   │   ├── models.py       # Definición de Tablas Declarativas orientadas en SQL local
│   │   ├── schemas.py      # Estructuras de verificación Pydantic y tipado seguro.
│   │   └── api/            # Archivos modulares de lógica enrutada pura (ideas.py, ai.py...)
│   └── sql_app.db          # Base de datos SQLite (almacenamiento crudo persistente)
└── frontend/               # Lado visible Single-Page (SPA) orquestado por Vite
    ├── package.json        
    ├── vite.config.js      # Herramientas extra en pipeline transpilador principal.
    └── src/
        ├── api/            # Instancias inyectoras e interceptores de credenciales para Axios 
        ├── pages/          # Pantallas macro (Dashboard, Login y Detalle de idea).
        └── components/     # Widgets sueltos a lo largo de la UX (Iconos y Navbars).
```

---

## Notas de Seguridad y Mantenimiento
- Las credenciales y llaves (API Keys) **nunca** deben subirse al control de versiones (`git add .`). Asegúrate de que el `.gitignore` mantenga bloqueado el archivo `.env`.
- Cualquier operación sensible en el backend (como eliminación o asignaciones) recae ineludiblemente bajo comprobación RBAC (Validando si `current_user.role == 'admin'` o si el emisor es el creador original del recurso).
