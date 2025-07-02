export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: 'ansiedad' | 'artritis' | 'dolor de espalda' | 'dolor de cabeza' | 'insomnio' | 'mala postura';
  instructorId: string;
  sesionesRecomendadas: number;
  posturas: {
    idPostura: string;
    duracionMinutos: number;
  }[];
}
