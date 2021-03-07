## Sobre
Esse repositório é criado para consumir a API de mapas do IBGE e entregar polígonos de todas as divisões geográficas oficiais (exceto bairros, que precisará ser implementada em _cross_ com o _geocoding_).

**Status**: Em desenvolvimento

### Pendências
1. Trocar os _for loops_ para _apply_.
2. Criar uma função _wrapper_ `get_polygons`.
3. Criar o micro service (ms) que irá servir o método `get_polygons`. Deno? Pode compilar em binário, é mais simples de spawnar child process e não precisa do framework instalado no final.
4. Criar o ms que irá receber o POST _request_ dos arquivos _aliasList_ e _doubleList_ de cada escopo.
5. Criar a imagem do container em dois modos: 1. _cached_, no momento da _build_ ela chama a API do IBGE e salva todos os mapas; 2. _lean_, sem cache, armazena em produção, caso necessário.
6. Fazer a imagem alpine _multi-arch_.

___

Copyright [Pedro Paulo Teixeira dos Santos] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.