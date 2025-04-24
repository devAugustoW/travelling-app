# travellingApp ✈️🌍

Seu diário de viagens digital para registrar e reviver suas aventuras!

[![Video Demo](https://img.youtube.com/vi/TbMI7nmvmwg/0.jpg)](https://www.youtube.com/shorts/TbMI7nmvmwg)

## Sobre o Projeto

O `travellingApp` é um aplicativo móvel (desenvolvido com Expo) projetado para ajudar viajantes a organizar, documentar e compartilhar suas experiências pelo mundo. O `travellingApp`, cria álbuns ricos com informações para cada viagem, adicionando fotos, localizações em mapas interativos, descrições, avaliações e muito mais. 

## ✨ Funcionalidades Principais

*   **Criação e Gestão de Álbuns de Viagem:**
    *   Crie álbuns detalhados para cada destino ou jornada.
    *   Especifique informações como tipo de viagem (Praia, Montanha, Cidade, etc.), destino, título personalizado, atividade principal, nível de dificuldade, duração e custo estimado.
    *   Faça "check-in" ao chegar no seu destino, capturando automaticamente sua localização GPS ou insira o nome do local via texto.
    *   Visualize todos os seus álbuns organizados na tela inicial.

*   **Registro Detalhado de Momentos (Posts/Fotos):**
    *   Adicione fotos aos seus álbuns para ilustrar suas memórias.
    *   Edite títulos e descrições para cada foto, contando a história por trás da imagem.
    *   Associe uma localização precisa a cada foto, com visualização integrada no mapa.
    *   Avalie seus momentos e fotos favoritas com um sistema de notas (estrelas).
    *   Marque uma foto como a "Capa do Álbum" para destaque.
    *   Gerencie seus posts facilmente (edite informações ou exclua, se necessário).

*   **Exploração e Organização:**
    *   Navegue por seus álbuns e veja as "Melhores Fotos" (com maior nota) diretamente na tela inicial.
    *   Filtre suas memórias por categorias para encontrar rapidamente o que procura.
    *   Utilize a barra de pesquisa para buscar por álbuns ou locais específicos.

*   **Interface Intuitiva:**
    *   Design limpo e focado na experiência do usuário viajante.
    *   Navegação simples entre álbuns, posts e funcionalidades.

## 🚀 Tecnologias Utilizadas

*   React Native
*   Expo
*   React Navigation
*   Axios 
*   AsyncStorage 
*   JavaScript
*   API Google Place Auto Complete


## 🔗 Arquitetura do Projeto

Este repositório contém o código frontend do travellingApp. Para uma experiência completa, você também precisará configurar o backend:

### Backend (API)

[Link para o repositório da API](https://github.com/devAugustoW/travelling-api)

##  🛠 Get Started
Siga estas instruções para configurar e rodar o projeto localmente.

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Expo Go (aplicativo) instalado no seu dispositivo móvel
- Conta no [Google Cloud Platform](https://console.cloud.google.com) para API do Places
- Conta no [Cloudinary](https://cloudinary.com) para armazenamento de imagens

### Executando o Aplicativo
1. Faça um download do projeto
2. no terminal, na pasta no projeto, instale as dependências do projeto:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
```env
GOOGLE_PLACES_API_KEY=sua_chave_do_google_places
CLOUDINARY_URL=sua_url_do_cloudinary
CLOUD_NAME=seu_cloud_name
CLOUD_API_SECRET=sua_api_secreta
CLOUD_API_KEY=sua_api_key
API_URL=url_do_backend
```

### Executando o Aplicativo
1. Inicie o servidor de desenvolvimento:
```bash
npx expo start
```

2. Use o aplicativo Expo Go no seu dispositivo móvel para escanear o QR Code que aparecerá no terminal

### 👥 Modo Visitante

Para explorar o aplicativo sem necessidade de criar uma conta, utilize a opção "Entrar como visitante" na tela de login. Este modo permite que você conheça as principais funcionalidades do aplicativo através de um perfil demonstrativo totalmente populado.

#### O que você pode fazer como visitante:
- Explorar álbuns de viagem já criados
- Visualizar fotos e suas localizações no mapa
- Ver as melhores fotos na página inicial
- Utilizar filtros de busca por categoria (Praia, Montanha, Cidade, etc.)
- Pesquisar álbuns e locais específicos

#### Limitações do modo visitante:
- Não é possível criar novos álbuns
- Não é possível adicionar ou editar fotos
- Não é possível excluir conteúdo
- Não é possível avaliar fotos

> 💡 Para ter acesso a todas as funcionalidades, crie sua própria conta clicando em "Criar uma conta" na tela de login.

## ✒️ Autor
Augusto Dantas - @devaugustow
