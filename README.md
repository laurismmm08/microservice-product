# Exercício Prático: Análise de Qualidade de Software
## Disciplina: Qualidade de Software

---

## 📋 Objetivos de Aprendizagem

Ao final deste exercício, o aluno será capaz de:
- Identificar características de código de qualidade em aplicações reais
- Analisar arquiteturas de software e seus benefícios
- Compreender a importância de testes, documentação e boas práticas
- Implementar melhorias de performance em sistemas existentes

---

## 🎯 Parte 1: Análise da Aplicação

Você irá analisar uma aplicação full-stack (frontend + backend) disponível no GitHub que demonstra diversas práticas de qualidade de software.

### **Backend - Análise Inicial**

#### 1. **Linguagem de Programação**
- Qual linguagem de programação o backend utiliza?

     **Resposta:** TypeScript/Node.js, 
      EVIDENCIA É QUE TEMOS ARQUIVOS .ts EN TODAS AS PASTAS,package.json, POIS USAMOS npm iNSTALL
      E main_api.ts, COMO PONTO DE ENTRADA 

- Quais são as vantagens dessa linguagem para este tipo de aplicação?

      **Resposta**

      TypeScript sobre Node.js oferece uma combinação boa para o desenvolvimento de aplicações modernas. O JavaScript se estabeleceu como uma linguagem universal que permite uma abordagem full-stack, onde nós os desenvolvedores podemos trabalhar tanto no frontend quanto no backend utilizando o mesmo ambiente, promovendo uma maior coesão técnica nos projetos. 

      O TypeScript eleva a qualidade do código através de seu sistema de tipos, que atua como uma camada de segurança. Esta característica permite detectar erros ainda durante a fase de compilação, muito antes do código chegar à produção. O type safety não apenas previne bugs comuns, mas também serve como documentação viva do sistema, onde as interfaces e tipos definidos comunicam claramente as intenções do código e as expectativas de cada módulo. Esta clareza da estrutura é muito valiosa em projetos que seguem arquiteturas complexas, como a Clean Architecture que foi a  implementada neste projeto.

   O ecossistema Node.js oferece uma das mais amplas coleções de bibliotecas e ferramentas do mercado de desenvolvimento. Através do NPM, nós os desenvolvedores temos acesso a soluções maduras e bem testadas para qualquer necessidade, desde frameworks web como Express e Fastify até utilitários de validação, ORMs e ferramentas de build. Esta ampla gama de recursos acelera significativamente o desenvolvimento e reduz a necessidade de reinventar soluções já consolidadas na comunidade de desenvolvedores.


#### 2. **Configuração e Execução**
- Como clonar o repositório do backend?

      **Resposta**
      - clonar: no terminal digite:git clone https://github.com/leonardorsolar/microservice-product.git, será clonado o projeto todo, tanto backend como frontend

      - abrir a pásta do projeto: cd microservice-product

- Quais são os passos necessários para instalar as dependências?

      **Resposta**

         - Ir até o microserviço: cd backend/catalog
         - Instalar as dependencias: npm install
         Esse npm install lê o package.json onde estão listados os pacotes a serem instalados, cria a pasta com todas as bibliotecas e instala as depencias necessárias

         - Como cada microserviço tem seu package.json é necessário instalar as dependencias de cada.

- Como executar a aplicação em ambiente de desenvolvimento?

      **Resposta** 

      Podemos ter varias opções mas uma fácil e que eu usei foi:

      -rodar npm run start:sqlite, que cria o arquivo catalog.sqlite e popula ele com os dados de exemplo e roda na porta 3001. 


      
- Existe um arquivo de variáveis de ambiente? Quais configurações são necessárias?

      **Resposta**
      Não existe um arquivo de ambiente. Não fiz nehuma configuração só rodei na pasta bankend  npm run start:sqlite
      e ele cria o banco de dados, popula com os dados de exemplo e fica disponível na porta selecionada. 



#### 3. **Arquitetura de Software**
- Qual padrão arquitetural foi implementado? (Dica: observe a estrutura de pastas)

   **Resposta**
      O projeto tem uma arquitetura de microsserviços combinada com Clean Architecture. Nessa abordagem há na organização do código, onde cada funcionalidade de negócio, catalog, auth, checkout, freight e stock, é implementada como um serviço independente e auto-contido. Cada microsserviço segue individualmente Clean Architecture e mantem uma estrutura interna organizada em camadas de domain, application e infra. 

      Esta dupla estratificação permite que cada serviço consiga evoluir de forma independente.

