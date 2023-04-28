"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

// Post a job
router.post("/", ensureIsAdmin, async (req, res, next) => {
  try {
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (error) {
    return next(error);
  }
});

// Get all jobs
router.get("/", async (req, res, next) => {
  try {
    const title = req.query.title || "";
    const minSalary = Number(req.query.minSalary) || 0;
    const hasEquity = req.query.hasEquity || false;

    if (hasEquity != "false" && hasEquity != "true") {
      throw new ExpressError(
        `${hasEquity} is not a boolean, please enter either true or false`,
        400
      );
    }

    const jobs = await Job.findAll(title, minSalary, hasEquity);

    if (jobs.length === 0) {
      return res.json({ msg: `No jobs found, please adjust query strings` });
    }
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

// Get job by id
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

// Update a job
router.put("/:id", ensureIsAdmin, async (req, res, next) => {
  try {
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

// Delete a job
router.delete("/:id", ensureIsAdmin, async (req, res, next) => {
  try {
    await Job.remove(req.params.id);
    return res.json({ msg: `Job with id of ${req.params.id} deleted` });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
