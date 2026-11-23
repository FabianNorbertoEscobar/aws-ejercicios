# AWS: ejercicios y laboratorios

Este repositorio reúne código, configuraciones y artefactos de prácticas realizadas para dos cursos de desarrollo en AWS: **AWS Developing** y **AWS Developing Serverless**. No es una única aplicación ni un proyecto listo para desplegar de punta a punta: cada carpeta corresponde a un laboratorio, una muestra o una parte de una aplicación de curso.

El README describe lo que se conserva en el repositorio. Algunos recursos y configuraciones son históricos y pueden depender de cuentas, roles, nombres, endpoints o versiones de herramientas que ya no están disponibles. Revisá y adaptá esos valores antes de ejecutar cualquier script o hacer un despliegue.

## Contenido

| Curso / tema | Carpeta | Qué se practicó |
| --- | --- | --- |
| Developing: Amazon S3 | [`labs aws developing/lab-s3`](<labs aws developing/lab-s3>) | Crear buckets y objetos, alojar un sitio estático y transformar CSV a JSON. |
| Developing: Amazon DynamoDB | [`labs aws developing/lab-dynamo-db`](<labs aws developing/lab-dynamo-db>) | Crear y cargar una tabla, consultar por clave, paginar resultados, actualizar ítems y usar PartiQL. |
| Developing: AWS Lambda y Polly | [`labs aws developing/lab-lambda`](<labs aws developing/lab-lambda>) | Operaciones sobre notas, síntesis de voz con Polly y entrega de audio desde S3. |
| Developing: aplicación final Polly Notes | [`labs aws developing/lab-final`](<labs aws developing/lab-final>) | Aplicación web de notas, especificación de API y artefactos de la integración con Cognito y servicios AWS. |
| Developing Serverless: ejemplos del segundo día | [`labs aws developing serverless/day-2-apps`](<labs aws developing serverless/day-2-apps>) | API serverless con SAM, procesamiento de errores, logs, trazas, capas Lambda y utilidades del entorno de laboratorio. |
| Developing Serverless: Bookmark App | [`labs aws developing serverless/app-code`](<labs aws developing serverless/app-code>) | Aplicación CRUD con API Gateway, Lambda y DynamoDB, más un flujo de revisión de marcadores con eventos y Step Functions. |

## AWS Developing

### Amazon S3: buckets, objetos y sitio estático

El laboratorio de S3 está compuesto por scripts Python que usan **Boto3** y una configuración local en `config.ini`.

1. **Crear y verificar un bucket** — `create-bucket.py` lee el nombre desde `[S3]`, comprueba si el bucket existe, lo crea en la región de la sesión y espera a que esté disponible. La creación contempla la particularidad de `us-east-1`, que no requiere `LocationConstraint`.
2. **Cargar un objeto** — `create-object.py` sube el CSV configurado con su `ContentType` y metadatos personalizados.
3. **Transformar CSV a JSON** — `convert-csv-to-json.py` descarga el objeto de S3, interpreta la primera fila como encabezado y convierte las filas siguientes en una lista JSON; luego guarda el resultado como otro objeto con tipo de contenido y metadatos.
4. **Publicar un sitio estático** — `create-s3-website.py` carga HTML, CSS e imágenes desde `html/`, configura los documentos de inicio y error de S3 Static Website Hosting y aplica una política de lectura pública. El script imprime la URL del endpoint de sitio web de la región.

Archivos de apoyo: `notes.csv` y `notes.json` son datos de ejemplo; `policy.json` y `website.json` contienen configuraciones relacionadas con acceso y hosting. La carpeta `html/` contiene la página y sus recursos estáticos.

**Qué se ejercita:** clientes de Boto3, configuración por archivo, operaciones de bucket y objeto, tipos de contenido y metadatos, waiters, lectura y escritura de objetos, y conversión de datos.

### Amazon DynamoDB: modelado, consultas y actualización

`lab-dynamo-db/config.ini` define la tabla `Notes`, las claves y los parámetros que consumen los scripts. `notes.json` aporta los datos iniciales.

