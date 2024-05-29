"use strict";

const AWS = require("aws-sdk");
const uuid = require("uuid");

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
});

const TABLE_NAME = process.env.TASKS_TABLE;

// Create Task
module.exports.createTask = async (event) => {
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
    body: JSON.stringify(newTask),
  };
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
};

// Delete Task
module.exports.deleteTask = async (event) => {
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
};
