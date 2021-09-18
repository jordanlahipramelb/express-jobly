const { sqlForPartialUpdate } = require("./sql");

describe("Test sqlForPartialUpdate Function", () => {
  test("Update 1 item", () => {
    const result = sqlForPartialUpdate(
      { key1: "value1" },
      { key1: "key_1", key2: "key_2" }
    );

    expect(result).toEqual({
      setCols: '"key_1"=$1',
      values: ["value1"],
    });
  });

  test("Update 2 items", () => {
    const result = sqlForPartialUpdate(
      { key1: "value1", key2: "value2" },
      { key1: "key_1", key2: "key_2" }
    );

    expect(result).toEqual({
      setCols: '"key_1"=$1, "key_2"=$2',
      values: ["value1", "value2"],
    });
  });
});
