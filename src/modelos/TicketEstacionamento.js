export default class TicketEstacionamento {
  constructor(placa, documentoCliente = '', tipoCliente = 'Avulso', entrada = new Date()) {
    if (!placa) throw new Error('Placa é obrigatória para gerar ticket.');
    this.placa = String(placa).trim().toUpperCase();
    this.documentoCliente = documentoCliente || '';
    this.tipoCliente = tipoCliente || 'Avulso';
    this.entrada = entrada instanceof Date ? entrada : new Date(entrada);
    this.saida = null;
    this.valorCobrado = 0;
    this.valorDesconto = 0;
    this.valorPago = 0;
    this.observacao = '';
  }

  registrarSaida(saida = new Date(), resultado = {}) {
    this.saida = saida instanceof Date ? saida : new Date(saida);
    this.valorCobrado = Number(resultado.valorCobrado) || 0;
    this.valorDesconto = Number(resultado.valorDesconto) || 0;
    this.valorPago = Number(resultado.valorPago) || 0;
    this.observacao = resultado.observacao || '';
  }

  estaAberto() { return this.saida === null; }

  calcularDias() {
    const fim = this.saida || new Date();
    const msDia = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((fim - this.entrada) / msDia));
  }

  pertenceAoPeriodo(inicio, fim) {
    const referencia = this.saida || this.entrada;
    return (!inicio || referencia >= inicio) && (!fim || referencia <= fim);
  }

  toCSV() {
    return [
      this.placa, this.documentoCliente, this.tipoCliente,
      this.#formatarData(this.entrada),
      this.saida ? this.#formatarData(this.saida) : '',
      this.saida ? this.valorCobrado : '',
      this.saida ? this.valorDesconto : '',
      this.saida ? this.valorPago : '',
      this.observacao
    ].join(',');
  }

  #formatarData(data) { return data.toISOString().slice(0, 19); }

  static fromCSV(linha, cadastroClientes = null) {
    const cols = linha.split(',').map(c => c.trim());
    let placa, documentoCliente, tipoCliente, entrada, saida, valorCobrado, valorDesconto, valorPago, observacao;

    if (cols.length >= 9) {
      [placa, documentoCliente, tipoCliente, entrada, saida, valorCobrado, valorDesconto, valorPago, observacao = ''] = cols;
    } else {
      [placa, entrada, saida, valorCobrado, valorDesconto, valorPago] = cols;
      const cliente = cadastroClientes?.buscarPorPlaca(placa);
      documentoCliente = cliente?.documento || '';
      tipoCliente = cliente?.tipo || 'Avulso';
      observacao = '';
    }

    const ticket = new TicketEstacionamento(placa, documentoCliente, tipoCliente, new Date(entrada));
    if (saida) ticket.registrarSaida(new Date(saida), { valorCobrado, valorDesconto, valorPago, observacao });
    return ticket;
  }
}
