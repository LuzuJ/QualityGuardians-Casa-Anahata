export enum TipoTerapia {
  ANSIEDAD = 'ansiedad',
  ARTRITIS = 'artritis',
  DOLOR_ESPALDA = 'dolor de espalda',
  DOLOR_CABEZA = 'dolor de cabeza',
  INSOMNIO = 'insomnio',
  MALA_POSTURA = 'mala postura',
}

export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: TipoTerapia;
  instructorId: string;
  sesionesRecomendadas: number;
  posturas: {
    idPostura: string;
    duracionMinutos: number;
  }[];
}
