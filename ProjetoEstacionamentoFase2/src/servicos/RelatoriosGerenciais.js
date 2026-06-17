export default class RelatoriosGerenciais {
  constructor(cadastro, registro) {
    this.cadastro = cadastro;
    this.registro = registro;
  }

  #datas(inicio, fim) {
    return {
      inicio: inicio ? new Date(inicio) : null,
      fim: fim ? new Date(fim) : null
    };
  }

  totalArrecadado(inicio = null, fim = null, categoria = null) {
    const periodo = this.#datas(inicio, fim);
    return this.registro.tickets
      .filter(t => !t.estaAberto())
      .filter(t => t.pertenceAoPeriodo(periodo.inicio, periodo.fim))
      .filter(t => !categoria || t.tipoCliente.toUpperCase() === categoria.toUpperCase())
      .reduce((soma, t) => soma + Number(t.valorPago), 0);
  }

  totalArrecadadoPorCategoria(inicio = null, fim = null) {
    const periodo = this.#datas(inicio, fim);
    return this.registro.tickets
      .filter(t => !t.estaAberto() && t.pertenceAoPeriodo(periodo.inicio, periodo.fim))
      .reduce((acc, t) => {
        acc[t.tipoCliente] = (acc[t.tipoCliente] || 0) + Number(t.valorPago);
        return acc;
      }, {});
  }

  situacaoCliente(documento) {
    const cliente = this.cadastro.buscar(documento);
    if (!cliente) return null;
    const registros = this.registro.tickets.filter(t => t.documentoCliente === cliente.documento || cliente.possuiPlaca(t.placa));
    return {
      documento: cliente.documento,
      nome: cliente.nome,
      tipo: cliente.tipo,
      placas: cliente.listarPlacas().join(' | '),
      saldo: cliente.saldo ?? '',
      debito: cliente.debito ?? '',
      bloqueado: cliente.bloqueado ? 'Sim' : 'Não',
      podeEntrar: cliente.podeEntrar() ? 'Sim' : 'Não',
      motivo: cliente.motivoBloqueio || '',
      totalRegistros: registros.length,
      entradasAbertas: registros.filter(t => t.estaAberto()).length,
      totalPago: registros.reduce((s, t) => s + Number(t.valorPago), 0)
    };
  }

  registrosClienteCadastradoPorPeriodo(documento, inicio = null, fim = null) {
    const cliente = this.cadastro.buscar(documento);
    if (!cliente) return [];
    const periodo = this.#datas(inicio, fim);
    return this.registro.tickets
      .filter(t => t.documentoCliente === cliente.documento || cliente.possuiPlaca(t.placa))
      .filter(t => t.pertenceAoPeriodo(periodo.inicio, periodo.fim))
      .map(t => this.#ticketDTO(t));
  }

  registrosNaoCadastradosPorPeriodo(inicio = null, fim = null) {
    const periodo = this.#datas(inicio, fim);
    return this.registro.tickets
      .filter(t => !t.documentoCliente)
      .filter(t => t.pertenceAoPeriodo(periodo.inicio, periodo.fim))
      .map(t => this.#ticketDTO(t));
  }

  clientesImpedidosDeEntrar() { return this.cadastro.clientesImpedidos(); }

  dezClientesMaisFrequentesDoAno(ano = new Date().getFullYear()) {
    const contagem = new Map();
    for (const t of this.registro.tickets) {
      const data = t.entrada;
      if (!t.documentoCliente || data.getFullYear() !== Number(ano)) continue;
      const atual = contagem.get(t.documentoCliente) || { documento: t.documentoCliente, quantidade: 0 };
      atual.quantidade += 1;
      contagem.set(t.documentoCliente, atual);
    }
    return [...contagem.values()]
      .map(item => ({ ...item, nome: this.cadastro.buscar(item.documento)?.nome || 'Cliente não encontrado' }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }

  veiculosNoPatio() { return this.registro.listarAbertos().map(t => this.#ticketDTO(t)); }
  historicoDeSaidas() { return this.registro.listarFinalizados().map(t => this.#ticketDTO(t)); }
  quantidadePorTipoCliente() { return this.cadastro.listar().reduce((a, c) => ({ ...a, [c.tipo]: (a[c.tipo] || 0) + 1 }), {}); }
  totalEmDebitosEmpresariais() { return this.cadastro.listar().filter(c => c.tipo === 'Empresa').reduce((s, e) => s + Number(e.debito), 0); }

  resumo() {
    return {
      clientesCadastrados: this.cadastro.listar().length,
      quantidadePorTipoCliente: this.quantidadePorTipoCliente(),
      veiculosNoPatio: this.veiculosNoPatio().length,
      ticketsFinalizados: this.registro.listarFinalizados().length,
      totalArrecadado: this.totalArrecadado(),
      totalEmDebitosEmpresariais: this.totalEmDebitosEmpresariais(),
      clientesImpedidos: this.clientesImpedidosDeEntrar().length
    };
  }

  #ticketDTO(t) {
    return {
      placa: t.placa,
      documentoCliente: t.documentoCliente || 'Não cadastrado',
      tipoCliente: t.tipoCliente,
      entrada: t.entrada.toISOString(),
      saida: t.saida ? t.saida.toISOString() : 'Aberto',
      valorCobrado: t.valorCobrado,
      valorDesconto: t.valorDesconto,
      valorPago: t.valorPago,
      observacao: t.observacao
    };
  }
}
