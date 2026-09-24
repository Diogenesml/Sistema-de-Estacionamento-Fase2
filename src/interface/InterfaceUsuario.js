import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import Estudante from '../modelos/Estudante.js';
import Professor from '../modelos/Professor.js';
import Empresa from '../modelos/Empresa.js';

export default class InterfaceUsuario {
  constructor(cadastro, registro, relatorios, persistencia) {
    this.cadastro = cadastro;
    this.registro = registro;
    this.relatorios = relatorios;
    this.persistencia = persistencia;
    this.rl = readline.createInterface({ input, output });
  }

  async iniciar() {
    let opcao = '';
    while (opcao !== '0') {
      console.log('\n=== Sistema de Estacionamento - Fase 2 ===');
      console.log('1 - Cadastrar cliente');
      console.log('2 - Registrar entrada de veículo');
      console.log('3 - Registrar saída de veículo');
      console.log('4 - Consultar situação de cliente');
      console.log('5 - Relatórios gerenciais');
      console.log('6 - Salvar dados em CSV');
      console.log('0 - Sair');
      opcao = await this.rl.question('Escolha uma opção: ');
      try {
        if (opcao === '1') await this.#cadastrarCliente();
        else if (opcao === '2') await this.#registrarEntrada();
        else if (opcao === '3') await this.#registrarSaida();
        else if (opcao === '4') await this.#consultarCliente();
        else if (opcao === '5') await this.#menuRelatorios();
        else if (opcao === '6') this.#salvar();
      } catch (erro) { console.error(`Erro: ${erro.message}`); }
    }
    this.#salvar();
    this.rl.close();
  }

  async #cadastrarCliente() {
    const tipo = (await this.rl.question('Tipo (1-Estudante, 2-Professor, 3-Empresa): ')).trim();
    const documento = await this.rl.question('CPF/CNPJ: ');
    const nome = await this.rl.question('Nome: ');
    let cliente;
    if (tipo === '1') cliente = new Estudante(documento, nome, Number(await this.rl.question('Saldo inicial: ')) || 0);
    else if (tipo === '2') cliente = new Professor(documento, nome, await this.rl.question('Departamento/opcional: '));
    else if (tipo === '3') cliente = new Empresa(documento, nome, Number(await this.rl.question('Débito inicial: ')) || 0);
    else throw new Error('Tipo inválido.');
    const placas = (await this.rl.question('Placas separadas por vírgula: ')).split(',').map(p => p.trim()).filter(Boolean);
    placas.forEach(p => cliente.adicionarPlaca(p));
    this.cadastro.cadastrar(cliente);
    this.#salvar();
    console.log('Cliente cadastrado com sucesso.');
  }

  async #registrarEntrada() {
    const placa = await this.rl.question('Placa: ');
    const ticket = this.registro.registrarEntrada(placa);
    this.#salvar();
    console.table([ticket]);
  }

  async #registrarSaida() {
    const placa = await this.rl.question('Placa: ');
    const ticket = this.registro.registrarSaida(placa);
    this.#salvar();
    console.table([ticket]);
  }

  async #consultarCliente() {
    const documento = await this.rl.question('CPF/CNPJ: ');
    const situacao = this.relatorios.situacaoCliente(documento);
    if (!situacao) console.log('Cliente não encontrado.');
    else console.table([situacao]);
  }

  async #menuRelatorios() {
    console.log('\n1 - Total arrecadado por período/categoria');
    console.log('2 - Registros de cliente cadastrado por período');
    console.log('3 - Registros de não cadastrados por período');
    console.log('4 - Clientes impedidos de entrar');
    console.log('5 - 10 clientes mais frequentes do ano');
    console.log('6 - Veículos no pátio');
    const opcao = await this.rl.question('Escolha: ');
    if (opcao === '1') {
      const inicio = await this.rl.question('Início ISO opcional: ');
      const fim = await this.rl.question('Fim ISO opcional: ');
      const categoria = await this.rl.question('Categoria opcional: ');
      console.log('Total:', this.relatorios.totalArrecadado(inicio || null, fim || null, categoria || null));
      console.table(this.relatorios.totalArrecadadoPorCategoria(inicio || null, fim || null));
    } else if (opcao === '2') {
      const doc = await this.rl.question('CPF/CNPJ: ');
      const inicio = await this.rl.question('Início ISO opcional: ');
      const fim = await this.rl.question('Fim ISO opcional: ');
      console.table(this.relatorios.registrosClienteCadastradoPorPeriodo(doc, inicio || null, fim || null));
    } else if (opcao === '3') {
      const inicio = await this.rl.question('Início ISO opcional: ');
      const fim = await this.rl.question('Fim ISO opcional: ');
      console.table(this.relatorios.registrosNaoCadastradosPorPeriodo(inicio || null, fim || null));
    } else if (opcao === '4') console.table(this.relatorios.clientesImpedidosDeEntrar());
    else if (opcao === '5') console.table(this.relatorios.dezClientesMaisFrequentesDoAno(Number(await this.rl.question('Ano: '))));
    else if (opcao === '6') console.table(this.relatorios.veiculosNoPatio());
  }

  #salvar() { this.persistencia.salvarTudo(); console.log('Dados salvos em CSV.'); }
}
