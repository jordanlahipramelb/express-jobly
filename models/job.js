"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

// id SERIAL PRIMARY KEY,
// title TEXT NOT NULL,
// salary INTEGER CHECK (salary >= 0),
// equity NUMERIC CHECK (equity <= 1.0),
// company_handle VARCHAR(25) NOT NULL
//   REFERENCES companies ON DELETE CASCADE

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */
  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [data.title, data.salary, data.equity, data.companyHandle]
    );

    const duplicateCheck = await db.query(
      `SELECT company_handle
             FROM jobs
             WHERE company_handle = $1`,
      [data.companyHandle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job title: ${companyhandle}`);

    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Optionally search filters
   * - title (will find case-insensitive, partial matches)
   * - minSalary
   * - hasEquity (true returns only jobs with equity > 0, other values ignored)
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   *
   * */

  static async findAll(searchFilters = {}) {
    //join jobs table with company table matching jobs.company_handle and company.handle
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                 FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    // WHERE SQL queries
    let whereExpressions = [];
    // the values of the above queries
    let queryValues = [];

    const { title, minSalary, hasEquity } = searchFilters;

    // push possible query search terms to whereExpressions and queryValues in order to generate the correct SQL query

    if (title !== undefined) {
      // search for characters of title between words
      queryValues.push(`%${title}%`);
      // pushes case-insensitive title to array
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (minSalary !== undefined) {
      queryValues.push(minSalary);

      // array number of the above query value in order to match with it when querying
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    // if there is something in the array, join the query SQL statement with WHERE and AND between each value of the array
    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // finalize query
    query += " ORDER BY name";
    const jobsRes = await db.query(query, queryValues);
    return jobsRes.rows;
  }
}

module.exports = Job;
