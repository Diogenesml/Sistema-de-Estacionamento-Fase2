import fs from 'fs';
import path from 'path';
import Cliente from '../modelos/Cliente.js';
import Estudante from '../modelos/Estudante.js';
import Professor from '../modelos/Professor.js';
import Empresa from '../modelos/Empresa.js';

export default class CadastroClientes {
  constructor() {
    this.clientes = new Map();
    this.indicePlacas = new Map();
    this.placasBloqueadas = new Set();
  }

  get totalClientes() { return this.clientes.size; }

  cadastrar(cliente) {
    if (this.clientes.has(cliente.documento)) throw new Error(`Cliente ${cliente.documento} já cadastrado.`);
    this.#validarPlacasUnicas(cliente);
    this.clientes.set(cliente.documento, cliente);
    this.#reindexarPlacas();
    return cliente;
  }

  cadastrarCliente(cliente) { return this.cadastrar(cliente); }

  atualizar(cliente) {
    const antigo = this.clientes.get(cliente.documento);
    if (!antigo) this.#validarPlacasUnicas(cliente);
    this.clientes.set(cliente.documento, cliente);
    this.#reindexarPlacas();
    return cliente;
  }

  buscar(documento) { return this.clientes.get(String(documento).trim()); }
  buscarPorPlaca(placa) { return this.indicePlacas.get(Cliente.formatarPlaca(placa)); }
  remover(documento) { const ok = this.clientes.delete(String(documento).trim()); this.#reindexarPlacas(); return ok; }
  listar() { return [...this.clientes.values()]; }

  adicionarPlaca(documento, placa) {
    const cliente = this.buscar(documento);
    if (!cliente) throw new Error('Cliente não encontrado.');
    const placaFormatada = Cliente.formatarPlaca(placa);
    const dono = this.buscarPorPlaca(placaFormatada);
    if (dono && dono.documento !== cliente.documento) throw new Error(`Placa ${placaFormatada} já pertence a ${dono.nome}.`);
    cliente.adicionarPlaca(placaFormatada);
    this.#reindexarPlacas();
  }

  bloquearPlaca(placa, motivo = 'Placa impedida de entrar.') { this.placasBloqueadas.add(Cliente.formatarPlaca(placa)); }
  desbloquearPlaca(placa) { this.placasBloqueadas.delete(Cliente.formatarPlaca(placa)); }
  placaBloqueada(placa) { return this.placasBloqueadas.has(Cliente.formatarPlaca(placa)); }

  clientesImpedidos() {
    return this.listar().filter(c => !c.podeEntrar() || c.bloqueado).map(c => ({
      documento: c.documento,
      nome: c.nome,
      tipo: c.tipo,
      motivo: c.motivoBloqueio || (c.tipo === 'Estudante' ? 'Saldo insuficiente.' : 'Restrição cadastral.'),
      placas: c.listarPlacas().join(' | ')
    }));
  }

  carregarCSV(caminhoArquivo) {
    if (!fs.existsSync(caminhoArquivo)) return;
    const linhas = fs.readFileSync(caminhoArquivo, 'utf-8').split(/\r?\n/).filter(l => l.trim());
    this.clientes.clear();
    for (const linha of linhas) this.atualizar(CadastroClientes.clienteFromCSV(linha));
    this.#reindexarPlacas();
  }

  async carregarDeCSV(caminhoArquivo) { this.carregarCSV(caminhoArquivo); return this.totalClientes; }

  salvarCSV(caminhoArquivo) {
    fs.mkdirSync(path.dirname(caminhoArquivo), { recursive: true });
    fs.writeFileSync(caminhoArquivo, this.listar().map(c => c.toCSV()).join('\n'), 'utf-8');
  }

  #validarPlacasUnicas(cliente) {
    for (const placa of cliente.listarPlacas()) {
      const dono = this.buscarPorPlaca(placa);
      if (dono && dono.documento !== cliente.documento) throw new Error(`Placa duplicada: ${placa}.`);
    }
  }

  #reindexarPlacas() {
    this.indicePlacas.clear();
    for (const cliente of this.listar()) {
      for (const placa of cliente.listarPlacas()) {
        if (this.indicePlacas.has(placa)) throw new Error(`Placa duplicada encontrada no cadastro: ${placa}.`);
        this.indicePlacas.set(placa, cliente);
      }
    }
  }

  static clienteFromCSV(linha) {
    const cols = linha.split(',').map(c => c.trim());
    const [documento, nome, terceiroCampo = '', tipoCampo = '', ...placasOriginais] = cols;
    const terceiroEhNumero = terceiroCampo !== '' && !Number.isNaN(Number(terceiroCampo));
    const tipo = tipoCampo.toUpperCase();
    const terceiro = terceiroCampo.toUpperCase();
    let cliente;
    let placas = [...placasOriginais];

    if (terceiroEhNumero && tipo === 'ESTUDANTE') cliente = new Estudante(documento, nome, Number(terceiroCampo));
    else if (terceiroEhNumero && tipo === 'EMPRESA') cliente = new Empresa(documento, nome, Number(terceiroCampo));
    else if (terceiro === 'PROFESSOR') { cliente = new Professor(documento, nome); placas = [tipoCampo, ...placasOriginais].filter(Boolean); }
    else if (tipo === 'PROFESSOR') cliente = new Professor(documento, nome, terceiroCampo);
    else throw new Error(`Tipo de cliente desconhecido na linha: ${linha}`);

    placas.filter(Boolean).forEach(p => cliente.adicionarPlaca(p));
    return cliente;
  }
}
