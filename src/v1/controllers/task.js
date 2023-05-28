const Section = require("../models/section");
const Task = require("../models/task");
const Board = require("../models/board");
const { generarPDF, generarHTML } = require("../utils/pdfApi");

exports.create = async (req, res) => {
  const { boardId } = req.params;
  const { sectionId } = req.body;
  try {
    const section = await Section.findById(sectionId);
    const tasksCount = await Task.find({ section: sectionId }).count();
    const task = await Task.create({
      user: req.user._id,
      board: boardId,
      section: sectionId,
      position: tasksCount > 0 ? tasksCount : 0,
    });
    task._doc.section = section;
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};

exports.update = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findByIdAndUpdate(taskId, { $set: req.body });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};

exports.delete = async (req, res) => {
  const { taskId } = req.params;
  try {
    const currentTask = await Task.findById(taskId);
    await Task.deleteOne({ _id: taskId });
    const tasks = await Task.find({ section: currentTask.section }).sort(
      "position"
    );
    for (const key in tasks) {
      await Task.findByIdAndUpdate(tasks[key].id, { $set: { position: key } });
    }

    res.status(200).json(`Deleted task ${taskId}`);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};

exports.updatePosition = async (req, res) => {
  const {
    resourceList,
    destinationList,
    resourceSectionId,
    destinationSectionId,
  } = req.body;

  const resourceListReverse = resourceList.reverse();
  const destinationListReverse = destinationList.reverse();

  try {
    if (resourceSectionId !== destinationSectionId) {
      for (const key in resourceListReverse) {
        await Task.findByIdAndUpdate(resourceListReverse[key].id, {
          $set: {
            section: resourceSectionId,
            position: key,
          },
        });
      }
    }

    for (const key in destinationListReverse) {
      await Task.findByIdAndUpdate(destinationListReverse[key].id, {
        $set: {
          section: destinationSectionId,
          position: key,
        },
      });
    }

    res.status(200).json("updated");
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};

exports.getTasksInCalendar = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id, addedToCalendar: true, done: false })
      .sort("date")
      .populate("board", "_id title icon")
      .populate({
        path: "section",
        select: "_id title",
      });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getTasksBetweenDates = async (req, res) => {
  const { boardId, startDate, endDate } = req.body;

  const adjustedStartDate = new Date(startDate);
  adjustedStartDate.setHours(0, 0, 0, 0);
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setHours(23, 59, 59, 999); // para incluir todos los elementos hasta el final del día

  try {
    let tasksQuery = {
      user: req.user._id,
      addedToCalendar: true,
      date: {
        $gte: adjustedStartDate,
        $lte: adjustedEndDate,
      },
    };

    if (boardId) {
      tasksQuery.board = boardId;
    }

    const tasks = await Task.find(tasksQuery)
      .sort("date")
      .populate({
        path: "board section",
        select: "_id title",
      })
      .populate({
        path: "section",
        select: "_id title",
      });
    res.status(200).json(tasks);
  } catch (error) {
    console.log("getTasksBetweenDates: ", error);
    res.status(500).json(error);
  }
};

exports.generatePDF = async (req, res) => {
  const { tasks, start, end, boardId } = req.body;
  console.log({ tasks, start, end, boardId })
  const board = await Board.findById(boardId);

  try {
    const html = generarHTML({ tasks, start, end, boardName: board.title });
    const pdfBuffer = await generarPDF(html);

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
