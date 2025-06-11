export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: 'ansiedad' | 'artritis' | 'dolor de espalda';
  instructorId: string;
  sesionesRecomendadas: number;
  posturas: {
    idPostura: string;
    duracionMinutos: number;
  }[];
}