- Explique o papel de cada camada: `domain`, `application`, `infra`

      **Resposta**

         A camada domain representa o coração de cada microsserviço, contendo as regras de negócio. No serviço de catalog, por exemplo, esta camada define o que é um produto, suas propriedades essenciais e as validações que garantem sua integridade. 
         A camada application orquestra os casos de uso específicos de cada serviço, implementando a lógica de aplicação que coordena as operações sem se preocupar com detalhes técnicos. 
         A camada infra fornece as implementações concretas para conexão com bancos de dados, APIs externas e outras ferramentas, servindo como ponte entre a lógica de negócio e o mundo exterior. 

- Por que essa separação é importante para a qualidade do código?

      **Resposta**

      Esta separação em camadas é fundamental para a qualidade do código porque estabelece limites claros de responsabilidade. Ao isolar as regras de negócio puras na camada domain, garantimos que mudanças na infraestrutura, como trocar de banco de dados ou framework web, não impactem o núcleo do negócio. A arquitetura permite que times diferentes trabalhem em camadas distintas sem conflitos, facilita a escrita de testes automatizados focados e possibilita a evolução técnica independente de cada componente. Em um contexto de microsserviços, essa organização é ainda mais útil, pois cada serviço pode ser desenvolvido, testado e implantado de forma autônoma.

- Quais são os endpoints da API disponíveis?

   **Resposta**
      Cada microsserviço expõe endpoints específicos para sua área de responsabilidade. No serviço de catalog  estão disponíveis os endpoints GET /products para listagem de produtos e GET /products/:idProduct para busca individual. O auth oferece endpoints para autenticação, o checkout para processamento de pedidos, o freight para cálculo de fretes e o stock para gestão de estoque. Esta divisão por domínio funcional permite que cada API seja especializada e otimizada para seu propósito específico.

- Como a aplicação implementa a inversão de dependências?

   **Resposta**
      A aplicação implementa a inversão de dependências através de um sistema de contratos entre as camadas. As interfaces são declaradas nas camadas mais internas, domain e application,  enquanto as implementações concretas são fornecidas pelas camadas externas de infraestrutura. Por exemplo, o caso de uso GetProducts declara sua dependência em uma interface ProductRepository, sem saber se a implementação real usará SQLite, PostgreSQL ou outo banco. Esta abstração permite que diferentes tecnologias sejam "plugadas" sem modificar a lógica de negócio.

#### 4. **Banco de Dados**
- Qual banco de dados a aplicação utiliza por padrão?

   **Resposta**

      A aplicação suportando tanto PostgreSQL quanto SQLite de forma nativa. Analisando a implementação, não há um banco "padrão" definido, mas sim uma flexibilidade que permite escolher entre as duas tecnologias conforme o ambiente. Lembrabdo que SQLite é otimizado para desenvolvimento e testes pois cria um banco local automaticamente, enquanto o PostgreSQL é orientado para ambientes de produção, pois exige configuração prévia mas oferecendo maior robustez e desempenho.

- Descreva a estrutura das tabelas do banco de dados

      **Resposta**

      id_product    INTEGER PRIMARY KEY,
      description   TEXT NOT NULL,
      price         NUMERIC/REAL NOT NULL,
      width         INTEGER,
      height        INTEGER, 
      length        INTEGER,
      weight        NUMERIC/REAL

- Como o código desacopla a lógica de negócio da tecnologia de banco de dados?

   **Resposta**

      O desacoplamento é implementado através de uma arquitetura em camadas com inversão de dependências. A camada de application define a interface ProductRepository com os métodos list() e get(id), estabelecendo um contrato que qualquer implementação de persistência deve seguir. As implementações concretas "ProductRepositoryDatabase" para PostgreSQL e "ProductRepositorySqlite" para SQLite, residem na camada de infraestrutura e são responsáveis por traduzir essas operações genéricas em comandos específicos de cada banco.

      O sistema utiliza Adapter através da interface DatabaseConnection, que abstrai as diferenças entre os drivers dos bancos. Isso permite que a lógica de negócio na camada domain e application permaneça completamente independente da tecnologia de persistência.