- `createTable.py` crea una tabla con clave de partición `UserId` (cadena) y clave de ordenamiento `NoteId` (número), capacidad aprovisionada y un waiter para esperar su disponibilidad.
- `loadData.py` lee el JSON y carga las notas con el recurso de tabla de Boto3 (`put_item`).
- `queryData.py` consulta las notas de un usuario mediante la clave de partición y limita los atributos proyectados.
- `paginateData.py` recorre un `scan` con un paginator y un tamaño de página configurable. Muestra cómo procesar resultados por páginas, en vez de asumir que una respuesta contiene todos los elementos.
- `updateItem.py` agrega una marca `Is_Incomplete` y después actualiza condicionalmente la nota cuando esa marca tiene el valor esperado. Ilustra `UpdateExpression`, `ConditionExpression` y valores de retorno.
- `partiQL.py` ejecuta una sentencia PartiQL parametrizada para obtener un ítem por `UserId` y `NoteId`.

Las respuestas del cliente de bajo nivel de DynamoDB se deserializan para imprimirlas como JSON; el helper contempla tipos numéricos `Decimal` y conjuntos.

**Qué se ejercita:** diseño de clave compuesta, diferencias entre `query` y `scan`, proyección de atributos, paginación, carga de datos, expresiones de actualización y protección de cambios mediante condiciones. La tabla usa capacidad aprovisionada definida por el archivo de configuración; revisá el dimensionamiento y el costo para cualquier uso real.

### AWS Lambda, DynamoDB y Amazon Polly

`lab-lambda/` contiene handlers Python y eventos JSON de muestra asociados a una aplicación de notas. Las funciones separan responsabilidades:

- `createUpdate-function/app.py`: crea o reemplaza una nota en DynamoDB (`put_item`).
- `list-function/app.py`: obtiene notas de un usuario con `query`, o recorre la tabla con `scan` si no se recibe un usuario.
- `delete-function/app.py`: elimina una nota por su clave compuesta.
- `dictate-function/app.py`: busca una nota, sintetiza su texto a MP3 con **Amazon Polly**, escribe temporalmente el archivo en `/tmp`, lo sube a S3 y devuelve una URL prefirmada para descargarlo.

Las funciones esperan que el entorno Lambda proporcione variables como `TABLE_NAME`, `MP3_BUCKET_NAME` y `AWS_REGION`, además de permisos IAM para los servicios que invocan. Los archivos ZIP de esa carpeta son paquetes históricos; no reemplazan una compilación actual ni una configuración de despliegue.

### Aplicación final: Polly Notes

`lab-final/` conserva la especificación `swagger/PollyNotesAPI-swagger.yaml` y una aplicación web React en `web/`, junto con archivos compilados. La API documenta operaciones de notas, búsqueda y generación de audio, protegidas mediante un authorizer de **Amazon Cognito User Pools**, e integradas con funciones Lambda. El flujo de audio combina la nota de DynamoDB, Polly y un objeto MP3 servido mediante una URL prefirmada de S3.

La especificación OpenAPI/Swagger y el código deben leerse como material del laboratorio, no como una configuración desplegable actual: contienen referencias concretas de una cuenta y región anteriores y referencias a funciones cuyo código no está todo presente en el repositorio. Los archivos de `web/build/` son artefactos generados; el código fuente se encuentra en `web/src/`.

## AWS Developing Serverless

### Ejemplos con AWS SAM del segundo día

#### API HTTP y DynamoDB

`day-2-apps/serverless-api/template.yml` define una aplicación **AWS SAM** con una tabla DynamoDB y tres funciones Node.js:

| Endpoint | Operación | Handler |
| --- | --- | --- |
| `/` | `GET` — lista ítems con `Scan` | `src/getAllItems/get-all-items.js` |
| `/{id}` | `GET` — obtiene un ítem por clave | `src/getById/get-by-id.js` |
| `/` | `POST` — crea o reemplaza un ítem | `src/putItem/put-item.js` |

La tabla de ejemplo usa `id` como clave primaria. El template conecta rutas de API Gateway con funciones Lambda, inyecta el nombre de la tabla mediante `SAMPLE_TABLE` y declara una política de acceso DynamoDB para cada función. El ejercicio permite seguir la relación entre plantilla declarativa, permisos, variables de entorno, eventos HTTP y operaciones de persistencia.

