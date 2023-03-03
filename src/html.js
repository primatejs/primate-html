import {Path, File} from "runtime-compat/filesystem";
import {fulfill, flatten} from "htmt";

const last = -1;
const response = {
  status: 200,
  headers: {"Content-Type": "text/html"},
};

const index_html = "index.html";
const preset = await new Path(import.meta.url).directory.join(index_html).file
  .read();

const getIndex = async env => {
  try {
    return await File.read(`${env.paths.static.join(index_html)}`);
  } catch (error) {
    return preset;
  }
};

export default (strings, ...keys) => async env => {
  const index = await getIndex(env);
  const {paths: {components: path}} = env;
  const loadFile = async file => [file.base, (await file.read())
    .replaceAll("\n", "")];
  const components = await path.exists
    ? Object.fromEntries(await Promise.all((
      await File.collect(`${path}`, ".html")).map(loadFile)))
    : {};
  const re = strings
    .slice(0, last)
    .map((string, i) => `${string}\${${i}}`)
    .join("") + strings[strings.length + last];
  const html = flatten(await fulfill(re, components, await Promise.all(keys)));
  const body = index.replace("<body>", () => `<body>${html}`);
  return {...response, body};
};
