// filename: utils.ts
/**
 * Some functions to facilitate to get geolocation jobs.
 */
import { readerFromStreamReader, tgz } from "../deps.ts";
import { belongsTo, getOnePolygon } from "../mod.ts";

/**
 * A function to download anything and save in filesystem.
 * @param url the external url to download.
 * @param destfile the path for save file.
 */
export async function downloadFile(url: string, destfile: string) {
  const responseObject = await fetch(url);
  const ResponseReadableStream = responseObject.body?.getReader();

  if (ResponseReadableStream) {
    const readableStream = readerFromStreamReader(ResponseReadableStream);
    const file = await Deno.open(destfile, { create: true, write: true });
    await Deno.copy(readableStream, file);
    file.close();
  }
}

/**
 * A function to untar files.
 * @param path the file to be untar.
 * @param destfile the path where the content will be saved.
 */
export async function untarFile(path: string, destfile: string) {
  await tgz.uncompress(path, destfile);
}

/**
 * A function to run shell command in child process.
 * @param cmd a shell command string to run in a child process.
 * @param print bollen that defines if the result is to be printed in the stdout.
 */
export async function runCmd(cmd: string, print?: boolean) {
  const p = Deno.run({
    cmd: cmd.split(" "),
    stdout: "piped",
    stderr: "piped",
  });
  const { code } = await p.status();

  // Reading the outputs closes their pipes
  const rawOutput = await p.output();
  const rawError = await p.stderrOutput();

  if (code === 0 && print == true) {
    await Deno.stdout.write(rawOutput);
  } else {
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString);
  }

  Deno.exit(code);
}

/**
 * This function gets de osmextractool from github and untar in the filesystem. However, this repo has already the bin files for use in the respective folder.
 */
export async function getOsmExtractTools() {
  const urls = {
    extract_osm:
      "https://github.com/AndGem/osm_extract_polygon/releases/download/v.0.3.3/osm_extract_polygon-linux-amd64.tar.gz",
  } as { [key: string]: string };

  await downloadFile(
    urls.extract_osm,
    "./osm_extract.tar.gz",
  );

  await untarFile("./osm_extract.tar.gz", ".");
  console.log(
    'Now install osmium-tools with:\n "sudo apt install osmium-tool"',
  );
}

/**
 * A function that extracts the pbf from a specific city.
 * @param city a city to get the pbf file. Some cities need to be edited since there are double names.
 */
export async function getCityPbf(city: string) {
  try {
    const metadata: any = await belongsTo(city, "cities");
    const polygon: any = await getOnePolygon(city, "cities");
    const City: string = city.replace(/\s+/g, "").normalize("NFD").replace(
      /[\u0300-\u036f]/g,
      "",
    );

    const url = {
      Sul:
        "https://download.geofabrik.de/south-america/brazil/sul-latest.osm.pbf",
      Sudeste:
        "https://download.geofabrik.de/south-america/brazil/sudeste-latest.osm.pbf",
      Norte:
        "https://download.geofabrik.de/south-america/brazil/norte-latest.osm.pbf",
      Nordeste:
        "https://download.geofabrik.de/south-america/brazil/nordeste-latest.osm.pbf",
      "Centro-Oeste":
        "https://download.geofabrik.de/south-america/brazil/centro-oeste-latest.osm.pbf",
    } as { [key: string]: string };

    await Promise.all(
      [
        await Deno.writeTextFile(`${City}.geojson`, JSON.stringify(polygon)),
        await downloadFile(
          url[metadata.microrregiao.mesorregiao.UF.regiao.nome],
          `./${metadata.microrregiao.mesorregiao.UF.regiao.nome}-latest.osm.pbf`,
        ),
        await runCmd(
          `./src/bin/osmium extract --strategy smart -p ${City}.geojson ${metadata.microrregiao.mesorregiao.UF.regiao.nome}-latest.osm.pbf -o ${City}.pbf`,
        ),
      ],
    );
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * A function to get all neighboorhods from a file.
 * @param path the path of city pbf file.
 */
export async function extractNeighboorhodFromPbf(path: string) {
  await runCmd(
    `./src/bin/osm_extract_polygon -f ${path} --geojson -o --max 10 --min 10`,
    false,
  );
}

/**
 * A function to resume all neighborhood in one output, a geojson Feature Collection.
 * @param path from all files of neighborhoods.
 * @returns a geojson feature collection.
 */
export async function readNeighborhoodGeojsonFromDir(path: string) {
  let dir: string;
  let features: any[] = [];

  for await (const dirEntry of Deno.readDir(path)) {
    if (dirEntry.isFile && dirEntry.name.match(".geojson$")) {
      features.push(
        await JSON.parse(await Deno.readTextFile(`./${path}/${dirEntry.name}`)),
      );
    }
  }

  //ToDo: Check the polygons that will be included and excluded depend on the neighborhood_list and neighborhood_includes.
  const geojson = await JSON.stringify({ type: "FeatureCollection", features });
  return geojson;
}

//const bairros = await readNeighborhoodGeojsonFromDir('./riodejaneiro.pbf_polygons/')
