import { parse } from "https://deno.land/std/flags/mod.ts";
import { createHash } from "https://deno.land/std@0.92.0/hash/mod.ts";

import {
  belongsTo,
  belongsToMany,
  forwardGeocoding,
  getManyPolygons,
  getOnePolygon,
  reverseGeocoding,
} from "./mod.js";

async function tesa(args) {
  let params = parse(args);
  let call = params._[0];
  let { output } = params;
  let cached = false;
  let cachedFiles = [];
  let hash = createHash("md5");

  for await (let dirEntry of Deno.readDir(".")) {
    if (dirEntry.isDirectory && dirEntry.name === ".cache") {
      cached = true;
    }
  }

  if (cached) {
    for await (let dirEntry of Deno.readDir("./.cache")) {
      if (dirEntry.isFile) {
        cachedFiles.push(dirEntry.name);
      }
    }
  }

  switch (call) {
    case "getOnePolygon":
      {
        if (
          !params.alias | !params.type
        ) {
          throw "some parameter was not fulfilled";
        }
        if (
          output !== "console" && output !== "file"
        ) {
          throw "You must choose some type of output (options: console or file)";
        }

        hash.update(`polygon${params.type}${params.alias}`);
        let hashInHex = hash.toString();

        switch (output) {
          case "file":
            {
              if (!cached) {
                Deno.chdir(Deno.cwd());
                Deno.mkdir("./.cache");
                Deno.writeTextFile(
                  `./.cache/${hashInHex}.json`,
                  JSON.stringify(
                    await getOnePolygon(params.alias, params.type),
                  ),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(
                    `\nYour file already exists in: ./.cache/${result}`,
                  );
                } else {
                  Deno.chdir(Deno.cwd());
                  Deno.writeTextFile(
                    `./.cache/${hashInHex}.json`,
                    JSON.stringify(
                      await getOnePolygon(params.alias, params.type),
                    ),
                  );
                }
              }
            }
            break;
          case "console":
            {
              if (!cached) {
                console.log(
                  JSON.stringify(
                    await getOnePolygon(params.alias, params.type),
                  ),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(await Deno.readTextFile(`./.cache/${result}`));
                } else {
                  console.log(
                    JSON.stringify(
                      await getOnePolygon(params.alias, params.type),
                    ),
                  );
                }
              }
            }
            break;
        }
      }
      break;
    case "getManyPolygons":
      {
        let { request } = params;

        if (!request) throw "some parameter was not fulfilled";
        if (
          output !== "console" && output !== "file"
        ) {
          throw "You must choose some type of output (options: console or file)";
        }

        hash.update(`polygons${request}`);
        let hashInHex = hash.toString();

        switch (output) {
          case "file":
            {
              if (!cached) {
                Deno.chdir(Deno.cwd());
                Deno.mkdir("./.cache");
                Deno.writeTextFile(
                  `./.cache/${hashInHex}.json`,
                  JSON.stringify(await getManyPolygons(request)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(
                    `\nYour file already exists in: ./.cache/${result}`,
                  );
                } else {
                  Deno.chdir(Deno.cwd());
                  Deno.writeTextFile(
                    `./.cache/${hashInHex}.json`,
                    JSON.stringify(await getManyPolygons(request)),
                  );
                }
              }
            }
            break;
          case "console":
            {
              if (!cached) {
                console.log(
                  JSON.stringify(await getManyPolygons(params.request)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(await Deno.readTextFile(`./.cache/${result}`));
                } else {
                  console.log(
                    JSON.stringify(await getManyPolygons(params.request)),
                  );
                }
              }
            }
            break;
        }
      }
      break;
    case "belongsTo":
      {
        if (
          !params.alias | !params.type
        ) {
          throw "some parameter was not fulfilled";
        }
        if (
          output !== "console" && output !== "file"
        ) {
          throw "You must choose some type of output (options: console or file)";
        }

        hash.update(`belongTo${params.type}${params.alias}`);
        let hashInHex = hash.toString();

        switch (output) {
          case "file":
            {
              if (!cached) {
                Deno.chdir(Deno.cwd());
                Deno.mkdir("./.cache");
                Deno.writeTextFile(
                  `./.cache/${hashInHex}.json`,
                  JSON.stringify(await belongsTo(params.alias, params.type)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(
                    `\nYour file already exists in: ./.cache/${result}`,
                  );
                } else {
                  Deno.chdir(Deno.cwd());
                  Deno.writeTextFile(
                    `./.cache/${hashInHex}.json`,
                    JSON.stringify(await belongsTo(params.alias, params.type)),
                  );
                }
              }
            }
            break;
          case "console":
            {
              if (!cached) {
                console.log(
                  JSON.stringify(await belongsTo(params.alias, params.type)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(await Deno.readTextFile(`./.cache/${result}`));
                } else {
                  console.log(
                    JSON.stringify(await belongsTo(params.alias, params.type)),
                  );
                }
              }
            }
            break;
        }
      }
      break;
    case "belongsToMany":
      {
        let { request } = params;

        if (!request) throw "some parameter was not fulfilled";
        if (
          output !== "console" && output !== "file"
        ) {
          throw "You must choose some type of output (options: console or file)";
        }

        hash.update(`belongsMany${request}`);
        let hashInHex = hash.toString();

        switch (output) {
          case "file":
            {
              if (!cached) {
                Deno.chdir(Deno.cwd());
                Deno.mkdir("./.cache");
                Deno.writeTextFile(
                  `./.cache/${hashInHex}.json`,
                  JSON.stringify(await belongsToMany(request)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(
                    `\nYour file already exists in: ./.cache/${result}`,
                  );
                } else {
                  Deno.chdir(Deno.cwd());
                  Deno.writeTextFile(
                    `./.cache/${hashInHex}.json`,
                    JSON.stringify(await belongsToMany(request)),
                  );
                }
              }
            }
            break;
          case "console":
            {
              if (!cached) {
                console.log(
                  JSON.stringify(await belongsToMany(params.request)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(await Deno.readTextFile(`./.cache/${result}`));
                } else {
                  console.log(
                    JSON.stringify(await belongsToMany(params.request)),
                  );
                }
              }
            }
            break;
        }
      }
      break;
    case "forwardGeocoding":
      {
        let { layout, location } = params;

        if (!layout | !location) throw "some parameter was not fulfilled";
        if (
          output !== "console" && output !== "file"
        ) {
          throw "You must choose some type of output (options: console or file)";
        }

        hash.update(`forward${location}`);
        let hashInHex = hash.toString();

        switch (output) {
          case "file":
            {
              if (!cached) {
                Deno.chdir(Deno.cwd());
                Deno.mkdir("./.cache");
                Deno.writeTextFile(
                  `./.cache/${hashInHex}.json`,
                  JSON.stringify(await forwardGeocoding(layout, location)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(
                    `\nYour file already exists in: ./.cache/${result}`,
                  );
                } else {
                  Deno.chdir(Deno.cwd());
                  Deno.writeTextFile(
                    `./.cache/${hashInHex}.json`,
                    JSON.stringify(await forwardGeocoding(layout, location)),
                  );
                }
              }
            }
            break;
          case "console":
            {
              if (!cached) {
                console.log(
                  JSON.stringify(await forwardGeocoding(layout, location)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(await Deno.readTextFile(`./.cache/${result}`));
                } else {
                  console.log(
                    JSON.stringify(await forwardGeocoding(layout, location)),
                  );
                }
              }
            }
            break;
        }
      }
      break;
    case "reverseGeocoding":
      {
        let { layout, location } = params;

        if (!layout | !location) throw "some parameter was not fulfilled";
        if (
          output !== "console" && output !== "file"
        ) {
          throw "You must choose some type of output (options: console or file)";
        }

        hash.update(`forward${location}`);
        let hashInHex = hash.toString();

        switch (output) {
          case "file":
            {
              if (!cached) {
                Deno.chdir(Deno.cwd());
                Deno.mkdir("./.cache");
                Deno.writeTextFile(
                  `./.cache/${hashInHex}.json`,
                  JSON.stringify(await reverseGeocoding(layout, location)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(
                    `\nYour file already exists in: ./.cache/${result}`,
                  );
                } else {
                  Deno.chdir(Deno.cwd());
                  Deno.writeTextFile(
                    `./.cache/${hashInHex}.json`,
                    JSON.stringify(await reverseGeocoding(layout, location)),
                  );
                }
              }
            }
            break;
          case "console":
            {
              if (!cached) {
                console.log(
                  JSON.stringify(await reverseGeocoding(layout, location)),
                );
              } else {
                let result = cachedFiles.filter((file) =>
                  file === `${hashInHex}.json`
                );
                if (result.length > 0) {
                  console.log(await Deno.readTextFile(`./.cache/${result}`));
                } else {
                  console.log(
                    JSON.stringify(await reverseGeocoding(layout, location)),
                  );
                }
              }
            }
            break;
        }
      }
      break;
    default:
      throw "The Call is required as first parameter.";
  }
}

tesa(Deno.args);

/*
tesa getOnePolygon --type 'cities' --alias 'amparo(pb)' --output console
./dist/tesa getManyPolygons --request "{\"type\": \"macroregion\", \"aliases\": [\"NORTE\", \"SUL\"]}" --output console
./dist/tesa belongsTo --type 'cities' --alias 'amparo(pb)' --output console
./dist/tesa belongsToMany --request "{\"type\": \"macroregion\", \"aliases\": [\"NORTE\", \"SUL\"]}" --output console
./dist/tesa forwardGeocoding --layout "{\"request\": \"unstructured\", \"map_tiles\": { \"name\": \"Nominatim/OpenStreetMap\"}}" --location '"Avenida Professor Plínio Bastos, 640, Olaria, Rio de Janeiro"' --output console
./dist/tesa reverseGeocoding --layout "{\"map_tiles\": { \"name\": \"Nominatim/OpenStreetMap\"}}" --location "{ \"lon\": -43.2643487, \"lat\": -22.8374775 }" --output console

*/
