console.log(await (await fetch ( `https://nominatim.openstreetmap.org/search?q="Avenida Professor Plínio Bastos, 640, Olaria, Rio de Janeiro"&format=geojson`)).text())