![CodePlayData_pt_en](https://user-images.githubusercontent.com/52466957/111396185-5345c180-869d-11eb-987e-94689a2614ae.gif)

# Tools for Easy Spatial Analysis (tesa)

## Sobre a empresa

A `CodePlayData` é um projeto criado com a missão de simplificar os processos de
gerência, tratamento e consumo de dados em aplicações e softwares de alguns
setores da sociedade. Acreditamos que possamos contribuir de forma significativa por
meio de produtos e serviços que reduzam a complexidade de determinados métodos
aplicados na área de dados, como por exemplo, tornar acessível a análise de
dados espaciais, facilitar a aplicação de técnicas de modelagem estruturais e
extração de _latent features_, possibilitar aplicações de _feature store_ e
versionamento de _fetures_ e/ou reduzir a complexidade da didática em
programação.

Prezamos pela simplicidade dos processos, satisfação do usuário e clareza nas
relações. Nosso modelo prioritário de negócio é por meio de **APIs públicas**,
**FaaS** e **PWAs**. Sempre que possível iremos optar por soluções
_open-source_. Se quiser conhecer mais acompanhe nossas redes sociais:

- [Twitter](https://https://twitter.com/CodePlayData)

## Sobre esse repositório

**Público**: Esse repositório é destinado a cientistas de dados, desenvolvedores
e afins, no Brasil.

**Objetivo**: Reduzir a complexidade de processos nos três pilares das análises
espaciais:

- Geocodificação e Busca (back-end);
- Geolocalização e Mapas (front-end);
- Geoprocessamento e Modelos (data-science);

**Integrações**:
[API do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3),
[Nominatim](https://nominatim.org/) e [Geofabrik](https://download.geofabrik.de/).

<br>

**Status**: Em desenvolvimento. **Linguagens**: Javascript. **Frameworks**: Deno e Vue3.

<br>

### Estrutura de pastas

- **src**: o código fonte.
- **test**: pasta que contém todos os testes disponíveis.
- **bin**: pasta que contém os binários do osmium-tool, usado para criar aquivos .pbf, e do osm_extract_polygon, usado para extrair objetos de arquivos osm. As duas ferramentas são utilizadas para o processo de extração dos polígonos do bairros (e serão usados para extração das ruas e outras coisas).
- **data**: todos os arquivos necessários para converter nomes: string em códigos do IBGE que equivalem ao polígono solicitado. Os arquivos _double são os nomes duplicados, triplicados, quadruplicados ou quintuplicados das divisões geográficas do Brasil.
- **neighborhoods_includes**: Pasta que contém polígonos dos bairros corrigidos por municípios.

<br>

> Os bairros estão sendo coletados diretamente dos objetos OpenStreetMap (.osm), que de certa forma é uma contribuição coletiva, entretanto, no Brasil a divisão dos bairros é de prerrogativa dos municípios isso faz com que as divisões sejam alteradas com maior frequência do que as divisões acima. Sendo assim, na `neigborhood_list.csv` existe uma lista de bairros que serão considerados "errados" para serem removidos e link dos bairros considerados "corrigidos" para serem incluidos pela função antes de entregar o objeto geojson.

<br>

---

<br>

## Geocodificação e Busca

A Geocodificação é o processo de converter referências de localização, como
endereços, CEP ou nomes de divisões geográficas como municípios ou estados, em
dados referenciados geograficamente para os sistemas de informações geográficas
(GIS), utilizando vetores (em casos de dados pontuais) ou _arrays_ (em caso de
polígonos) de valores de latitude e longitude<sup>1</sup>.

Esse é um método já normalizado nos hábitos atuais quando buscamos corridas de
aplicativos de carros, novos endereços ou buscamos a distância entre dois pontos
para calcularmos o frete de uma entrega<sup>2</sup>.

Atualmente a pioneira no fornecimento desse serviço é a Google com a sua
[Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview).
Muito do sucesso se deve a rotineira busca ativa (mapeamento) dos endereços
feito pela empresa com veículos especiais.

Todavia, existem opções comunitárias para o mesmo tipo de serviço, como é o
[Nominatim](https://nominatim.org/) (o "motor" de busca do OpenStreetMaps). Os
dados são atualizados pela comunidade e exportados por empresas como a
[Geofabrik](https://www.geofabrik.de/) em bases de dados de mapas (tiles) para
serem utilizadas no Nominatim em diversos usos. Especificamenete no caso de
mapas brasileiros existem estudos que validaram a viabilidade de uso<sup>3</sup>
e até implementaram soluções para aumentar a precisão e estimular a contribuição
da comunidade<sup>4</sup>.

<br>

### Especificações

A princípio, todas as funções estão autônomas, não necessitando de depedências além das que já estão na pasta `./src/`. Porém, caso o exista um `config.json` (existe um exemplo na pasta root), ao alterar as urls, é possível utilizar as funções para buscar os polígonos em API privadas. Por default, serão utilizados o OpenStretMaps para localizar os pontos e o IBGE para buscar os polígonos. Entretanto, no OSM **tenha cuidado com o limite de requisições!!!**

> Caso sejam utilizados múltiplos servidores privados o nome de cada um deles deve ser
correspondente ao nome da macroregião em questão, por exemplo, caso o servidor
seja apenas da região Sudeste, esse deve ser o nome.

---

### Hint
> No front-end faça uso de processamento paralelo com service-workers para não
> comprometer o event loop com requisições pesadas. Aproveite e utilize a Cache
> API para os arquivos estáticos, como o config.json, a pasta src/data ou para
> requisições na API.

<br>

Por se tratar de uma lib do Deno é possível simular um processo uma
"instalação", nesse caso o Deno cria um Bash script no root com o call do Deno
na frente para que seja possível chamar as funções, classes e etc...
diretamente. Para isso basta:

```
deno install --allow-read --allow-write --allow-net mod.js
```

<br>

Os testes unitários estão no arquivo unit.test.ts e podem ser executados com:

```
deno test -A
```

A seguir aprentam-se os resumos das funções: 
| Nome | Descrição | Parâmetros |
|:--------|:-----------------|:--------|
| **getOnePolygon** | Busca por nome um polígono de um tipo de divisão geográfica brasileira. | NOME, CATEGORIA GEOGRÁFICA | 
| **getManyPolygons** | Busca por nomes um array de polígonos de um tipo de divisão geográfica brasileira. | { type: CATEGORIA GEOGRÁFICA, aliases: [NOMES] } | 
| **belongsTo** | Busca por nome a hierarquia geográfica a qual o objeto pertence. | NOME, CATEGORIA GEOGRÁFICA | 
| **belongsToMany** | Busca por nomes um array de hierarquias geográficas de cada objeto do array. | { type: CATEGORIA GEOGRÁFICA, aliases: [NOMES] } |
| **fowardGeocoding** | Busca por identificadores geográficos, estruturados ou não, a localização de um ponto. | { request: ESTRUTURA¹, map_tiles: { name: NOME } } <br> { housenumber: NUMERO, street: ENDEREÇO, city: CIDADE, state: ESTADO} |
| **reverseGeoding** | Busca do endereço segundo dados de localização, latitude e longitude. | { map_tiles: { name: NOME } } <br> { lon: LONGITUDE, lat: LATITUDE } | 
|**hierarchicalOrdering** | Busca toda a ordem hierárquica a qual o ponto pertence e armazena os polígonos | { street: ENDEREÇO, number: NUMERO, city: CIDADE, geometry: [ LATITUDE, LONGITUDE ] } |
| **downloadFile** | Faz o download de um arquivo a partir de uma URL | URL, path |
| **extractNeighboorhodFromPbf** | Extrai de arquivos .osm todos os objetos da categoria 10 classificados como bairros | path |
| **getCityPbf** | Obtém o arquivo .osm de uma determinada cidade | NOME DA CIDADE |
| **getOsmExtractTools** | Função que faz o download e instalação da ferramenta de extração de polígonos, lembrando que o repositório já possui os binários necessários para isso. | null |
| **readNeighborhoodGeojsonFromDir** | Lê todos os arquivos .geojson dos bairros e sintetiza em um único. | path |
| **runCmd** | Função que executa comandos shell por meio de um child proccess. | Comando: string, print: boolean, que define se vai ser impresso no STDOUT |
| **untarFile** | Untar o file | path, destfile |
¹Tipo de Request ao servidor de mapas, se ela será do tipo estruturada ou não estruturada (endereço de livre escrita).


<br>

> Nota nº1: Entre as divisões de estado e município existem 2 modelos propostos
> pelo IBGE. O primeiro deles é de 1990 e agrupa os municípios em _microregiões_
> e essas em _meso-regiões_, esse critério previa que os municípios com
> características sociais e econômicas semelhantes deveriam fazer parte de um
> mesmo grupo. Entretanto, esse conceito não se estabeleceu, uma vez que as
> próprias unidades administrativas se agruparam ao longo dos anos segundo os
> seus próprios critérios, assim em 2017 surge uma proposta de agrupamento em
> regiões _imediatas_ e essas em regiões _intermediárias_ (com nomes muito
> próximos do que conhecemos popularmente).

<br>

> Nota nº2: A segunda classificação de 2017 ainda está sendo implementada, por
> exemplo: na API não contém a opção de dividir o Brasil, as macroregiões ou os
> estados em regiões imediatas ou intermediárias, isso significa que na opção
> `getManyPolygons`, não é possível fazer a economia de requisões; Ou seja, para
> usar essa classificação terá que fazer um _loop_ com a função `getOnePolygon`
> (**cuidado com o limite da API**).

<br>

#### Referências

<sup>1</sup>Zandbergen, P.A. Influence of geocoding quality on environmental
exposure assessment of children living near high traffic roads. BMC Public
Health 7, 37 (2007). https://doi.org/10.1186/1471-2458-7-37.

<sup>2</sup>Dapeng Li. Geocoding and Reverse Geocoding. Comprehensive Geographic
Information Systems, Elsevier, 2018, p. 95-109, ISBN 9780128047934.

<sup>3</sup>ELIAS, Elias Nasr Naim; FERNANDES, Vivian de Oliveira; ALIXANDRINI
JUNIOR, Mauro José and SCHMIDT, Marcio Augusto Reolon. The quality of
OpenStreetMap in a large metropolis in northeast Brazil: Preliminary assessment
of geospatial data for road axes. Bol. Ciênc. Geod. [online]. 2020, vol.26, n.3
[cited 2021-04-08], e2020012. Available from:
<http://www.scielo.br/scielo.php?script=sci_arttext&pid=S1982-21702020000300201&lng=en&nrm=iso>.
Epub Sep 21, 2020. ISSN 1982-2170.
https://doi.org/10.1590/s1982-21702020000300012.

<sup>4</sup>John E. Vargas Muñoz, Devis Tuia & Alexandre X. Falcão (2020)
Deploying machine learning to assist digital humanitarians: making image
annotation in OpenStreetMap more efficient, International Journal of
Geographical Information Science, DOI: 10.1080/13658816.2020.1814303.

<br>

## Geoprocessamento

ToDo

## Geolocalização

ToDo

## LICENÇA

<br>

Copyright Pedro Paulo Teixeira dos Santos

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

        http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

---
