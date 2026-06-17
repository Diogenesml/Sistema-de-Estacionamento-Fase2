import fs from 'fs';
import path from 'path';
import Cliente from '../modelos/Cliente.js';
import Avulso from '../modelos/Avulso.js';
import TicketEstacionamento from '../modelos/TicketEstacionamento.js';

export default class RegistroDeEntradasESaidas {
  static TARIFA_BASE_DIARIA = 20;

  constructor(cadastroClientes = null) {
    this.cadastroClientes = cadastroClientes;
    this.tickets = [];
    this.ticketsPorPlaca = new Map();
  }

  registrarEntrada(placa, entrada = new Date()) {
    const placaFormatada = Cliente.formatarPlaca(placa);
    if (this.buscarTicketAberto(placaFormatada)) throw new Error(`Já existe entrada aberta para a placa ${placaFormatada}.`);
    if (this.cadastroClientes?.placaBloqueada(placaFormatada)) throw new Error(`Placa ${placaFormatada} está bloqueada.`);

    const cliente = this.cadastroClientes?.buscarPorPlaca(placaFormatada);
    if (cliente && !cliente.podeEntrar()) throw new Error(`Cliente ${cliente.nome} está impedido de entrar: ${cliente.motivoBloqueio || 'restrição cadastral ou financeira'}.`);

    const ticket = new TicketEstacionamento(placaFormatada, cliente?.documento || '', cliente?.tipo || 'Avulso', entrada);
    this.#adicionarTicket(ticket);
    return ticket;
  }

  registrarSaida(placa, saida = new Date()) {
    const placaFormatada = Cliente.formatarPlaca(placa);
    const ticket = this.buscarTicketAberto(placaFormatada);
    if (!ticket) throw new Error(`Não existe entrada aberta para a placa ${placaFormatada}.`);

    ticket.saida = saida instanceof Date ? saida : new Date(saida);
    const cliente = this.cadastroClientes?.buscarPorPlaca(placaFormatada);
    const pagador = cliente || new Avulso(placaFormatada);
    const resultado = pagador.calcularCobranca(ticket, RegistroDeEntradasESaidas.TARIFA_BASE_DIARIA);
    ticket.registrarSaida(ticket.saida, resultado);
    if (cliente) cliente.aplicarCobranca(resultado);
    return ticket;
  }

  buscarTicketAberto(placa) {
    const placaFormatada = Cliente.formatarPlaca(placa);
    return (this.ticketsPorPlaca.get(placaFormatada) || []).find(t => t.estaAberto());
  }

  listarAbertos() { return this.tickets.filter(t => t.estaAberto()); }
  listarFinalizados() { return this.tickets.filter(t => !t.estaAberto()); }
  listarPorPeriodo(inicio, fim, somenteCadastrado = null) {
    return this.tickets.filter(t => t.pertenceAoPeriodo(inicio, fim) && (somenteCadastrado === null || Boolean(t.documentoCliente) === somenteCadastrado));
  }

  carregarCSV(caminhoArquivo) {
    if (!fs.existsSync(caminhoArquivo)) return;
    const linhas = fs.readFileSync(caminhoArquivo, 'utf-8').split(/\r?\n/).filter(l => l.trim());
    this.tickets = [];
    this.ticketsPorPlaca.clear();
    for (const linha of linhas) this.#adicionarTicket(TicketEstacionamento.fromCSV(linha, this.cadastroClientes));
  }

  salvarCSV(caminhoArquivo) {
    fs.mkdirSync(path.dirname(caminhoArquivo), { recursive: true });
    fs.writeFileSync(caminhoArquivo, this.tickets.map(t => t.toCSV()).join('\n'), 'utf-8');
  }

  #adicionarTicket(ticket) {
    this.tickets.push(ticket);
    if (!this.ticketsPorPlaca.has(ticket.placa)) this.ticketsPorPlaca.set(ticket.placa, []);
    this.ticketsPorPlaca.get(ticket.placa).push(ticket);
  }
}
