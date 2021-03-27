FROM hayd/alpine-deno as base
HEALTHCHECK --interval=30s --timeout=3000s --start-period=5s --retries=3 CMD [ "deno", "test", "--allow-net", "mod.test.js" ]