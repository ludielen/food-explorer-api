const { Router } = require("express");
const PlatesController = require("../controllers/PlatesController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const uploadConfig = require("../configs/upload");
const multer = require("multer");
const upload = multer(uploadConfig.MULTER);

const platesRoutes = Router();
const platesController = new PlatesController();

platesRoutes.use(ensureAuthenticated)

platesRoutes.get("/", platesController.getPlates);
platesRoutes.put("/", platesController.updatePlate);
platesRoutes.delete("/:plate_id", platesController.deletePlate);
platesRoutes.post("/", platesController.createPlate);
platesRoutes.patch("/:plate_id", upload.single("plate_picture"), platesController.uploadPicture);

module.exports = platesRoutes;