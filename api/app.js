const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const { mongoURI } = require('./config');

const app = express();
const port = process.env.PORT || 3030;

mongoose.connect(mongoURI);

app.use(bodyParser.json());
app.use('/users', userRoutes);
app.use('/discussions', discussionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
