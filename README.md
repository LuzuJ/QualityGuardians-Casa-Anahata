# QualityGuardians-Casa-Anahata

## Índice

- [QualityGuardians-Casa-Anahata](#qualityguardians-casa-anahata)
  - [Índice](#índice)
  - [Descripción](#descripción)
  - [Características principales](#características-principales)
  - [Tecnologías y herramientas](#tecnologías-y-herramientas)
  - [Instalación y arranque](#instalación-y-arranque)
  - [Uso de la aplicación](#uso-de-la-aplicación)



## Descripción

El proyecto consiste en el desarrollo de un software para la gestión de clases de yoga terapéutico. Esta software permitirá a los instructores registrarse, gestionar pacientes y crear series terapéuticas personalizadas con posturas específicas, mientras que los pacientes podrán ejecutar sus series asignadas y registrar su nivel de molestia/dolor antes y después de cada sesión. El sistema incluirá funcionalidades básicas para ambos roles, integrando imágenes, videos e instrucciones de posturas asociadas a tipos de terapia.



## Características principales

- **Gestión de perfiles**: Login de terapeutas y registro de pacientes.  
- **Sesiones**: El terapeuta asigna sesiones de yoga a los pacientes.  
- **Series**: El terapeuta crea y organiza series con distintas posturas de yoga para sus pacientes.  
- **Pacientes**: Son registrados por los terapeutas y realizan las sesiones designadas, además de dar un feedback sobre el dolor y la sesión.
- **Posturas**: Muestran información sobre las mismas (nombre, beneficios, descripción, imagen, video y tipo de terapia).


## Tecnologías y herramientas

- **Frontend**  
  - HTML 
  - CSS  
  
- **Backend**  
  - TYPESCRIPT 
  - NODE
  
- **Base de datos**
  - SUPABASE



## Instalación y arranque

1. Clona este repositorio:

   ```bash
   git clone https://github.com/JoelXimenez/QualityGuardians-Casa-Anahata.git
   cd QualityGuardians-Casa-Anahata
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Arranca en modo desarrollo:

   ```bash
   npm run dev
   ```


## Uso de la aplicación

La app permite a los **instructores de yoga terapéutico** registrarse, iniciar sesión y gestionar pacientes. Pueden crear series terapéuticas eligiendo un tipo de terapia (como ansiedad o dolor de espalda), seleccionar posturas específicas, asignarles una duración y definir el número de sesiones recomendadas. Luego, pueden asignar estas series a sus pacientes.

Por su parte, los **pacientes** inician sesión y ejecutan la serie que tienen asignada. Antes de comenzar, indican su nivel de molestia o dolor. Luego, siguen las posturas en el orden definido, con acceso a fotografías, videos e instrucciones. Al finalizar, registran nuevamente su nivel de molestia/dolor y dejan un comentario obligatorio. La app guía a ambos perfiles de forma clara y estructurada para facilitar la terapia personalizada.