"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newJob = {
    companyHandle: "c1",
    title: "Test",
    salary: 100,
    equity: "0.1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob,
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "job1",
        salary: 10,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "job2",
        salary: 20,
        equity: "0.2",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[2],
        title: "job3",
        salary: 30,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[3],
        title: "job4",
        salary: null,
        equity: null,
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("works: by name", async function () {
    let jobs = await Job.findAll({ title: "b1" });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "job1",
        salary: 10,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("works: min salary", async function () {
    let jobs = await Job.findAll({ minSalary: 25 });
    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "job3",
        salary: 30,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("works: equity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "job1",
        salary: 10,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "job2",
        salary: 20,
        equity: "0.2",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("works: min salary & equity", async function () {
    let jobs = await Job.findAll({ minSalary: 15, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "job2",
        salary: 20,
        equity: "0.2",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
});

/************************************** get */

describe("get(id)", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "job1",
      salary: 10,
      equity: "0.1",
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let data = {
    title: "updateData",
    salary: 1000,
    equity: "0.5",
  };
  test("works", async function () {
    let job = await Job.update(testJobIds[0], data);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...data,
    });
  });

  test("not found if job does not exist", async function () {
    try {
      await Job.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request error with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query("SELECT id FROM jobs WHERE id=$1", [
      testJobIds[0],
    ]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