#### Procesamiento de errores y observabilidad

`day-2-apps/error-processor/` contiene otro ejemplo SAM. El template define una cola SQS, un bucket S3, una capa Lambda, una función que genera errores y otra que procesa eventos de logs. El filtro de suscripción de CloudWatch Logs invoca al processor cuando aparece `ERROR`; el código usa **AWS X-Ray**, **CloudWatch Logs** y S3 para buscar trazas y guardar información de diagnóstico. Un recurso personalizado de CloudFormation prepara/invoca funciones y establece retención de logs.

`build-layer.sh` prepara las dependencias de la capa Node.js. El código y el template representan material didáctico de observabilidad y manejo de errores, no una arquitectura lista para producción; antes de desplegarlos, revisá runtimes, dependencias, roles IAM y compatibilidad entre APIs de SDK.

#### Scripts auxiliares del entorno

`day-2-apps/` también incluye scripts de construcción, despliegue, invocación y procesamiento de archivos. `resize.sh` intenta ampliar el volumen EBS de la instancia de laboratorio, su partición y sistema de archivos. No es necesario para ejecutar las aplicaciones de ejemplo y **modifica infraestructura real**: no lo ejecutes fuera de la instancia y del entorno para el que fue preparado.

### Bookmark App con AWS SAM

`app-code/backend/template.yaml` describe una aplicación de marcadores con **API Gateway**, **AWS Lambda** y una tabla de **DynamoDB**. La tabla usa `id` como clave de partición, conserva un stream con imágenes anteriores y nuevas, y define los índices secundarios `bookmarkUrl-index` y `user-index`.

#### API y operaciones CRUD

| Ruta | Método | Función |
| --- | --- | --- |
| `/bookmarks` | `POST` | `createBookmark`: agrega un marcador. |
| `/bookmarks` | `GET` | `listBookmarks`: lista marcadores, o consulta por usuario usando `user-index`. |
| `/bookmarks/{id}` | `GET` | `getBookmark`: recupera un marcador. |
| `/bookmarks/{id}` | `PUT` | `updateBookmark`: actualiza el elemento. |
| `/bookmarks/{id}` | `DELETE` | `deleteBookmark`: elimina el elemento. |

Las funciones usan AWS SDK for JavaScript v3 y `DynamoDBDocumentClient`. El README del backend incluye una secuencia de `curl` y el comando `sam deploy --guided`; consultá [las instrucciones originales del backend](<labs aws developing serverless/app-code/backend/README.md>) para los ejemplos de payload y llamadas.

#### Marcadores compartidos y flujo de aprobación

Además del CRUD, el template y los handlers muestran un flujo orientado a compartir y aprobar publicaciones:

1. La tabla de DynamoDB emite eventos en **DynamoDB Streams**; `streamTrigger` convierte inserciones o modificaciones relevantes en eventos del bus `bookmarks-bus` de **EventBridge**.
2. Una regla puede registrar los eventos en CloudWatch Logs. Otras reglas seleccionan marcadores compartidos para iniciar el flujo del concurso o publicar notificaciones con **Amazon SNS**.
3. `contest` cambia el estado del marcador. El flujo de aprobación se coordina con **AWS Step Functions**: valida URL, solicita aprobación, espera una respuesta mediante task token y, según la decisión, actualiza el estado o notifica el resultado.
4. `userApprovalEmail` publica un correo con enlaces de aprobación/rechazo; `userApproval` recibe la acción y completa la tarea de Step Functions; `publishApproval` actualiza el elemento y publica la notificación de aprobación.

El flujo declarado en `app-code/statemachine.json`, los scripts `duplicateBookmarkCheck.js` y `functionBakery.js` en la raíz de `labs aws developing serverless/`, y los recursos de la plantilla son piezas de un ejercicio que combina servicios administrados, eventos, integración entre servicios y aprobaciones humanas. La definición de Step Functions conserva referencias de infraestructura específicas del despliegue original; hay que reemplazarlas y revisar la integración con el template antes de reutilizarla.

#### Interfaz web

