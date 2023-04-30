const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", () => {
  test("update", () => {
    const result = sqlForPartialUpdate(
      { name: "PerryJenkin"},
      { name: "PapaJohns", nickname: "PJ"}
    );
    expect(result).toEqual({
        setCols: "\"PapaJohns\"=$1",
        values: ['PerryJenkin']
    })
  });
});
