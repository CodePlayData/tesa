// @filename: polygons.ts
/**
 *  These functions are made for Geolocation. 
 * It's most atomics possible and can be used in High Order Functions, for example: if some one wants to perform a hierarchical geolocation, witch means, to get all polygons that determined point belongs, they can parse the address in country (if necessary), macroregion, states, middleware and microregions and city, to perform a download of all these polygons, put them in order and then insert the location of point as the lowest level. Of course to do that you have to known beforehand these locations, that's why the belongTo function exists.
 */

 import { parseCsv } from "../deps.ts";
 import type { GeoJsonObject, Config, DoubledItem, ListItems, LocationInfo, MetaInfoRequest } from "../types.d.ts"
 import { getCityPbf, extractNeighboorhodFromPbf, readNeighborhoodGeojsonFromDir } from "../mod.ts";
 
 /**
  * A function to call a IBGE API service to get where the place belongs, similar to pelias/whosonfirst (https://github.com/pelias/whosonfirst). Does not work for neighborhoods.
  * @param alias location name or as is called
  * @param type geographic classification of the Brazilian IBGE.
  * @param config the object that contain info about all lists thar are needed to convert a name in a valid index.
  * @returns all geographic division which the place belongs.
  */
 async function belongsTo(alias:string, type:string, config?:Config): Promise<undefined | LocationInfo> {
   
   const url = {
     country: config?.lists?.main?.country ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv",
     macroregion: config?.lists?.main?.macroregion ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv",
     states: config?.lists?.main?.states ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv",
     middleregions: config?.lists?.main?.middleregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv",
     immediate: config?.lists?.main?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_list.csv",
     microregions: config?.lists?.main?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv",
     intermediary: config?.lists?.main?.intermediary ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/intermediary_list.csv",
     cities: config?.lists?.main?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv"
     } as { [key: string]: string};
   
   const doublesUrl = {
     microregions: config?.lists?.doubles?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv",
     immediate: config?.lists?.doubles?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_doubles.csv",
     cities: config?.lists?.doubles?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
   } as { [key: string]: string};
 
     try {
     if (type === "microregions" || type === "cities" || type === "immediate") {
             const doublesList = await parseCsv(
               await (
                 await fetch(doublesUrl[type])
               ).text(),
               { skipFirstRow: true, separator: ";" },
             ) as DoubledItem[]
 
             const doubles = doublesList.filter((place) =>
               place.Alias === alias
                 .toUpperCase()
                 .normalize("NFD")
                 .replace(/[\u0300-\u036f]/g, "")
               ).map(
                   (place) => [place.Opt1, place.Opt2, place.Opt3, place.Opt4, place.Opt5]
                 )
 
             if (doubles.length > 0) {
               console.log(
                 "There are repeated names in this geographic category:\n",
               );
               doubles.flat().map((i) => console.log(String(i)));
               return;
           }
       }
 
     const list = await parseCsv(
       await (
         await fetch(url[type])
       ).text(),
         { skipFirstRow: true, separator: ";" },
       ) as ListItems[]
 
     const place = list.filter((place) => place.Alias === alias.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))[0]
     let location: {[key:string]:string};
 
     if(config){
       location = {
         cities: `${config?.api?.localidades?.cities}${place?.Code}`,
         microregions: `${config?.api?.localidades?.microregions}${place?.Code}`,
         intermediary: `${config?.api?.localidades?.intermediary}${place?.Code}`,
         middleregions: `${config?.api?.localidades?.middleregions}${place?.Code}`,
         states: `${config?.api?.localidades?.states}${place?.Code}`,
         immediate: `${config?.api?.localidades?.immediate}${place?.Code}`
       };
     } else {
       location = {
         cities: `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${place.Code}`,
         microregions: `https://servicodados.ibge.gov.br/api/v1/localidades/microrregioes/${place.Code}`,
         intermediary: `https://servicodados.ibge.gov.br/api/v1/localidades/regioes-intermediarias/${place.Code}`,
         middleregions: `https://servicodados.ibge.gov.br/api/v1/localidades/mesorregioes/${place.Code}`,
         states: `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${place.Code}`,
         immediate: `https://servicodados.ibge.gov.br/api/v1/localidades/regioes${place.Code}`
       };
     }
 
     const result = await fetch(location[type]);
     return (await JSON.parse(await result.text()));
 
   } catch (error) {
     console.log(error.message)
   }
 };
 
 /**
  * A function to call a IBGE APi service to get where many places belongs. Does not work for neighborhoods.
  * @param request an object with the type of geojson division and the names of divisions wanted;
  * @param config a object with the urls that the function must seek to get the polygons metadata;
  * @returns a array of objects that relates all divisions that the polygons belongs;
  */
 async function belongsToMany(request:MetaInfoRequest, config?:Config): Promise<undefined | LocationInfo[]> {
   
   const type:string = request.type
   const aliases:string[] = request.aliases
   const doublesResult:string[] = []
   
   let code;
   let place_codes: string[] = [];
   let unique_codes = [];
   let metaInfos: LocationInfo[] = [];
   let doublesUrl: {[key: string]: string};
   let url: {[key: string]: string};
   let baseUrl: {[key: string]: string | undefined} | string;
 
   doublesUrl = {
     microregions: config?.lists?.doubles?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv",
     immediate: config?.lists?.doubles?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_doubles.csv",
     cities: config?.lists?.doubles?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
     };
 
   url = {
     country: config?.lists?.main?.country ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv",
     macroregion: config?.lists?.main?.macroregion ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv",
     states: config?.lists?.main?.states ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv",
     middleregions: config?.lists?.main?.middleregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv",
     immediate: config?.lists?.main?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_list.csv",
     microregions: config?.lists?.main?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv",
     intermediary: config?.lists?.main?.intermediary ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/intermediary_list.csv",
     cities: config?.lists?.main?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv"
     };
 
   if(config) {
     baseUrl = {
       macroregion: config?.api?.localidades?.macroregion,
       states: config?.api?.localidades?.states,
       middleregions: `${config?.api?.localidades?.states}${code}/mesorregioes`,
       intermediary: `${config?.api?.localidades?.states}${code}/regioes-intermediarias`,
       immediate: `${config?.api?.localidades?.states}${code}/regioes-imediatas`,
       microregions: `${config?.api?.localidades?.states}${code}/microrregioes`,
       cities: `${config?.api?.localidades?.states}${code}/municipios`
     };
   } else {
     baseUrl = {
       macroregion: 'https://servicodados.ibge.gov.br/api/v1/localidades/regioes',
       states: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/',
       middleregions: 'https://servicodados.ibge.gov.br/api/v1/localidades/mesorregioes/',
       intermediary: 'https://servicodados.ibge.gov.br/api/v1/localidades/regioes-intermediarias/',
       immediate: 'https://servicodados.ibge.gov.br/api/v1/localidades/regioes-imediatas/',
       microregions: 'https://servicodados.ibge.gov.br/api/v1/localidades/microrregioes/',
       cities: 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios/'
     };
   }
 
   if (type === "microregions" || type === "cities" || type === "immediate") {
     try {
       const doublesList = await parseCsv(
         await (
           await fetch(doublesUrl[type])
          ).text(),
         { skipFirstRow: true, separator: ";" },
       ) as DoubledItem[]
 
       const doubles = aliases.map((i) => //tem que ver se esse i é reconhecido como string, se sim typagem ok té aqui
         doublesList.filter((place) =>
           place.Alias === i
             .toUpperCase()
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, "")
         ).map(
           (place) => [
             place.Opt1,
             place.Opt2,
             place.Opt3,
             place.Opt4,
             place.Opt5,
           ]
         )
       );
 
     doubles.map((i) => i.map((o) => doublesResult.push(...o)));
 
     if (doublesResult.length > 0) {
       console.log(
         "There are repeated names in this geographic category:\n",
       );
       doublesResult.flat().map((i) => console.log(String(i)));
       return;
       }
     } catch (error) {
       console.log(error.message)
     }
   }
   
   if (type === "macroregion" || type === "states") { 
     try {
         const statesJson: LocationInfo[] = JSON.parse(await(await fetch(baseUrl[type] as unknown as Request)).text());    
         const list = await parseCsv(await (await fetch(url[type])).text(), { skipFirstRow: true, separator: ";" }) as ListItems[];
         const result = aliases.map((i) => list.filter((place) => place.Alias === i.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")).map((place) => place.Code)).flat() as string[];
         result.map((i) => place_codes?.push(i?.toString().substring(0, 2)));
         unique_codes = [...new Set(place_codes)] as string[];
         metaInfos = [...result.map((i) => statesJson.filter((o) => o.id === eval(i))).flat()];
         return (metaInfos);
       } catch (error) {
         console.log(error.message)
     }
   } else {
       try {
         const list = await parseCsv(await (await fetch(url[type])).text(), { skipFirstRow: true, separator: ";" }) as ListItems[];
         // filter the alias list to the items in aliases array of the request and getting the code to insert in the urls in case not macroregion and states
         const result = aliases.map((i) => list.filter((place) => place.Alias === i.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")).map((place) => place.Code)).flat() as string[];
         result.map((i) => place_codes.push(i.toString().substring(0, 2)));
         unique_codes = [...new Set(place_codes)] as string[];
         const major_polygons: LocationInfo[] = await Promise.all(unique_codes.map(async (i) => {
           code = eval(i);
           if(config) {
             switch (type) {
               case "middleregions":
                 baseUrl = `${config?.api?.localidades?.states}${code}/mesorregioes`;
                 break;
               case "intermediary":
                 baseUrl =
                   `${config?.api?.localidades?.states}${code}/regioes-intermediarias`;
                 break;
               case "immediate":
                 baseUrl =
                   `${config?.api?.localidades?.states}${code}/regioes-imediatas`;
                 break;
               case "microregions":
                 baseUrl = `${config?.api?.localidades?.states}${code}/microrregioes`;
                 break;
               case "cities":
                 baseUrl = `${config?.api?.localidades?.states}${code}/municipios`;
                 break;
             }
           } else {
             switch (type) {
               case "middleregions":
                 baseUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${code}/mesorregioes`;
                 break;
               case "intermediary":
                 baseUrl =
                   `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${code}/regioes-intermediarias`;
                 break;
               case "immediate":
                 baseUrl =
                   `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${code}/regioes-imediatas`;
                 break;
               case "microregions":
                 baseUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${code}/microrregioes`;
                 break;
               case "cities":
                 baseUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${code}/municipios`;
                 break;
             }
           }
             return JSON.parse(await (await fetch(baseUrl as unknown as Request)).text());
           }));
         
         result.map(
           (i)=> major_polygons
             .flat()
             .map(
               (o)=> {
                 if(o.id == eval(i)) {
                   metaInfos.push(o)
                 }
               }
             )
           );
         return (metaInfos);
     } catch (error) {
         console.log(error.message)
     }
   }
 };
 
 /**
  * A function to get a polygon of one region depending on the type. Does not work for neighborhoods.
  * @param alias a name of the division wanted.
  * @param type the type of division.
  * @returns a geojson polygon.
  */
 async function getOnePolygon(alias:string, type:string, config?: Config): Promise<undefined | GeoJsonObject> {
   if (!alias || !type) throw "some parameters was not fulfilled";
   if (
     typeof (alias) !== "string" || typeof (type) !== "string"
   ) {
     throw "the parameters must be string";
   }
 
   const url = {
     country: config?.lists?.main?.country ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv",
     macroregion: config?.lists?.main?.macroregion ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv",
     states: config?.lists?.main?.states ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv",
     middleregions: config?.lists?.main?.middleregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv",
     immediate: config?.lists?.main?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_list.csv",
     microregions: config?.lists?.main?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv",
     intermediary: config?.lists?.main?.intermediary ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/intermediary_list.csv",
     cities: config?.lists?.main?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv"
     } as { [key: string]: string}
   
   const doublesUrl = {
     microregions: config?.lists?.doubles?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv",
     immediate: config?.lists?.doubles?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_doubles.csv",
     cities: config?.lists?.doubles?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
   } as { [key: string]: string}
 
   let polygon:GeoJsonObject;
 
 
   try {
     // check if there is any doubled names in microregions or cities
     if (type === "microregions" || type === "cities" || type === "immediate") {
       const doublesList = await parseCsv(
         await (
           await fetch(doublesUrl[type])
         ).text(),
         { skipFirstRow: true, separator: ";" },
       ) as DoubledItem[]
 
       const doubles = doublesList.filter((place) =>
         place.Alias === alias
           .toUpperCase()
           .normalize("NFD")
           .replace(/[\u0300-\u036f]/g, "")
         ).map(
             (place) => [place.Opt1, place.Opt2, place.Opt3, place.Opt4, place.Opt5]
           )
 
       if (doubles.length > 0) {
         console.log(
           "There are repeated names in this geographic category:\n",
         );
         doubles.flat().map((i) => console.log(String(i)));
         return;
     }
 }
 
   const list = await parseCsv(
     await (
       await fetch(url[type])
     ).text(),
       { skipFirstRow: true, separator: ";" },
     ) as ListItems[]
     
     const RequestUrl = list.filter((place) => place.Alias  === alias
           .toUpperCase()
           .normalize("NFD")
           .replace(/[\u0300-\u036f]/g, "")
       )
         .map((place) => place.Link)[0]
     
     const result = fetch(RequestUrl);
     polygon = await(await result).json();
 
     return (polygon);
   }
   catch (error) {
     console.log(error.message);
     return;
   }
 };
 
 /**
  * A function to get many Geojson Polygons at once. Does not work for neighborhoods.
  * @param request an object with the type of geojson division and the names of divisions wanted;
  * @param config a object with the urls that the function must seek to get the polygons;
  * @returns a array of polygons, GeojsonPolygons;
  */
 async function getManyPolygons(request: MetaInfoRequest, config?:Config): Promise<undefined | LocationInfo[]> {
   if (!request) throw "the request was not fulfilled";
 
   let type: string;
   let aliases: string[] = [];
 
   if (typeof request !== "object") {
     let partial = JSON.parse(request);
     type = partial.type;
     aliases = partial.aliases;
   } else {
     type = request.type;
     aliases = request.aliases;
   }
 
   let code;
   let baseUrl: {[key: string]: string | undefined} | string;
   let doublesResult:string[] = [];
   let place_codes: string[] = [];
   let unique_codes: string[] = [];
   let polygons: LocationInfo[];
   let doublesUrl: {[key: string]: string};
   let url: {[key: string]: string};
 
   doublesUrl = {
     microregions: config?.lists?.doubles?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv",
     immediate: config?.lists?.doubles?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_doubles.csv",
     cities: config?.lists?.doubles?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
     };
 
   url = {
     country: config?.lists?.main?.country ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv",
     macroregion: config?.lists?.main?.macroregion ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv",
     states: config?.lists?.main?.states ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv",
     middleregions: config?.lists?.main?.middleregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv",
     immediate: config?.lists?.main?.immediate ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/immediate_list.csv",
     microregions: config?.lists?.main?.microregions ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv",
     intermediary: config?.lists?.main?.intermediary ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/intermediary_list.csv",
     cities: config?.lists?.main?.cities ?? "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv"
     };
     
   try {
     if (type === "microregions" || type === "cities" || type === "immediate") {
       try {
         const doublesList = await parseCsv(
           await (
             await fetch(doublesUrl[type])
            ).text(),
           { skipFirstRow: true, separator: ";" },
         ) as DoubledItem[]
         
         const doubles: string[][][] = aliases.map((i) => //tem que ver se esse i é reconhecido como string, se sim typagem ok té aqui
           doublesList.filter((place) =>
             place.Alias === i
               .toUpperCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "")
           ).map(
             (place) => [
               place.Opt1,
               place.Opt2,
               place.Opt3,
               place.Opt4,
               place.Opt5,
             ]
           )
         );
       
       doubles.map((i) => i.map((o) => doublesResult.push(...o)));
       doublesResult = doublesResult.filter((i)=> i !== "");
       if (doublesResult.length > 0) {
         console.log('There are repeated names in this geographic category, try to replace for:\n')
         doublesResult.flat().map((i) => console.log(`${String(i)}`));
         return;
         }
       } catch (error) {
         console.log(error.message);
       }
     }
     // in case of macroregion or states the method GET will be called once. For all others the call could vary from 1 to 27.
     if (type === "macroregion" || type === "states") {
       if(config) {
         baseUrl = {
           macroregion: `${config?.api?.malhas?.country}&intrarregiao=regiao`,
           states: `${config?.api?.malhas?.country}&intrarregiao=UF`
         }
       } else {
         baseUrl = {
           macroregion: "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=regiao",
           states: "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=UF"
         }
       }
       
       const statesJson: GeoJsonObject = JSON.parse(await (await fetch(baseUrl[type] as unknown as Request)).text());
       
       const list = await parseCsv(
         await (
           await fetch(url[type])
         )
           .text(),
         { skipFirstRow: true, separator: ";" },
       ) as ListItems[];
       
       const result = aliases.map((i) =>
         list.filter((place) =>
           place.Alias === i
             .toUpperCase()
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, "")
         )
           .map((place) => place.Code)
       ).flat() as string[];
       
       result.map((i) => place_codes.push(i.toString().substring(0, 2)));
       console.log(place_codes)
       
       unique_codes = [...new Set(place_codes)];
       
       
       polygons = [
         ...result.map((i) =>
           statesJson.features.filter((o:any) => o.properties.codarea === i)
         ).flat(),
       ];
       
       return (polygons);
     } 
     else {
       // get the alias list
       const list = await parseCsv(
         await (
           await fetch(url[type])
         )
           .text(),
         { skipFirstRow: true, separator: ";" },
       ) as ListItems[];
 
       // filter the alias list to the items in aliases array of the request and getting the code to insert in the urls in case not macroregion and states
       const result = aliases.map((i) =>
         list.filter((place) =>
           place.Alias === i
             .toUpperCase()
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, "")
         )
           .map((place) => place.Code)
       ).flat() as string[];
   
       //ajeitei o flat no result pode quebrar aqui
       result.map((i) => place_codes.push(i.toString().substring(0, 2)));
       
       unique_codes = [...new Set(place_codes)];
       
       const major_polygons = await Promise.all(unique_codes.map(async (i) => {
         code = eval(i);
 
         if(config) {
           baseUrl = {
             middleregions: `${config?.api?.malhas?.states}${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=mesorregiao`,
             microregions: `${config?.api?.malhas?.states}${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=microrregiao`,
             cities: `${config?.api?.malhas?.states}${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=municipio`
           }
         } else {
           baseUrl = {
             middleregions: `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=mesorregiao`,
             microregions: `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=microrregiao`,
             cities: `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=municipio`
           }
         }
         
         return JSON.parse(await (await fetch(baseUrl[type] as unknown as Request)).text());
       }));
       
       polygons = [
         ...result.map((i) =>
           major_polygons.map((o) =>
             o.features.filter((u:any) => u.properties.codarea === i)
           )
         ).flat().flat(),
       ];
  
       return (polygons);
 
     }
   } catch (error) {
     console.log(error.message);
     return;
   }
 };
 
 
 async function getNeighborhoodsFromCity(city: string) {
   const normalizedCity = city.replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
   await getCityPbf(city)
 
   try {
       const bairros = await Promise.all([
         await extractNeighboorhodFromPbf(`${normalizedCity}.pbf`),
         await readNeighborhoodGeojsonFromDir(`./${normalizedCity}.pbf_polygons/`)
       ])
       console.log(bairros)
   } catch (error) {
     console.log(error.message)
   }
 
 }
 
  //await getNeighborhoodsFromCity('rio de janeiro')
 //await extractNeighboorhodFromPbf(`riodejaneiro.pbf`)
 
 export { belongsTo, belongsToMany, getOnePolygon, getManyPolygons }
 