`app-code/frontend/` contiene una aplicación **Vue 2** con Vuex y AWS Amplify. Sus componentes cubren autenticación, navegación y operaciones de marcadores, incluyendo la visualización y el envío de marcadores compartidos. El README del frontend conserva notas del setup histórico de Amplify, autenticación y desarrollo local.

Este frontend y sus dependencias son de una generación anterior de Vue/Amplify. Para entender el ejercicio, empezá por `src/`, `package.json` y [`el README del frontend`](<labs aws developing serverless/app-code/frontend/README.md>); no asumas que la instalación o configuración descrita sigue siendo compatible con versiones actuales.

## Preparación y ejecución

Los ejercicios no comparten un único entorno. Como punto de partida, necesitás:

- Una cuenta de AWS de laboratorio con permisos suficientes y una región definida.
- AWS CLI y credenciales configuradas mediante un perfil o el mecanismo indicado por tu entorno.
- Python 3 y Boto3 para los scripts de Developing.
- Node.js/npm para los ejemplos JavaScript y la interfaz.
- AWS SAM CLI para las aplicaciones SAM.

Para los scripts de S3 y DynamoDB, ejecutá cada archivo desde su propia carpeta de laboratorio: los scripts leen `config.ini` y algunos nombres de archivos relativos al directorio actual. Antes de ejecutarlos, inspeccioná ese archivo y reemplazá los valores propios del curso por recursos únicos de tu cuenta.

Para la Bookmark App, el backend se encuentra en `labs aws developing serverless/app-code/backend/`; su guía propone `sam deploy --guided`. El template solicita parámetros (por ejemplo, etapa de API y ARN de rol Lambda), por lo que vas a necesitar preparar esos valores y verificar los permisos y las referencias de infraestructura primero. Los ejemplos SAM de `day-2-apps/` son aplicaciones separadas y deben desplegarse desde sus propios directorios.

No hay un comando único de instalación, prueba o despliegue que aplique a todo el repositorio.

## Precauciones antes de reutilizar el material

- **Credenciales:** no agregues claves de AWS al repositorio ni copies credenciales de un curso. Usá perfiles/roles temporales y permisos mínimos.
- **Nombres y recursos existentes:** los nombres de buckets y tablas pueden colisionar con los de otra cuenta o región. Confirmá qué recursos se crearán antes de desplegar.
- **Acceso público:** el laboratorio de hosting S3 aplica una política `s3:GetObject` con principal `*`. Es una demostración educativa de contenido público, no una política apropiada para datos privados.
- **Costos y limpieza:** Lambda, API Gateway, DynamoDB, S3, SNS, EventBridge, CloudWatch, Step Functions y otros recursos pueden generar cargos. Revisá los recursos creados por cada stack y eliminá de forma selectiva los que ya no necesites.
- **Roles, endpoints y ARN históricos:** algunos ejemplos contienen identificadores o endpoints del despliegue original. No los uses como propios; reemplazalos por recursos de tu cuenta y región.
- **Scripts con efectos externos:** `resize.sh` modifica un volumen EBS. Revisá cada comando antes de correr scripts contra una cuenta o una instancia activa.
- **Material de curso:** estos ejemplos priorizan mostrar conceptos y flujos. No constituyen una revisión de seguridad, una guía operativa de producción ni una garantía de compatibilidad con las versiones actuales de AWS.

## Mapa del repositorio

```text
.
├── labs aws developing/
│   ├── lab-s3/                         # S3, objetos, CSV/JSON y sitio estático
│   ├── lab-dynamo-db/                  # DynamoDB, consultas y actualizaciones
│   ├── lab-lambda/                     # Notas, Lambda, Polly y S3
│   ├── lab-final/                      # Polly Notes: frontend y Swagger
│   └── ...
└── labs aws developing serverless/
    ├── day-2-apps/                     # Muestras SAM y utilidades
    └── app-code/
        ├── backend/                    # SAM, API, Lambdas y Step Functions
        └── frontend/                   # Vue y Amplify
```

Los archivos `build/`, `.aws-sam/`, ZIP y otros artefactos generados que aparecen en algunas carpetas se conservan como parte del material histórico. Para estudiar o modificar una aplicación, tomá como referencia el código fuente y los templates, no solo el resultado compilado.
