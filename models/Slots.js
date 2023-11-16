const mongoose = require("mongoose");

const SlotsSchema = mongoose.Schema(
  {
    Slots: {
      type: Object,
      required: true
    }
  },
  {
    collection: "Slots"
  }
);

const SlotsModel = mongoose.model("SlotsModel", SlotsSchema);
module.exports = SlotsModel;
