const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  // create a job
  static async create(title, salary, equity, company_handle) {
    const validCompanyCheck = await db.query(
      `
    SELECT handle
    FROM companies
    WHERE handle = $1`,
      [company_handle]
    );

    if (validCompanyCheck.rows.length === 0) {
      throw new NotFoundError(
        `Company by handle of ${company_handle} does not exist`
      );
    }
    const result = await db.query(
      `
        INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4,) 
        RETURNING title`,
      [(title, salary, equity, company_handle)]
    );

    const job = result.rows[0];
    return job;
  }

  //   return all jobs
  static async findAll(title, minSalary, hasEquity) {
    const jobRes = await db.query(`
    SELECT *
    FROM jobs`);

    let jobs = jobRes.rows;
    if (hasEquity == 'true') {
      jobs = jobs.filter((job) => job.equity > 0);
    } else {
      jobs = jobRes.rows;
    }
    const results = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(title.toLowerCase()) &&
        job.salary > minSalary
    );

    return results;
  }

  //   return a job by id
  static async get(id) {
    const result = await db.query(
      `
    SELECT *
    FROM jobs
    WHERE id = $1
    RETURNING title`,
      [id]
    );

    const job = result.rows[0];
    if (!job) {
      throw new NotFoundError("Job does not exist");
    }

    return job;
  }

  //   Update a job
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job found`);

    return job;
  }

  //   delete a job
  static async remove(id) {
    const result = await db.query(
      `
    DELETE
    FROM jobs
    WHERE id = $1
    RETURNING title`,
      [id]
    );

    const job = result.rows[0];

    if (!job) {
      throw new NotFoundError(`Job not Found`);
    }
  }
}

module.exports = Job;
