getwd()
setwd('./src/data')
getwd()
dir()

data <- read.csv2('cities_list.csv')

data$Link <-
print(paste0(
"https://servicodados.ibge.gov.br/api/v3/malhas/municipios/", data$Code, "?formato=application/vnd.geo+json&qualidade=maxima"))

write.csv2(data, 'cities_list.csv')
