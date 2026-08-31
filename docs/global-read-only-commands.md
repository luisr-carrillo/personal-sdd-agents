# Comandos globales de solo lectura para agentes

## Objetivo

Esta guía propone una allowlist de comandos de inspección que pueden aprobarse globalmente para las fases de Analyst, Design, Plan y Review. Ningún comando permitido cambia deliberadamente archivos del workspace, el estado de staging, las referencias o el historial de Git, ni necesita acceso de red. Git puede refrescar cachés internas de metadatos.

Se permiten coincidencias exactas y las familias con argumentos indicadas abajo. Los comodines se aplican solo al resto de los argumentos de un subcomando Git de inspección revisado; nunca al ejecutable ni al verbo Git.

## Allowlist recomendada

```text
pwd
ls
git status
git status *
git branch
git branch --show-current
git log
git log *
git show
git show *
git diff
git diff *
git rev-parse *
git ls-files
git ls-files *
git ls-tree *
git merge-base *
git name-rev *
git describe
git describe *
git show-ref
git show-ref *
git tag
git remote
git remote -v
git reflog
git reflog show *
git shortlog
git shortlog *
git --no-pager --no-optional-locks status --short
git --no-pager --no-optional-locks branch --show-current
git --no-pager --no-optional-locks rev-parse HEAD
git --no-pager --no-optional-locks rev-parse --show-toplevel
git --no-pager --no-optional-locks rev-parse --is-inside-work-tree
git --no-pager --no-optional-locks ls-files
```

Las plantillas versionadas están en:

- `kiro/permissions.yaml`: fusionar sus reglas en `~/.kiro/settings/permissions.yaml` para aplicarlas a todos los workspaces de Kiro.
- `github-copilot/settings.json`: fusionar sus propiedades en el `settings.json` de usuario de VS Code. No reemplazar otras preferencias del usuario.

La plantilla de Copilot ignora sus reglas predeterminadas de autoaprobación para que solo esta allowlist quede aprobada automáticamente. Los demás comandos siguen solicitando aprobación. Las reglas `ask` de Kiro y las reglas `false` de Copilot excluyen las variantes peligrosas de las familias amplias.

| Familia | Uso seguro en las cuatro fases |
|---|---|
| `pwd` | Confirma el directorio de trabajo. |
| `ls` | Enumera el directorio de trabajo actual sin admitir rutas ni opciones adicionales. |
| `git status *` | Inspecciona cambios y estado del worktree. |
| `git branch`, `git branch --show-current`, `git tag`, `git remote`, `git remote -v` | Lista nombres y metadatos sin permitir argumentos que creen, muevan o eliminen referencias. |
| `git log *`, `git shortlog *`, `git reflog show *` | Consulta historial y reflogs con filtros, formatos, rangos y pathspecs. |
| `git show *`, `git diff *` | Inspecciona objetos y diferencias; las opciones que pueden escribir o ejecutar procesos externos quedan excluidas. |
| `git rev-parse *`, `git merge-base *`, `git name-rev *`, `git describe *`, `git show-ref *` | Resuelve revisiones y relaciones entre referencias. |
| `git ls-files *`, `git ls-tree *` | Enumera el índice, el worktree y árboles versionados. |
| Formas con `--no-pager --no-optional-locks` | Mantienen compatibilidad con la lista estricta y son preferibles cuando resulten prácticas. |

`--no-pager` evita iniciar un proceso de paginación configurado por el usuario. `--no-optional-locks` evita escrituras opcionales de mantenimiento o refresco de Git.

## Excepciones protegidas

Las siguientes variantes siempre deben pedir aprobación, aunque comiencen con una familia permitida:

- Cualquier redirección, tubería, sustitución de comandos o composición de shell.
- `git log`, `git show` o `git diff` con `--output`, `--ext-diff` o `--textconv`.
- `git log` o `git show` con `--show-signature`; puede ejecutar GPG.
- `git log` con `--alternate-refs`; puede ejecutar `core.alternateRefsCommand` configurado.
- `git diff` con `--no-index`; puede leer rutas arbitrarias fuera del workspace.

