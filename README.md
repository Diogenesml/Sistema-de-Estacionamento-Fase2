# Projeto Estacionamento - Fase 2

Sistema em JavaScript/Node.js para controle de estacionamento, corrigido a partir da avaliação da Fase 1 e ampliado com persistência CSV, interface com usuário e relatórios gerenciais.

## Como executar

O projeto usa apenas recursos nativos do Node.js.

```bash
npm install
npm start
```

Para testar rapidamente sem entrar no menu interativo:

```bash
npm run demo
```

## O que foi corrigido em relação à Fase 1

- As regras de cobrança foram movidas para as classes de domínio, aproveitando melhor o polimorfismo.
- Cada tipo de cliente calcula sua cobrança:
  - Professor: isento.
  - Estudante: paga valor fixo por ingresso, com desconto sobre a tarifa normal.
  - Empresa: acumula débito para pagamento posterior.
  - Avulso/não cadastrado: paga a tarifa normal.
- O sistema impede entrada duplicada para a mesma placa.
- O sistema impede placas bloqueadas e clientes com restrição.
- Empresas podem ser bloqueadas ao atingir limite de débito.
- Estudantes sem saldo suficiente são impedidos de entrar.
- As placas são armazenadas com `Set`, evitando duplicidade.
- Clientes, placas e registros usam `Map` para associação eficiente.

## Funcionalidades da Fase 2

### a) Persistência em CSV

- Leitura de `dados/clientes.csv` na inicialização.
- Leitura de `dados/registros.csv` na inicialização.
- Manutenção dos dados em memória durante a execução.
- Salvamento manual e automático após alterações e ao encerrar.
- Compatibilidade com o formato original da Fase 1 e com o formato ampliado da Fase 2.

### b) Interface com usuário

A classe `InterfaceUsuario` fica separada em `src/interface/InterfaceUsuario.js` e permite:

- Cadastro de clientes.
- Entrada de veículos.
- Saída de veículos.
- Consulta da situação de cliente.
- Geração de relatórios.
- Salvamento dos dados em CSV.

### c) Relatórios gerenciais implementados

- Valor total arrecadado por período e/ou categoria de cliente.
- Situação de um cliente cadastrado.
- Registros de estacionamento de cliente cadastrado por período.
- Registros de estacionamento de cliente não cadastrado por período.
- Relação de clientes impedidos de entrar no estacionamento.
- Relação dos 10 clientes mais frequentes do ano.
- Relatórios extras: veículos no pátio, histórico de saídas, total de débitos empresariais e quantidade por tipo de cliente.

### d) Estruturas de dados usadas

- `Set`: placas de cada cliente e placas bloqueadas.
- `Map`: cadastro de clientes por documento, índice de placas por cliente e tickets por placa.

## Estrutura

```text
src/
  app.js
  modelos/
    Cliente.js
    Estudante.js
    Professor.js
    Empresa.js
    TicketEstacionamento.js
    Avulso.js
  servicos/
    CadastroClientes.js
    RegistroDeEntradas_E_Saidas.js
    RelatoriosGerenciais.js
    PersistenciaCSV.js
  interface/
    InterfaceUsuario.js
dados/
  clientes.csv
  registros.csv
DiagramaDeClasses.png
```

## Formato do arquivo `dados/clientes.csv`

Formatos aceitos:

```text
cpf,nome,saldo,Estudante,placa1,placa2
cpf,nome,Professor,placa1,placa2
cnpj,nome,debito,Empresa,placa1,placa2
```

Exemplos:

```text
12345678901,João Silva,100,Estudante,ABC1D23
34567890123,Carlos Oliveira,Professor,JKL4G56,GHI3F45
56789012345,Tecnopuc S.A.,30,Empresa,STU7J89,VWX8K90,YZA9L01
```

## Formato do arquivo `dados/registros.csv`

Formato ampliado da Fase 2:

```text
placa,documentoCliente,tipoCliente,dataHoraEntrada,dataHoraSaida,valorCobrado,valorDesconto,valorPago,observacao
```

Registros abertos deixam os campos de saída e valores vazios.

## Observação

O arquivo `registros.csv` antigo da Fase 1 também é aceito. Ao salvar novamente, o sistema grava no formato ampliado da Fase 2.

