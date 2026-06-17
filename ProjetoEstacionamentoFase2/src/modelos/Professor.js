import Cliente from './Cliente.js';

export default class Professor extends Cliente {
  constructor(cpf, nome, departamento = '') {
    super(cpf, nome);
    this.departamento = departamento || '';
  }

  calcularCobranca(ticket, tarifaBase) {
    const valorSemDesconto = tarifaBase * ticket.calcularDias();
    return { valorCobrado: 0, valorDesconto: valorSemDesconto, valorPago: 0, observacao: 'Professor isento.' };
  }

  toCSV() { return [this.documento, this.nome, 'Professor', ...this.listarPlacas()].join(','); }
}
