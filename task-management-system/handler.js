"use strict";

const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const express = require("express");
const serverless = require("serverless-http");

const app = express();
const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const TASKS_TABLE = process.env.TASKS_TABLE;

app.use(express.json());

// Create a new task
app.post("/tasks", async function (req, res) {
  const { taskId, title, description, status, dueDate } = req.body;
  if (typeof taskId !== "string") {
    return res.status(400).json({ error: '"taskId" must be a string' });
  }

  const params = {
    TableName: TASKS_TABLE,
    Item: {
      taskId: { S: taskId },
      title: { S: title },
      description: { S: description },
      status: { S: status },
      dueDate: { S: dueDate },
    },
  };

  try {
    const command = new PutItemCommand(params);
    await client.send(command);
    res.json({ taskId, title, description, status, dueDate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create task" });
  }
});

// Get all tasks
app.get("/tasks", async function (req, res) {
  const params = {
    TableName: TASKS_TABLE,
  };

  try {
    const command = new ScanCommand(params);
    const data = await client.send(command);
    res.json(data.Items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve tasks" });
  }
});

// Get a specific task by ID
app.get("/tasks/:taskId", async function (req, res) {
  const params = {
    TableName: TASKS_TABLE,
    Key: {
      taskId: { S: req.params.taskId },
    },
  };

  try {
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    if (Item) {
      res.json({
        taskId: Item.taskId.S,
        title: Item.title.S,
        description: Item.description.S,
        status: Item.status.S,
        dueDate: Item.dueDate.S,
      });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find task with provided "taskId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve task" });
  }
});

// Update a task
app.put("/tasks/:taskId", async function (req, res) {
  const { title, description, status, dueDate } = req.body;
  const params = {
    TableName: TASKS_TABLE,
    Key: {
      taskId: { S: req.params.taskId },
    },
    UpdateExpression:
      "set title = :title, description = :description, status = :status, dueDate = :dueDate",
    ExpressionAttributeValues: {
      ":title": { S: title },
      ":description": { S: description },
      ":status": { S: status },
      ":dueDate": { S: dueDate },
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const command = new UpdateItemCommand(params);
    const { Attributes } = await client.send(command);
    res.json({
      taskId: Attributes.taskId.S,
      title: Attributes.title.S,
      description: Attributes.description.S,
      status: Attributes.status.S,
      dueDate: Attributes.dueDate.S,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not update task" });
  }
});

// Delete a task
app.delete("/tasks/:taskId", async function (req, res) {
  const params = {
    TableName: TASKS_TABLE,
    Key: {
      taskId: { S: req.params.taskId },
    },
  };

  try {
    const command = new DeleteItemCommand(params);
    await client.send(command);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not delete task" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
