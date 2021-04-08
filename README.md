![CodePlayData_pt_en](https://user-images.githubusercontent.com/52466957/111396185-5345c180-869d-11eb-987e-94689a2614ae.gif)

# Tools for Easy Spatial Analysis (tesa)

## Sobre a empresa

A `CodePlayData` nasce de um projeto criado com a missão de simplificar os processos de gerência, tratamento e consumo de dados em aplicações e softwares de alguns setores da sociedade.

Acreditamos que nos próximos anos possamos contribuir de forma significativa por meio de produtos e serviços que reduzam a complexidade de determinados métodos aplicados na área de dados, como por exemplo, tornar acessível a análise de dados espaciais, facilitar a aplicação de técnicas de modelagem estruturais e extração de _latente features_, possibilitar aplicações para _feture store_ e versionamento de _fetures_ e/ou reduzir a complexidade da didática em programação.  

Prezamos pela simplicidade dos processos, satisfação do usuário e clareza nas relações.
Nosso modelo prioritário de negócio é por meio de **APIs públicas**, **FaaS** e **PWAs**. Sempre que possível iremos optar por soluções _open-source_.
Se quiser conhecer mais acompanhe nossas redes sociais:

- [Twitter](https://https://twitter.com/CodePlayData)

## Sobre esse repositório

**Público**: Esse repositório é destinado a todos os Cientistas de Dados, desenvolvedores e afins, no Brasil.
**Objetivo**: Reduzir a complexidade de processos nos três pilares das análises espaciais:
- Geolocalização e Mapas
- Geocodificação e Busca
- Geoprocessamento e Modelos

**Integrações**: [API do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3) e [Nominatim](https://nominatim.org/).

<br>

**Status**: Em desenvolvimento.
**Linguagem**: Javascript.
**Framework**: Deno.

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

## Geolocalização 
ToDo
## Geocodificação
ToDo
## Geoprocessamento

<br>

---

<br>

## Buildando o projeto


### **Bundle**

Para transformar o pacote em um módulo html5 basta:

```
deno bundle mod.js ./dist/tesa.js
```
<br>

### **Instalação**
Por se tratar de uma lib do Deno é possível simular um processo uma "instalação", nesse caso o Deno cria um Bash script no root com o call do Deno na frente para que seja possível chamar as funções, classes e etc... diretamente. Para isso basta:

```
deno install --allow-net mod.js
```
<br>

### **Binário**
Uma das inovações do Deno é a possibilidade de fazer um binário da lib. Para isso basta:

``` 
deno compile --output ./dist/bin/tesa(em caso de windowns adicionar .exe) mod.js
```

<br>

>Nota nº1: Entre as divisões de estado e município existiram 2 modelos propostos pelo IBGE. O primeiro deles é de 1990 e agrupa os municípios em _microregiões_ e essas em _meso-regiões_, esse critério previa que os municípios com características sociais e econômicas semelhantes deveriam fazer parte de um mesmo grupo. Entretanto, esse conceito não se estabeleceu, uma vez que as próprias unidades administrativas se agruparam ao longo dos anos segundo os seus próprios critérios, assim em 2017 surge uma proposta que agrupa em regiões _imediatas_ e essas em regiões _intermediárias_ (com nomes muito próximos do que conhecemos popularmente). 

<br>

>Nota nº2: A segunda classificação de 2017 ainda está sendo implementada, por exemplo: na API não contém a opção de dividir o Brasil, as macroregiões ou os estados em regiões imediatas ou intermediárias, isso significa que na opção `getManyPolygons`, não é possível fazer a economia de requisões; Ou seja, para usar essa classificação terá que fazer um _loop_ com a função `getOnePolygon` (**cuidado com o limite da API**).

<br>


