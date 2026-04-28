const hsProductModel = require("../Models/HSProduct");

const getAllHSProducts = async (req, res) => {
  try {
    const products = await hsProductModel.getAllHSProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHSProductByCode = async (req, res) => {
  try {
    const product = await hsProductModel.getHSProductByCode(req.params.code);
    if (!product) {
      return res.status(404).json({ message: "HS product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createHSProduct = async (req, res) => {
  try {
    const {
      code,
      mineral_id,
      product_name_ar,
      product_name_en,
      product_name_fr,
      product_category_ar,
      product_category_en,
      product_category_fr,
    } = req.body;
    if (!code || !mineral_id || !product_name_ar || !product_name_en || !product_name_fr) {
      return res.status(400).json({ message: "code, mineral_id, product_name_ar, product_name_en and product_name_fr are required" });
    }

    const product = await hsProductModel.createHSProduct({
      code,
      mineral_id,
      product_name_ar,
      product_name_en,
      product_name_fr,
      product_category_ar,
      product_category_en,
      product_category_fr,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateHSProduct = async (req, res) => {
  try {
    const product = await hsProductModel.updateHSProduct(req.params.code, req.body);
    if (!product) {
      return res.status(404).json({ message: "HS product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteHSProduct = async (req, res) => {
  try {
    const product = await hsProductModel.deleteHSProduct(req.params.code);
    if (!product) {
      return res.status(404).json({ message: "HS product not found" });
    }
    res.json({ message: "HS product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllHSProducts,
  getHSProductByCode,
  createHSProduct,
  updateHSProduct,
  deleteHSProduct,
};
