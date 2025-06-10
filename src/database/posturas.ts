import { Postura } from '../models/postura';

// El array con los datos vive aquí
export const posturas: Postura[] = [
  {
    id: 'p1',
    nombre: 'Postura del niño',
    nombreSanskrito: 'Balasana',
    tipoTerapias: ['ansiedad', 'dolor de espalda'],
    fotoUrl: '/imagenes/balasana.jpg',
    videoUrl: '/videos/balasana.mp4',
    instrucciones: [
     'Arrodíllate y siéntate sobre tus talones.',
      'Inclínate hacia adelante y extiende los brazos.',
      'Apoya la frente en el suelo.'
    ],
    beneficios: ['Relaja la espalda', 'Reduce el estrés'],
    modificaciones: ['Coloca una almohada debajo del torso para mayor comodidad']
  },
  {
    id: 'p2',
    nombre: 'Postura del gato-vaca',
    nombreSanskrito: 'Marjaryasana-Bitilasana', // Corregido para claridad
    tipoTerapias: ['artritis', 'dolor de espalda'],
    fotoUrl: '/imagenes/cat-cow.jpg',
    instrucciones: [
      'Colócate en cuatro apoyos.',
      'Alterna arqueando y curvando la espalda con la respiración.'
    ],
    beneficios: ['Mejora movilidad espinal', 'Disminuye rigidez']
  }
  // ...Añade más posturas aquí
];