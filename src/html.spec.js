export default test => {
  test.fix(({html}) => html);

  test.reassert(assert => async (template, expected) =>
    assert((await template).body).equals(`<body>${expected}`));

  test.case("tag", (assert, html) => {
    assert(html`<div></div>`, "<div></div>");
  });

  test.case("tag with attributes", async (assert, html) => {
    await assert(html`<div title="test"></div>`, "<div title=\"test\"></div>");
    await assert(html`<div>test</div>`, "<div>test</div>");
  });

  test.case("tag with attribute and data", async (assert, html) => {
    const key = "value";

    await assert(html`<div title="${key}"></div>`,
      "<div title=\"value\"></div>");
  });

  test.case("tag with attributes and data", async (assert, html) => {
    const key = "value";
    const key2 = "value2";

    await assert(html`<div title="${key}" title2="${key2}"></div>`,
      "<div title=\"value\" title2=\"value2\"></div>");
  });

  test.case("custom tag", async (assert, html) => {
    const expected = "<ct></ct>";

    await assert(html`<custom-tag />`, expected);
    await assert(html`<custom-tag></custom-tag>`, expected);
  });

  test.case("custom tag with attribute", async (assert, html) => {
    const foo = "bar";
    const tag = "<cwa>bar</cwa>";

    await assert(html`<custom-with-attribute foo="${foo}"/>`, tag);
  });

  test.case("custom tag with object attribute", async (assert, html) => {
    const foo = {bar: "baz"};
    const tag = "<cwoa>baz</cwoa>";

    await assert(html`<custom-with-object-attribute foo="${foo}"/>`, tag);
  });

  test.case("slot before custom tag", async (assert, html) => {
    const result = "<div>test</div><ct></ct>";

    await assert(html`<slot-before-custom><div>test</div></slot-before-custom>`,
      result);
  });

  test.case("slot after custom tag", async (assert, html) => {
    const result = "<ct></ct><div>test</div>";

    await assert(html`<custom-before-slot><div>test</div></slot-before-custom>`,
      result);
  });

  test.case("custom tag with slot (text)", async (assert, html) => {
    const result = "<cws>test</cws>";

    await assert(html`<custom-with-slot>test</slot-with-custom>`, result);
  });

  test.case("custom tag with slot (tag)", async (assert, html) => {
    const result = "<cws><span>test</span></cws>";
    const input = html`<custom-with-slot><span>test</span></custom-with-slot>`;

    await assert(input, result);
  });

  test.case("custom tag in custom tag (slotted)", async (assert, html) => {
    const input = html`<custom-with-slot><custom-tag /></custom-with-slot>`;
    const ct = "<ct></ct>";
    const result = `<cws>${ct}</cws>`;

    await assert(input, result);
  });

  test.case("custom tag in custom tag slotted in tag", async (assert, html) => {
    const input = html`<custom-with-slot><custom-tag /></custom-with-slot>`;
    const result = "<cws><ct></ct></cws>";

    await assert(input, result);
  });

  test.case("for with array", async (assert, html) => {
    const foo = [{bar: "baz"}, {bar: "baz2"}];
    const input = html`<for-with-object foo="${foo}"></for-with-object>`;
    const s1 = "<span>baz</span>";
    const s2 = "<span>baz2</span>";
    const result = `<fwo><div>${s1}</div><div>${s2}</div></fwo>`;

    await assert(input, result);
  });
};
