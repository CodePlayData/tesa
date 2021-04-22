![CodePlayData_pt_en](https://user-images.githubusercontent.com/52466957/111396185-5345c180-869d-11eb-987e-94689a2614ae.gif)

# Tools for Easy Spatial Analysis (tesa)

## Sobre a empresa

A `CodePlayData` nasce de um projeto criado com a missão de simplificar os processos de gerência, tratamento e consumo de dados em aplicações e softwares de alguns setores da sociedade.

Acreditamos que nos próximos anos possamos contribuir de forma significativa por meio de produtos e serviços que reduzam a complexidade de determinados métodos aplicados na área de dados, como por exemplo, tornar acessível a análise de dados espaciais, facilitar a aplicação de técnicas de modelagem estruturais e extração de _latent features_, possibilitar aplicações de _feature store_ e versionamento de _fetures_ e/ou reduzir a complexidade da didática em programação.  

Prezamos pela simplicidade dos processos, satisfação do usuário e clareza nas relações.
Nosso modelo prioritário de negócio é por meio de **APIs públicas**, **FaaS** e **PWAs**. Sempre que possível iremos optar por soluções _open-source_.
Se quiser conhecer mais acompanhe nossas redes sociais:

- [Twitter](https://https://twitter.com/CodePlayData)

## Sobre esse repositório

**Público**: Esse repositório é destinado a todos os Cientistas de Dados, desenvolvedores e afins, no Brasil.

**Objetivo**: Reduzir a complexidade de processos nos três pilares das análises espaciais:
- Geocodificação e Busca
- Geolocalização e Mapas
- Geoprocessamento e Modelos

**Integrações**: [API do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3) e [Nominatim](https://nominatim.org/).

<br>

**Status**: Em desenvolvimento.
**Linguagem**: Javascript.
**Framework**: Deno.

<br>

### Estrutura de pastas
- .k8s: Imagem do _container_ do binário do tesa em uma base Ubuntu (145MB).
- src: o código fonte.

<br>

___


<br>


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

---


<br>

## Geocodificação e Busca
A Geocodificação é o processo de converter referências de localização, como endereços, CEP ou nomes de divisões geográficas como municípios ou estados, em dados referenciados geograficamente para os sistemas de informações geográficas (GIS), utilizando vetores (em casos de dados pontuais) ou _arrays_ (em caso de polígonos) de valores de latitude e longitude<sup>1</sup>. 

Esse é um método já normalizado nos hábitos atuais quando buscamos corridas de aplicativos de carros, novos endereços ou buscamos a distância entre dois pontos para calcularmos o frete de uma entrega<sup>2</sup>.

Atualmente a pioneira no fornecimento desse serviço é a Google com a sua [Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview). Muito do sucesso se deve a rotineira busca ativa (mapeamento) dos endereços feito pela empresa com veículos especiais. 

Todavia, existem opções comunitárias para o mesmo tipo de serviço, como é o [Nominatim](https://nominatim.org/) (o "motor" de busca do OpenStreetMaps). Os dados são atualizados pela comunidade e exportados por empresas como a [Geofabrik](https://www.geofabrik.de/) em bases de dados de mapas (tiles) para serem utilizadas no Nominatim em diversos usos. Especificamenete no caso de mapas brasileiros existem estudos que validaram a viabilidade de uso<sup>3</sup> e até implementaram soluções para aumentar a precisão e estimular a contribuição da comunidade<sup>4</sup>.

### Problematização
- [ ]  A busca por endereços na API do Google não é difícil, a principal limitação é o custo, que pode subir consideravelmente dependendo do número de requests que serão feitas. Para usar o Nominatim existem pelo menos dois tutoriais disponíveis em português: [Geocodificação— sem Google maps API — Parte I](https://medium.com/data-hackers/geocodifica%C3%A7%C3%A3o-sem-google-maps-api-parte-i-f4e9e32c386) e [Geocodificação — sem Google maps API— Parte II](https://medium.com/data-hackers/geocodifica%C3%A7%C3%A3o-sem-google-maps-api-parte-ii-82722f62628). Um ponto de melhoria desse processo é a disponibilidade de métodos de consumo dessas API que possam ser implementados em escala, seja no front-end ou no back-end, sem necessidade de um set de Data Science, pois estes podem consumir facilmente 500MB a 1GB de aplicação, como nos casos de Jupyter notebooks (Phyton ou R) ou infras como KubeFlow. 

- [ ] O padrão de pontos é apenas uma parte de uma análise espacial. Os polígonos são parte essencial do processo de Geolocalização e a busca por esses na API do Google é complexa enquanto que no Nominatim computacionalmente custosa.

### Soluções
Para resolver a questão de disponibilidade e escalibilidade, optou-se por utilizar Javascript como linguagem e Deno.js como framework de desenvolvimento. 
No _front-end_ será possível utilizar as funções como módulo do HTML5 ou integradas como pacotes Deno. 
No _back-end_ o Deno fornece a possibilidade de compilar em binário.

Quanto a limitação dos polígonos, o Instituto Brasileiro de Geografia e Estatística (IBGE) fornece em API as malhas geográficas (polígonos) de todas as divisões geográficas brasileiras, sendo necessário apenas fazer um _wrapper_ das chamadas para essa API.

#### Especificações

Os arquivos principais (módulo ou compilado) possuem como única dependência o arquivo config.json, que obrigatoriamente deve estar no mesmo diretório. Esse arquivo contém 
**todos os links externos para as chamadas da API, o que possibilita a troca dos links para servidores privados sem necessidade de mexer no código.**
Por _default_ o servidor no `config.json` é o OpenStreetMaps.


**Tenha cuidado com o limite de requisições!!!**


Em caso de múltiplos servidores privados o nome de cada um deles deve ser correspondente ao nome da macroregião em questão, por exemplo, caso o servidor seja apenas da região Sudeste, esse deve ser o nome.

Caso queira utilizar um servidor próprio basta alterar o arquivo `config.json`. No caso de servidores pagos que necessitem de API_key configure-a como variável de ambiente.
O arquivo compilado é vínculado à pasta em que está inserido pois em caso de necessitar de cache (boa prática!) a pasta será criada no mesmo diretório. 
Para o alias do arquivo no `~/.bashrc` opte por utilizar o caminho absoluto.

Após o repositório clonado, para transformar o pacote em um módulo html5 basta:

```
deno bundle --allow-read --allow-write --allow-net mod.js ./dist/tesa.js
```
**Lembre-se que o a dependencia config.json deve estar junto com o módulo na pasta root**
> No front-end faca* uso de processamento paralelo com service-workers para nao* comprometer o event loop com requisicoes* pesadas. Aproveite e utilize a Cache API nativa da maioria dos navegadores disponiveis* para os arquivos estaticos*, como o config.json e para requisicoes* na API.

<br>

Por se tratar de uma lib do Deno é possível simular um processo uma "instalação", nesse caso o Deno cria um Bash script no root com o call do Deno na frente para que seja possível chamar as funções, classes e etc... diretamente. Para isso basta:

```
deno install --allow-read --allow-write --allow-net mod.js
```
<br>

Uma das inovações do Deno é a possibilidade de fazer um binário da lib. Para isso basta:

``` 
deno compile --unstable --allow-read --allow-write --allow-net --output ./dist/bin/tesa(em caso de windowns adicionar .exe) to_bin.js
```
Repare que ainda não existe compilação para multiarquiteturas, sendo assim, será necessário repetir o processo em cada uma das que se deseja utilizar.

Os testes unitários estão no arquivo mod.test.js e podem ser executados com:
```
deno test -A mod.test.js
```
A seguir aprentam-se os resumos das funções:
| Nome | Descrição | Parametros |
|:-----|:----------|:-----------|
| **getOnePolygon** | Busca por nome de um polígono de um tipo de divisão geográfica brasileira. |  | 
| **getManyPolygons** | Busca por nomes de um array de polígonos de um tipo de divisão geográfica brasileira. |  |
| **belongsTo** | Busca por nome da hierarquia geográfica a qual o objeto pertence. |  |
| **belongsToMany** | Busca por nomes de um array das hierarquias geográficas de cada objeto do array. |  |
| **fowardGeocoding** | Busca por identificadores geográficos, estruturados ou não, da localização de um local.  |  |
| **reverseGeoding** | Busca do endereço segundo dados de localização. |  | 

ToDos:

- **hierarchicalOrdering**: Separa todo o dataset em objetos aninhados segundo suas hierarquias geográficas. 

<br>

>Nota nº1: Entre as divisões de estado e município existiram 2 modelos propostos pelo IBGE. O primeiro deles é de 1990 e agrupa os municípios em _microregiões_ e essas em _meso-regiões_, esse critério previa que os municípios com características sociais e econômicas semelhantes deveriam fazer parte de um mesmo grupo. Entretanto, esse conceito não se estabeleceu, uma vez que as próprias unidades administrativas se agruparam ao longo dos anos segundo os seus próprios critérios, assim em 2017 surge uma proposta que agrupa em regiões _imediatas_ e essas em regiões _intermediárias_ (com nomes muito próximos do que conhecemos popularmente). 

<br>

>Nota nº2: A segunda classificação de 2017 ainda está sendo implementada, por exemplo: na API não contém a opção de dividir o Brasil, as macroregiões ou os estados em regiões imediatas ou intermediárias, isso significa que na opção `getManyPolygons`, não é possível fazer a economia de requisões; Ou seja, para usar essa classificação terá que fazer um _loop_ com a função `getOnePolygon` (**cuidado com o limite da API**).

<br>

#### Referências
<sup>1</sup>Zandbergen, P.A. Influence of geocoding quality on environmental exposure assessment of children living near high traffic roads. BMC Public Health 7, 37 (2007). https://doi.org/10.1186/1471-2458-7-37.

<sup>2</sup>Dapeng Li. Geocoding and Reverse Geocoding. Comprehensive Geographic Information Systems, Elsevier, 2018, p. 95-109, ISBN 9780128047934.

<sup>3</sup>ELIAS, Elias Nasr Naim; FERNANDES, Vivian de Oliveira; ALIXANDRINI JUNIOR, Mauro José  and  SCHMIDT, Marcio Augusto Reolon. The quality of OpenStreetMap in a large metropolis in northeast Brazil: Preliminary assessment of geospatial data for road axes. Bol. Ciênc. Geod. [online]. 2020, vol.26, n.3 [cited  2021-04-08], e2020012. Available from: <http://www.scielo.br/scielo.php?script=sci_arttext&pid=S1982-21702020000300201&lng=en&nrm=iso>.  Epub Sep 21, 2020. ISSN 1982-2170.  https://doi.org/10.1590/s1982-21702020000300012.

<sup>4</sup>John E. Vargas Muñoz, Devis Tuia & Alexandre X. Falcão (2020) Deploying machine learning to assist digital humanitarians: making image annotation in OpenStreetMap more efficient, International Journal of Geographical Information Science, DOI: 10.1080/13658816.2020.1814303.


<br>

## Geoprocessamento

ToDo

## Geolocalização 
ToDo
