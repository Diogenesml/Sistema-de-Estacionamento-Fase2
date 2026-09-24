import path from 'path';
import { fileURLToPath } from 'url';
import CadastroClientes from './servicos/CadastroClientes.js';
import RegistroDeEntradasESaidas from './servicos/RegistroDeEntradas_E_Saidas.js';
import RelatoriosGerenciais from './servicos/RelatoriosGerenciais.js';
import PersistenciaCSV from './servicos/PersistenciaCSV.js';
import InterfaceUsuario from './interface/InterfaceUsuario.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const caminhoDados = path.resolve(__dirname, '../dados');
const caminhos = {
  clientes: path.join(caminhoDados, 'clientes.csv'),
  registros: path.join(caminhoDados, 'registros.csv')
};

const cadastro = new CadastroClientes();
const registro = new RegistroDeEntradasESaidas(cadastro);
const persistencia = new PersistenciaCSV(cadastro, registro, caminhos);
persistencia.carregarTudo();
const relatorios = new RelatoriosGerenciais(cadastro, registro);

if (process.argv.includes('--demo')) {
  console.log('\n🚗 SISTEMA DE ESTACIONAMENTO — DEMONSTRAÇÃO\n');
  console.log('Resumo operacional:');
  console.table([relatorios.resumo()]);
  console.log('\nArrecadação por categoria:');
  console.table(relatorios.totalArrecadadoPorCategoria());
  console.log('\nClientes com restrição de entrada:');
  console.table(relatorios.clientesImpedidosDeEntrar());
  console.log('\nClientes mais frequentes em 2025:');
  console.table(relatorios.dezClientesMaisFrequentesDoAno(2025));
} else {
  const ui = new InterfaceUsuario(cadastro, registro, relatorios, persistencia);
  await ui.iniciar();
}
