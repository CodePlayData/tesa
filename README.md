## Sobre
Esse repositório é criado para consumir a API de malhas geográficas do IBGE disponível [aqui](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3) e entregar polígonos, objeto de uso na técnica de geolocalização, de todas as divisões geográficas oficiais.

**Status**: Em desenvolvimento.

Essa versão 3.0 da API vem com um _query_ _builder_ para agilizar o processo de chamada. Considerando que o IBGE se guia, na maioria das vezes, pelo código padrão estabelecidos por eles, o objetivo desse projeto é possibilitar a chamada pelo nome, ao estilo **Nominatim**.

## Bundle
Para transformar o pacote em um módulo html5 basta:

```
deno bundle mod.js ./dist/tesa.js
```

## Instalação
Por se tratar de uma lib do Deno é possível simular um processo uma "instalação", nesse caso o Deno cria um Bash script no root com o call do Deno na frente para que seja possível chamar as funções, classes e etc... diretamente. Para isso basta:

```
deno install --allow-net mod.js
```

### Binário!
Uma das inovações do Deno é a possibilidade de fazer um binário para o sua lib. Para isso basta:

``` 
deno compile --output ./dist/bin/tesa(em caso de windowns adicionar .exe) mod.js
```

>Nota nº1: Entre as divisões de estado e município existiram 2 modelos propostos pelo IBGE. O primeiro deles é de 1990 e agrupa os municípios em _microregiões_ e essas em _meso-regiões_, esse critério previa que os municípios com características sociais e econômicas semelhantes deveriam fazer parte de um mesmo grupo. Entretanto, esse conceito não se estabeleceu, uma vez que as próprias unidades administrativas se agruparam ao longo dos anos segundo os seus próprios critérios, assim em 2017 surge uma proposta que agrupa em regiões _imediatas_ e essas em regiões _intermediárias_ (com nomes muito próximos do que conhecemos popularmente). 

>Nota nº2: A segunda classificação de 2017 ainda está sendo implementada, por exemplo: na API não contém a opção de dividir o Brasil, as macroregiões ou os estados em regiões imediatas ou intermediárias, isso significa que na opção `getManyPolygons`, não é possível fazer a economia de requisões; Ou seja, para usar essa classificação terá que fazer um _loop_ com a função `getOnePolygon` (**cuidado com o limite da API**).
___

Copyright Pedro Paulo Teixeira dos Santos

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
