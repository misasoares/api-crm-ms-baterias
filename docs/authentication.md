# Documentação de Autenticação do Backend

Este documento descreve o fluxo de autenticação implementado na API NestJS.

## Visão Geral

A aplicação utiliza **JWT (JSON Web Token)** para autenticação.

- **Estratégia**: A estratégia Passport-JWT extrai o token do cabeçalho `Authorization: Bearer <token>`.
- **Guard**: Um `JwtAuthGuard` global protege todos os endpoints por padrão.
- **Rotas Públicas**: Endpoints decorados com `@IsPublic()` ignoram o guard.

## Endpoints

### POST /auth/login

- **Público**: Sim
- **Corpo**: `{ email, password }`
- **Resposta**: `{ access_token: string }`
- **Descrição**: Autentica o usuário e emite um JWT.

### POST /auth/register

- **Público**: Sim
- **Corpo**: `{ name, email, password }`
- **Resposta**: Objeto do usuário.
- **Descrição**: Cria uma nova conta de usuário.

### GET /auth/verify-access-token

- **Público**: Não (Protegido por `JwtAuthGuard`)
- **Resposta**: `true` (boolean)
- **Descrição**: Usado pelo frontend para verificar se o token armazenado ainda é válido.
  - Se o token for válido, a requisição passa pelo Guard e retorna `true`.
  - Se o token for inválido ou expirado, o Guard global lança um erro `401 Unauthorized` antes que a requisição chegue a este manipulador.

## Guards & Decorators

- **JwtAuthGuard**: Um guard global aplicado a todas as rotas por padrão. Ele valida o JWT no cabeçalho da requisição.
- **@IsPublic()**: Um decorator customizado usado para excluir rotas específicas (como login e registro) do `JwtAuthGuard` global.
