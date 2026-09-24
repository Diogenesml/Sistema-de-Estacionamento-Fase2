import test from 'node:test';
import assert from 'node:assert/strict';
import Estudante from '../src/modelos/Estudante.js';
import Professor from '../src/modelos/Professor.js';
import Empresa from '../src/modelos/Empresa.js';
import TicketEstacionamento from '../src/modelos/TicketEstacionamento.js';
import CadastroClientes from '../src/servicos/CadastroClientes.js';
import RegistroDeEntradasESaidas from '../src/servicos/RegistroDeEntradas_E_Saidas.js';

test('ticket normaliza a placa e inicia aberto', () => {
  const ticket = new TicketEstacionamento('abc1d23');
  assert.equal(ticket.placa, 'ABC1D23');
  assert.equal(ticket.estaAberto(), true);
});

test('professor pode ser cadastrado com placa', () => {
  const professor = new Professor('12345678901', 'Professor Teste');
  professor.adicionarPlaca('ABC1D23');
  assert.equal(professor.possuiPlaca('ABC1D23'), true);
  assert.equal(professor.tipo, 'Professor');
});

test('estudante e empresa preservam seus tipos de domínio', () => {
  assert.equal(new Estudante('12345678901', 'Aluno', 100).tipo, 'Estudante');
  assert.equal(new Empresa('12345678000199', 'Empresa', 0).tipo, 'Empresa');
});

test('sistema impede duas entradas abertas para a mesma placa', () => {
  const cadastro = new CadastroClientes();
  const registro = new RegistroDeEntradasESaidas(cadastro);
  registro.registrarEntrada('ABC1D23');
  assert.throws(() => registro.registrarEntrada('ABC1D23'));
});

test('saída fecha o ticket anteriormente aberto', () => {
  const cadastro = new CadastroClientes();
  const registro = new RegistroDeEntradasESaidas(cadastro);
  registro.registrarEntrada('XYZ9A99');
  const ticket = registro.registrarSaida('XYZ9A99');
  assert.equal(ticket.estaAberto(), false);
  assert.ok(ticket.saida instanceof Date);
});
