# Contribuindo

A seguir estão as regras para sua colaboração ser considerada nesse repositório.

### Regras gerais

- Para contribuir com esse repositório será necessário estar inserido no grupo
  `CodePlayData` ou pelo menos no subgrupo `CodePlayData/api`.
- Inicie criando uma _Issue_ e relate tudo o que deseja alterar.
- Atribua uma label a _Issue_.
- Atribua um tempo de trabalho estimado.
- Formate o conteúdo da _Issue_ de acordo com o template pré-definido.
- A partir de sua _Issue_ crie um Merge Request, mas **não altere o nome
  pré-definido**.
- Antes de solicitar o Merge Request marque um dos integrantes do grupo como
  revisor.

Repare que toda _Issue_ desse repo possui 5 labels disponíveis de serem alocadas
que são: CI/CD, Test, Refact, Route e Doc. Baseado nas labels cada _Issue_ tem
um _template_ pré-definido que será descrito a seguir.

Para ser considerada como válida e se manter aberta uma _Issue_ deve ter um
tempo estimado de trabalho. **Não insira data limite**. Para definir esse tempo,
a seguir tem uma tabela que deve orientar a escolha baseada no tipo da _label_ e
do grau de dificuldade. **É função da pessoa que estiver criando a Issue
verificar e escolher o tempo estimado**. Para atribuir um tempo a _Issue_ basta
colocar /estimate <tempo> no corpo do texto da _Issue_.

Os tempos disponíveis para serem usados são:

| Área                                                                                                                                 | Dificuldade | Tempo  |
| :----------------------------------------------------------------------------------------------------------------------------------- | :---------- | :----- |
| CI/CD                                                                                                                                | *           | 1h 30m |
| CI/CD                                                                                                                                | **          | 5h     |
| CI/CD                                                                                                                                | ***         | 8h¹    |
| CI/CD                                                                                                                                | ****        | 16h²   |
| CI/CD                                                                                                                                | *****       | 32h³   |
| Refact                                                                                                                               | *           | 3h     |
| Refact                                                                                                                               | **          | 5h     |
| Refact                                                                                                                               | ***         | 8h     |
| Refact                                                                                                                               | ****        | 16h    |
| Refact                                                                                                                               | *****       | 32h    |
| Test                                                                                                                                 | *           | 30m    |
| Test                                                                                                                                 | **          | 1h     |
| Test                                                                                                                                 | ***         | 2h 30m |
| Test                                                                                                                                 | ****        | 5h     |
| Test                                                                                                                                 | *****       | 8h     |
| Doc                                                                                                                                  | *           | 10m    |
| Doc                                                                                                                                  | **          | 25m    |
| Doc                                                                                                                                  | ***         | 45m    |
| Doc                                                                                                                                  | ****        | 1h     |
| Doc                                                                                                                                  | *****       | 3h     |
| Route                                                                                                                                | *           | 30m    |
| Route                                                                                                                                | **          | 50m    |
| Route                                                                                                                                | ***         | 1h 30m |
| Route                                                                                                                                | ****        | 2h     |
| Route                                                                                                                                | *****       | 3h     |
| ¹É equivalente a um dia de trabalho. ²Dois dias de trabalhos. ³Essa opção deve ser considerada como uma semana completa de trabalho. |             |        |

<br>

### Template Issues

1. Doc

A _Issue_ de alteração de Doc é simples de ser formatada, pois contém apenas
dois tópicos obrigatórios: Ajustes e Inserções. O ajuste é um tópico que
necessita de citação do local de ajuste entre aspas. A inserção é um tópico
livre.

<br>

2. Test

Primeiramente, as _Issues_ de testes devem identificar quais são as
**Dependências** de código anteriores a implementação daquele teste a ser
sugerido. Isso se deve ao fato de a maioria dos testes estarem intimamente
ligados a refatorações.

Em seguinda os **Pré-requisitos** devem ser especificados. Considerando que cada
tipo de teste possui uma lib, um framework ou um modo ideal de fazer, essas
demandas devem ser listadas nesse tópico.

Na seção de **Implementações**, liste todos as demandas de teste em si.

Por fim no tópico **Uso** escreva como rodar esses testes. Isso se deve ao fato
de múltiplos frameworks estarem implementados.

**O fluxo de testagem é responsabilidade do CI/CD**

<br>

3. CI/CD

**Todo o fluxo de CI/CD deve estar na pasta .k8s**, pois o grupo `CodePlayData`
terá um _cluster_ implementado.

Caso necessário, inicie um tópico de **Imagens**, que deve especificar quais
novas imagens serão criadas no arquivo **Dockerfile** e sua função.

No tópico **Objetos** especifique que objetos serão criados e para quê.

No tópico **Estágios** mencione os estágios implementados no fluxo de CI/CD.

Não esqueça que:

- As novas imagens precisam ser criadas dentro do arquivo Dockerfile, que está
  em _multistage_
- No arquivo é necessário `REFERENCE.md` especificar o objeto ou grupo de
  objetos criado(s) e suas funções.
- É necessário explicar em comentários o novo `stage` no fluxo de CI/CD no
  arquivo `.gitlab-ci.yml`.

<br>

4. Refact

A _Issue_ de Refact precisa deixar claro o estado em que a aplicação está
(quando possível implementando diagramas), para qual estado irá e qual a
intenção desse ajuste. Pode estar separada em tópicos como
[nesse exemplo](https://gitlab.com/codeplaydata/ui/linktree/-/issues/5) ou
apenas referido no corpo do texto.

**É necessário estar claro no título a que se refere o ajuste da _Issue_!!**

Se necessário utilize a PWA do [Excalidraw](https://excalidraw.com/) para os
diagramas, toda a app funciona localmente, offline e exporta o conteúdo para
usando a LocalStorage API.
<br>

5. Route Mudanças de roteamento devem ser sugeridas em três tópicos: remoções,
   alterações e adições.

Apresente sempre de forma tabular e especifique os motivos!.
