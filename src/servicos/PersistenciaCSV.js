export default class PersistenciaCSV {
  constructor(cadastro, registro, caminhos) {
    this.cadastro = cadastro;
    this.registro = registro;
    this.caminhos = caminhos;
  }

  carregarTudo() {
    this.cadastro.carregarCSV(this.caminhos.clientes);
    this.registro.carregarCSV(this.caminhos.registros);
  }

  salvarTudo() {
    this.cadastro.salvarCSV(this.caminhos.clientes);
    this.registro.salvarCSV(this.caminhos.registros);
  }
}