- Existe algum mecanismo de migração de dados?
      **Resposta**

      Não encontrei mecanismo de migração de dados, existe uma abordagem para SQLite, onde pode criar a tabela e popular ela; e outra para PostgreSQL, onde a tabela é criada antes de rodar a aplicação de forma manual. 

#### 5. **Funcionalidades**
- Liste todas as funcionalidades disponíveis na aplicação

   **Resposta**

      1. Catalog Service
         1.1 Listagem de Produtos

         1.2 Busca de Produto Específico

      2. Auth Service
         2.1 Registro de Usuários

         2.2 Autenticação de Login

         2.3 Validação de Tokens

      3. Checkout Service
         3.1 Finalização de Compra

         3.2 Consulta de Pedidos

         3.3 Listagem de Pedidos

         3.4 Validação de Cupons

      4. Freight Service
    
         4.1 Simulação de Frete

      5. Stock Service - Controle de Estoque
         5.1 Consulta de Estoque

         5.2 Redução de Estoque

         5.3 Limpeza de Estoque

- Quais operações CRUD estão implementadas?

   **Resposta**

      Operações CREATE
         Criação de Usuários

         Criação de Pedidos

         Registro de Produtos

      Operações READ
         Consulta de Produtos

         Consulta de Pedidos

         Consulta de Estoque

         Validação de Autenticação

         Consulta de Frete

      Operações UPDATE
         Atualização de Estoque

         Atualização de Status de Cupons

         Atualização de Dimensões

      Operações DELETE
         Limpeza de Estoque

#### 6. **Testes Automatizados**
- A aplicação possui testes? De quais tipos? (unitários, integração, e2e)

   **Resposta**

      Todos os cinco microsserviços possuem uma serie de testes organizada em duas categorias:

      Testes de Integração: Estão na pasta integration/, estes testes verificam o funcionamento conjunto de componentes, incluindo endpoints HTTP, comunicação com banco de dados PostgreSQL, e integração entre diferentes camadas da aplicação. Estes testes dependem de infraestrutura externa (banco de dados) e falham quando o PostgreSQL não está disponível.

      Testes Unitários: Localizados na pasta unit/, focam em componentes como entidades de domínio (Product, Order, Coupon), value objects (Cpf, Password), utilitários (StockCalculator, FreightCalculator) e regras de negócio puras. Estes testes são independentes de infraestrutura.

- Como executar a suite de testes?

   **Resposta**

      
      npm test


      npx jest


      npm run test:watch  # ou npx jest --watch (modo desenvolvimento)

- Como gerar o relatório de cobertura de código (coverage)?
   **Resposta**
      
      npm test -- --coverage OU npx jest --coverage


- Qual a porcentagem de cobertura? Isso é suficiente?

   **Resposta**

      A aplicação apresenta uma cobertura de testes variável entre os microsserviços, com o Catalog de 83.44% de statements e 86.56% de linhas, enquanto o Auth possui apenas 66.66% de statements e uma cobertura de branches de 9.09%. Os demais serviços, Checkout, Freight e Stock,mantêm coberturas regulares entre 65% e 70%. Indica falta de padronização na estratégia de testes. Apesar da estrutura de testes estar bem organizada em unitários e de integração, a implementação atual necessita de melhorias significativas antes de ser considerada adequada para ambiente produtivo.

#### 7. **Qualidade de Código - Linting**
- O que é linting e qual sua importância para a qualidade do código?

      **Resposta**

         Linting é o processo de análise estática do código que identifica automaticamente problemas de estilo, padrões inconsistentes e possíveis erros antes da execução. É fundamental para manter a consistência em bases de código colaborativas, prevenir bugs através da detecção precoce de problemas, facilitar a manutenção através de convenções padronizadas e garantir a aplicação de boas práticas de desenvolvimento.

- Qual ferramenta de lint está configurada no projeto?

      **Resposta**

         Não achei ferramentas de linting configurada no projeto. Os arquivos de configuração de ESLint e Prettier encontrados pertencem exclusivamente a dependências do node_modules.

- Como executar a verificação de lint?

      **Resposta**

         npx tsc --noEmit
         npm run build

