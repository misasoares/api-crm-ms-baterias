# CRM API

CRM simples para gestão de clientes e pedidos para envio automatico de mensagem.

## Scripts Disponíveis

### Desenvolvimento

- `npm run start`: Inicia a aplicação.
- `npm run start:dev`: Inicia a aplicação em modo de desenvolvimento (watch mode).
- `npm run start:debug`: Inicia a aplicação em modo de debug.

### Qualidade de Código

- `npm run lint`: Executa o ESLint para verificar problemas no código.
- `npm run format`: Formata o código usando Prettier.
- `npm run pr-check`: Executa uma verificação completa (format, lint, build e testes) antes de abrir um PR.

### Testes

- `npm run test`: Executa os testes unitários.
- `npm run test:e2e`: Executa os testes end-to-end.
- `npm run test:cov`: Gera relatório de cobertura de testes.

### Build

- `npm run build`: Compila a aplicação para produção.

## Tratamento de Mensagens

A API é responsável por fornecer feedback claro sobre o resultado das operações.

### Sucesso

Em caso de sucesso, a API retorna um objeto contendo:

- `success`: `true`
- `code`: Código HTTP (ex: 200, 201)
- `data`: Dados da resposta (se houver)
- `message`: Mensagem descritiva (ex: "Pedido criado com sucesso")

### Erro

Em caso de erro, a API retorna um objeto contendo:

- `success`: `false`
- `code`: Código HTTP do erro (ex: 400, 404, 409)
- `message`: Mensagem descritiva do erro (ex: "Este número de telefone já está vinculado a outro cliente.")
- `invalidFields`: Lista de campos inválidos (em caso de erro de validação)
