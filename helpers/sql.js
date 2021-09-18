const { BadRequestError } = require("../expressError");

/**
 *  Partially updates queries with the data provided.
 * 
 * @param dataToUpdate { Object } contains the data of what you want to update.
 * 
 *    Ex: {
          key1: value1,
          key2: value2,
          ...
        }

 * @param jsToSql { Object } maps JS-style data fields to the database column names

 *    Ex: {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        }

      Ex: { key1: "key_1", key2: "key_2" }

 * @returns { Object } { setCols, values (dataToUpdate)}

      Ex: {
          setCols: '"key_1"=$1, "key_2"=$2',
          values: ["value1", "value2"],
        }

      Ex: {firstName: 'Aliya', age: 32} =>
 *   { setCols: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    // key names set to increasing $number
    setCols: cols.join(", "),
    // the value of each key
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
