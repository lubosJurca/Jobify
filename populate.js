import { readFile } from 'fs/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Job from './models/JobModel.js';
import User from './models/UserModel.js';
import { log } from 'console';

try {
  // connect to db
  await mongoose.connect(process.env.MONGO_URI);
  //   find user so you get user id
  const user = await User.findOne({ email: 'lubos@gmail.com' });
  //   create jobs from mock data
  const jsonJobs = JSON.parse(
    await readFile(new URL('./utils/MOCK_DATA.json', import.meta.url))
  );

  //   iterate through jobs and add user id
  const jobs = jsonJobs.map((job) => {
    return { ...job, createdBy: user._id };
  });

  //   delete all jobs from user if there are any
  await Job.deleteMany({ createdBy: user._id });
  //   create new jobs with user id and mock data
  await Job.create(jobs);
  console.log('Succes');
  // process.exit(0) is a Node.js method that exits the current process with an exit code of 0. The exit code 0 conventionally represents a successful exit without any errors.
  process.exit(0);
} catch (error) {
  console.log(error);
  process.exit(1);
}
