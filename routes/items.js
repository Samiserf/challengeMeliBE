const { Router } = require("express");
const { itemsGet, itemsDetailGet } = require("../controllers/items");

const router = Router();

router.get("/", itemsGet);
router.get("/:idItem", itemsDetailGet);

module.exports = router;
