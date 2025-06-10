export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: 'ansiedad' | 'artritis' | 'dolor de espalda';
  posturas: {
    idPostura: string;
    duracionMinutos: number;
  }[];
  sesionesRecomendadas: number;
  instructorId: string;
}
