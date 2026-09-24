export default class Cliente {
  constructor(documento, nome) {
    if (!documento || !nome) throw new Error('Documento e nome são obrigatórios.');
    this.documento = String(documento).trim();
    this.nome = String(nome).trim();
    this.placas = new Set();
    this.bloqueado = false;
    this.motivoBloqueio = '';
  }

  get tipo() { return this.constructor.name; }

  adicionarPlaca(placa) { this.placas.add(Cliente.formatarPlaca(placa)); }
  removerPlaca(placa) { this.placas.delete(Cliente.formatarPlaca(placa)); }
  possuiPlaca(placa) { return this.placas.has(Cliente.formatarPlaca(placa)); }
  listarPlacas() { return [...this.placas]; }

  bloquear(motivo = 'Cliente impedido de entrar.') {
    this.bloqueado = true;
    this.motivoBloqueio = motivo;
  }

  desbloquear() {
    this.bloqueado = false;
    this.motivoBloqueio = '';
  }

  podeEntrar() { return !this.bloqueado; }

  calcularCobranca(ticket, tarifaBase) {
    const valorCobrado = tarifaBase * ticket.calcularDias();
    return { valorCobrado, valorDesconto: 0, valorPago: valorCobrado, observacao: 'Cliente avulso.' };
  }

  aplicarCobranca() {}

  toCSV() { return [this.documento, this.nome, '', this.tipo, ...this.listarPlacas()].join(','); }

  static formatarPlaca(placa) {
    if (!placa) throw new Error('Placa inválida.');
    return String(placa).trim().toUpperCase();
  }
}
