# Sistema de Estacionamento

Sistema de gestão de estacionamento desenvolvido em **JavaScript/Node.js**, com foco em orientação a objetos, regras de negócio, persistência em CSV e relatórios gerenciais.

O projeto surgiu como atividade acadêmica e está sendo evoluído para uma versão de portfólio, preservando sua proposta original de aplicação de terminal.

## Principais recursos

- cadastro de estudantes, professores e empresas
- veículos avulsos
- registro de entradas e saídas
- prevenção de entrada duplicada
- regras de cobrança específicas por categoria
- bloqueios e restrições de entrada
- persistência de clientes e registros em CSV
- relatórios de arrecadação, frequência e ocupação
- uso de `Map` e `Set`
- testes automatizados com o test runner nativo do Node.js
- integração contínua com GitHub Actions

## Executar

Requer Node.js 20 ou superior.

```bash
npm install
npm start
```

Para executar uma demonstração sem utilizar o menu interativo:

```bash
npm run demo
```

## Testes

```bash
npm test
```

A suíte inicial valida comportamentos do domínio, incluindo normalização de placas, tipos de cliente, prevenção de entradas duplicadas e fechamento de tickets.

## Arquitetura

```text
src/
├── app.js
├── interface/
│   └── InterfaceUsuario.js
├── modelos/
│   ├── Cliente.js
│   ├── Estudante.js
│   ├── Professor.js
│   ├── Empresa.js
│   ├── Avulso.js
│   └── TicketEstacionamento.js
└── servicos/
    ├── CadastroClientes.js
    ├── RegistroDeEntradas_E_Saidas.js
    ├── RelatoriosGerenciais.js
    └── PersistenciaCSV.js

dados/
tests/
.github/workflows/
```

### Camadas

**Modelos** concentram as entidades e regras de domínio. **Serviços** coordenam cadastro, movimentações, persistência e relatórios. **InterfaceUsuario** mantém a interação de terminal separada das regras de negócio.

## Regras de negócio

- Professor: categoria com regra própria de cobrança.
- Estudante: cobrança diferenciada e controle de saldo.
- Empresa: acumula débito conforme as regras do domínio.
- Avulso: utiliza a tarifa padrão.
- Uma placa não pode possuir duas entradas abertas simultaneamente.
- Clientes ou placas com restrição podem ser impedidos de entrar.

## Persistência

Os dados permanecem em arquivos CSV para preservar a proposta acadêmica e tornar o projeto simples de executar sem banco de dados externo.

## Contexto acadêmico

A versão original foi desenvolvida em fases. A evolução para portfólio reorganiza o repositório, adiciona testes e automação, mas mantém as regras de negócio e a aplicação Node.js como núcleo do projeto.

## Autor

Diógenes Moreira Legal
