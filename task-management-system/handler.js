"use strict";

const AWS = require("aws-sdk");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
});

const TABLE_NAME = process.env.TASKS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to validate JWT
const authenticateJWT = (event) => {
  const token = event.headers.Authorization || event.headers.authorization;
  if (!token) {
    throw new Error("No token provided");
  }
  try {
    const tokenWithoutBearer = token.replace("Bearer ", "");
    return jwt.verify(tokenWithoutBearer, JWT_SECRET);
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

// Create Task
module.exports.createTask = async (event) => {
  try {
    const user = authenticateJWT(event);
    const { title, description, status, dueDate } = JSON.parse(event.body);
    const id = uuid.v4();
    const newTask = { id, title, description, status, dueDate };
    await docClient
      .put({
        TableName: TABLE_NAME,
        Item: newTask,
      })
      .promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Task created", task: newTask, user }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

// Get All Tasks
module.exports.getAllTasks = async () => {
  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items),
  };
};

// Get Task by ID
module.exports.getTaskById = async (event) => {
  const { id } = event.pathParameters;
  const data = await docClient
    .get({
      TableName: TABLE_NAME,
      Key: { id },
    })
    .promise();
  if (!data.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Task not found" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(data.Item),
  };
};

// Update Task
module.exports.updateTask = async (event) => {
  try {
    const user = authenticateJWT(event);
    const { id } = event.pathParameters;
    const { title, description, status, dueDate } = JSON.parse(event.body);
    await docClient
      .update({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression:
          "set title = :title, description = :description, #status = :status, dueDate = :dueDate",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":title": title,
          ":description": description,
          ":status": status,
          ":dueDate": dueDate,
        },
      })
      .promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ id, title, description, status, dueDate }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

// Delete Task
module.exports.deleteTask = async (event) => {
  try {
    const user = authenticateJWT(event);
    const { id } = event.pathParameters;
    await docClient
      .delete({
        TableName: TABLE_NAME,
        Key: { id },
      })
      .promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Task deleted successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

// Handle SQS Message
module.exports.handleSQSMessage = async (event) => {
  for (const record of event.Records) {
    console.log("SQS message: ", JSON.stringify(record, null, 2));
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "SQS message handled successfully" }),
  };
};

// Handle S3 Upload
module.exports.handleS3Upload = async (event) => {
  for (const record of event.Records) {
    console.log("S3 event: ", JSON.stringify(record, null, 2));
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "S3 event handled successfully" }),
  };
};

// Hourly Task
module.exports.hourlyTask = async (event) => {
  console.log("Hourly task executed at", new Date().toISOString());

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hourly task executed successfully" }),
  };
};
