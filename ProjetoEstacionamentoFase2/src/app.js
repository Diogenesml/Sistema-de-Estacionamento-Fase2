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
  console.log('Demonstração da Fase 2 executada com sucesso.');
  console.log('\nResumo geral:');
  console.table([relatorios.resumo()]);
  console.log('\nTotal arrecadado por categoria:');
  console.table(relatorios.totalArrecadadoPorCategoria());
  console.log('\nClientes impedidos de entrar:');
  console.table(relatorios.clientesImpedidosDeEntrar());
  console.log('\n10 clientes mais frequentes de 2025:');
  console.table(relatorios.dezClientesMaisFrequentesDoAno(2025));
} else {
  const ui = new InterfaceUsuario(cadastro, registro, relatorios, persistencia);
  await ui.iniciar();
}
