import expand from "./expand.js";
import flatten from "./flatten.js";

const customs = {
  "c-tag": "<p></p>",
  "c-attribute": "<p value=\"${foo}\"></p>",
  "c-object-attribute": "<p value=\"${foo.bar}\"></p>",
  "c-for-object": "<p for=\"${foo}\"><p value=\"${bar}\"></p></p>",
};

const slots = {
  "s-between": "<p><slot></slot></p>",
  "s-before": "<slot></slot><c-tag></c-tag>",
  "s-after": "<c-tag></c-tag><slot></slot>",
  "s-with": "<s-between><c-tag></c-tag></s-between>",
};

const c_tag = "<p></p>";

const slot_expected = {
  "s-between": "<p></p>",
  "s-before": c_tag,
  "s-after": c_tag,
  "s-with": `<p>${c_tag}</p>`,
};

const components = {...customs, ...slots};

export default test => {
  test.space("custom components", Object.keys(customs), (assert, each) => {
    assert(flatten(expand(`<${each} />`, components))).equals(components[each]);
  });

  test.space("slotted componets", Object.keys(slots), (assert, each) => {
    assert(flatten(expand(`<${each} />`, components)))
      .equals(slot_expected[each]);
  });

  test.case("working with data", assert => {
    const comps = {
      "s-index": "<s-layout user=\"${data.user}\">${data.site.name}</s-layout>",
      "s-layout": "<slot />",
    };
    const user = {name: "Bob", age: 35};
    const data = {data: {site: {name: "title"}, user}};
    const html = "<s-index data=\"${data}\"/>";
    const expanded = expand(html, comps, data);
    assert(expanded.children[0].children[0]._data).equals({user});
  });

  test.case("working with promised data", assert => {
    const comps = {
      "s-index": "<s-layout user=\"${data.user}\">${data.site.name}</s-layout>",
      "s-layout": "<slot />",
    };
    const user = Promise.resolve({name: "Bob", age: 35});
    const data = {data: {site: {name: "title"}, user}};
    const html = "<s-index data=\"${data}\"/>";
    const expanded = expand(html, comps, data);
    assert(expanded.children[0].children[0]._data).equals({user});
  });
};
