import Cliente from './Cliente.js';

export default class Avulso extends Cliente {
  constructor(placa = '') {
    super('AVULSO', 'Cliente Avulso');
    if (placa) this.adicionarPlaca(placa);
  }

  calcularCobranca(ticket, tarifaBase) {
    const valorCobrado = tarifaBase * ticket.calcularDias();
    return { valorCobrado, valorDesconto: 0, valorPago: valorCobrado, observacao: 'Cliente não cadastrado paga tarifa normal.' };
  }
}
