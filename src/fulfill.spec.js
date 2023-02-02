import fulfill from "./fulfill.js";
import flatten from "./flatten.js";

const customs = {
  "c-attribute": "${foo}",
  "c-object-attribute": "<p id=\"${foo.bar}\"></p>",
  "c-for-object": "<fwo for=\"${foo}\"><span value=\"${bar}\"></span></fwo>",
};

const comps = {
  "s-index": "<s-layout user=\"${data.user}\">${data.site.name}</s-layout>",
  "s-layout": "<p><slot /></p>",
};

export default test => {
  test.reassert(assert => async ({html, components = {}, data}, expected) => {
    assert(flatten(await fulfill(html, components, data))).equals(expected);
  });

  test.case("text", async assert => {
    await assert({html: "${foo}", data: {foo: "bar"}}, "bar");
  });

  test.case("attribute", async assert => {
    await assert({html: "<p id=\"${foo}\" />", data: {foo: "bar"}},
      "<p id=\"bar\"></p>");
  });

  test.case("partial attribute", async assert => {
    await assert({html: "<a href=\"/test/${foo}\" /></a>", data: {foo: "bar"}},
      "<a href=\"/test/bar\"></a>");
  })

  test.case("object", async assert => {
    const html = "${foo.bar}";
    await assert({html, data: {foo: {bar: "baz"}}}, "baz");
  });

  test.case("promise", async assert => {
    const html = "${foo}";
    await assert({html, data: Promise.resolve({foo: "bar"})}, "bar");
  });

  test.case("component", async assert => {
    const html = "<c-attribute foo=\"${foo}\" />";
    await assert({html, components: customs, data: {foo: "bar"}}, "bar");
  });

  test.case("component attribute object", async assert => {
    const html = "<c-object-attribute foo=\"${foo}\" />";
    await assert({html, components: customs, data: {foo: {bar: "baz"}}},
      "<p id=\"baz\"></p>");
  });

  test.case("for + array", async assert => {
    const html = "<div for=\"${users}\"><p>${name}</p></div>";
    await assert({html, data: {users: [{name: "Donald"}, {name: "Joe"}]}},
      "<div><div><p>Donald</p></div><div><p>Joe</p></div></div>");
  });

  test.case("working with data", async assert => {
    const user = {name: "Bob", age: 35};
    const data = {data: {site: {name: "title"}, user}};
    const html = "<s-index data=\"${data}\"/>";
    await assert({html, components: comps, data}, "<p>title</p>");
  });

  test.case("working with promised data", async assert => {
    const user = Promise.resolve({name: "Bob", age: 35});
    const data = {data: {site: {name: "title"}, user}};
    const html = "<s-index data=\"${data}\"/>";
    await assert({html, components: comps, data}, "<p>title</p>");
  });

  test.case("don't fulfill undefined data", async assert => {
    const data = {data: {}};
    const html = "<s-index data=\"${data}\"/>";
    await assert({html, components: comps, data: {}}, "<p></p>");
    await assert({html, components: comps}, "<p></p>");
  });
};
