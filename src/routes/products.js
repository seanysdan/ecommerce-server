const express = require("express");
const axios = require("axios");

const models = require("../models");
const { Sequelize } = require("../models");
const jwt_decode = require("jwt-decode");
const { parseToken } = require("../utils/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.query;
  try {
    const product = await models.Item.findOne({
      where: { id: parseInt(id) },
    });
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.get("/favorites", async (req, res) => {
  try {
    const decodedUser = parseToken(req);
    const _fav = await models.Favorite.findAll({
      where: { userId: decodedUser.user.id },
      attributes: ["productId"],
    });
    let favIds = _fav.map(function (fav) {
      return fav["productId"];
    });
    const favProducts = await models.Item.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: favIds,
        },
      },
    });
    return res.send(favProducts);
  } catch (error) {
    return res.send("fail");
  }
});

router.post("/favorites", async (req, res) => {
  try {
    const decodedUser = parseToken(req);
    const { productId } = req.body;
    await models.Favorite.create({
      productId,
      userId: decodedUser.user.id,
    });
    return res.send("success");
  } catch (error) {
    return res.send("fail");
  }
});

router.delete("/favorites", async (req, res) => {
  try {
    const productId = req.body.id;
    await models.Favorite.destroy({
      where: {
        productId,
      },
    });
    return res.send("success");
  } catch (error) {
    return res.send("fail");
  }
});

module.exports = router;
