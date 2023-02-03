import {Path} from "runtime-compat/filesystem";
import html from "../src/html.js";

const path = new Path(import.meta.url).directory;
const conf = {
  paths: {
    components: path.join("components"),
    static: path.join("static"),
  },
};
export default () => (strings, ...keys) => html(strings, ...keys)(conf);