- Quais regras de estilo estão sendo aplicadas?

      **Resposta**

      As regras estão sendo definidas no tsconfig.json de cada microsserviço

      "strict"

      "forceConsistentCasingInFileNames"

      "esModuleInterop"

      "skipLibCheck"

      Target ES2016

      Module CommonJS

#### 8. **Pergunta Avançada**
- Para rodar a aplicação com PostgreSQL em vez de SQLite, quais mudanças seriam necessárias?

      **Resposta**

         A aplicação já está configurada para suportar ambos os bancos de dados através de um sistema flexível 

         Comando atual para SQLite:

         npm run start:sqlite ou 
         DB=sqlite DB_FILE=./catalog.sqlite npm start

         Comando para PostgreSQL:


         npm start OU npm run dev OU DB=postgres npm start
         Precisa garantir que esteja rodando 

         Host: localhost
         Porta: 5432
         Database: app
         Usuário: postgres
         Senha: 123456
         Schema: cccat11 com tabela product criada

         A infraestrutura já está preparada com:

         Dois adapters de banco, PgPromiseAdapter e SqliteAdapter

         Dois repositórios, ProductRepositoryDatabase e ProductRepositorySqlite

         Factory pattern
- Isso demonstra qual princípio de qualidade de software?

      **resposta**

      Esta implementação demonstra o Princípio da Inversão de Dependência (DIP), "D" do SOLID.
      Esta é uma implementação de Ports and Adapters (Hexagonal Architecture), onde o núcleo da aplicação permanece completamente agnóstico aos detalhes tecnológicos externos.
---

### **Frontend - Análise Inicial**

#### 1. **Linguagem e Framework**
- Qual linguagem/framework o frontend utiliza?
      **Resposta**

         O frontend foi desenvolvido utilizando React com JavaScript como tecnologia principal, complementado com ferramentas que inclui Vite como bundler, Tailwind CSS para estilização e React Router DOM para gerenciamento de rotas. Esta escolha é das mais adotadas pela comunidade atualmente.

- Por que essa escolha é adequada para aplicações modernas?
      **Resposta**

      O React oferece uma arquitetura baseada em componentes que promove reutilização de código, facilitando a manutenção e escalabilidade da aplicação. A integração com Vite proporciona um ambiente de desenvolvimento extremamente eficiente, com recarregamento rápido de módulos durante o desenvolvimento e builds otimizados para produção mais rápido. O Tailwind CSS introduz uma metodologia de estilização utilitária que acelera o desenvolvimento visual, e o React Router DOM oferece uma solução robusta para gerenciamento de navegação. A inclusão de Vitest e Testing Library assegura que a aplicação possa ser adequadamente testada. 

#### 2. **Configuração e Execução**
- Como clonar o repositório do frontend?

      **Resposta**

         git clone https://github.com/leonardorsolar/microservice-product.git
         Após a clonagem, é essencial navegar até o diretório específico do frontend usando cd microservice-product/frontend

- Como instalar as dependências?
      **Resposta**

      A instalação das dependências é realizada através do comando npm install executado dentro do diretório do frontend. 
      Este processo analisa o arquivo package.json que define todas as bibliotecas necessárias, incluindo React para a interface de usuário, React Router DOM para gerenciamento de rotas, Tailwind CSS para estilização, Vite como ferramenta de build, e diversas dependências de desenvolvimento para testing e linting. 
      Durante a instalação, o npm resolve automaticamente todas as dependências transitivas, criando a pasta node_modules com todo o ecossistema de bibliotecas necessário para o funcionamento da aplicação.

- Como executar a aplicação em modo de desenvolvimento?

      **Resposta**

      o comando npm run dev, que utiliza o Vite para fornecer um ambiente de desenvolvimento otimizado. 
      O servidor normalmente fica disponível na porta 5173, acessível através do endereço http://localhost:5173, proporcionando aos desenvolvedores um feedback imediato durante o ciclo de desenvolvimento.

- Como fazer o build para produção?

      **Resposta**

      Utiliza-se o comando npm run build, que aciona o processo de build do Vite. O resultado é uma pasta dist contendo todos os arquivos prontos para deploy em qualquer servidor web estático ou serviço de hospedagem, com a aplicação completamente preparada para ambiente produtivo.

