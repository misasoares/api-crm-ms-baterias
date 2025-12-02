# Documentação da API

## Acesso Rápido

A documentação interativa (Swagger UI) está disponível em:

> **http://localhost:3000/api**

## Autenticação

A API utiliza autenticação **Bearer Token (JWT)**.

### Fluxo de Autenticação

1.  **Login**: Envie uma requisição `POST` para `/auth/login` com `email` e `password`.
2.  **Receber Token**: A API retornará um objeto `{ "access_token": "..." }`.
3.  **Autenticar Requisições**: Adicione o cabeçalho `Authorization` em todas as requisições subsequentes:
    ```text
    Authorization: Bearer <seu_token_aqui>
    ```

> **Nota**: Todas as rotas são protegidas por padrão, exceto as marcadas explicitamente como públicas (como o login).

## Endpoints Principais

### Auth

- `POST /auth/login`: Autentica um usuário e retorna o token JWT. (Público)

### Users

- `POST /users`: Cria um novo usuário. (Protegido)
- `GET /users`: Lista todos os usuários. (Protegido)
- `GET /users/:id`: Busca um usuário pelo ID. (Protegido)

### Customers

- `POST /customers`: Cria um novo cliente. (Protegido)
- `GET /customers`: Lista todos os clientes. (Protegido)
- `GET /customers/:id`: Busca um cliente pelo ID. (Protegido)

### Orders

- `POST /orders`: Cria um novo pedido para um cliente. (Protegido)
- `GET /orders`: Lista todos os pedidos. (Protegido)
- `GET /orders/:id`: Busca um pedido pelo ID. (Protegido)

## Tratamento de Erros

A API retorna erros no formato padrão HTTP:

- **400 Bad Request**: Erro de validação (ex: campos faltando).
- **401 Unauthorized**: Token ausente ou inválido.
- **404 Not Found**: Recurso (Usuário, Cliente, Pedido) não encontrado.
- **500 Internal Server Error**: Erro inesperado no servidor.
