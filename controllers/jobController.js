import JobModel from '../models/JobModel.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import day from 'dayjs';

// ----------------------GET ALL JOBS -----------------------
export const getAllJobs = async (req, res) => {
  // these query parameters are coming from the frontend to filter the jobs
  const { search, jobStatus, jobType, sort } = req.query;

  // query object to be used in the JobModel.find()
  const queryObject = {
    createdBy: req.user.userId,
  };

  // if there's a search query, add it to the query object
  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  if (jobStatus && jobStatus !== 'all') {
    queryObject.jobStatus = jobStatus;
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  // sort jobs
  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'position',
    'z-a': '-position',
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // setup pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  // find jobs
  const jobs = await JobModel.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);
  // count total jobs
  const totalJobs = await JobModel.countDocuments(queryObject);

  // how many pages we have
  const numOfPages = Math.ceil(totalJobs / limit);

  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPages, currentPage: page, jobs });
};

// ---------------------CREATE JOB--------------------------
export const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;

  const job = await JobModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// ---------------------GET SINGLE JOB-------------------------
export const getSingleJob = async (req, res) => {
  const job = await JobModel.findById(req.params.id);

  res.status(StatusCodes.OK).json({ job });
};

//   ----------------------EDIT JOB------------------------
export const editJob = async (req, res) => {
  const updatedJob = await JobModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Job succesfully updated', job: updatedJob });
};

//   --------------------DELETE JOB--------------------
export const deleteJob = async (req, res) => {
  const removedJob = await JobModel.findByIdAndDelete(req.params.id);

  res.status(StatusCodes.OK).json({ msg: 'Job deleted', job: removedJob });
};

//   ----------------------STATS------------------------
export const showStats = async (req, res) => {
  let stats = await JobModel.aggregate([
    // in this aggregate query, we're going to filter the jobs by the user
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    // this query groups the jobs by their status
    { $group: { _id: '$jobStatus', count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await JobModel.aggregate([
    // in this aggregate query, we're going to filter the jobs by the user
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = day()
        .month(month - 1)
        .year(year)
        .format('MMM YY');

      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