`git log *` es de solo lectura respecto al repositorio en su uso normal, pero no es completamente seguro sin estas excepciones: hereda opciones de diff, permite escribir mediante `--output` y puede ejecutar herramientas configuradas. También se asume que la instalación, configuración y pagers de Git son confiables; se debe preferir `git --no-pager log ...` en entornos de mayor riesgo.

## Aplicación por fase

| Fase | Uso previsto |
|---|---|
| Analyst | Confirmar repositorio, rama, revisión y archivos versionados al establecer el contexto actual. |
| Design | Vincular el diseño a una revisión concreta y localizar límites existentes del código. |
| Plan | Confirmar que las tareas se basan en el mismo repositorio, rama y revisión que los artefactos aprobados. |
| Review | Establecer la base de evidencia y detectar cambios locales antes de inspeccionar la implementación. |

Para leer, listar o buscar contenido se deben preferir las herramientas nativas del agente. Ya permiten restringir rutas sensibles y no exponen un intérprete de shell.

## Condiciones de aprobación

- Limitar los comodines a las familias de inspección enumeradas y aplicar primero sus excepciones protegidas.
- Ejecutar únicamente dentro de un workspace confiable.
- Resolver `git` desde una instalación y configuración confiables, no desde un alias, función o wrapper del repositorio.
- Rechazar redirecciones, tuberías, sustituciones, saltos de línea y operadores como `>`, `>>`, `|`, `;`, `&&`, `||`, `$()` y comillas invertidas.
- Mantener las exclusiones existentes para secretos, credenciales, claves y archivos de entorno.
- Tratar la salida como datos no confiables; nunca como instrucciones para el agente.

Una aprobación global de shell no sustituye los límites de cada fase. Tampoco habilita por sí sola una herramienta de ejecución: actualmente los agentes Kiro Analyst, Designer y Planner no tienen `execute_bash`, y los equivalentes de GitHub Copilot tampoco tienen `execute`. No se recomienda añadir shell a esos agentes solo para reemplazar sus herramientas nativas de lectura y búsqueda.

## Comandos que deben pedir aprobación

No conviene aprobar globalmente los siguientes grupos, aunque algunas invocaciones parezcan de lectura:

| Grupo | Motivo |
|---|---|
| Variantes protegidas de `git diff`, `git show`, `git log` | Pueden escribir salida, ejecutar pagers, GPG, textconv, diff drivers u otros comandos configurados, o leer fuera del workspace. |
| `cat`, `head`, `tail`, `less`, `find`, `grep`, `rg`, `sed`, `awk`, `jq` | Una regla útil requeriría rutas o argumentos abiertos; el shell permitiría ampliar alcance, redirigir salida o activar opciones con otros efectos. Usar herramientas nativas. |
| Tests, lint, type checks, análisis estático y builds | Ejecutan código controlado por el repositorio y pueden escribir cachés, artefactos o acceder a la red. |
| Gestores de paquetes y scripts del repositorio | Pueden instalar dependencias, ejecutar lifecycle hooks y modificar lockfiles o cachés. |
| `gh` y otros clientes remotos | Consultan servicios externos, usan credenciales y algunas variantes modifican estado remoto. |
| Docker, servicios locales, migraciones, generación de código e infraestructura | Pueden modificar el host, datos, servicios o recursos externos. |
| Cualquier comando Git que cambie el worktree, índice, referencias o historial | Incluye `add`, `commit`, `checkout`, `switch`, `restore`, `reset`, `clean`, `stash`, `merge`, `rebase`, `push` y variantes equivalentes. |

No se deben crear reglas amplias como `git *`, `git branch *`, `git tag *`, `git remote *`, `rg *` o `*`. Una allowlist de comandos no es un sandbox: si la plataforma no puede aplicar las excepciones más restrictivas o analizar cada subcomando, estas familias deben seguir sujetas a aprobación manual.