#### 3. **Arquitetura e Estrutura**
- Qual padrão de organização de código foi utilizado?

      **Resposta**

         O frontend adota um padrão híbrido de arquitetura que combina Feature-Based Modules com Component-Based Design. Esta abordagem organiza o código tanto por funcionalidades de negócio (módulos) quanto por reutilização técnica (componentes). A aplicação utiliza React Router DOM para gerenciar a navegação entre os diferentes módulos, com cada rota mapeando para um módulo específico que encapsula toda a lógica relacionada a uma área funcional particular.

- Explique a estrutura de pastas: `components`, `modules`, `lib`

      **Resposta** 

      A pasta components contém elementos de interface de usuário reutilizáveis, com uma subpasta ui dedicada a componentes primitivos como botões, inputs e outros elementos básicos que formam a fundação visual da aplicação. Estes componentes são agnósticos de negócio e focam exclusivamente em apresentação e interação.

      A pasta modules implementa a organização por funcionalidades de negócio, contendo módulos especializados como produto para gestão de catálogo e usuario para administração de usuários. Cada módulo é uma unidade autocontida que inclui componentes específicos, lógica de estado, e integrações com APIs, é uma feature completa da aplicação.

      A pasta lib serve como uma camada de utilitários compartilhados, contendo funções helper e lógica comum que é utilizada across múltiplos módulos e componentes. 

- Por que separar código em módulos é uma boa prática?

      **Resposta**

         A separação do código em módulos constitui uma boa prática para a qualidade do software  devido a múltiplos benefícios inter-relacionados. Ela promove alta coesão e baixo acoplamento, agrupando código relacionado enquanto minimiza dependências entre diferentes partes do sistema. 

         Em contextos de desenvolvimento em equipe, a modularização permite trabalho paralelo eficiente, onde diferentes desenvolvedores podem focar em módulos distintos sem constantes conflitos de merge ou bloqueios. Cada módulo pode evoluir independentemente, seguindo seu próprio ritmo de desenvolvimento e prioridades. Adicionalmente, esta abordagem facilita o testing e a qualidade, pois cada módulo pode ser testado de forma isolada, com mocks e stubs bem definidos para suas dependências externas.

#### 4. **Design UI/UX**
- Qual estratégia de design foi utilizada? (CSS puro, framework, biblioteca de componentes)
- A aplicação é responsiva? Como foi implementado?
- Identifique componentes reutilizáveis no projeto

#### 5. **Integração com Backend**
- Como o frontend se comunica com o backend?
- Onde estão configuradas as URLs da API?
- Como os erros de API são tratados?

#### 6. **Funcionalidades**
- Quais funcionalidades estão disponíveis na interface?
- Como a aplicação gerencia o estado dos dados?

#### 7. **Testes**
- Existem testes no frontend?
- Que tipos de testes estão implementados?
- Como executar os testes?
- Como verificar a cobertura de código?

#### 8. **Qualidade de Código**
- Existe configuração de lint/prettier?
- Como executar a verificação de qualidade?
- Quais padrões de código estão sendo seguidos?

---

## 🚀 Parte 2: Implementação de Melhoria

### **Issue: Sistema de Paginação**

**Contexto:** A aplicação atual retorna todos os registros de uma vez, o que pode causar problemas de performance quando o volume de dados aumenta.

**Tarefa:** Implementar um sistema de paginação completo (backend + frontend) para melhorar a performance da aplicação.

#### **Requisitos Backend:**
1. Modificar o endpoint GET para aceitar parâmetros:
   - `page` (número da página, padrão: 1)
   - `limit` (itens por página, padrão: 10)
2. Retornar metadados da paginação:
   - Total de itens
   - Total de páginas
   - Página atual
   - Itens por página
3. Implementar a paginação na camada de repositório
4. Adicionar testes para o novo comportamento

#### **Requisitos Frontend:**
1. Criar componentes de paginação reutilizáveis
2. Implementar controles de navegação (próxima, anterior, ir para página)
3. Exibir informações sobre a paginação atual
4. Manter a experiência do usuário fluida

#### **Entrega Esperada:**
- [ ] Fork do repositório original
- [ ] Branch com nome `feature/paginacao`
- [ ] Código implementado e funcionando
- [ ] Testes passando (incluindo novos testes)
- [ ] README atualizado com a nova funcionalidade
- [ ] Pull Request com descrição detalhada das mudanças

