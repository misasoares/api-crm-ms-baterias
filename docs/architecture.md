# Arquitetura do Projeto

Este projeto segue uma arquitetura de **Monolito Modular** construída com **NestJS**.

## Visão Geral

A aplicação é dividida em módulos baseados em funcionalidades de negócio (Domínios), em vez de camadas técnicas. Isso facilita a manutenção, escalabilidade e futura extração para microserviços, se necessário.

### Estrutura de Diretórios

```text
src/
├── common/          # Código compartilhado (Guards, Decorators, Filters)
├── modules/         # Módulos de Domínio (O coração da aplicação)
│   ├── auth/        # Autenticação e Gestão de Tokens JWT
│   ├── customers/   # Gestão de Clientes
│   ├── orders/      # Gestão de Pedidos
│   └── users/       # Gestão de Usuários do Sistema
├── prisma/          # Módulo global do Prisma (Banco de Dados)
└── main.ts          # Ponto de entrada (Configuração do Swagger e Pipes)
```

## Componentes Chave

### 1. Módulos (`src/modules`)

Cada módulo é autocontido e possui seus próprios:

- **Controller**: Lida com as requisições HTTP.
- **Service**: Contém a lógica de negócio.
- **DTOs**: Define e valida os dados de entrada (Data Transfer Objects).
- **Entities**: Define o formato de resposta (para o Swagger e Serialização).

### 2. Autenticação Global

- **Guard Global**: `JwtAuthGuard` é registrado globalmente no `AppModule`. Isso significa que **todas** as rotas são protegidas por padrão.
- **Decorator `@IsPublic()`**: Usado para abrir exceções (ex: rota de Login).
- **Estratégia**: Usa `passport-jwt` para validar tokens Bearer.

### 3. Banco de Dados

- **Prisma ORM**: Usado para interação com o PostgreSQL.
- **PrismaModule**: Um módulo global (`@Global()`) que exporta o `PrismaService`, permitindo que qualquer outro módulo o injete sem precisar importá-lo explicitamente.

### 4. Validação e Documentação

- **Class Validator**: Validação automática de DTOs no `ValidationPipe` global.
- **Swagger**: Documentação automática gerada a partir dos DTOs e Entities.
