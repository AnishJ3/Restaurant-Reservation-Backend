const mongoose = require("mongoose");

const SlotsSchema = mongoose.Schema(
  {
    R_ID:String,
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