---

## 🏆 Parte 3: Avaliação de Qualidade

### **Responda: Por que esta aplicação demonstra qualidade de software?**

Analise e descreva como a aplicação implementa os seguintes aspectos de qualidade:

#### **1. Manutenibilidade**
- Como a arquitetura facilita manutenção futura?
- O código é legível e bem organizado?

#### **2. Testabilidade**
- Como a arquitetura facilita a criação de testes?
- Os componentes estão desacoplados?

#### **3. Escalabilidade**
- A arquitetura suporta crescimento da aplicação?
- É fácil adicionar novas funcionalidades?

#### **4. Reusabilidade**
- Existem componentes/módulos reutilizáveis?
- Como o código evita duplicação?

#### **5. Portabilidade**
- É fácil trocar tecnologias (banco de dados, servidor HTTP)?
- O código está acoplado a frameworks específicos?

#### **6. Performance**
- Existem otimizações implementadas?
- Como a paginação melhora a performance?

#### **7. Segurança**
- Existem práticas de segurança implementadas?
- Como os dados são validados?

#### **8. Documentação**
- O código está bem documentado?
- Existe documentação de uso?

---

## 📊 Critérios de Avaliação

| Critério | Peso |
|----------|------|
| Análise completa das questões (Parte 1) | 30% |
| Implementação da paginação funcionando | 40% |
| Qualidade do código implementado | 15% |
| Análise crítica de qualidade (Parte 3) | 15% |

---

## 💡 Dicas para o Sucesso

1. **Explore o código:** Não apenas leia, execute e teste a aplicação
2. **Entenda o "porquê":** Não basta saber o que está implementado, entenda por que foi feito assim
3. **Pesquise padrões:** Pesquise sobre Clean Architecture, SOLID, Design Patterns
4. **Teste antes de modificar:** Certifique-se que os testes estão passando antes de fazer mudanças
5. **Commits semânticos:** Use mensagens de commit claras e descritivas
6. **Documente suas mudanças:** Explique o que foi feito e por quê

---

## 📚 Referências Recomendadas

- Clean Architecture (Robert C. Martin)
- SOLID Principles
- Test-Driven Development (TDD)
- API Design Best Practices
- Frontend Performance Optimization

---

**Prazo de entrega:** [Definir data]

# 🚀 Issue: Sistema de Paginação de Produtos

## 🧩 Funcionalidade
Implementar sistema de paginação completo (backend + frontend) para listagem de produtos, melhorando a performance da aplicação quando houver grande volume de dados.

## 🎯 Comportamento Esperado
* O sistema deve permitir navegação paginada através dos produtos cadastrados.
* O usuário deve poder:
   * Visualizar um número limitado de itens por página (padrão: 10 itens)
   * Navegar entre páginas (próxima, anterior, ir para página específica)
   * Ver informações sobre a paginação atual (página X de Y, total de itens)
   * Alterar a quantidade de itens exibidos por página (10, 20, 50)
* O carregamento deve ser rápido, independente do volume total de dados
* Durante o carregamento, exibir um indicador visual (loading)
* Em caso de erro na consulta, o sistema deve apresentar uma mensagem amigável:
  _"Não foi possível carregar os produtos. Tente novamente mais tarde."_

## 🧠 Diretrizes Técnicas

### **Backend**
* Modificar o endpoint `GET /api/products` para aceitar query parameters:
   * `page` (número da página, padrão: 1, mínimo: 1)
   * `limit` (itens por página, padrão: 10, valores permitidos: 10, 20, 50)
