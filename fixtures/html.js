import {Path} from "runtime-compat/filesystem";
import html from "../src/html.js";

const path = new Path(import.meta.url).directory.join("components");
const conf = {paths: {components: path}, index: "<body>"};
export default () => (strings, ...keys) => html(strings, ...keys)(conf);
