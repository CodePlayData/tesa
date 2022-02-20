import { parse as parseCsv } from "https://deno.land/std@0.99.0/encoding/csv.ts";
import { tgz } from "https://deno.land/x/compress@v0.4.1/mod.ts";
import { readerFromStreamReader } from "https://deno.land/std/io/mod.ts";

export { parseCsv, tgz , readerFromStreamReader }