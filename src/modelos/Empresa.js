import Cliente from './Cliente.js';

export default class Empresa extends Cliente {
  static LIMITE_DEBITO = 200;

  constructor(cnpj, nome, debito = 0, limiteDebito = Empresa.LIMITE_DEBITO) {
    super(cnpj, nome);
    this.debito = Number(debito) || 0;
    this.limiteDebito = Number(limiteDebito) || Empresa.LIMITE_DEBITO;
  }

  podeEntrar() { return super.podeEntrar() && this.debito < this.limiteDebito; }

  calcularCobranca(ticket, tarifaBase) {
    const valorCobrado = tarifaBase * ticket.calcularDias();
    return { valorCobrado, valorDesconto: 0, valorPago: 0, observacao: 'Empresa acumula débito para pagamento posterior.' };
  }

  aplicarCobranca(resultado) {
    this.adicionarDebito(resultado.valorCobrado);
    if (this.debito >= this.limiteDebito) this.bloquear(`Débito atingiu o limite de R$ ${this.limiteDebito.toFixed(2)}.`);
  }

  adicionarDebito(valor) { this.debito += Number(valor) || 0; }
  quitarDebito(valor) { this.debito = Math.max(0, this.debito - (Number(valor) || 0)); if (this.debito < this.limiteDebito) this.desbloquear(); }

  toCSV() { return [this.documento, this.nome, this.debito, 'Empresa', ...this.listarPlacas()].join(','); }
}
