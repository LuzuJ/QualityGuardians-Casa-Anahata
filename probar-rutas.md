# Probar el proyecto
Para probar el proyecto se deben ejecutar ambas lineas en diferentes consolas del mismo proyecto junto con las dependencias 
> npm install

Back correrá en el puerto 3000
> npm run dev:backend

Front en el puerto 5173
> npm run dev:frontend

# Para probar las historias de usuario 
## Historia 01
POST
http://localhost:3000/api/instructores
{
  "nombre": "Laura Gómez",
  "correo": "laura@example.com",
  "contraseña": "yoga2024"
}

## Historia 02
POST
http://localhost:3000/api/auth/login
{
  "correo": "laura@example.com",
  "contraseña": "yoga2024"
}

## Historia 03
POST
http://localhost:3000/api/pacientes
auth: bearer: colocar el token de autorización obtenido al iniciar sesión (sin comillas)
{
  "nombre": "Carlos Pérez",
  "correo": "carlos@example.com",
  "fechaNacimiento": "1990-04-25",
  "genero": "masculino",
  "observaciones": "Paciente con dolores lumbares"
}

### OBTENER PACIENTES
GET
auth: bearer: colocar el token de autorización obtenido al iniciar sesión (sin comillas)
http://localhost:3000/api/pacientes/


## Historia 04
PUT
http://localhost:3000/api/pacientes/id del paciente
auth: bearer: colocar el token de autorización obtenido al iniciar sesión (sin comillas)
{
  "nombre": "Carlos Villarreal",
  "correo": "carlos01@example.com",
  "fechaNacimiento": "1990-04-25",
  "genero": "masculino",
  "observaciones": "Paciente con dolores lumbares"
}