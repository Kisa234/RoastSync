export interface EstadisticasPedidoPorTipo {
  tipo: string;
  total: number;
  completados: number;
  pendientes: number;
  esNuestro: number;
  facturados: number;
  noFacturados: number;
  cantidadTotal: number;
  tiempoPromedioCompletadoHoras: number | null;
}

export interface ClientePedidos {
  id_user: string;
  cantidadPedidos: number;
}

export interface EstadisticasPedidos {
  totalPedidos: number;
  pedidosCompletados: number;
  pedidosPendientes: number;
  pedidosPropios: number;
  pedidosFacturados: number;
  pedidosNoFacturados: number;
  tiempoPromedioCompletadoHoras: number | null;
  promedioPedidosPorDia: number;
  porTipo: EstadisticasPedidoPorTipo[];
  topClientes: ClientePedidos[];
}