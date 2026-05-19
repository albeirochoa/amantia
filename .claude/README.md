# Claude Code · Configuración del proyecto Amantia

Esta carpeta contiene la configuración de Claude Code para el proyecto Amantia. Cuando abres este repo con `claude` en la terminal, Claude Code lee automáticamente estos archivos y carga el contexto del proyecto, los agentes especialistas, y los permisos.

## Estructura

```
.claude/
├── agents/
│   ├── amantia-deploy.md    # Especialista en deploy a producción
│   └── amantia-content.md   # Especialista en copy y secciones
├── commands/
│   └── deploy.md            # Slash command /deploy
└── settings.json            # Permisos del proyecto
```

Además, el archivo `CLAUDE.md` en la raíz del proyecto es el contexto principal que Claude Code lee al iniciar la sesión.

## Cómo usar

### 1. Instalar Claude Code (si no lo tienes)

```bash
npm install -g @anthropic-ai/claude-code
```

Requiere Node.js 20+.

### 2. Iniciar sesión en el proyecto

```bash
cd amantia-coming-soon
claude
```

Claude Code detecta automáticamente el `CLAUDE.md` y los agentes.

### 3. Invocar agentes

**Automático** (recomendado): solo describe lo que quieres hacer. Claude Code decide qué agente delegar:

```
> Quiero hacer deploy del sitio a Cloudflare Pages
[Claude Code delega a @amantia-deploy automáticamente]

> Cambia "Menos ruido. Más presencia." por "Menos ruido. Más alma."
[Claude Code delega a @amantia-content automáticamente, y probablemente te diga que no, porque "presencia" es central a la marca]
```

**Explícito** (cuando quieras forzar uno específico):

```
> @amantia-deploy verifica que el form de MailerLite esté funcionando en producción

> @amantia-content agrega la sección "Qué es Amantia" siguiendo el documento v1.1
```

### 4. Slash commands

Para flujos repetitivos, hay comandos custom:

```
/deploy
```

Ejecuta el flujo completo de deploy: validación, build, push, conexión a hosting.

### 5. Gestión de agentes desde dentro de Claude Code

```
/agents
```

Abre la interfaz interactiva para ver agentes activos, crear nuevos, o editar los existentes.

## Por qué dos agentes y no uno

Separar deploy de contenido es deliberado:

- **Deploy** necesita acceso a Bash, git, build tools. Es ejecución técnica.
- **Content** solo necesita Read/Edit/Write en `src/`. Es trabajo editorial.

Si un mismo agente hiciera ambas cosas, podría accidentalmente "arreglar" un build mientras edita copy, o cambiar copy mientras hace deploy. La separación protege contra estos cross-overs.

Además, cuando le pides a Claude Code "cambia este texto", no necesita cargar todo el contexto de Cloudflare Pages, DNS, y MailerLite. El agente de contenido es más ligero, más rápido, y menos propenso a errores.

## Permisos · settings.json

Los permisos en `settings.json` definen qué comandos puede ejecutar Claude Code sin pedirte confirmación cada vez. Las reglas importantes:

**Permitido sin preguntar:**
- Comandos npm del proyecto
- Operaciones git normales
- Lectura/edición en `src/` y `public/`
- Lectura del `.env.example`

**Bloqueado siempre:**
- Cualquier acceso a `.env` (las credenciales reales)
- `rm -rf` (protección contra borrado accidental)
- Comandos a APIs de email externas (SendGrid, Twilio) — solo MailerLite vía fetch en runtime

Si Claude Code necesita hacer algo no listado, te preguntará explícitamente.

## Extender el sistema

### Agregar un agente nuevo

Crea un archivo `.md` en `.claude/agents/` con frontmatter YAML:

```markdown
---
name: nombre-corto
description: Cuándo usar este agente (clave para la delegación automática)
tools: Read, Edit, Bash
model: sonnet
---

# Instrucciones del system prompt aquí
```

La `description` es lo más importante: Claude Code la lee para decidir cuándo delegar automáticamente.

### Agregar un slash command

Crea un archivo `.md` en `.claude/commands/`. El nombre del archivo es el comando (sin barra inclinada):

```
.claude/commands/preview.md → /preview
.claude/commands/lighthouse.md → /lighthouse
```

### Agentes que podrían ser útiles a futuro

Cuando llegues a la landing completa y al portal QuebradaNegra.com, considera agregar:

- `@quebradanegra-content` — para guías editoriales en markdown con frontmatter SEO
- `@amantia-seo` — para auditar Lighthouse, meta tags, schema.org markup
- `@amantia-analytics` — para integrar Plausible o Umami sin código intrusivo

No los crees ahora. Crea agentes cuando detectes que un patrón se repite, no antes.

## Recursos

- **Documentación oficial:** https://docs.claude.com/en/docs/claude-code/overview
- **Subagentes:** https://docs.claude.com/en/docs/claude-code/sub-agents
- **Slash commands:** https://docs.claude.com/en/docs/claude-code/slash-commands
