import test from "ava";
import { PGlite } from "../../dist/index.js";
import { xml2 } from "../../dist/contrib/xml2.js";

test("xml2 xml_valid", async (t) => {
  const pg = new PGlite({
    extensions: {
      xml2,
    },
  });

  await pg.exec("CREATE EXTENSION IF NOT EXISTS xml2;");

  const res = await pg.query("SELECT xml_valid('<foo>bar</foo>') as value;");
  t.is(res.rows[0].value, true);
});

test("xml2 xpath_string", async (t) => {
  const pg = new PGlite({
    extensions: {
      xml2,
    },
  });

  await pg.exec("CREATE EXTENSION IF NOT EXISTS xml2;");

  const res = await pg.query("SELECT xpath_string('<foo>bar</foo>', '/foo/text()') as value;");
  t.is(res.rows[0].value, "bar");
});

test("xml2 xpath_number", async (t) => {
  const pg = new PGlite({
    extensions: {
      xml2,
    },
  });

  await pg.exec("CREATE EXTENSION IF NOT EXISTS xml2;");

  const res = await pg.query("SELECT xpath_number('<foo>42</foo>', '/foo/text()') as value;");
  t.is(res.rows[0].value, 42);
});

test("xml2 xpath_boolean", async (t) => {
  const pg = new PGlite({
    extensions: {
      xml2,
    },
  });

  await pg.exec("CREATE EXTENSION IF NOT EXISTS xml2;");

  const res = await pg.query("SELECT xpath_bool('<foo>true</foo>', '/foo/text()') as value;");
  t.is(res.rows[0].value, true);
});

test("xml2 xpath_table", async (t) => {
  const pg = new PGlite({
    extensions: {
      xml2,
    },
  });

  await pg.exec("CREATE EXTENSION IF NOT EXISTS xml2;");

  await pg.exec(`
    CREATE TABLE test (
    id int PRIMARY KEY,
    xml text
    );

    INSERT INTO test VALUES (1, '<doc num="C1">
    <line num="L1"><a>1</a><b>2</b><c>3</c></line>
    <line num="L2"><a>11</a><b>22</b><c>33</c></line>
    </doc>');

    INSERT INTO test VALUES (2, '<doc num="C2">
    <line num="L1"><a>111</a><b>222</b><c>333</c></line>
    <line num="L2"><a>111</a><b>222</b><c>333</c></line>
    </doc>');

  `);

  const ret = await pg.exec(`
    SELECT t.*,i.doc_num FROM
      xpath_table('id', 'xml', 'test',
                  '/doc/line/@num|/doc/line/a|/doc/line/b|/doc/line/c',
                  'true')
        AS t(id int, line_num varchar(10), val1 int, val2 int, val3 int),
      xpath_table('id', 'xml', 'test', '/doc/@num', 'true')
        AS i(id int, doc_num varchar(10))
    WHERE i.id=t.id AND i.id=1
    ORDER BY doc_num, line_num;
  `);

  t.deepEqual(ret.rows, [
    { id: 1, doc_num: "C1", line_num: "L1", val1: 1, val2: 2, val3: 3 },
    { id: 1, doc_num: "C1", line_num: "L2", val1: 11, val2: 22, val3: 33 },
  ]);
});