* Estrutura de resposta JSON esperada:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```
* Implementar a lógica de paginação na camada de **Repository** (ProductRepositoryDatabase.ts)
* Adicionar validação dos parâmetros de entrada (valores negativos, limite máximo)
* Otimizar a query SQL utilizando `LIMIT` e `OFFSET`
* Criar consulta separada para contar o total de registros (`COUNT`)
* Manter a arquitetura limpa: lógica de paginação não deve vazar para o Domain

### **Frontend**
* Criar componente reutilizável `<Pagination />` em `components/ui/`
* Implementar controles de navegação:
   * Botões "Anterior" e "Próxima"
   * Numeração de páginas (com elipse para muitas páginas)
   * Seletor de itens por página
* Exibir informações: "Mostrando X-Y de Z produtos"
* Gerenciar estado da paginação (página atual, total de páginas)
* Atualizar URL com parâmetros de paginação (ex: `?page=2&limit=20`) para permitir compartilhamento
* Implementar debounce nas requisições para evitar chamadas excessivas
* Manter posição do scroll no topo ao mudar de página
* Garantir acessibilidade (ARIA labels, navegação por teclado)

### **Qualidade e Testes**
* **Testes Backend:**
   * Teste unitário: paginação com diferentes valores de page/limit
   * Teste unitário: validação de parâmetros inválidos
   * Teste de integração: verificar se o SQL gerado está correto
   * Teste de integração: verificar metadados de paginação
* **Testes Frontend:**
   * Teste de componente: renderização do Pagination
   * Teste de comportamento: navegação entre páginas
   * Teste de comportamento: mudança de itens por página
* Manter ou aumentar o coverage atual do projeto
* Código deve passar no lint sem warnings
* Seguir os padrões de código já estabelecidos no projeto

### **Documentação**
* Atualizar README.md com exemplo de uso da paginação
* Documentar os novos query parameters da API
* Adicionar comentários JSDoc/TSDoc nos métodos principais

## ✅ Critérios de Aceitação

1. **Dado que** existem mais de 10 produtos cadastrados,  
   **Quando** o usuário acessa a listagem de produtos,  
   **Então** o sistema exibe apenas os primeiros 10 itens e os controles de paginação.

2. **Dado que** o usuário está visualizando a primeira página,  
   **Quando** ele clica no botão "Próxima",  
   **Então** o sistema carrega a segunda página de produtos sem recarregar a aplicação inteira.

3. **Dado que** o usuário está na página 3 de 5,  
   **Quando** ele visualiza as informações de paginação,  
   **Então** o sistema mostra claramente: página atual, total de páginas, total de itens.

4. **Dado que** o usuário altera o limite de itens por página de 10 para 20,  
   **Quando** a mudança é aplicada,  
   **Então** o sistema retorna à página 1 e exibe 20 itens.

5. **Dado que** o usuário está na página 2,  
   **Quando** ele recarrega a página do navegador,  
   **Então** o sistema mantém o usuário na página 2 (state persistido na URL).

6. **Dado que** ocorre um erro na requisição de produtos,  
   **Quando** o sistema tenta carregar a página,  
   **Então** uma mensagem de erro amigável é exibida sem quebrar a interface.

7. **Dado que** o desenvolvedor roda os testes automatizados,  
   **Quando** executa `npm test`,  
   **Então** todos os testes de paginação (backend e frontend) passam com sucesso.

8. **Dado que** o backend recebe parâmetros inválidos (ex: `page=-1`, `limit=1000`),  
   **Quando** valida os parâmetros,  
   **Então** retorna erro 400 com mensagem descritiva.

---

## 📋 Checklist de Implementação

**Backend:**
- [ ] Modificar ProductRepository interface para suportar paginação
- [ ] Implementar lógica de paginação em ProductRepositoryDatabase
- [ ] Atualizar GetProducts use case
- [ ] Adicionar validação de parâmetros
- [ ] Criar testes unitários
- [ ] Criar testes de integração
- [ ] Atualizar documentação da API

**Frontend:**
- [ ] Criar componente Pagination reutilizável
- [ ] Atualizar ProdutoModule para usar paginação
- [ ] Implementar gerenciamento de estado (useState/useReducer)
- [ ] Sincronizar estado com URL (useSearchParams ou similar)
- [ ] Adicionar loading states
- [ ] Adicionar tratamento de erros
- [ ] Criar testes de componentes
- [ ] Garantir acessibilidade (a11y)

**Qualidade:**
- [ ] Código passa no lint
- [ ] Coverage mantido ou aumentado
- [ ] Code review realizado
- [ ] README atualizado

---

## 🎓 Contexto Educacional
Esta issue faz parte do exercício prático da disciplina de **Qualidade de Software**. A implementação deve demonstrar:
- Arquitetura limpa e desacoplada
- Princípios SOLID
- Testabilidade
- Boas práticas de desenvolvimento
- Performance e escalabilidade

---

## 📊 Estimativa
**Story Points:** 8  
**Prioridade:** Alta  
**Sprint:** [Definir]


