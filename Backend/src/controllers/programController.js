import Program from "../models/ProgramModel.js";
import { logAction } from "../services/auditService.js";


// Create the Program
export const createProgram = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const program = await Program.create({
      name,
      description,
      createdBy: req.user.id,
    });

    if (logAction) {
      await logAction({
        action: "PROGRAM_CREATED",
        user: req.user.id,
        entityType: "Program",
        entityId: program._id,
        meta: { name: program.name },
      });
    }

    res.status(201).json(program);
  } catch (err) {
    next(err);
  }
};


// Get all Program
export const getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find().populate("createdBy", "name email role");
    res.json(programs);
  } catch (err) {
    next(err);
  }
};


// Get Program By ID
export const getProgramById = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  } catch (err) {
    next(err);
  }
};


// Update the Program
export const updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!program) return res.status(404).json({ message: "Program not found" });

    if (logAction) {
      await logAction({
        action: "PROGRAM_UPDATED",
        user: req.user.id,
        entityType: "Program",
        entityId: program._id,
      });
    }

    res.json(program);
  } catch (err) {
    next(err);
  }
};


// Delete the Program
export const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    if (logAction) {
      await logAction({
        action: "PROGRAM_DELETED",
        user: req.user.id,
        entityType: "Program",
        entityId: program._id,
      });
    }

    res.json({ message: "Program deleted" });
  } catch (err) {
    next(err);
  }
};
